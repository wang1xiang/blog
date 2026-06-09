---
title: "claude-mem完整工作原理调研"
published: 2026-06-05
description: "一句话定位：为 Claude Code 构建的持久化内存压缩系统，让 AI 跨会话保持上下文连续性。"
tags: ["Claude Code", "记忆系统"]
category: "AI工具"
image: api
draft: false
---
# claude-mem 完整工作原理调研

## 一、Introduction — claude-mem 是什么

**一句话定位**：为 Claude Code 构建的持久化内存压缩系统，让 AI 跨会话保持上下文连续性。

### 核心能力

1. **自动记录** — 通过 6 个生命周期钩子，自动捕获每次工具调用，生成语义摘要存入 SQLite
2. **自动注入** — 新会话启动时，自动把跟当前项目相关的记忆加载到 system prompt
3. **主动查询** — 自然语言提问即可搜索历史，如"上次修了什么 bug？"

### 与 CLAUDE.md 的关系

|          |  CLAUDE.md     | claude-mem     |
| -------- | -------------- | -------------- |
| **写入方式** | 手动维护           | AI 自动提取        |
| **内容性质** | "应该怎么做"（规则、约定） | "实际做过什么"（历史事实） |
| **更新频率** | 低频             | 每次工具调用后        |
| **互补关系** | 项目级"宪法"        | 跨项目的"长期记忆"     |

### 自动化联动：Folder Context Files

claude-mem 不仅是本地数据库存储，还能**自动为项目文件夹生成 CLAUDE.md**，实现与手动维护文件的联动。

**工作机制**：每次 observation 保存后，claude-mem 自动识别被修改文件所在的文件夹，查询近期相关 observation，生成活动时间线，写入该文件夹下的 `CLAUDE.md`（包裹在 `<claude-mem-context>` 标签中）。

**生成内容示例**：

```markdown
# Authentication Module

这里是手动写的模块说明，会被保留。

<claude-mem-context>
### Jan 4, 2026
| ID | Time | T | Title | Read |
| #1234 | 4:30 PM | 🔵 | Implemented user authentication | ~250 |
| #1235 | " | 🔴 | Fixed login redirect bug | ~180 |
</claude-mem-context>
```

**关键设计**：

- `<claude-mem-context>` 标签外的手动内容**始终保留**，再生时只替换标签内部分
- 项目根目录（含 `.git` 的目录）**不自动生成**，避免覆盖根 CLAUDE.md
- 默认关闭，通过 `CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED: "true"` 开启

**闭环价值**：团队中即使没有安装 claude-mem 的成员，拉取代码后也能通过自动生成的文件夹级 `CLAUDE.md` 看到活动时间线，快速了解最近做了什么。可通过 `--clean` 模式在 PR 合并前清理自动生成的内容。

---

## 二、Architecture — 架构

### 2.1 架构总览

**5 大核心组件**：

```
钩子收集 → SQLite 存储 → Worker 处理 → AI 压缩 → 下次会话注入
```

| 组件                | 作用                                          |
| ------------------- | --------------------------------------------- |
| **Plugin Hooks**    | 6 个生命周期钩子，捕获 Claude Code 的事件     |
| **Worker Service**  | Express HTTP 服务，管理数据处理和搜索 API     |
| **Database Layer**  | SQLite + FTS5 全文索引 + 可选 Chroma 向量搜索 |
| **mem-search 技能** | 自然语言搜索接口，三层渐进式披露              |
| **Viewer UI**       | React 实时查看器，`http://localhost:37777`    |

**技术栈**：TypeScript / Node.js 20+ + Bun / SQLite 3 + Express.js 5 / SSE / React / @anthropic-ai/claude-agent-sdk

**两条数据管线**：

- **记忆管线（写入）**：Hook (stdin) → SQLite → Worker → Claude Agent SDK 压缩 → 写回数据库 → 下次注入
- **搜索管线（读取）**：用户自然语言提问 → mem-search 触发 → HTTP API → FTS5 查询 → 返回结果

### 2.2 Hook Lifecycle — 6 个生命周期钩子

每次 Claude Code 运行，按此顺序触发：

