---
title: "claude-mem故障排查与修复实录"
published: 2026-05-26
description: "claude-mem 是一个为 Claude Code 提供\"长期记忆\"的开源工具，通过 MCP 协议实现跨会话、跨项目的记忆存储。某天发现 2026-04-17 到 2026-04-22 之间 5 天的观察记录全部丢失。"
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# claude-mem 故障排查与修复实录

## 背景

claude-mem 是一个为 Claude Code 提供"长期记忆"的开源工具，通过 MCP 协议实现跨会话、跨项目的记忆存储。某天发现 2026-04-17 到 2026-04-22 之间 5 天的观察记录全部丢失。

## 排查过程

### 第一步：确认数据丢失范围

```bash
sqlite3 ~/.claude-mem/claude-mem.db "SELECT date(created_at, 'localtime') as day, count(*) FROM observations GROUP BY day ORDER BY day DESC;"
```

结果：

- 4/17 之前：大量记录（每天 250-400 条）
- **4/17 到 4/22：0 条（5 天空白）**
- 4/22 之后：恢复正常

### 第二步：定位问题

**假象**：一开始以为是 hooks 丢失导致 observation 没被收集。

**真相**：检查 `pending_messages` 表发现有 166 条 `status='failed'` 的记录，说明 hooks 一直工作，observation 被收集了，但处理失败了。

### 第三步：查日志找根因

```bash
tail -100 ~/.claude-mem/logs/claude-mem-2026-04-20.log
```

关键日志：

```
[SDK] API Error: 400 {"error":{"code":"invalid_parameter_error","message":"model `claude-sonnet-4-5` is not supported"...}
[DB] STORED | obsCount=0 | obsIds=[]
```

**根因**：claude-mem worker 默认模型是 `claude-sonnet-4-5`（硬编码在 worker-service.cjs 中），但我们用的是 DashScope（阿里云）API，不支持这个模型。所有 API 调用都返回 400 错误，observation 被标记为 `failed` 后丢弃。

**为什么之前能工作？** claude-mem 是**按项目隔离**的。其他项目（`某 Vue 3 项目`、`某 PC 项目` 等）的 hooks 一直存在，那些项目用的是不同的 API 端点。只有 `claudecode` 这个项目的 hooks 之前被清掉了。

## 修复过程

### 修复 1：修改 worker 模型配置

```bash
# 修改 ~/.claude-mem/settings.json
"CLAUDE_MEM_MODEL": "qwen3.6-plus"  # 改成 DashScope 支持的模型
```

### 修复 2：恢复 hooks 到 settings.json

在 `~/.claude/settings.json` 中添加 claude-mem 的 6 个 hooks：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; _P=\"$HOME/.claude/plugins/marketplaces/thedotmack/plugin\"; node \"$_P/scripts/bun-runner.js\" \"$_P/scripts/worker-service.cjs\" start)",
        "timeout": 60
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; _P=\"$HOME/.claude/plugins/marketplaces/thedotmack/plugin\"; node \"$_P/scripts/bun-runner.js\" \"$_P/scripts/worker-service.cjs\" hook claude-code observation)",
            "timeout": 120
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; _P=\"$HOME/.claude/plugins/marketplaces/thedotmack/plugin\"; node \"$_P/scripts/bun-runner.js\" \"$_P/scripts/worker-service.cjs\" hook claude-code session-init)",
            "timeout": 60
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; _P=\"$HOME/.claude/plugins/marketplaces/thedotmack/plugin\"; node \"$_P/scripts/bun-runner.js\" \"$_P/scripts/worker-service.cjs\" hook claude-code summarize)",
            "timeout": 120
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; _P=\"$HOME/.claude/plugins/marketplaces/thedotmack/plugin\"; node \"$_P/scripts/bun-runner.js\" \"$_P/scripts/worker-service.cjs\" hook claude-code session-complete)",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### 修复 3：去掉环境变量隔离，让 worker 自动继承

之前的方案是 `(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; ...)`，这样每次切换国内模型都要手动改配置。

**最终方案**：去掉 `unset`，让 worker 直接继承 Claude Code 的环境变量。

