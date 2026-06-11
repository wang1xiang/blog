---
title: "mimo-code-小米-AI-编码代理调研"
published: 2026-06-11
description: "调研对象： 调研版本：0.1.0（2026-06 早期版本）"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# MiMo Code（小米 AI 编码代理）调研

调研对象：<https://mimo.xiaomi.com/zh/mimocode/start>
调研版本：0.1.0（2026-06 早期版本）

> 🎁 **重点福利**：MiMo-V2.5 模型当前**免费不限量使用**，通过 `/connect` 选 Xiaomi MiMo 即可。这是评估它最直接的理由——零成本试 Compose 工作流和多 provider 体验。

## 一句话定性

**MiMo Code = 小米品牌化的 [sst/opencode](https://github.com/sst/opencode) 分发版 + Xiaomi MiMo 模型生态 + 把 obra/superpowers 工作流硬塞成内置 Compose 模式。**

判定证据（文档里的 OpenCode 印记）：

- mDNS 默认域名 `opencode.local`
- 远程组织端点文档写 `.well-known/mimocode`，源码实际请求 `.well-known/opencode`
- 分享链接域名 `opncd.ai/s/<id>`
- macOS MDM 配置文件 `ai.opencode.managed.plist`
- 独立开关 `MIMOCODE_DISABLE_OPENCODE_SKILLS`
- 插件 SDK 包名 `@@mimocode/cli/plugin`（双 @ 疑似笔误未修）
- Schema URL `https://mimo.xiaomi.com//config.json`（双斜杠）

理解这点，下面所有差异都说得通：MiMo 是给 OpenCode 套了一层小米品牌、模型计费和工作流包，不是从零自研。

## 安装

```bash
# Mac/Linux（已实测可用）
curl -fsSL https://mimo.xiaomi.com/install | bash

# Windows
npm install -g @mimo-ai/cli
```

脚本流程：探测平台 → 拉 GitHub release（仓库 `XiaomiMiMo/MiMo-Code`）→ 解压到 `~/.mimocode/bin` → 写 PATH 到 `.zshrc`。
支持 `--version <ver>`、`--binary <path>`、`--no-modify-path`。

可执行文件：`~/.mimocode/bin/mimo`
首次运行会做 sqlite 数据库迁移。

## 关键路径

```
~/.mimocode/bin/mimo          # CLI 二进制
~/.config/mimocode/           # 全局配置（XDG）
  ├── mimocode.json(c)        # 主配置（集中所有运行时参数）
  ├── tui.json                # TUI/主题/键位（写主配置里会被静默丢弃）
  ├── agents/*.md             # 自定义 agent
  ├── commands/*.md           # 自定义命令
  ├── skills/                 # 自定义 skill
  └── themes/*.json           # 自定义主题
~/.local/share/mimocode/      # 数据
  ├── auth.json               # provider API keys（0o600）
  ├── log/                    # 应用日志（保留最近 10 个）
  ├── project/<slug>/storage/ # 会话数据（按 git 仓库分组）
  └── mimocode.db             # 会话数据库
~/.cache/mimocode/            # provider SDK 动态下载缓存
```

可用 `MIMOCODE_HOME=<绝对路径>` 整体迁移上述四目录。

## CLI 子命令全景

子命令架构比 Claude Code 分裂得多，是 OpenCode 血统：

```
mimo [project]                # 启 TUI（默认）
mimo run [message..]          # 非交互式跑一句
mimo serve                    # 启 HTTP server
mimo web                      # 启 server + 浏览器 UI
mimo acp                      # Agent Client Protocol 服务
mimo attach <url>             # 附着到运行中的 mimo server
mimo session list             # 会话管理
mimo stats                    # token/工具/模型用量统计
mimo models [provider]        # 列模型，--refresh 刷新 models.dev
mimo providers / mimo auth    # provider 凭证管理
mimo mcp add/list/auth/logout/debug  # MCP 治理
mimo agent / mimo agent create       # agent 管理
mimo plugin <module>          # npm 包形式的插件
mimo github run --event --token      # 模拟 GitHub event
mimo pr <number>              # 拉 PR 分支并启动
mimo upgrade [target] --method curl|npm|pnpm|bun|brew
mimo uninstall --keep-config --keep-data --dry-run
mimo export/import <file|url> # 会话导出导入
```

## 与 Claude Code 的核心差异表

| 维度                 | Claude Code                             | MiMo Code                                                                              |
| -------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| 模型                 | 仅 Anthropic（+ Bedrock/Vertex）        | 75+ provider，AI SDK + Models.dev 动态加载                                             |
| 规则文件             | `CLAUDE.md`                             | `AGENTS.md`，回退兼容读 `CLAUDE.md`                                                    |
| 配置中心             | `~/.claude.json` + `settings.json` 散布 | `mimocode.json(c)` 集中 + 凭证拆 `auth.json` + TUI 拆 `tui.json`                       |
| 数据目录             | `~/.claude/`                            | `~/.local/share/mimocode/`（XDG 规范）                                                 |
| 默认遥测             | 提示明显可关                            | **默认开**（`MIMOCODE_ENABLE_ANALYSIS=true`），上报 model_call/tool_call/agent_request |
| 默认自动更新         | 开                                      | **默认关**（`MIMOCODE_DISABLE_AUTOUPDATE=true`）                                       |
| 默认 Claude 生态兼容 | —                                       | **默认关**（`MIMOCODE_MIMO_ONLY=true`，不读 `.claude/`/provider env）                  |
| 切模式               | `Shift+Tab`                             | `Tab`                                                                                  |
| 前导键               | 无                                      | `ctrl+x`（Emacs/tmux 风）                                                              |

## MiMo 独有能力（CC 没有）

按重要性排：

1. **Compose 模式 + 13 个内置工作流 Skills**
   把 [obra/superpowers](https://github.com/obra/superpowers) 移植成官方一等公民模式。13 个 skill：`tdd / debug / verify / brainstorm / plan / execute / parallel / review / feedback / worktree / merge / subagent / new-skill`。Tab 切到 Compose 或 `@compose` 调用，随版本对齐分发到 `{data}/compose/{version}/`，通过 `compose:<short-name>` 命名空间引用。**MiMo 最大的产品差异化决策。**

2. **`/undo` / `/redo`**
   基于 Git 反转文件改动 + 撤回消息流。CC 没有。

3. **会话原生 fork**
   `mimo --continue --fork`、`mimo --session <id> --fork`，HTTP 接口支持任意消息点分叉。

4. **`question` 工具**
   模型能结构化反问用户：标题 + 问题 + 候选项列表，用户多选/自填后统一提交。

5. **Formatters（24 种内置）**
   写完文件按扩展名自动跑 prettier/ruff/rustfmt/gofmt/biome 等。CC 无。

6. **LSP（32 种内置 + 自动下载二进制）**
   打开文件自动启 LSP 拿诊断喂给 LLM。CC 要装 `typescript-lsp` 这种插件。

7. **自定义工具（TS 函数，不走 MCP）**
   `.mimocode/tools/*.ts` 写 `export default tool({...})`，能拿到 `sessionID/worktree/directory` 上下文，能覆盖内置 `bash` 行为。

   ```typescript
   import { tool } from "@@mimocode/cli/plugin";
   export default tool({
     description: "Query the project database",
     args: { query: tool.schema.string() },
     async execute(args, context) {
       /* context: agent/sessionID/worktree/directory */
     },
   });
   ```

8. **服务化运行**
   `mimo serve` / `mimo web` / `mimo acp` / `mimo attach <url>`，自带 HTTP/Web/ACP。一个 mimo 可附到另一台机器上运行的 mimo，配 `--mdns` 局域网自动发现。

9. **权限模型更细**
   - 三态 `allow/ask/deny` + per-tool 对象 + glob 模式（`mymcp_*: ask`）
   - 独有 `external_directory`（默认 ask，限 cwd 外路径）
   - 独有 `doom_loop`（同一工具同输入重复 3 次拦截）
   - bash 按命令 glob：`"git push": "ask"` `"git status *": "allow"`
   - **匹配语义是"最后匹配胜出"**（CC 是先匹配胜出，反向）
   - macOS MDM plist 企业强制层凌驾用户层

10. **变体（variants）+ `ctrl+t` 切换**
    同模型多套 reasoning effort 预设：Anthropic `high/max`，OpenAI `minimal/low/medium/high/xhigh`，Google `low/high`。

11. **会话分享生态**
    `/share` → `opncd.ai/s/<id>` → `mimo import https://opncd.ai/s/...` 续别人会话。

12. **完整可自定义键位 + 命令面板**
    `tui.json` 全部快捷键可改，`ctrl+x` 前导 + `ctrl+p` 命令面板 + `F2/shift+F2` 最近模型循环切。

13. **JSON 主题系统**
    11 内置（`mimocode`/`tokyonight`/`everforest`/`ayu`/`catppuccin`/`gruvbox`/`kanagawa`/`nord`/`matrix`/`one-dark`/`system`），深细分到 `syntax*/markdown*/diff*` 几十色键，支持 dark/light 双色变体、`defs` 变量、项目级覆盖。

14. **`mimo stats`、`mimo upgrade --method`、`mimo uninstall --dry-run`、`mimo github run`**
    内置 token 统计、多包管理器升级器、卸载器、GitHub 事件模拟。

15. **MCP OAuth 一等公民**
    `mimo mcp add/list/auth/logout/debug`，Token 存 `~/.local/share/mimocode/mcp-auth.json`，支持 RFC 7591 动态客户端注册，组织可通过 `.well-known/mimocode` 端点下发默认 MCP。

16. **`.ignore` 反向白名单**
    项目根 `.ignore` 可显式 `!node_modules/` 允许通常被 gitignore 排除的目录。

## CC 兼容的真实边界

### 真的能用（目录扫描兼容）

| 资源      | 兼容路径                                                                        |
| --------- | ------------------------------------------------------------------------------- |
| Skills    | `~/.claude/skills/`、`.claude/skills/`（+ `.codex/`、`.opencode/`、`.agents/`） |
| Agents    | `~/.claude/agents/`、`.claude/agents/`                                          |
| Commands  | 占位符 `$ARGUMENTS` `!cmd` `@file` 通用，frontmatter 兼容                       |
| MCP       | 从 `~/.claude.json` 的 `mcpServers` 字段注入（同名跳过）                        |
| CLAUDE.md | 作为 `AGENTS.md` 缺失时的回退                                                   |

### 静默失效的部分（用户没报错但功能没生效）

- **Hooks**：MiMo 通篇无 PreToolUse/PostToolUse/Stop 这套机制。CC plugin 里靠 hooks 实现的自动化（commit 拦截、保存触发等）全失效
- **Output Styles**：无（MiMo 用 themes + tui 替代）
- **Statusline 自定义**：未见等价物
- **CLAUDE.md 中的 `@import`**：MiMo 不自动解析，要用 `instructions` 字段或显式 Read
- **CC plugin 系统**：与 MiMo 的 `plugin`（npm 包引用）是不同概念，plugin 里的 skills/commands/agents 部分能用，hooks/output styles 部分失效

### mimo-only 默认值的矛盾

文档说 `MIMOCODE_MIMO_ONLY=true` 是默认值，按此模式**不读 `.claude/` 的 prompt 和 skills、不读 `ANTHROPIC_API_KEY` 等 provider env**。但实测可用 CC skill——可能文档不准（0.1.0 早期），也可能安装时自动绕过。

验证方法：

```bash
env | grep MIMOCODE
mimo --log-level DEBUG 2>&1 | grep -i 'claude\|skill\|agent' | head -20
```

### 影响范围控制

- `MIMOCODE_DISABLE_CLAUDE_CODE=1` 全禁兼容
- `MIMOCODE_DISABLE_CLAUDE_CODE_PROMPT=1` 仅禁 CLAUDE.md
- `MIMOCODE_DISABLE_CLAUDE_CODE_SKILLS=1` 仅禁 .claude/skills
- `MIMOCODE_DISABLE_CLAUDE_CODE_MCP=1` 禁 MCP 兼容（mimo-only 下仍默认开）

## 迁移用名词映射

| Claude Code             | MiMo Code                                          |
| ----------------------- | -------------------------------------------------- |
| `CLAUDE.md`             | `AGENTS.md`（兼容读 CLAUDE.md）                    |
| `~/.claude/`            | `~/.config/mimocode/` + `~/.local/share/mimocode/` |
| `~/.claude.json`        | `mimocode.json(c)` + `auth.json` + `tui.json`      |
| `.claude/settings.json` | `.mimocode/mimocode.json`                          |
| `.claude/skills/`       | `.mimocode/skills/`（兼容多家）                    |
| `.claude/agents/`       | `.mimocode/agents/`                                |
| `.claude/commands/`     | `.mimocode/commands/`                              |
| `.mcp.json`             | `mimocode.json` 的 `mcp` 字段                      |
| `claude` (CLI)          | `mimo` (CLI)                                       |
| `Shift+Tab` 切模式      | `Tab` 切 agent（Plan/Build/Compose）               |
| `/clear`                | `/new`（别名 `/clear`，`ctrl+x n`）                |
| `/compact`              | `/compact`（别名 `/summarize`，`ctrl+x c`）        |
| 无                      | `/undo` `/redo` / `mimo --fork` / `mimo session`   |
| 无                      | `ctrl+x` leader-key + `ctrl+p` 命令面板            |

## 关键斜杠命令速查

| 命令                | 别名                  | 快捷键                       |
| ------------------- | --------------------- | ---------------------------- |
| `/connect`          | —                     | —                            |
| `/compact`          | `/summarize`          | `ctrl+x c`                   |
| `/init`             | —                     | `ctrl+x i`（生成 AGENTS.md） |
| `/new`              | `/clear`              | `ctrl+x n`                   |
| `/sessions`         | `/resume` `/continue` | `ctrl+x l`                   |
| `/share` `/unshare` | —                     | `ctrl+x s`                   |
| `/undo` `/redo`     | —                     | `ctrl+x u/r`                 |
| `/models`           | —                     | `ctrl+x m`                   |
| `/themes`           | —                     | `ctrl+x t`                   |
| `/editor`           | —                     | `ctrl+x e`（用 `$EDITOR`）   |
| `/export`           | —                     | `ctrl+x x`（导 Markdown）    |
| `/thinking`         | —                     | 切思考块显示                 |
| `/details`          | —                     | `ctrl+x d`（切工具执行详情） |

## 判断与建议

### Claude Code 仍然强的地方

1. **模型本身**：Sonnet/Opus 在编码上的稳定性 MiMo 自家模型短期追不上
2. **生态成熟度**：Skills、Hooks、Subagent 积累一年多，社区/插件目录更厚
3. **Hooks**：MiMo 无等价机制（核心可编程点）
4. **IDE 集成**：CC 有 VSCode/JetBrains 官方扩展，MiMo 未见（acp 协议留了口子）
5. **细节稳定**：MiMo 文档多处"实验性"标签（LSP 工具、Plan 模式、HTTP API、Workspaces、Markdown 渲染），含官方笔误

### 不建议换主力的理由

- 0.1.0 极早期，多处实验特性
- 拼装感明显（OpenCode 套壳 + 小米模型 + 工作流硬塞）
- 关键能力缺失（hooks、IDE 集成）

### 值得抄回 CC 的设计

1. **`/undo` / `/redo`** —— CC 真该加
2. **会话 fork + 分享链接互导** —— 协作场景有用
3. **`question` 工具结构化反问** —— 比纯文字提问体验好
4. **`doom_loop` 重复调用拦截 + `external_directory` 限制** —— 安全护栏值得抄
5. **Compose 模式把 superpowers 工作流做成一等公民** —— CC 用户自己装超能力插件是绕路

### 真正适合换的人

- 在国内、希望国产模型计费、对 Anthropic 出海合规敏感
- 想用 OpenCode 体系但希望商业公司维护
- 重度多 provider 用户（同时用 OpenAI/Anthropic/Kimi/Gemini，且不想用 OpenRouter）
- 想试 superpowers 工作流但懒得装的人

### 我的策略

观察 2-3 个版本（0.3+ 大概率修掉早期问题）再认真评估，现在把它当**竞品参考**，留 Claude Code 做主力。