| 阶段                    | 触发时机         | 做什么                                                            |
| ----------------------- | ---------------- | ----------------------------------------------------------------- |
| **0. Setup**            | Claude 启动      | 版本检查（亚毫秒级），不匹配提示 `npx claude-mem repair`          |
| **1. SessionStart**     | 会话开始         | 启动 Worker + 从数据库注入上次会话上下文                          |
| **2. UserPromptSubmit** | 用户输入问题时   | 创建会话记录，保存原始 prompt 供后续搜索                          |
| **3. PreToolUse**       | 使用 Read 工具前 | 捕获文件读取上下文                                                |
| **4. PostToolUse**      | 每次工具调用后   | 最忙的钩子——捕获工具执行数据，发给 Worker 做 AI 压缩              |
| **5. Stop**             | Claude 停止时    | 生成会话摘要（Request/Investigated/Learned/Completed/Next Steps） |
| **6. SessionEnd**       | 会话结束         | 标记会话完成（不删除数据），为下次注入做准备。`/clear` 时跳过     |

**PostToolUse** 一次会话可能触发 100+ 次，每次读文件、改代码、跑命令都会被记录。

### 2.3 Claude Agent SDK 的角色

**为什么需要它**：PostToolUse 钩子捕获的是原始工具调用数据（如 `{"tool": "Edit", "file": "src/auth.ts"}`），本身没有语义价值。SDK 的作用是把原始记录变成结构化洞察（如 `{"type": "bugfix", "title": "修复 JWT token 验证"}`）。

**工作流程**：原始观察堆积 → 批量发给 Claude Agent SDK → 调用配置的模型（默认 `claude-haiku`，我们实际配置为 `qwen3.6-plus`） → 解析 XML 响应 → 结构化数据写回 SQLite

**可配置模型**（通过 `CLAUDE_MEM_MODEL` 指定，由 Claude Agent SDK 调用）：

| 模型                        | 用途                         |
| --------------------------- | ---------------------------- |
| `claude-haiku-4-5-20251001` | 默认，快速便宜，适合批量压缩 |
| `claude-sonnet-4-6`         | 平衡质量和成本               |
| `claude-opus-4-7`           | 最高质量，最贵               |

### 2.4 Worker Service

**端口分配**：默认 `37700 + (uid % 100)`（多用户不冲突），可用 `CLAUDE_MEM_WORKER_PORT` 覆盖

**主要 HTTP 端点**：

| 端点                              | 用途             |
| --------------------------------- | ---------------- |
| `GET /api/observations`           | 分页获取观察记录 |
| `GET /api/observation/:id`        | 按 ID 获取单条   |
| `POST /api/observations/batch`    | 批量获取多条     |
| `GET /api/summaries`              | 分页获取会话摘要 |
| `GET /api/stats`                  | 按项目统计数据   |
| `GET /api/pending-queue`          | 查看处理队列状态 |
| `POST /api/pending-queue/process` | 手动触发处理     |
| `GET /stream`                     | SSE 实时推送     |

**数据存储**：

```
~/.claude-mem/
├── claude-mem.db           # SQLite 数据库
├── .env                    # gateway 凭证（BASE_URL + AUTH_TOKEN）
├── .install-version        # 版本标记
├── settings.json           # 用户配置
├── supervisor.json         # 进程管理
├── worker.pid              # PID 文件
├── chroma/                 # 可选向量索引
├── corpora/                # Knowledge Agent 语料库
└── logs/
    ├── worker-out.log      # 输出日志
    └── worker-error.log    # 错误日志
```

**管理命令**：`npm run worker:start` / `stop` / `restart` / `logs` / `status`

---

## 三、Usage — 使用

### 3.1 Observation（观察记录）

**最小信息单元**——每次 Claude 调用工具后，被 AI 压缩提取的一条"工作记录"。

**完整结构**：

```json
{
  "id": 123,
  "type": "bugfix",
  "title": "修复 JWT token 验证中的竞态条件",
  "subtitle": "高并发下读取过期 session",
  "narrative": "用户反馈登录后偶发 401...",
  "facts": ["401 是竞态条件导致的", "同步验证方案有效"],
  "concepts": ["authentication", "concurrency", "jwt"],
  "files_read": ["src/auth.ts", "src/session.ts"],
  "files_modified": ["src/auth.ts"],
  "created_at": "2026-06-04T10:30:00Z",
  "project": "claudecode"
}
```

**6 种类型**：

| Type        | 含义      | 例子                          |
| ----------- | --------- | ----------------------------- |
| `bugfix`    | 修复 bug  | "修复了 401 偶发问题"         |
| `feature`   | 新增功能  | "添加了 dark mode 切换"       |
| `decision`  | 技术决策  | "选用 SQLite 而非 PostgreSQL" |
| `discovery` | 发现/认知 | "发现 API 限流是 100 RPM"     |
| `refactor`  | 重构      | "提取了 useAuth composable"   |
| `change`    | 一般变更  | "更新了依赖版本"              |