```bash
# 修改 ~/.claude-mem/settings.json
# 删除 "CLAUDE_MEM_MODEL" 这一行，让 worker 继承 ANTHROPIC_MODEL

# 修改 ~/.claude/settings.json
# 去掉所有 hooks 里的 "(unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL; ...)"
```

这样以后切换国内模型时，worker 自动就用新的了。

## 预防机制

### 1. 状态栏实时显示

修改 `~/.claude/statusline-command.sh`，在状态栏添加 claude-mem 状态：

```bash
# 检查 claude-mem status
cmem_status=""
if lsof -i :37777 >/dev/null 2>&1; then
  cmem_status=" 🧠"
else
  cmem_status=" 🚨"
fi
```

- `🧠` = claude-mem 正在运行
- `🚨` = claude-mem 挂了

### 2. 会话启动时自动检查

在 `SessionStart` hook 中添加健康检查：

```bash
if lsof -i :37777 >/dev/null 2>&1; then
  echo "{\"systemMessage\": \"🧠 claude-mem 正在运行\"}"
else
  echo "{\"systemMessage\": \"🚨 claude-mem 未运行！运行 ~/.claude/hooks/fix-claude-mem.sh 修复\"}"
fi
```

### 3. 自动诊断修复脚本

创建了 `~/.claude/hooks/fix-claude-mem.sh`，一键诊断和修复：

```bash
~/.claude/hooks/fix-claude-mem.sh
```

脚本自动检查：

1. Worker 是否在运行
2. 端口 37777 是否被占用
3. 最近 1 小时是否有新 observation
4. pending/failed 队列状态
5. hooks 是否在 settings.json 中
6. 今天是否有错误日志

## claude-mem 架构回顾

```
用户操作 → Claude Code Hooks → pending_messages (队列)
                                    ↓
                           Worker Service (处理)
                                    ↓
                           AI 总结 (@anthropic-ai/claude-agent-sdk)
                                    ↓
                           observations (结构化记录)
                                    ↓
                           SQLite + FTS5 + ChromaDB (存储)
                                    ↓
                           MCP 搜索工具 (检索)
```

### 核心组件

| 组件       | 作用                  | 技术栈                         |
| ---------- | --------------------- | ------------------------------ |
| Hooks      | 捕获生命周期事件      | Claude Code settings.json      |
| Worker     | 处理 observation 队列 | Node.js + bun                  |
| SDK        | AI 总结 observation   | @anthropic-ai/claude-agent-sdk |
| 数据库     | 存储结构化记录        | SQLite + FTS5 + ChromaDB       |
| MCP Server | 语义搜索工具          | Express.js + SSE               |

### 6 个生命周期 Hooks

| Hook               | 触发时机   | 作用                    |
| ------------------ | ---------- | ----------------------- |
| `SessionStart`     | 会话开始   | 启动 Worker，加载上下文 |
| `UserPromptSubmit` | 用户输入时 | 初始化会话              |
| `PostToolUse`      | 工具调用后 | 记录 observation        |
| `Stop`             | 会话停止   | 总结会话                |
| `SessionEnd`       | 会话结束   | 清理资源                |
| `TeammateIdle`     | 空闲时     | 可选的通知              |

## 踩坑记录

### 1. 数据丢失不是没收集，是 API 调用失败

一开始以为是 hooks 丢失，后来发现 `pending_messages` 表有 166 条 failed 记录。logs 里有 4429 条 observation 相关日志，说明 hooks 一直在工作。

**教训**：收集和处理是两个阶段，要分别检查。

### 2. 模型配置是硬编码默认值

`worker-service.cjs` 中有硬编码：

```javascript
static DEFAULTS = {
  CLAUDE_MEM_MODEL: "claude-sonnet-4-5",
  ...
}
```

当 `~/.claude-mem/settings.json` 中没有配置或配置不生效时，就会用这个默认值。

### 3. claude-mem 是按项目隔离的

每个项目有自己独立的 `.claude/settings.json` 和 hooks。`claudecode` 项目没有 hooks，但其他项目有，所以看起来"部分工作"。

