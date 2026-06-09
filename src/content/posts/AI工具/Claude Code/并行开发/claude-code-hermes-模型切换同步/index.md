---
title: "claude-code-hermes-模型切换同步"
published: 2026-06-01
description: "我有两个 AI 助手在同时使用：Claude Code 和 Hermes。它们底层都通过 Anthropic API 格式调用各种模型（qwen、doubao、kimi 等）。每次切换模型时都需要分别配置两个工具，很麻烦。"
tags: ["Claude Code", "并行开发"]
category: "AI工具"
image: api
draft: false
---
# Claude Code 模型切换同步到 Hermes 配置

## 背景

我有两个 AI 助手在同时使用：Claude Code 和 Hermes。它们底层都通过 Anthropic API 格式调用各种模型（qwen、doubao、kimi 等）。每次切换模型时都需要分别配置两个工具，很麻烦。

## 目标

修改 Claude Code 的 `switch-model.sh` 脚本，让它在切换模型时自动同步更新 Hermes 的配置。

## 方案演进

### V1：每个模型独立配置文件

最初为每个模型创建独立的 `settings-模型名.json`（qwen、doubao、kimi、glm、deepseek、minimax、hermes），共 7 个文件。切换时从对应文件读取 env + model，替换 `settings.json` 的对应字段。

**问题**：豆包通道的 5 个模型（doubao、kimi、glm、deepseek、minimax）Token 和 URL 完全相同，只有 model 名不同，维护了 5 个重复配置文件。

### V2：三通道架构（当前）

2026-05-09 重构为按通道分组，同一通道的模型共享 Token/URL 配置：

| 通道                 | 配置文件                | Token         | URL                                                       | 可用模型                                                              |
| -------------------- | ----------------------- | ------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| 豆包 Coding Plan     | settings-doubao.json    | 7aab8f7f...   | ark.cn-beijing.volces.com/api/coding                      | doubao-seed-2.0-code, kimi-k2.6, glm-5.1, deepseek-v3.2, minimax-m2.5 |
| 阿里百炼 Coding Plan | settings-qwen.json      | sk-sp-7466... | coding.dashscope.aliyuncs.com/apps/anthropic              | qwen3.6-plus, qwen3-coder-plus, glm-5                                 |
| 阿里 Token Plan      | settings-ali-token.json | sk-sp-djI...  | token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic/v1 | qwen3.6-plus, deepseek-v3.2, glm-5, qwen-image-2.0-pro                |

配置文件从 7 个精简为 4 个（doubao、qwen、ali-token、hermes），每个文件内用 `modelDescriptions` 记录该通道所有模型的描述文案。

### V2 配置文件结构示例

```json
{
  "description": "豆包coding plan",
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "7aab8f7f...",
    "ANTHROPIC_BASE_URL": "https://ark.cn-beijing.volces.com/api/coding",
    "ANTHROPIC_MODEL": "doubao-seed-2.0-code"
  },
  "model": "doubao-seed-2.0-code",
  "modelDescriptions": {
    "doubao-seed-2.0-code": "doubao-seed-2.0-code：日常补完专家（次选）",
    "kimi-k2.6": "kimi-k2.6：长文本分析专家",
    "glm-5.1": "glm-5.1：代码生成专家",
    "deepseek-v3.2": "deepseek-v3.2：数学与逻辑推理专家",
    "minimax-m2.5": "minimax-m2.5：创意与写作专家"
  }
}
```

### V2 switch-model.sh 核心逻辑

所有切换统一走 `switch_channel_model` 函数，从通道配置文件读取 Token/URL，只替换 `settings.json` 的 `env` 和 `model` 字段，保留 hooks 等其他配置：

```bash
switch_channel_model() {
    local channel="$1"
    local model="$2"
    local config_file="$3"

    local auth_token=$(jq -r '.env.ANTHROPIC_AUTH_TOKEN' "$config_file")
    local base_url=$(jq -r '.env.ANTHROPIC_BASE_URL' "$config_file")
    local channel_desc=$(jq -r '.description // ""' "$config_file")

    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"

    jq --arg token "$auth_token" \
       --arg url "$base_url" \
       --arg model "$model" \
       '.env.ANTHROPIC_AUTH_TOKEN = $token |
        .env.ANTHROPIC_BASE_URL = $url |
        .env.ANTHROPIC_MODEL = $model |
        .model = $model' \
       "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"

    echo "已切换到${channel_desc}: $model"
    show_current

    local desc=$(jq -r --arg model "$model" '.modelDescriptions[$model] // ""' "$config_file")
    [ -n "$desc" ] && echo "$desc"
}
```