**与 Session、Summary 的关系**：

```
Session（会话容器）
  ├── 包含多个 Observation（工作记录条目）
  └── 结束时生成一条 Summary（会话总结）
```

| 概念            | 粒度             | 什么时候产生             |
| --------------- | ---------------- | ------------------------ |
| **Observation** | 一次工具调用     | PostToolUse 钩子触发时   |
| **Session**     | 一次 Claude 会话 | 打开到关闭的完整生命周期 |
| **Summary**     | 整个会话的总结   | Stop 钩子触发时          |

### 3.2 Context Injection — 上下文注入

SessionStart 钩子干 4 件事：
**核心问题**：每次新会话启动都无脑灌入历史数据，会不会是 Token 刺客？

1. 查数据库，拉取当前项目最近的 observation（默认 50 条）
2. 拉取最近的 session summaries
3. 按时间线展示，带会话标记
4. **智能显示摘要**：只有当摘要是在最后一条观察之后生成的，才显示完整详情

**核心问题**：每次新会话启动都无脑灌入历史数据，会不会是 Token 刺客？

**答案：不会。实际开销不到传统 RAG 的 1/10。**

#### Token 算账

SessionStart 钩子注入的 **不是详情**，而是 **高密索引**（Index List）。

```
### Oct 26, 2025
| ID | Time | T | Title | Tokens |
| #2591 | 1:15 AM | ⚖️ | Stderr messaging abandoned | ~155 |
| #2592 | 1:16 AM | 🟡 | Web UI strategy redesigned | ~193 |
```

- **每条成本**：平均 20-30 tokens
- **50 条总成本**：50 × 30 ≈ **1,500 tokens**
- **占上下文窗口**：< 1%（Claude Code 通常 200k+）

**用 1,500 tokens 买了一张"项目历史地图"，换来 AI 跨越 50 次历史事件的上帝视角。**

#### 智能显示摘要（Heuristic Summary Injection）

SessionStart 用 **时间戳做卡点**，决定注入哪些内容：

| 场景              | 触发条件                                           | 注入内容                               |
| :---------------- | :------------------------------------------------- | :------------------------------------- |
| **A：项目未变更** | 上次会话的 Summary 在最后一条 Observation 之后生成 | 只注入 Summary 详情 + 50 条轻量索引    |
| **B：需要看详情** | 用户主动提问或 AI 判断需要上下文                   | 通过三层搜索工具按需拉取特定 ID 的详情 |

**场景 A 示例**：上次会话结束时，Stop 钩子已把操作提炼为 "修复了 JWT 竞态条件，验证了同步方案"。本次启动只注入这条 Summary + 索引——AI 瞬间了解上次收尾进度，没加载任何 Observation 原始细节。

**场景 B 示例**：AI 启动时只有"目录"。当用户问"上次重构 worker-service.ts 的细节是什么？"，它才通过三层工作流（`search` → `timeline` → `get_observations`）主动拉取特定 ID 的详情。

#### `/clear` 行为

`/clear` 对 claude-mem 只是"换了个 prompt 编号"——SessionStart 仍触发并重新注入，观察记录继续捕获，结束时仍会生成摘要。底层会话连续性不受影响。

#### 传统 RAG vs claude-mem 启动成本对比

| 维度             | 传统向量 RAG（Top-20 Chunk）          | claude-mem（SessionStart 注入）     |
| :--------------- | :------------------------------------ | :---------------------------------- |
| **注入内容**     | 20 个包含大量代码和上下文的原始文本块 | 50 条高密索引 + 1 条上阶段 Summary  |
| **启动 Token**   | 15,000-30,000（高污染）               | ~1,500（极度干净）                  |
| **上下文噪声**   | 高（大量与当前意图无关的废代码）      | 零（AI 仅知道"存在什么"，按需调取） |
| **Token 利用率** | < 10%                                 | 接近 100%                           |

**一句话总结**：给 LLM 一个目录，而不是把书全铺在桌上。

#### 会话中的 Token 复用

新会话启动注入的 ~1,500 tokens 索引和 Summary，在后续对话中会怎样？

**标准模式（Append）**：索引被固定在 System Prompt 或最顶层历史记录中，每次用户发送消息时，这 ~1,500 tokens 会随请求一起重复发送（因为 LLM 无状态，必须重新阅读完整上下文）。