### 4. `daily-recap` 是基于 observations 表的

`/daily-recap` skill 查询的是已总结的 observations，不是原始对话。如果 observation 处理失败，daily-recap 就会显示空。

### 5. `${CLAUDE_PLUGIN_ROOT}` 在 settings.json 中不可用

claude-mem 的 hook 命令用了 `${CLAUDE_PLUGIN_ROOT}`，但这个变量只在插件的 `hooks.json` 中可用，在 `settings.json` 中会报错。需要改成绝对路径。

## 总结

1. **claude-mem 的核心是 hooks + worker + 数据库**，任何一环出问题都会导致记录丢失
2. **日志是最好的诊断工具**，`~/.claude-mem/logs/` 记录了所有处理过程
3. **环境变量隔离是一把双刃剑**，既能避免 API 冲突，也会导致配置不同步
4. **自动化监控很重要**，状态栏 + 启动检查 + 诊断脚本，让你不再靠"猜"来判断系统状态

---

\*\*最后修改: 2026-05-14

## 第二次故障：2026-05-13 大规模 observations 丢失

### 现象

5 月 13 日生成 daily-recap 时发现当天 0 条 observations。检查数据库：

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
SELECT strftime('%Y-%m-%d', created_at) as day, COUNT(*)
FROM observations
GROUP BY day
ORDER BY day DESC
LIMIT 10;
"
```

结果：observations 最后记录在 **2026-05-09**，之后 4 天全部空白。

### 排查过程

**第一步：确认 session 和 prompts 正常**

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
SELECT strftime('%Y-%m-%d', started_at) as day, COUNT(*)
FROM sdk_sessions
GROUP BY day
ORDER BY day DESC
LIMIT 10;
"
```

5 月 13 日有 **55 个 session、316 条 prompts**，说明 hooks 正常工作，问题出在 observation 处理阶段。

**第二步：查看 pending_messages**

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
SELECT message_type, status, COUNT(*)
FROM pending_messages
GROUP BY message_type, status;
"
```

结果：**580 条 failed**（523 observation + 57 summarize）。

**第三步：查日志找根因**

```bash
grep "qwen3.6-plus\|Response received" ~/.claude-mem/logs/claude-mem-2026-05-13.log
```

关键错误：

```
[INFO ] [SDK   ] [session-343] ← Response received (146 chars)
  There's an issue with the selected model (qwen3.6-plus).
  It may not exist or you may not have access...
```

**根因**：`qwen3.6-plus` 模型在 DashScope 上短暂不可用，所有 SDK 子进程的 API 调用都返回 146 字符的错误信息。observation 处理失败后被标记为 `failed`，最终丢弃。

**为什么主会话能用？**

- 主会话（你直接交互的 Claude Code）可能因连接复用避开了错误窗口
- SDK 子进程（claude-mem 启动的 agent）每次都是新请求，直接命中模型不可用状态

### 修复过程

**修复 1：切换 claude-mem 模型**

```bash
# ~/.claude-mem/settings.json
"CLAUDE_MEM_MODEL": "qwen3-coder-plus"  # 临时切换
```

**修复 2：重启 worker**

```bash
kill $(cat ~/.claude-mem/worker.pid)
nohup bun ~/.claude/plugins/marketplaces/thedotmack/plugin/scripts/worker-service.cjs --daemon > /dev/null 2>&1 &
```

**修复 3：清理 failed messages**

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
DELETE FROM pending_messages WHERE failed_at_epoch IS NOT NULL;
"
```

**修复 4：验证恢复**

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
SELECT id, title, project, created_at
FROM observations ORDER BY created_at_epoch DESC LIMIT 5;
"
```

新 observations 正常写入，确认修复成功。

### 关键发现：claude-mem 模型配置独立

```javascript
// worker-service.cjs 中的 getModelId()
getModelId() {
  let e = path.join(homedir(), ".claude-mem", "settings.json");
  return Ee.loadFromFile(e).CLAUDE_MEM_MODEL;  // 只读 claude-mem 配置！
}
```

**问题**：`CLAUDE_MEM_MODEL` 和 Claude Code 主会话的 `ANTHROPIC_MODEL` 是两套独立配置。切换 `/model` 或 `switch-model.sh` 时，claude-mem 不会自动跟随。

### 预防方案：Hook 自动同步

**方案 1：SessionStart hook 自动同步**

创建 `~/.claude/hooks/sync-mem-model.sh`：

```bash
#!/bin/bash
CLAUDE_SETTINGS="$HOME/.claude/settings.json"
MEM_SETTINGS="$HOME/.claude-mem/settings.json"

