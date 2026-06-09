---
title: "GitLab自动Review实操-NodeJS版"
published: 2026-05-20
description: "| 原因 | 说明 | |------|------| | 技术栈统一 | 项目主栈是 Node.js，维护成本低 | | 代理支持更好 | https-proxy-agent 在 Node.js 中更成熟 | | 依赖更简单 | n..."
tags: ["Auto-Review", "02-auto-review"]
category: "工具"
image: api
draft: true
---
# GitLab 自动 Review 流程实操文档（Node.js 版）

> 从 Python 原型到 Node.js/TypeScript 生产版的完整搭建实录。
> 核心流程：MR 提交 → Gemini 审查 → Claude Code 自动修复 → 最多 2 轮循环 → 人工最终决定

---

## 一、为什么从 Python 改成 Node.js

| 原因 | 说明 |
|------|------|
| 技术栈统一 | 项目主栈是 Node.js，维护成本低 |
| 代理支持更好 | `https-proxy-agent` 在 Node.js 中更成熟 |
| 依赖更简单 | `npm install` 即可，无需 Python 虚拟环境 |

---

## 二、项目结构

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
├── ecosystem.config.cjs     # PM2 配置
├── package.json
├── tsconfig.json
├── .env                     # 环境变量（不提交）
└── README.md
```

---

## 三、环境准备

### 3.1 依赖安装

```bash
npm install express dotenv zod https-proxy-agent
npm install -D typescript tsx @types/node @types/express
npm install -g pm2
```

### 3.2 TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### 3.3 环境变量（.env）

```env
GITLAB_URL=企业内部 GitLab/
GITLAB_TOKEN=your-gitlab-token
GITLAB_PROJECT_ID=937
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-lite
CLAUDE_WORK_DIR=/Users/xiangwang/claudecode
MAX_REVIEW_ROUNDS=2
WEBHOOK_PORT=8081
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
```

---

## 四、核心模块实现

### 4.1 配置校验（config.ts）

使用 Zod 做运行时校验，启动时自动检查所有必填项：

```ts
import { z } from 'zod';

const configSchema = z.object({
  gitlabUrl: z.string().url(),
  gitlabToken: z.string(),
  gitlabProjectId: z.string(),
  geminiApiKey: z.string(),
  geminiModel: z.string().default('gemini-2.5-flash-lite'),
  claudeWorkDir: z.string(),
  maxReviewRounds: z.coerce.number().default(2),
  webhookPort: z.coerce.number().default(8081),
  logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
});

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    gitlabUrl: process.env.GITLAB_URL,
    gitlabToken: process.env.GITLAB_TOKEN,
    // ... 其他字段
  });
  if (!result.success) {
    throw new Error(`配置校验失败:\n${result.error.issues.map(i => i.message).join('\n')}`);
  }
  return result.data;
}
```

### 4.2 GitLab 客户端（gitlab-client.ts）

**关键踩坑**：Node.js 原生 `fetch` 不支持 `agent` 选项，必须用 `https.request` + `https-proxy-agent`。

```ts
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as https from 'node:https';

function getAgent() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  return proxy ? new HttpsProxyAgent(proxy) : undefined;
}

// 使用 https.request 而不是 fetch
async function fetchWithAgent<T>(url, options): Promise<T> {
  const agent = getAgent();
  const protocol = url.startsWith('https:') ? https : await import('node:http');

  return new Promise((resolve, reject) => {
    const req = protocol.request(url, { method, headers, agent }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        else resolve(JSON.parse(data));
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
```

核心方法封装：

| 方法 | API 端点 | 用途 |
|------|----------|------|
| `getMrDiffText(iid)` | `/merge_requests/{iid}/changes` | 获取 MR diff 并组装 |
| `postNote(iid, body)` | `/merge_requests/{iid}/notes` | 发布评论到 MR |
| `listOpenMrs()` | `/merge_requests?state=opened` | 列出开放 MR |
| `testConnection()` | `/projects/{id}` | 测试连接 |

### 4.3 Gemini 审查引擎（gemini-review.ts）

**关键踩坑**：Gemini SDK 在代理环境下 SSL 握手失败，改用 `https.request` 直调 HTTPS API。

```ts
const REVIEW_SYSTEM_PROMPT = `你是一个资深高级软件工程师，正在进行代码审查。你必须全程使用中文进行回复。

审查以下代码 diff。对于发现的每个问题：
1. 指出文件和大致行号
2. 分类严重程度：critical/warning/suggestion/nitpick
3. 分类问题类型：bug/security/performance/style/maintainability/test
4. 用中文清晰说明问题
5. 给出具体的修复建议（含代码示例）`;

const REVIEW_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    overall_verdict: { type: 'STRING', enum: ['approved', 'needs_changes', 'minor_suggestions'] },
    comments: {
      type: 'ARRAY',
      items: { /* ReviewComment 结构 */ }
    }
  },
  required: ['summary', 'overall_verdict', 'comments'],
};

async function reviewDiff(diffText, apiKey, model = 'gemini-2.5-flash-lite') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    system_instruction: { parts: [{ text: REVIEW_SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: `审查以下 diff:\n\`\`\`diff\n${diffText}\`\`\`` }] }],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: REVIEW_SCHEMA,
    },
  };

  // 3 次重试 + 指数退避
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const data = await httpsPostJson(url, payload);
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
      if (attempt < 3) await sleep(3 * attempt * 1000);
    }
  }
}
```

**审查结果格式化**：`formatReviewSummary()` 将 JSON 结果转为带 Emoji 的中文 Markdown，发布到 MR 评论。

### 4.4 Claude Code 修复引擎（claude-fix.ts）

**关键踩坑**：不能用 `exec`，prompt 中的反引号会被 shell 解析为命令替换。必须用 `spawn` + stdin 写入。

```ts
import { spawn } from 'node:child_process';

