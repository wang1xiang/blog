---
title: "claude-code-deepseek-原生API接入"
published: 2026-06-01
description: "用户持有 DeepSeek 原生 API key，但 Claude Code 只能发 Anthropic 格式请求（/v1/messages + x-api-key）。DeepSeek 的默认 API 是 OpenAI 兼容格式，需要..."
tags: ["Claude Code", "并行开发"]
category: "AI工具"
image: api
draft: false
---
# Claude Code 接入 DeepSeek 原生 API

## 背景

用户持有 DeepSeek 原生 API key，但 Claude Code 只能发 Anthropic 格式请求（`/v1/messages` + `x-api-key`）。DeepSeek 的默认 API 是 OpenAI 兼容格式，需要找到其 Anthropic 兼容端点才能直接接入。

## 关键发现

DeepSeek **原生支持 Anthropic API 格式**，不需要额外的代理或转换层。

- **Endpoint**: `https://api.deepseek.com/anthropic`（注意**不带** `/v1`，Claude Code 会自动拼接 `/v1/messages`）
- **认证**: `x-api-key` 头 + DeepSeek 原生 token（`sk-` 前缀）
- **格式**: 标准 Anthropic `/v1/messages` 协议

## 配置方案

### 配置文件: `~/.claude/settings-deepseek.json`

```json
{
  "description": "DeepSeek 原生 API",
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "<REDACTED>",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-flash"
  },
  "model": "deepseek-v4-flash",
  "modelDescriptions": {
    "deepseek-v4-flash": "deepseek-v4-flash：快速响应，适合简单问题和日常补完（默认）",
    "deepseek-v4-pro": "deepseek-v4-pro：深度推理，适合复杂问题和架构设计"
  }
}
```

### 可用模型

| 模型                | 用途               | 特点                 |
| ------------------- | ------------------ | -------------------- |
| `deepseek-v4-flash` | 简单问题、日常补完 | 响应快，按量付费便宜 |
| `deepseek-v4-pro`   | 复杂问题、架构设计 | 深度推理，质量更高   |

### switch-model.sh 接入

```bash
# DeepSeek 原生 API (Anthropic 兼容端点)
deepseek-flash)  switch_channel_model "DeepSeek原生API" "deepseek-v4-flash" "$CLAUDE_DIR/settings-deepseek.json" ;;
deepseek-pro)    switch_channel_model "DeepSeek原生API" "deepseek-v4-pro"   "$CLAUDE_DIR/settings-deepseek.json" ;;
```

### ~/.zshrc 快捷命令

```bash
alias switch-deepseek-flash='~/.claude/switch-model.sh deepseek-flash'
alias switch-deepseek-pro='~/.claude/switch-model.sh deepseek-pro'
```

## 踩坑记录

### 坑1：ANTHROPIC_BASE_URL 带了 `/v1` 导致 404

配置时写成 `https://api.deepseek.com/anthropic/v1`，`switch-model.sh` 健康检查拼接后变成 `.../anthropic/v1/v1/messages`（重复 `/v1`）。

**解决**：`ANTHROPIC_BASE_URL` 只写到 `https://api.deepseek.com/anthropic`，不加 `/v1`。

### 坑2：`reasoning_content` 字段不兼容

Claude Code 发送请求时会带上 `reasoning_content` 字段（这是 Claude 模型的特性），但 DeepSeek 的 Anthropic 兼容端点不接受消息历史里的这个字段，导致实际请求报 400 错误。

**现状**：健康检查（probe）通过，但 Claude Code 实际对话可能因格式不兼容而报错。这个问题不在配置层面解决，需要一层代理来剥离 `reasoning_content`。

## 切换命令

```bash
switch-deepseek-flash   # 切换到 v4-flash（快速响应）
switch-deepseek-pro     # 切换到 v4-pro（深度推理）
```