### V3：豆包备用 key 通道

2026-05-09 新增豆包 Coding Plan 的备用 API key，当主 key 限额用完时可以快速切换。

**做法**：创建 `settings-doubao-alt.json`，Token 不同但 URL、模型列表、描述文案与主 key 完全一致。脚本里新增 `*-alt` case 走这个配置文件。

新增 alias 命名规则：`switch-doubao-alt-*`，与主 key 的 `switch-doubao-*` 对称。

### V3 .zshrc 快捷命令

```bash
# 豆包 Coding Plan (主 key)
alias switch-doubao='~/.claude/switch-model.sh doubao'
alias switch-doubao-kimi='~/.claude/switch-model.sh kimi'
alias switch-doubao-glm='~/.claude/switch-model.sh glm'
alias switch-doubao-deepseek='~/.claude/switch-model.sh deepseek'
alias switch-doubao-minimax='~/.claude/switch-model.sh minimax'

# 豆包 Coding Plan (备用 key)
alias switch-doubao-alt='~/.claude/switch-model.sh doubao-alt'
alias switch-doubao-alt-kimi='~/.claude/switch-model.sh kimi-alt'
alias switch-doubao-alt-glm='~/.claude/switch-model.sh glm-alt'
alias switch-doubao-alt-deepseek='~/.claude/switch-model.sh deepseek-alt'
alias switch-doubao-alt-minimax='~/.claude/switch-model.sh minimax-alt'

# 阿里百炼 Coding Plan
alias switch-bailian='~/.claude/switch-model.sh bailian-qwen'
alias switch-bailian-coder='~/.claude/switch-model.sh bailian-coder'
alias switch-bailian-glm='~/.claude/switch-model.sh bailian-glm'

# 阿里 Token Plan
alias switch-token='~/.claude/switch-model.sh token-qwen'
alias switch-token-deepseek='~/.claude/switch-model.sh token-deepseek'
alias switch-token-glm='~/.claude/switch-model.sh token-glm'
alias switch-token-image='~/.claude/switch-model.sh token-image'

alias current-model='~/.claude/switch-model.sh'
```

## 踩坑记录

### 坑1：直接用 sed 修改 config.yaml 导致 provider 名称错误

一开始尝试直接用 sed 替换 provider 名称为 "volcengine"，但 Hermes 不认识这个 provider，报 404 错误。

**解决**：始终使用 "dashscope" provider 名称，只修改里面的配置内容（base_url、model、token）。

### 坑2：直接编辑 config.yaml 不如用 hermes 命令

手动编辑 config.yaml 可能会有格式问题或者遗漏某些配置项。

**解决**：改用 `hermes config set` 命令来修改配置，这样更可靠。

### 坑3：.env 文件中的 token 需要同步更新

不同模型可能使用不同的 token，切换模型时需要同步更新 Hermes 的 ANTHROPIC_AUTH_TOKEN。

**解决**：在 switch-model.sh 中用 sed 自动更新 .env 文件。

### 坑4（2026-05-09）：switch_doubao_model 覆盖了 settings.json 的全部内容

V2 重构时，`switch_doubao_model` 从 `settings-doubao.json` 读取配置后写入 `settings.json`，但 `settings-doubao.json` 只有 env + model + modelDescriptions，没有 hooks、statusLine 等字段。写入后 `settings.json` 丢失了所有 hooks 配置，导致 `/doctor` 报 "Invalid or malformed JSON" 错误。

**根因**：脚本用 `jq` 从 doubao 模板生成完整的 settings.json 输出，覆盖了原有文件。

**解决**：改为用 jq 只替换 `settings.json` 中的 env 和 model 字段（`.env.ANTHROPIC_AUTH_TOKEN = $token | .env.ANTHROPIC_BASE_URL = $url | .env.ANTHROPIC_MODEL = $model | .model = $model`），保留 hooks 等其他字段不变。

**教训**：`settings-*.json` 是模板文件，不是完整的 settings 替代品。切换模型时必须只改 env + model，不能整个文件覆盖。

### 坑5（2026-05-09）：macOS 默认 bash 3.x 不支持 declare -A

脚本中使用了 `declare -A`（关联数组），但 macOS 自带 bash 3.x 不支持。

**解决**：改用 `case` 语句 + `get_doubao_model()` 函数实现模型名映射。

### 坑6（2026-05-09）：ANTHROPIC_BASE_URL 不应包含 /messages 后缀

阿里 Token Plan 的 URL 末尾带了 `/messages`，但 SDK 会自动拼接 `/messages`，导致实际请求的路径变成 `/v1/messages/messages`。