算一笔账（以 10 轮对话为例）：

- 重复计算：1,500 × 10 = **15,000 tokens**
- 成本：极低（输入 token 价格远低于输出）
- 收益：AI 在这 10 轮中随时随地能秒回跨会话问题（"前天那个组件是怎么设计的？"）

**架构师视角**：这比每次发现 AI 忘了历史、不得不人工复制粘贴几万字代码要划算得多。1.5 万 tokens 的成本换来的是会话级别的上下文连续性，完全在可接受预算内。

### 3.3 Memory Search — 三层搜索工作流

不一次性灌入所有历史，而是分三层，按需展开：

```
Layer 1: search()           → 轻量索引（ID + 标题 + 分类，~50-100 tokens/条）
Layer 2: timeline()         → 某条记录前后的时间线上下文（~100-200 tokens/条）
Layer 3: get_observations() → 只对筛选后的 ID 拉完整详情（500-1,000 tokens/条）
```

**Token 对比**：传统 RAG 一次拉 20 条 = 10,000-20,000 tokens（10% 有用）vs 三层搜索 = 2,500-4,000 tokens（接近 100% 有用）。**省了约 10 倍 token。**

**三个搜索工具**：

- **`search`** — 全文搜索，支持 `AND`/`OR`/`NOT`/短语，按 type/project/date 过滤
- **`timeline`** — 按 ID 或关键词定位锚点，展开前后 N 条上下文
- **`get_observations`** — 批量拉取完整详情（必须传数组 `ids=[123, 456, 789]`）

**6 个常见场景**：

| 场景             | 搜索策略                                                       |
| ---------------- | -------------------------------------------------------------- |
| **Debug**        | `search("error database", type="bugfix")` → timeline → 拉详情  |
| **回顾决策**     | `search("authentication", type="decision")` → 直接拉详情       |
| **代码考古**     | `search("worker-service.ts")` → timeline → 拉详情              |
| **功能演进**     | `search("dark mode", orderBy="date_asc")` → timeline → 拉详情  |
| **学习模式**     | `search(type="refactor")` → 拉详情研究模式                     |
| **重新接手项目** | `search(project, orderBy="date_desc")` → timeline → 拉关键决策 |

### 3.4 Knowledge Agents — 知识代理

把 observation 历史编译成一个**可对话的"大脑"**——不是返回原始搜索结果，而是综合回答。

**核心流程：Build → Prime → Query**：

```
BUILD（编译语料库）──>  PRIME（加载到 Claude 会话）──>  QUERY（对话提问）
```

1. **Build** — 从 observation 历史中按条件筛选，保存为 corpus 文件（`~/.claude-mem/corpora/*.corpus.json`）
2. **Prime** — 把整个 corpus 加载到 Claude Agent SDK 的会话中，返回 `session_id` 就是 agent
3. **Query** — 对话提问，每次追问自然累加到会话中
4. **Rebuild/Reprime** — 新 observation 加入后重新编译和加载

**vs Mem-Search**：

| 维度           | mem-search                 | knowledge-agent        |
| -------------- | -------------------------- | ---------------------- |
| **返回**       | 原始 observation 记录      | 综合回答               |
| **适用**       | 找具体的东西（ID、时间线） | 理解模式、决策、架构   |
| **Token 模型** | 按次付费（三层渐进）       | Prime 一次付，后续便宜 |
| **数据新鲜度** | 实时查库                   | 编译快照（需 rebuild） |

**经验法则**：要找到**具体的某件事**用 mem-search；要**理解全局**用 knowledge-agent。

**大白话类比**：

| 工具                | 像什么       | 典型问法                                                                                |
| ------------------- | ------------ | --------------------------------------------------------------------------------------- |
| **mem-search**      | `git log -S` | "上次修 auth.ts 那个 bug 的 ID 是多少？" → 返回那条记录                                 |
| **knowledge-agent** | 架构师分身   | "过去三个月我们在重构路由上踩了哪些坑？未来怎么规避？" → 读完所有语料，吐出一篇复盘报告 |

### 3.5 Progressive Disclosure — 渐进式披露

**核心原则**：先展示存在什么 + 获取成本。让 agent 自己决定要不要拉取。

传统 RAG 启动注入 35,000 tokens 历史（6% 有用），claude-mem 只注入 ~800 tokens 索引（100% 有用）。

**索引格式**：

