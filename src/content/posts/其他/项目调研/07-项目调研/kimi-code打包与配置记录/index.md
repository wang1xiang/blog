---
title: "kimi-code打包与配置记录"
published: 2026-06-03
description: "Node 版本要求：项目要求 Node >= 24.15.0，系统默认是 v18.18.0。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# Kimi-Code 打包与配置完整记录

## 1. pnpm 升级与依赖安装

**Node 版本要求**：项目要求 Node >= 24.15.0，系统默认是 v18.18.0。

```bash
source ~/.nvm/nvm.sh && nvm use 24.15.0
pnpm install    # 951 个包，约 2.5 分钟
pnpm build      # 12 个 workspace 全部构建成功
```

## 2. 四种构建方式的区别

| 命令                   | 产物                 | 签名       | 用途                                  |
| ---------------------- | -------------------- | ---------- | ------------------------------------- |
| `build:native:js`      | JS bundle            | 无         | 仅打包 JS，非原生可执行文件           |
| `build:native:sea`     | arm64 原生可执行文件 | ad-hoc     | **本地开发/测试**（推荐日常用）       |
| `build:native:release` | arm64 原生可执行文件 | Apple 证书 | 正式发布，需 `APPLE_SIGNING_IDENTITY` |
| `package:native`       | zip 分发包           | —          | 打包到 GitHub Release                 |

**构建产物位置**：

- JS 版: `apps/kimi-code/dist/main.mjs`
- 原生版: `apps/kimi-code/dist-native/bin/darwin-arm64/kimi`

**运行方式**：

```bash
# 原生可执行文件（无需 node）
./apps/kimi-code/dist-native/bin/darwin-arm64/kimi

# JS 版
node apps/kimi-code/dist/main.mjs
```

## 3. Provider 配置（Alibaba Coding Plan CN）

通过 `provider catalog` 从 models.dev 目录添加：

```bash
node apps/kimi-code/dist/main.mjs provider catalog add \
  alibaba-coding-plan-cn \
  --api-key <你的百炼API-Key> \
  --default-model qwen3.6-plus
```

配置文件自动写入 `~/.kimi-code/config.toml`，格式：

```toml
default_model = "alibaba-coding-plan-cn/qwen3.6-plus"

[providers.alibaba-coding-plan-cn]
type = "openai"
api_key = "sk-sp-xxxxxxxxxxxx"
base_url = "https://coding.dashscope.aliyuncs.com/v1"
```

**可用模型**（11 个）：qwen3.6-plus、qwen3.5-plus、qwen3-coder-plus、kimi-k2.5、glm-5 等。

## 4. max_tokens 400 错误

### 问题现象

```
Error: [provider.api_error] 400 <400> InternalError.Algo.InvalidParameter:
Range of max_tokens should be [1, 65536]
```

### 根因

配置文件中的 `max_context_size = 1000000` 被 kimi-code 内部的 `completion-budget` 逻辑当作 `max_tokens` 发送给 API，而 DashScope 端点的 `max_tokens` 上限是 65536。

关键代码链路：

1. `resolveCompletionBudget()` → 用 `max_context_size` 作为 fallback
2. `computeCompletionBudgetCap()` → 取 `max_context_size`（100 万）
3. `applyCompletionBudget()` → 调用 `withMaxCompletionTokens(1000000)`
4. OpenAI-legacy provider 将 `max_tokens: 1000000` 发给 DashScope
5. DashScope 返回 400：`Range of max_tokens should be [1, 65536]`

### 解决方案（不改代码）

设置环境变量覆盖预算计算：

```bash
KIMI_MODEL_MAX_COMPLETION_TOKENS=8192 ./apps/kimi-code/dist-native/bin/darwin-arm64/kimi
```

此变量作为 `hardCap` 优先级最高，会替代 `max_context_size` 的 fallback。

### 可用模型的 max_tokens 上限

- qwen3.6-plus / qwen3.5-plus / qwen3-coder-plus: 65536
- qwen3-max-2026-01-23: 65536
- kimi-k2.5: 65536

## 5. 记忆/规则文件配置

Kimi Code 使用 **AGENTS.md** 替代 Claude 的 **CLAUDE.md**：

| 级别   | 路径                     | 作用范围           |
| ------ | ------------------------ | ------------------ |
| 全局   | `~/.kimi/AGENTS.md`      | 所有项目           |
| 项目级 | `<项目根目录>/AGENTS.md` | 当前项目           |
| 子目录 | `<子目录>/AGENTS.md`     | 该子目录及其子目录 |

实际使用时将 CLAUDE.md 内容复制过去即可：

```bash
cp ~/.claude/CLAUDE.md ~/.kimi/AGENTS.md
```

## 6. 配置验证命令速查

```bash
# 查看可用 Provider
node apps/kimi-code/dist/main.mjs provider list

# 查看 catalog 中的模型
node apps/kimi-code/dist/main.mjs provider catalog list alibaba-coding-plan-cn

# 查看模型详情
node apps/kimi-code/dist/main.mjs provider catalog list alibaba-coding-plan-cn/qwen3.6-plus

# 测试 API 连通性
curl -X POST https://coding.dashscope.aliyuncs.com/v1/chat/completions \
  -H "Authorization: Bearer sk-sp-xxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3.6-plus","messages":[{"role":"user","content":"hi"}],"max_tokens":100}'
```