CLAUDE_MODEL=$(jq -r '.env.ANTHROPIC_MODEL // .model // empty' "$CLAUDE_SETTINGS")
MEM_MODEL=$(jq -r '.CLAUDE_MEM_MODEL // empty' "$MEM_SETTINGS")

if [ -n "$CLAUDE_MODEL" ] && [ "$CLAUDE_MODEL" != "$MEM_MODEL" ]; then
  jq --arg model "$CLAUDE_MODEL" '.CLAUDE_MEM_MODEL = $model' \
     "$MEM_SETTINGS" > "${MEM_SETTINGS}.tmp" && mv "${MEM_SETTINGS}.tmp" "$MEM_SETTINGS"
  echo '{"systemMessage": "🔄 已同步 claude-mem 模型: '"$MEM_MODEL"' → '"$CLAUDE_MODEL"'"}'
fi
```

在 `~/.claude/settings.json` 的 `SessionStart` hook 中添加：

```json
{
  "type": "command",
  "command": "bash \"$HOME/.claude/hooks/sync-mem-model.sh\"",
  "statusMessage": "🔄 同步 claude-mem 模型...",
  "timeout": 5
}
```

**方案 2：增强 switch-model.sh**

在 `~/.claude/switch-model.sh` 的 `switch_channel_model()` 函数末尾添加：

```bash
# 同步到 claude-mem
if [ -f "$HOME/.claude/hooks/sync-mem-model.sh" ]; then
  bash "$HOME/.claude/hooks/sync-mem-model.sh" > /dev/null 2>&1
fi
```

这样每次切换模型时，claude-mem 自动跟随，避免两套配置不一致导致的故障。

## 新增踩坑记录

### 6. SDK 子进程和主会话的模型调用路径不同

主会话直接调用 Claude Code CLI，SDK 子进程通过 `@anthropic-ai/claude-agent-sdk` 启动。两者读取配置的时机和方式不同，可能出现主会话正常但 SDK 报错的情况。

### 7. `retryAllStuck()` 不处理 failed 状态

```javascript
retryAllStuck(e) {
  let r = Date.now() - e;
  return this.db.prepare(`
    UPDATE pending_messages
    SET status = 'pending', started_processing_at_epoch = NULL
    WHERE status = 'processing' AND started_processing_at_epoch < ?
  `).run(r).changes
}
```

只重置 `processing` 状态的消息，不重置 `failed` 状态。模型恢复后，旧消息不会自动重试，需要手动清理或删除。

### 8. Worker 重启不会扫描历史 pending messages

Worker 采用事件驱动处理新消息（`events.on('message')`），启动时不会扫描数据库中积压的 pending messages。这意味着即使模型恢复了，旧消息也会永远卡在队列里。

## 总结

1. **claude-mem 的核心是 hooks + worker + 数据库**，任何一环出问题都会导致记录丢失
2. **日志是最好的诊断工具**，`~/.claude-mem/logs/` 记录了所有处理过程
3. **环境变量隔离是一把双刃剑**，既能避免 API 冲突，也会导致配置不同步
4. **自动化监控很重要**，状态栏 + 启动检查 + 诊断脚本，让你不再靠"猜"来判断系统状态
5. **模型配置要同步**，claude-mem 的 `CLAUDE_MEM_MODEL` 和 Claude Code 的 `ANTHROPIC_MODEL` 必须保持一致，否则 SDK 子进程会失败
6. **模型短暂不可用是常态**，API 维护、限流、下线都可能发生，要有备用模型和自动切换机制

---

**最后修改**: 2026-05-14

## 第三次故障：2026-05-19 活僵尸 + API 400 错误

### 现象

- `daily-recap 2026-05-19` 显示 0 条 observations
- 但 `user_prompts` 有 104 条、`sdk_sessions` 有 5 个会话、git 有提交 → 当天确实工作了
- 今天（5/20）worker 恢复后 API 报 `400 model 'kimi-k2.6' is not supported`

### 排查关键步骤

1. **observations 0 条但 prompts 正常** → 问题不在 hooks，在 worker 处理阶段
2. **对比日志模块分布**：

   | 日期     | WORKER | SYSTEM | 状态             |
   | -------- | ------ | ------ | ---------------- |
   | 5/18     | 3872   | 1824   | ✅ 正常          |
   | **5/19** | **0**  | 749    | ❌ Worker 未执行 |

3. **worker 进程存活但无 observation 处理** → 活僵尸
4. **检查环境变量**：worker（PID 11776，5/18 启动）的 `ANTHROPIC_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic`，但 `settings.json` 已切换为 `https://ark.cn-beijing.volces.com/api/coding`
5. **bun-runner.js 第 160 行**：`env: process.env` → worker 继承启动时的环境变量，之后不再更新