async function fixIssues(workDir, review, mrIid) {
  const prompt = formatFixPrompt(review); // 从 review 中提取 critical/warning 问题

  // 记录修复前的文件状态
  const beforeChanges = await getModifiedFiles(workDir);

  // 使用 spawn + stdin 避免 shell 转义
  const child = spawn('claude', [
    '-p',
    '--permission-mode', 'acceptEdits',
    '--allowed-tools', 'Read Edit Bash',
    '--output-format', 'json',
    '--no-session-persistence',
  ], { cwd: workDir, stdio: ['pipe', 'inherit', 'inherit'] });

  child.stdin.write(prompt);
  child.stdin.end();

  // 等待完成（600s 超时）
  await waitForClose(child, 600_000);

  // 对比变更
  const afterChanges = await getModifiedFiles(workDir);
  const newOrModified = [...afterChanges].filter(f => !beforeChanges.has(f));

  if (newOrModified.length === 0) return { success: true, changed: false };

  // git add + commit + push
  await execAsync('git add -A', { cwd: workDir });
  await execAsync(`git commit -m "auto-fix: 修复 MR !${mrIid} 审查问题"`, { cwd: workDir });
  await execAsync('git push', { cwd: workDir });

  return { success: true, changed: true };
}
```

**修复提示词生成**（`formatFixPrompt`）：只提取 `critical` 和 `warning` 级别的问题，附带文件位置、问题描述和修复建议。

### 4.5 Runner 主循环（runner.ts）

状态管理器（JSON 文件持久化）：

```ts
class StateManager {
  private state: Record<string, { round: number; status: string }> = {};

  getRound(mrIid) { return this.state[mrIid]?.round ?? 0; }
  incrementRound(mrIid) { /* round++, status='reviewing' */ }
  setStatus(mrIid, status) { /* 更新状态并保存 */ }
  isProcessing(mrIid) { /* checking reviewing/fixing */ }
}
```

核心循环逻辑：

```ts
async function runReviewFixCycle(client, config, mrIid, state) {
  // 1. 跳过正在处理的 MR
  if (state.isProcessing(mrIid)) return;

  // 2. 超过最大轮数则停止
  if (state.getRound(mrIid) >= config.maxReviewRounds) {
    await client.postNote(mrIid, '已达最大轮数，停止自动审查。');
    return;
  }

  // 3. 审查 diff
  state.incrementRound(mrIid);
  const review = await reviewMr(client, config, mrIid);

  // 4. 判断：approved 或没有 critical/warning → 通过
  if (review.overall_verdict === 'approved' ||
      !review.comments.some(c => c.severity === 'critical' || c.severity === 'warning')) {
    state.setStatus(mrIid, 'approved');
    return;
  }

  // 5. 调用 Claude Code 修复
  const fixResult = await fixIssues(config.claudeWorkDir, review, mrIid);

  // 6. 修复成功 → commit + push → 等待 GitLab 重新触发
  if (fixResult.changed) {
    state.setStatus(mrIid, 'fixed_waiting_for_re_review');
  }
}
```

**关键判断**：只有 `critical` 和 `warning` 才会触发自动修复，`suggestion` 和 `nitpick` 只发布评论不自动改。设计意图是小改动风险可能大于收益，适合人工判断。

### 4.6 Webhook 服务（webhook-server.ts）

```ts
import express from 'express';

