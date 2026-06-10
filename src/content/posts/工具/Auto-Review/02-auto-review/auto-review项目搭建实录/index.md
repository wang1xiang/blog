---
title: "Auto-Review项目搭建实录"
published: 2026-05-20
description: "在已有的「自动 Review 流程详解」文档基础上，实际搭建一套可运行的自动代码审查系统。核心流程："
tags: ["Auto-Review", "02-auto-review"]
category: "工具"
image: api
draft: false
---

# Auto-Review 项目搭建实录：从 0 到上线

> 搭建一个基于 GitLab + Gemini + Claude Code 的自动代码审查系统，支持 webhook 实时触发、自动修复、PM2 进程管理 + ngrok 公网隧道。

## 一、需求背景

在已有的「自动 Review 流程详解」文档基础上，实际搭建一套可运行的自动代码审查系统。核心流程：

```
开发者提交 MR → Gemini 审查 diff → Claude Code 自动修复 → 循环最多 2 轮 → 人类最终决定是否合并
```

**技术选型：**

- **平台**：GitLab（自建实例 企业内部 GitLab）
- **审查**：Gemini API（gemini-2.5-flash-lite，结构化 JSON 输出，中文反馈）
- **修复**：Claude Code CLI（`-p` 非交互模式 + `--permission-mode acceptEdits`）
- **后端**：Node.js + TypeScript + Express
- **进程管理**：PM2
- **公网隧道**：ngrok

## 二、Python 原型搭建（V1）

### 2.1 项目结构

```
projects/auto-review/
├── .env
├── pyproject.toml
├── src/
│   ├── config.py            # 配置加载
│   ├── gitlab_client.py     # GitLab API 封装
│   ├── gemini_review.py     # Gemini 审查引擎
│   ├── claude_fix.py        # Claude Code 修复引擎
│   ├── runner.py            # 主循环
│   └── webhook_server.py    # Flask Webhook 端点
└── scripts/
    ├── run_review.sh
    └── start_listener.sh
```

### 2.2 配置

```env
GITLAB_URL=企业内部 GitLab/
GITLAB_TOKEN=<REDACTED>
GITLAB_PROJECT_ID=937
GEMINI_API_KEY=<REDACTED>
GEMINI_MODEL=gemini-2.5-flash-lite
CLAUDE_WORK_DIR=/Users/xiangwang/claudecode
MAX_REVIEW_ROUNDS=2
WEBHOOK_PORT=8080
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
```

### 2.3 踩坑记录

| 问题                                                | 原因                         | 解决方案                           |
| --------------------------------------------------- | ---------------------------- | ---------------------------------- |
| `requests` 不读代理环境变量                         | Python requests 库行为       | 显式传 `proxies` 参数              |
| Gemini SDK 报 SSL 错误                              | 代理下 SDK 内部 SSL 握手失败 | 弃用 SDK，改用 requests 直调 HTTPS |
| `gemini-2.5-flash` 报 "User location not supported" | 代理没开                     | `.env` 中加 `HTTPS_PROXY` 配置     |
| GitLab `/diffs` 接口 404                            | 自建 GitLab 不支持该端点     | 改用 `/changes` 接口 fallback      |
| `python: command not found`                         | macOS 没有 python            | 脚本中改用 `python3` 或 `npx tsx`  |

### 2.4 V1 验证结果

- Gemini 成功审查 MR !1，发布中文审查摘要到 GitLab（评论 ID 79943）
- 完整流程打通：MR diff → Gemini 审查 → 发布评论 → 状态跟踪

## 三、Node.js/TypeScript 重构（V2）

### 3.1 为什么改 Node.js

1. 项目主技术栈是 Node.js（前端 + 后端），维护成本低
2. `https-proxy-agent` 在 Node.js 中更成熟
3. 无需 Python 虚拟环境，`npm install` 即可

### 3.2 技术栈