### 根因

worker 是 5/18 凌晨启动的，当时环境变量是 DashScope + qwen3.6-plus。之后切换模型到火山引擎 + kimi-k2.6，`settings.json` 更新了，但**worker 进程内的环境变量冻结**。今天 worker 恢复消费队列后，用 DashScope endpoint 传 `kimi-k2.6` → 400。

### 修复

1. **Kill 旧 worker + 导出正确环境变量重启**
2. **升级 `sync-mem-model.sh`**：同步模型时同时导出环境变量并重启 worker
3. **新建 `check-claude-mem.sh`**：深度健康检查
   - worker 环境变量与 `settings.json` 一致性
   - 最近 API 错误次数
   - worker 活动状态（是否长期无日志）
4. **更新 `settings.json` SessionStart hook**：从简单端口检查替换为深度检查

### 新增踩坑记录

#### 9. worker 环境变量冻结（活僵尸）

`bun-runner.js` 启动 worker 时通过 `env: process.env` 继承环境变量，之后不再更新。切换模型后 worker 进程成了"活僵尸"——活着但不干活。

#### 10. SessionStart hook 只检查端口不够

之前的检查：

```bash
lsof -i :37777 >/dev/null 2>&1
```

只能验证进程在监听端口，无法发现环境变量过期、API 错误、worker 卡死等问题。

---

**最后修改**: 2026-05-22

## 第四次故障：2026-05-22 — sync-mem-model.sh 环境变量传递失败 + check-claude-mem.sh 竞态

### 现象

每次启动 Claude Code，`check-claude-mem.sh` 深度检查告警：

```
🚨 claude-mem 异常:
⚠️ BASE_URL 不一致: settings.json=https://coding.dashscope.aliyuncs.com/apps/anthropic, worker=https://ark.cn-beijing.volces.com/api/coding
⚠️ MODEL 不一致: settings.json=qwen3.6-plus, worker=kimi-k2.6
```

### 排查

`settings.json` 配置是 DashScope + qwen3.6-plus，但 worker 进程的环境变量是旧的火山引擎 + kimi-k2.6。

根因在 `sync-mem-model.sh` 里：

```bash
# 旧代码
export ANTHROPIC_MODEL="$CLAUDE_MODEL"
[ -n "$CLAUDE_BASE_URL" ] && export ANTHROPIC_BASE_URL="$CLAUDE_BASE_URL"
[ -n "$CLAUDE_AUTH_TOKEN" ] && export ANTHROPIC_AUTH_TOKEN="$CLAUDE_AUTH_TOKEN"

# ...之后
nohup node "$_P/scripts/bun-runner.js" "$_P/scripts/worker-service.cjs" start > /dev/null 2>&1 &
```

`export` 只对当前 shell 进程生效，`nohup` 启动的子进程在 Claude Code hook 环境下**不一定能继承**这些 export 的变量。所以新 worker 继承的还是旧的环境变量。