export function createWebhookServer(config, client, state) {
  const app = express();
  app.use(express.json());

  app.post('/webhook', async (req, res) => {
    const { object_kind, event_type } = req.body;

    if (object_kind === 'merge_request') {
      const { action, iid: mrIid } = req.body.object_attributes || {};
      if (mrIid && ['open', 'update', 'reopen'].includes(action)) {
        // Fire and forget
        runReviewFixCycle(client, config, mrIid, state).catch(console.error);
        return res.json({ status: 'accepted' });
      }
    }

    return res.json({ status: 'ignored' });
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  return app;
}
```

### 4.7 CLI 入口（index.ts）

```ts
// 三种模式
// node dist/index.js start     - 审查所有 MR + 启动 webhook 监听（默认）
// node dist/index.js review    - 仅审查所有开放 MR
// node dist/index.js listener  - 仅启动 webhook 监听
```

---

## 五、npm scripts

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

---

## 六、部署：PM2 + ngrok

### 6.1 PM2 配置（ecosystem.config.cjs）

注意用 `.cjs` 扩展名，因为 `package.json` 中 `"type": "module"`。

```js
module.exports = {
  apps: [
    {
      name: 'auto-review',
      script: 'dist/index.js',
      args: 'start',
      interpreter: 'node',
      exec_mode: 'fork',     // 避免 cluster 模式端口冲突
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
    },
    {
      name: 'ngrok',
      cmd: 'ngrok http 8081 --log=stdout --log-format=json',
      autorestart: true,
      out_file: './logs/ngrok.log',
      error_file: './logs/ngrok.log',
    },
  ],
};
```

### 6.2 ngrok 公网隧道

```bash
# 安装
brew install ngrok
ngrok config add-authtoken <your-token>

# 获取公网 URL（用于 GitLab webhook）
curl http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url'
# 输出: https://xxxx.ngrok-free.dev
```

### 6.3 启动流程

```bash
npm install
npm run pm2:start

# 查看状态
pm2 list

# 查看日志
npm run pm2:logs
```

---

## 七、GitLab Webhook 配置

### 7.1 配置步骤

**Settings → Webhooks**：

| 字段 | 值 |
|------|-----|
| URL | `https://xxxx.ngrok-free.dev/webhook` |
| Secret token | 留空（V1 暂未使用） |
| Trigger | 勾选 **Merge request events** |

### 7.2 触发事件

Webhook 监听 `merge_request` 事件的以下 action：
- `open` — 新 MR 创建
- `update` — MR 更新（含代码 push）
- `reopen` — MR 重新打开

### 7.3 常见问题

| 问题 | 解决 |
|------|------|
| `Url is blocked: Requests to the local network are not allowed` | 管理员在 `Admin Area → Settings → Network → Outbound requests` 开启本地网络请求 |
| 收不到 webhook 事件 | 检查 ngrok 是否在线、webhook URL 是否正确 |
| 旧 ngrok 进程占用 | `lsof -ti:4040 | xargs kill` 清理后重启 PM2 |

---

## 八、完整架构

```
┌──────────────┐     webhook      ┌──────────────────┐
│   GitLab     │ ────────────────>│  webhook-server    │
│  (MR opened) │                  │     (Express:8081) │
└──────────────┘                  └────────┬─────────┘
                                           │
                         ┌─────────────────┤
                         │                 │
                         ▼                 ▼
                    ┌──────────┐    ┌──────────────┐
                    │ runner.ts │    │ gemini-review│
                    │(orchestra)│    │  .reviewDiff │
                    └──┬───┬───┘    └──────┬───────┘
                       │   │               │
                       ▼   ▼               ▼
                ┌──────────┐ ┌──────────┐ [ReviewResult]
                │ gitlab-  │ │ claude-  │
                │ client   │ │ fix      │
                └──────────┘ └──────────┘
```

---

## 九、完整流程

1. 开发者在 GitLab 创建 MR
2. PM2 服务收到 webhook → 获取 diff → 调用 Gemini 审查
3. 审查摘要以中文发布到 MR 评论
4. 如果有 `critical`/`warning` 问题 → Claude Code 自动修复 → commit + push
5. GitLab 再次发送 webhook → 重新审查
6. 最多循环 2 轮后停止
7. 人类审查最终状态决定是否合并

---

## 十、Python V1 到 Node.js V2 对比

| 组件 | Python V1 | Node.js V2 |
|------|-----------|------------|
| 运行环境 | Python 3.10+ | Node.js 18+ |
| 语言 | Python | TypeScript |
| 配置校验 | 手动 | Zod |
| Webhook | Flask | Express |
| GitLab API | python-gitlab / requests | https.request + https-proxy-agent |
| Gemini API | requests 直调 | https.request + https-proxy-agent |
| Claude Code | subprocess | child_process.spawn |
| 状态存储 | JSON 文件 | JSON 文件 |
| 进程管理 | 裸跑 | PM2 + ngrok |

---

## 十一、踩坑汇总

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Python requests 不读代理环境变量 | requests 库行为 | Node.js 用 `https-proxy-agent` |
| Gemini SDK 报 SSL 错误 | 代理下 SSL 握手失败 | 改用 `https.request` 直调 |
| `fetch` 不支持 agent | Node.js 限制 | 用 `https.request` 替代 |
| `exec` 中反引号被 shell 解析 | shell 命令替换 | 用 `spawn` + stdin 写入 |
| PM2 cluster 模式端口冲突 | 多实例监听同端口 | 改用 `fork` 模式 |
| `ecosystem.config.js` ESM 报错 | package.json 设了 `"type": "module"` | 改用 `.cjs` 扩展名 |
| `python` 命令不存在 | macOS 没有 python | 改用 `npx tsx` |
| 旧 ngrok 占用 4040 端口 | 残留进程 | `lsof -ti:4040 \| xargs kill` |

---

## 十二、项目仓库

- **GitHub**: https://github.com/wang1xiang/auto-review
- **Node.js 分支**: `node-version`
- **Python 版**: `main`