| 组件        | Python V1           | Node.js V2                        |
| ----------- | ------------------- | --------------------------------- |
| 运行环境    | Python 3.10+        | Node.js 18+                       |
| 语言        | Python              | TypeScript                        |
| Webhook     | Flask               | Express                           |
| 配置校验    | 手动校验            | Zod                               |
| GitLab API  | python-gitlab       | https.request + https-proxy-agent |
| Gemini API  | requests 直调 HTTPS | https.request + https-proxy-agent |
| Claude Code | subprocess          | child_process.spawn               |
| 状态存储    | JSON 文件           | JSON 文件                         |

### 3.3 关键实现

#### GitLab 客户端（https-proxy-agent 支持代理）

```ts
import { HttpsProxyAgent } from "https-proxy-agent";
import * as https from "node:https";

function getAgent() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  return proxy ? new HttpsProxyAgent(proxy) : undefined;
}

// fetchWithAgent 使用 https.request 而不是 fetch
// 因为 Node.js 原生 fetch 不支持 agent 选项
```

#### Gemini 审查（结构化 JSON 输出）

```ts
const payload = {
  system_instruction: { parts: [{ text: REVIEW_SYSTEM_PROMPT }] },
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    response_mime_type: "application/json",
    response_schema: REVIEW_SCHEMA,
  },
};

// 3 次重试 + 指数退避
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const data = await httpsPostJson(url, payload);
    return JSON.parse(text) as ReviewResult;
  } catch (e) {
    if (attempt < 3) await sleep(3 * attempt * 1000);
  }
}
```

#### Claude Code 修复（spawn + stdin 避免 shell 转义）

```ts
// 不能用 exec，prompt 中的反引号会被 shell 解析为命令替换
const child = spawn(
  "claude",
  [
    "-p",
    "--permission-mode",
    "acceptEdits",
    "--allowed-tools",
    "Read Edit Bash",
    "--output-format",
    "json",
    "--no-session-persistence",
  ],
  { cwd: workDir, stdio: ["pipe", "inherit", "inherit"] },
);

child.stdin.write(prompt);
child.stdin.end();
```

#### Runner 主循环

```ts
// review → 发布评论 → 判断是否需要修复 → Claude 修复 → commit/push
async function runReviewFixCycle(client, config, mrIid, state) {
  // 1. 检查是否超过最大轮数
  // 2. 审查 diff
  // 3. 如果 verdict === approved 或没有 critical/warning 问题，通过
  // 4. 否则调用 Claude Code 修复
  // 5. 修复后 commit + push，状态标记为 fixed_waiting_for_re_review
}
```

### 3.4 目录结构

```
auto-review/
├── src/
│   ├── config.ts            # Zod 配置校验
│   ├── gitlab-client.ts     # GitLab API 封装
│   ├── gemini-review.ts     # Gemini 审查引擎
│   ├── claude-fix.ts        # Claude Code 修复引擎
│   ├── runner.ts            # 主循环 + 状态管理
│   ├── webhook-server.ts    # Express Webhook 端点
│   └── index.ts             # CLI 入口
├── scripts/
│   └── run_review.sh
├── ecosystem.config.cjs     # PM2 配置
├── package.json
├── tsconfig.json
├── README.md
└── README-zh.md
```

### 3.5 npm scripts

```json
{
  "scripts": {
    "dev": "tsx src/index.ts start",
    "dev:review": "tsx src/index.ts review",
    "dev:listener": "tsx src/index.ts listener",
    "build": "tsc",
    "review": "node dist/index.js review",
    "pm2:start": "npm run build && pm2 start ecosystem.config.cjs",
    "pm2:stop": "pm2 stop auto-review",
    "pm2:restart": "npm run build && pm2 restart auto-review",
    "pm2:logs": "pm2 logs auto-review"
  }
}
```

## 四、部署：PM2 + ngrok

### 4.1 为什么选 PM2

| 方案   | 优点                             | 缺点                |
| ------ | -------------------------------- | ------------------- |
| PM2    | 崩溃自动重启、日志管理、开机自启 | 需要全局安装        |
| Docker | 环境隔离                         | 配置复杂，V1 不需要 |
| 裸跑   | 最简单                           | 无崩溃恢复          |