```
### Oct 26, 2025
**src/hooks/context-hook.ts**
| ID | Time | T | Title | Tokens |
| #2591 | 1:15 AM | ⚖️ | Stderr messaging abandoned | ~155 |
| #2592 | 1:16 AM | 🟡 | Web UI strategy redesigned | ~193 |
```

**Legend 图标**：🔴 gotcha | 🟡 problem-solution | 🔵 how-it-works | 🟢 what-changed | 🟣 discovery | 🟠 why-it-exists | 🟤 decision | ⚖️ trade-off

---

## 四、Configuration — 配置

### 4.1 核心配置项

配置文件：`~/.claude-mem/settings.json`（首次运行自动创建）

| 环境变量                          | 默认值                      | 用途                                        |
| --------------------------------- | --------------------------- | ------------------------------------------- |
| `CLAUDE_MEM_MODEL`                | `claude-haiku-4-5-20251001` | 压缩 observation 用的模型                   |
| `CLAUDE_MEM_PROVIDER`             | `claude`                    | AI provider：`claude`/`gemini`/`openrouter` |
| `CLAUDE_MEM_CLAUDE_AUTH_METHOD`   | `cli`                       | 认证方式：`cli`/`gateway`/`api-key`         |
| `CLAUDE_MEM_MODE`                 | `code`                      | 工作模式（如 `code--zh` 中文）              |
| `CLAUDE_MEM_CONTEXT_OBSERVATIONS` | 50                          | 新会话注入的 observation 数量               |
| `CLAUDE_MEM_WORKER_PORT`          | `37700 + (uid % 100)`       | Worker 端口                                 |
| `CLAUDE_MEM_DATA_DIR`             | `~/.claude-mem`             | 数据根目录                                  |
| `CLAUDE_MEM_SKIP_TOOLS`           | 逗号分隔列表                | 不记录这些工具调用                          |
| `CLAUDE_MEM_LOG_LEVEL`            | `INFO`                      | 日志级别                                    |

### 4.2 Gateway 配置（ANTHROPIC_BASE_URL）

当使用非 Anthropic 模型（如 qwen3.6-plus 通过 DashScope gateway）时，需要配置 gateway：

**`~/.claude-mem/.env`**：

```
ANTHROPIC_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic
ANTHROPIC_AUTH_TOKEN=sk-sp-xxxxx
```

**`~/.claude-mem/settings.json`**：

```json
{
  "CLAUDE_MEM_PROVIDER": "claude",
  "CLAUDE_MEM_CLAUDE_AUTH_METHOD": "gateway",
  "CLAUDE_MEM_MODEL": "qwen3.6-plus"
}
```

**关键点**：

- `CLAUDE_MEM_MODEL` 原样传给 SDK，gateway 必须认识这个名字
- 凭证必须在 `~/.claude-mem/.env`，shell export 不可靠
- claude-mem 不自动检测 Claude Code 本身的 `ANTHROPIC_BASE_URL`，必须镜像到 `.env`

### 4.3 Modes & Languages

Mode 定义了 Observer Role、Observation Types、Concepts、Language。通过 `CLAUDE_MEM_MODE` 配置：

| Mode                  | 说明                                     |
| --------------------- | ---------------------------------------- |
| `code`                | 默认 Code 模式                           |
| `code--chill`         | 只记录"重新发现很痛苦"的东西             |
| `code--zh`            | 中文 Code 模式（observation 用中文生成） |
| `email-investigation` | 邮件分析模式                             |

### 4.4 Hook 超时时间

| 钩子                  | 超时                | 原因                     |
| --------------------- | ------------------- | ------------------------ |
| Setup (version-check) | 300s（实际 <100ms） | 只读版本标记             |
| SessionStart          | 60s                 | 启动 worker + 注入上下文 |
| UserPromptSubmit      | 60s                 | 创建会话记录             |
| PreToolUse (Read)     | 60s                 | 捕获文件读取             |
| PostToolUse           | 120s                | 最忙，AI 压缩            |
| Stop (summary)        | 120s                | 生成会话摘要             |

---

## 五、Best Practices — 最佳实践

### 5.1 Context Engineering（上下文工程）

**核心原则**：找到最小的、信号最强的 token 集合，最大化期望结果的概率。

**与 Prompt Engineering 的区别**：

| Prompt Engineering        | Context Engineering                                   |
| ------------------------- | ----------------------------------------------------- |
| 写 LLM 指令（一次性任务） | 持续管理上下文（迭代过程）                            |
| 管好 prompt 怎么写        | 管好 system prompt + 工具 + MCP + 外部数据 + 消息历史 |