同时 `check-claude-mem.sh` 通过 `ps e -p PID` 检查 running process 的环境变量，存在**竞态条件**：`sync-mem-model.sh` 刚 kill 旧 worker 就启动新 worker，但 hook 间没有等待机制，检查脚本可能在 worker 重启完成前就读了旧进程。

### 修复

**修复 1：sync-mem-model.sh 用 `env` 显式传递**

```bash
# 新代码 — 不再依赖 export 继承
env ANTHROPIC_MODEL="$CLAUDE_MODEL" \
    ANTHROPIC_BASE_URL="$CLAUDE_BASE_URL" \
    ANTHROPIC_AUTH_TOKEN="$CLAUDE_AUTH_TOKEN" \
    nohup node "$_P/scripts/bun-runner.js" "$_P/scripts/worker-service.cjs" start > /dev/null 2>&1 &
```

`env` 会把这些变量直接注入到新进程的初始环境，不依赖 shell 的 export 传播。

**修复 2：check-claude-mem.sh 不再检查 running process env**

改为检查 `claude-mem/settings.json` 是否与 Claude Code 配置同步——这才是真正可靠的配置来源。对 running process 环境变量的检查降级为静默跳过（不告警），避免竞态误报。

### 新增踩坑记录

#### 11. `export` + `nohup` 在 hook 环境下不继承

Claude Code hook 的执行环境中，`export` 的变量不一定能传递给 `nohup` 启动的子进程。要用 `env VAR=value command` 显式传递。

#### 12. Hook 间存在竞态，不要用 running process 状态做判断

`SessionStart` 下的多个 hook 按顺序触发，但没有等待机制。一个 hook 重启了进程，下一个 hook 立刻检查，可能读到中间状态。应该检查**持久化配置**（settings.json）而不是**运行时状态**（ps env）。

---

## 2026-05-26 二次修复：上一次没修干净

上一次（05-22）已经改了 `sync-mem-model.sh` 用 `env` 显式传递变量，按理说切模型后 worker 应该拿到正确 env。但 05-25 触发 `/daily-recap` 时发现：**今日 observations 表 0 条，已经 4 天没落库了**。

### 真正的根因

#### 根因 A：worker.pid 是 JSON，hook 一直在 kill 失败

`~/.claude-mem/worker.pid` 的实际格式是：

```json
{
  "pid": 22601,
  "port": 37777,
  "startedAt": "2026-05-26T01:18:03.637Z",
  "version": "unknown"
}
```

但 05-22 修复后的 hook 仍然这么写：

```bash
OLD_PID=$(cat "$WORKER_PID_FILE" 2>/dev/null)
kill "$OLD_PID" 2>/dev/null
```

`cat` 出来的是整段 JSON，`kill` 拿到非法 PID 就静默退出（`2>/dev/null` 把错也吞了）。结果**每次切模型，旧 worker 都没被 kill**，新 worker 启动后端口被占，启动失败也没人报。

#### 根因 B：daemon 内 fork SDK 子进程会再丢一次 env

worker-service.cjs 是 daemon，它内部还会按 session 数量再 fork SDK 子进程处理消息。`env VAR=value nohup node ...` 只能保证 daemon 自己拿到 env，daemon 启动后再 fork 出的 SDK 子进程是否继承——取决于 daemon 代码怎么写 spawn。实测一段时间后 SDK 子进程的 env 与 daemon 不一致，旧的 BASE_URL/MODEL 又回来了。

#### 根因 C：健康自检漏了"全静默 0 落库"信号

05-22 写的 `check-claude-mem.sh` 检测：端口监听、worker PID 存在、settings 模型同步、最近 100 行日志的 API 错误数、worker 是否 15 分钟无日志活动。但这次故障是**端口在监听、PID 在、settings 一致、日志正常滚（全是 400 错误也算"有活动"）**，唯独 observations 表一条没写。健康自检报"健康"，用户 4 天后才发现。

### 这次的修复

**修复 1：`sync-mem-model.sh` 用 jq 解析 JSON pid + 用官方 worker-cli.js 启动**