### 4.2 PM2 配置（ecosystem.config.cjs）

注意用 `.cjs` 扩展名，因为 `package.json` 中设置了 `"type": "module"`。

```js
module.exports = {
  apps: [
    {
      name: "auto-review",
      script: "dist/index.js",
      args: "start",
      interpreter: "node",
      exec_mode: "fork", // 注意：不是 cluster，避免多实例端口冲突
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
    },
    {
      name: "ngrok",
      cmd: "ngrok http 8081 --log=stdout --log-format=json",
      autorestart: true,
      out_file: "./logs/ngrok.log",
      error_file: "./logs/ngrok.log",
    },
  ],
};
```

### 4.3 ngrok 公网隧道

```bash
# 安装 ngrok
brew install ngrok

# 登录授权（只需一次）
ngrok config add-authtoken <your-token>
```

获取公网 URL：

```bash
curl http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url'
# 输出: https://xxxx.ngrok-free.dev
```

### 4.4 完整启动流程

```bash
# 1. 安装依赖
npm install
npm install -g pm2

# 2. 启动（含 ngrok 隧道）
npm run pm2:start

# 3. 查看状态
pm2 list

# 4. 查看日志
npm run pm2:logs

# 5. 获取 ngrok 地址（用于 GitLab webhook）
curl http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url'
```

## 五、GitLab Webhook 配置

### 5.1 配置步骤

在 GitLab 项目中：**Settings → Webhooks**

- **URL**: `https://xxxx.ngrok-free.dev/webhook`（或用 ngrok 地址）
- **Secret token**: 留空
- **Trigger**: 只勾选 **Merge request events**
- 点击 **Add webhook**

### 5.2 常见问题

| 问题                                                            | 解决                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Url is blocked: Requests to the local network are not allowed` | 管理员在 `Admin Area → Settings → Network → Outbound requests` 开启本地网络请求 |
| 收不到 webhook 事件                                             | 检查 ngrok 是否在线、webhook URL 是否正确、ngrok 状态是否 stable                |

## 六、完整架构

```
┌──────────────┐     webhook      ┌──────────────────┐
│   GitLab     │ ────────────────>│  webhook-server    │
│  (MR opened) │                  │     (Express:8081) │
└──────────────┘                  └────────┬─────────┘
                                          │
                        ┌─────────────────┤
                        │ ngrok 隧道      │
                        │                 │
                        ▼                 ▼
               ┌──────────────┐   ┌──────────────┐
               │   runner.ts   │   │ gemini-review│
               │  (orchestrator)│  │   .reviewDiff│
               └──┬─────────┬──┘   └──────┬───────┘
                  │         │              │
                  ▼         ▼              ▼
         ┌────────────┐  ┌──────────┐  [ReviewResult]
         │gitlab-client│  │claude-fix│
         └────────────┘  └──────────┘
```

## 七、核心判断逻辑

```ts
// 只有 critical/warning 级别才会触发自动修复
if (
  review.overall_verdict === "approved" ||
  !review.comments.some(
    (c) => c.severity === "critical" || c.severity === "warning",
  )
) {
  // 通过，不再修复
  state.setStatus(mrIid, "approved");
  return;
}
```

这意味着：

- `suggestion` 和 `nitpick` 级别的问题只发布评论，不会自动改
- 设计意图：小改动风险可能大于收益，人工判断更合适

## 八、最终效果

1. 开发者在 GitLab 创建 MR
2. PM2 服务收到 webhook → 获取 diff → 调用 Gemini 审查
3. 审查摘要以中文发布到 MR 评论
4. 如果有 critical/warning 问题 → Claude Code 自动修复 → commit + push
5. GitLab 再次发送 webhook → 重新审查
6. 最多循环 2 轮后停止
7. 人类审查最终状态决定是否合并

## 九、项目仓库

- **GitHub**: https://github.com/wang1xiang/auto-review
- **分支**: `node-version`（当前开发版）、`main`（Python 版）