**Context Rot**：LLM 有"注意力预算"，上下文增长时会消耗殆尽。每个 token attend 所有其他 token（n² 关系），上下文越长准确率越低。

**System Prompt 正确高度**：足够具体引导行为 + 足够灵活提供启发式 + 最小信息集完整描述期望行为。从最小 prompt 开始，根据失败模式逐步补充。

**长任务三技术**：

1. **Compaction** — 压缩对话历史，保留关键决策
2. **结构化笔记（Agentic Memory）** — Agent 写 NOTES.md 等外部文件
3. **Sub-Agent 架构** — 主 agent 管高层计划，子 agent 返回 1000-2000 token 压缩摘要

### 5.2 Progressive Disclosure（渐进式披露）

**核心原则**：先展示存在什么 + 获取成本。让 agent 自己决定要不要拉取。

**四层设计原则**：

1. **让成本可见** — 每条显示 token 数（~50 便宜直接拉，~500 要慎重）
2. **语义压缩** — 标题用 ~10 字说清楚
3. **按上下文分组** — 按日期、文件路径、项目分组
4. **提供检索工具** — 索引 + search → timeline → get_observations

**成功指标**：

- ✅ 有用 token / 总上下文 > 80%
- ✅ 显示 50 条索引，只拉 2-3 条详情
- ✅ 有索引 30 秒找到相关内容，无索引 90 秒扫描

### 5.3 两篇最佳实践的关系

**Context Engineering 是指导思想**——怎么管理有限注意力预算。
**Progressive Disclosure 是具体实现**——claude-mem 把上下文工程原则落地为三层搜索架构。

**共同核心**：上下文是货币，要省着花。

### 5.4 记忆垃圾回收（Memory GC）

长期使用后（1000+ 会话），SQLite 的 FTS5 索引和 Chroma 向量库会膨胀，且早期的某些观察认知会在后续重构中被废弃，导致 **Context Rot（上下文腐化）**——新会话被过时的历史数据干扰。

**常见腐化场景**：

- "发现 A 库版本不兼容" → 后续升级后已不再适用
- "选用了方案 X" → 后续重构中已切换为方案 Y
- 早期临时方案被当作"决策"持久化，误导新会话

**对策**：

- **定期审查**：用 `search(type="decision", orderBy="date_asc")` 按时间线扫描早期决策，确认哪些已固化到 CLAUDE.md 或文档中
- **标记归档**：利用 Knowledge Agent 的 Build 机制，定期把已固化的内容从活跃数据中标记为 archived
- **控制注入量**：`CLAUDE_MEM_CONTEXT_OBSERVATIONS` 不要设太高（默认 50 足够），避免注入过多陈旧上下文
- **按类型过滤**：注入时只保留高价值类型（`decision`、`gotcha`、`discovery`），跳过 `change` 类琐碎记录

**经验法则**：每 3-6 个月做一次记忆审查，把已写入文档的内容从 SQLite 中剥离。记忆系统不是越多越好，**相关性 > 完整性**。

---

## 六、Custom Maintenance Scripts — 自定义维护脚本

### `sync-mem-model.sh` — 模型同步 + Worker 重启

**位置**：`~/.claude/hooks/sync-mem-model.sh`

**做 3 件事**：

1. 读取 Claude Code 当前模型（`~/.claude/settings.json`）
2. 写入 `~/.claude-mem/settings.json` 的 `CLAUDE_MEM_MODEL`
3. 重启 worker 进程

```
Claude Code settings.json ──读──▶ 当前模型
                                    │
                                    ▼
                            ──写──▶ claude-mem/settings.json
                                    │
                                    ▼
                            ──重启──▶ worker 进程
```

### `check-claude-mem.sh` — 深度健康检查

**位置**：`~/.claude/hooks/check-claude-mem.sh`

| 检查项      | 告警条件                              |
| ----------- | ------------------------------------- |
| 端口监听    | 37777 端口未监听（等待 5 秒后）       |
| Worker 进程 | 找不到 PID 或进程已死                 |
| 模型一致性  | `ANTHROPIC_MODEL != CLAUDE_MEM_MODEL` |
| API 错误    | 最近 100 行日志中 > 5 次 API Error    |
| 日志活跃度  | > 900 秒（15 分钟）无活动             |
| 今日落库数  | 10 点后今日 observations = 0          |

### `switch-model.sh` 自动同步 `.env`

每次切换 provider 时，`~/.claude/switch-model.sh` 自动把新 gateway 的 URL 和 key 写入 `~/.claude-mem/.env`，避免 worker 自动重启后丢失凭证。