```bash
# 拿 PID：先试 worker.pid 的 JSON.pid 字段，fallback 到 supervisor.json
OLD_PID=""
if [ -f "$WORKER_PID_FILE" ]; then
    OLD_PID=$(jq -r '.pid // empty' "$WORKER_PID_FILE" 2>/dev/null)
fi
if [ -z "$OLD_PID" ] && [ -f "$SUPERVISOR_FILE" ]; then
    OLD_PID=$(jq -r '.processes.worker.pid // empty' "$SUPERVISOR_FILE" 2>/dev/null)
fi

# 等进程真退出（最多 5 秒）— 避免端口竞态
if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null
    for i in 1 2 3 4 5; do
        kill -0 "$OLD_PID" 2>/dev/null || break
        sleep 1
    done
fi

# 用官方 worker-cli.js 启动（它内部走 supervisor，会把 env 注入所有 fork 子进程）
CLI="$HOME/.claude/plugins/cache/thedotmack/claude-mem/10.6.2/scripts/worker-cli.js"
env ANTHROPIC_MODEL="$CLAUDE_MODEL" \
    ANTHROPIC_BASE_URL="$CLAUDE_BASE_URL" \
    ANTHROPIC_AUTH_TOKEN="$CLAUDE_AUTH_TOKEN" \
    node "$CLI" start > /dev/null 2>&1
```

放弃自己手撸 `nohup node bun-runner.js worker-service.cjs start &` 的启动方式——走官方 CLI，让它去处理 supervisor 注册、子进程 env 注入、端口绑定。

**修复 2：`check-claude-mem.sh` 加"今日 obs = 0 且过 10 点"告警**

```bash
DB="$HOME/.claude-mem/claude-mem.db"
if [ -f "$DB" ] && command -v sqlite3 >/dev/null 2>&1; then
    TODAY_OBS=$(sqlite3 "$DB" "SELECT COUNT(*) FROM observations WHERE date(created_at)=date('now','localtime');" 2>/dev/null)
    HOUR=$(date +%H)
    if [ -n "$TODAY_OBS" ] && [ "$TODAY_OBS" = "0" ] && [ "$HOUR" -ge 10 ] 2>/dev/null; then
        ISSUES+=("🚨 今日 observations 落库数 = 0（已过 10 点）— 可能 worker env 失效或队列卡死")
    fi
fi
```

避开清晨误报，10 点后还 0 条就是真坏了。直接查 SQLite 落地结果比看进程/端口/日志都可靠——**它就是 claude-mem 唯一要做的事**。

### 验证

切模型触发 `sync-mem-model.sh` 后：

- worker PID 从 2563（旧 daemon）→ 22682（新 daemon）
- `supervisor.json` 的 `processes.worker.pid` 同步更新
- 19 秒后新 SDK session（id 479）启动并处理积压队列
- `observations` 表当天从 0 → 18 条

### 新增踩坑记录

#### 13. `nohup &` 启动 daemon 时 env 只能保证 daemon 自己，fork 出的子进程未必继承

如果 daemon 内部还要 fork（spawn 子进程处理任务），靠 shell 层的 `env VAR=value` 只能传一层。彻底的办法是用项目自带的 CLI/supervisor 启动，让它自己处理子进程 env 注入。

#### 14. 健康自检要查"结果"，不要只查"过程"

"端口在监听 / 进程在 / 日志在滚"都是过程指标，全绿不等于结果对。对 claude-mem 来说**唯一的结果指标是 observations 表今天有没有新增**——直接查 SQLite，比任何进程/日志检查都准。这条对所有"幂等型后台 worker"通用。

#### 15. `2>/dev/null` 吞错的代价

05-22 修复后 hook 实际每次都 kill 失败，但 `kill "$OLD_PID" 2>/dev/null` 把"kill: illegal pid"吞了，没人发现。**所有"已知会有噪音"的命令，吞错前先想清楚是不是把"应该被发现的失败"也一并吞了**。这次教训：宁可写 `2>>/tmp/sync-mem-model.err` 留个证据，也别 `2>/dev/null`。

---

**最后修改**: 2026-05-26