**解决**：`ANTHROPIC_BASE_URL` 只写到 `/v1`，去掉末尾的 `/messages`。

### 坑7（2026-06-01）：健康检查使用 OpenAI 格式导致 404

2026-06-01 发现 `switch-bailian` 和 `switch-doubao-kimi` 切换时返回 404 错误。

**根因**：`switch-model.sh` 的健康检查使用 OpenAI 格式（`/v1/chat/completions` + `Authorization: Bearer`），但所有通道的 endpoint 都支持 Anthropic 格式，Claude Code 实际发送的也是 Anthropic 格式请求。

**解决**：将健康检查改为 Anthropic 格式：

```bash
# 改为 /v1/messages + x-api-key + anthropic-version 头
local probe_url="$base_url/v1/messages"
probe_result=$(curl -s -w "\n%{http_code}" -X POST "$probe_url" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $auth_token" \
    -H "anthropic-version: 2023-06-01" \
    -d "{\"model\":\"$model\",\"max_tokens\":1,\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}" \
    2>/dev/null)
```

### 坑8（2026-06-01）：kimi-k2.6 在 DashScope 端点返回 400

`switch-doubao-kimi` 切到 kimi 后 Claude Code 报错 `model kimi-k2.6 is not supported`。

**根因**：`settings-doubao.json` 被误操作覆盖，`ANTHROPIC_BASE_URL` 变成了 DashScope 地址（`coding.dashscope.aliyuncs.com/apps/anthropic`），但 DashScope 不支持 kimi 模型。kimi 只能走 VolcEngine 端点。

**解决**：从备份恢复 `settings-doubao.json`，确保 `ANTHROPIC_BASE_URL` 为 `https://ark.cn-beijing.volces.com/api/coding`，`ANTHROPIC_AUTH_TOKEN` 为 `ark-` 开头的 VolcEngine token。

### 坑9（2026-06-01）：`jq` 误操作覆盖了 kimi 配置

调试时用 `jq` 命令直接修改了 `settings-doubao.json`，意外把 kimi 的配置覆盖掉了。

**教训**：修改配置文件前必须 `cp` 备份，不要直接在原文件上做实验性修改。从 `.bak` 备份恢复后确认所有模型的 Token/URL 正确。

### 坑10（2026-06-01）：settings-doubao-alt.json 备用 key token 丢失 + 前缀错误

`settings-doubao-alt.json` 的 token 先被恢复成了和主 key 相同的值，然后手动修正时又加错了 `ark-` 前缀。

**正确格式**：

| 文件                            | Token                                    | Base URL                               |
| ------------------------------- | ---------------------------------------- | -------------------------------------- |
| settings-doubao.json (主)       | `ark-861b1534...496f1`（有 `ark-` 前缀） | `ark.cn-beijing.volces.com/api/coding` |
| settings-doubao-alt.json (备用) | `7aab8f7f...c1fe`（**无** `ark-` 前缀）  | `ark.cn-beijing.volces.com/api/coding` |

URL 相同，token 不同。**注意备用 key 的原始值不带 `ark-` 前缀**，不要自己加。两个 kimi key 配额重置时间也不同（主 key 6-09，备用 key 6-06）。

## 使用方法

```bash
# 豆包通道
switch-doubao              # doubao-seed-2.0-code
switch-doubao-kimi         # kimi-k2.6

# 豆包通道 (主 key)
switch-doubao              # doubao-seed-2.0-code
switch-doubao-kimi         # kimi-k2.6

# 豆包通道 (备用 key)
switch-doubao-alt          # doubao-seed-2.0-code
switch-doubao-alt-kimi     # kimi-k2.6

# 阿里百炼通道
switch-bailian             # qwen3.6-plus
switch-bailian-coder       # qwen3-coder-plus

# 阿里 Token Plan 通道
switch-token               # qwen3.6-plus
switch-token-image         # qwen-image-2.0-pro

# 查看当前模型
current-model
```

输出效果：

```
已切换到豆包coding plan: doubao-seed-2.0-code
当前模型: doubao-seed-2.0-code
doubao-seed-2.0-code：日常补完专家（次选）
```

## 总结

从 V1 的 7 个独立配置文件演进到 V2 的三通道架构，减少了重复配置，统一了切换逻辑。核心经验：

1. 同一通道的模型共享 Token/URL，只需一个模板文件 + `modelDescriptions` 字段
2. 切换模型时只替换 `env` 和 `model` 字段，绝不覆盖 `settings.json` 的其他内容（hooks、statusLine 等）
3. macOS bash 兼容性：避免 `declare -A`，用 `case` 语句替代
4. `ANTHROPIC_BASE_URL` 不要带 `/messages` 后缀