---

## 七、Actual Configuration — 实际配置记录

**变更时间**：2026-06-04

### 最终配置

| 配置项                            | 值             | 说明                                   |
| --------------------------------- | -------------- | -------------------------------------- |
| `CLAUDE_MEM_MODEL`                | `qwen3.6-plus` | 通过 DashScope gateway 转发            |
| `CLAUDE_MEM_MODE`                 | `code--zh`     | 中文 Code 模式，observation 用中文生成 |
| `CLAUDE_MEM_CLAUDE_AUTH_METHOD`   | `gateway`      | 从 `.env` 读取凭证                     |
| `CLAUDE_MEM_CONTEXT_OBSERVATIONS` | 50（默认）     | 新会话注入 50 条最近 observation       |

### `.env` 凭证持久化

**问题**：之前 gateway 凭证（`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`）只存在于 `~/.claude/settings.json` 中，由 `sync-mem-model.sh` 临时 export 给 worker。脆弱性：Worker 崩溃后 Bun 自动重启、系统重启、手动 restart 都可能导致变量丢失。

**解决**：创建 `~/.claude-mem/.env`（权限 0600），Worker 每次启动时 `EnvManager.loadClaudeMemEnv()` 自动读取。

**职责分工**：

| 文件                          | 存什么                           | 什么时候改                                   |
| ----------------------------- | -------------------------------- | -------------------------------------------- |
| `~/.claude-mem/.env`          | gateway URL + API key（通道）    | 切换 provider 时（switch-model.sh 自动同步） |
| `~/.claude-mem/settings.json` | `CLAUDE_MEM_MODEL`（走哪个模型） | 切模型时（sync-mem-model.sh 同步）           |
| `sync-mem-model.sh`           | 同步模型名 + 重启 worker         | 每次切模型                                   |

`.env` 修的是路，`settings.json` 选的是车。换车型不用重新修路。

**为什么保留 `sync-mem-model.sh`**：即使有了 `.env` 兜底凭证，模型名的同步和 worker 重启仍然需要它。除了 `switch-model.sh`，用户还可能通过 `/model` 命令切模型——那时 sync 脚本是唯一的同步路径。

---

## 八、人类开发者专属玩法

不要只把 claude-mem 当成 AI 的"补丁"。对人类开发者而言，它本质上是一个 **全自动无感知运行的、带语义分析的研发行为白盒子**。SQLite 数据库是跨项目共享的，沉淀的数据完全可以直接为人所用。

### 8.1 代码考古：取代无意义的 git log

**痛点**：接手半年前的旧模块，看到一行诡异的兼容代码，git blame 显示是自己写的，但完全想不起来当时遇到了什么坑。

**玩法**：直接搜索文件名或模块名：

```bash
# 通过 HTTP API 搜索
curl -s "http://localhost:37700/api/observations?limit=100" | jq '.[] | select(.files_modified[] | contains("auth"))'

# 或通过 mem-search 技能
search("worker-service.ts")
```

**你能看到什么**：完整的 Observation 链路——"发现 API 高并发下偶发 401（事实） → 判定为 JWT 验证中的竞态条件（技术决策） → 提取并重构了 useAuth 组件（重构事实）"。

**价值**：相当于一个自动生成的 "代码心理活动日志"，比 git log 多了一层 "为什么这么改"。

### 8.2 自动化生成周报 / Release Notes

**痛点**：每周五花半小时凭记忆写周报、交付文档。

**玩法**：用 HTTP API 拉取本周 observation，喂给任意大模型润色：

```typescript
// get-my-weekly.ts
const res = await fetch("http://localhost:37700/api/observations?limit=100");
const data = await res.json();
// 筛选出本周的 type === 'feature' 或 'bugfix'
// 喂给大模型："帮我把这些开发事实润色成一份本周的周报交付文档"
```

**价值**：由于 observation 精准记录了改了哪些文件（`files_modified`）、解决了什么 Bug，生成的周报比凭记忆写的要精准、详实得多。

### 8.3 跨项目技术决策库（ADR）

**痛点**：在 A 项目封装了大文件分片上传的 Hooks，三个月后在 B 项目又遇到了，只记得"我以前做过"，但不记得细节。

**玩法**：claude-mem 的 SQLite 数据库是 **跨项目共享** 的（带 `project` 字段），直接在终端搜索：

```
search("slice upload", type="decision")
```

一秒钟找回三个月前在另一个项目里做出的架构决策和核心思路。

### 8.4 打通桌面工具链（MCP 集成）

claude-mem 原生支持 Claude Desktop MCP。这意味着它的记忆不仅能给终端的 Claude Code 用，还能赋能整个桌面生态：

- **Cursor / VS Code**：接入本地 claude-mem MCP 服务后，编辑器内的 AI 辅助面板可以直接调用 `search` 和 `timeline` 工具，读取你在终端用 Claude Code 调试出来的排错历史。
- **个人 RAG 知识库**：将 `~/.claude-mem/corpora/` 下的 `.corpus.json` 语料库导入 Obsidian 或 Notion，作为个人的 AI 辅助编程知识库。

### 8.5 团队新人的项目上下文

**传统做法**：丢一个过时的 README.md，花两小时口述项目架构。

**优雅做法**：开启 Folder Context Files 自动化后，claude-mem 自动为每个模块文件夹增量生成 `CLAUDE.md`，连同代码一起推送到 Git。新人拉下代码后，不需要装任何工具，光是读这个实时更新的 `CLAUDE.md` 里的活动时间线，就能摸清项目过去两周都在发生什么、怎么提交、规避了哪些坑。

---

## 九、高频排查与维护 Cheatsheet

| 遇到问题                                   | 排查原因                                                                     | 解决手段 / 命令                                                                                                                                                       |
| :----------------------------------------- | :--------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **切换模型后，记忆压缩没生效**             | Worker 没感知到新模型或网关凭证                                              | 运行 `sync-mem-model.sh` 并检查 `~/.claude-mem/.env` 是否已同步                                                                                                       |
| **明明刚做完的操作，新会话搜不到**         | 后台 AI 压缩队列（Pending Queue）积压                                        | 访问 `http://localhost:37700/api/pending-queue` 查看队列状态，或重启 worker                                                                                           |
| **不小心把敏感信息漏给 AI 压缩了**         | 触发了敏感数据录入                                                           | 1. 用 SQLite 工具直接删除 `~/.claude-mem/claude-mem.db` 中对应 ID 的记录<br>2. 后续在 prompt 中用 `<private>` 标签包裹敏感内容                                        |
| **Worker 进程死锁或端口冲突**              | 多实例运行或 PID 文件的端口未释放                                            | `npx claude-mem repair` 或手动 `kill -9 $(cat ~/.claude-mem/worker.pid \| jq -r '.pid')`                                                                              |
| **新会话注入的上下文全是旧内容**           | `CLAUDE_MEM_CONTEXT_OBSERVATIONS` 设得过高，或早期 observation 已腐化        | 降低 `CLAUDE_MEM_CONTEXT_OBSERVATIONS`（默认 50 足够），定期用 `search(type="decision", orderBy="date_asc")` 审查早期决策                                             |
| **健康检查报 MODEL 未同步**                | `settings.json` 的模型已改，但 `claude-mem/settings.json` 未同步             | 运行 `sync-mem-model.sh`，或手动 `jq --arg model "qwen3.6-plus" '.CLAUDE_MEM_MODEL = $model' ~/.claude-mem/settings.json > tmp && mv tmp ~/.claude-mem/settings.json` |
| **Worker 日志正常但今日 observations = 0** | Worker env 中 `ANTHROPIC_AUTH_TOKEN` 失效或队列卡死                          | 1. `cat ~/.claude-mem/.env` 确认凭证<br>2. `curl -s http://localhost:37700/api/stats` 检查项目数据<br>3. 重启 worker                                                  |
| **Folder Context Files 没自动生成**        | `CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED` 未设为 `"true"`，或修改发生在项目根目录 | 1. `jq '.CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED' ~/.claude-mem/settings.json` 确认<br>2. 根目录（含 `.git`）不生成，这是设计行为                                          |

### 常用维护命令

```bash
# 查看 worker 状态
curl -s http://localhost:37700/api/stats | jq '.'

# 查看待处理队列
curl -s http://localhost:37700/api/pending-queue | jq '.'

# 手动触发队列处理
curl -s -X POST http://localhost:37700/api/pending-queue/process

# 查看最近的 observation
curl -s "http://localhost:37700/api/observations?limit=5" | jq '.'

# 健康检查
bash ~/.claude/hooks/check-claude-mem.sh

# 同步模型 + 重启 worker
bash ~/.claude/hooks/sync-mem-model.sh

# 修复 claude-mem（版本不匹配、端口冲突）
npx claude-mem repair
```
