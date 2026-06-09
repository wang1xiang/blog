---
title: "Tmux-Agent-配置实录"
published: 2026-05-20
description: "在日常开发中，经常需要同时运行多个 AI Agent（Claude、Codex、Kimi-Code），每次手动创建 tmux 会话、拆分窗格、启动 Agent 比较繁琐。希望用一个快捷命令一键完成所有操作。"
tags: ["终端配置", "05-terminal-tooling"]
category: "工具"
image: api
draft: false
---
# Tmux Agent 配置实录

## 背景

在日常开发中，经常需要同时运行多个 AI Agent（Claude、Codex、Kimi-Code），每次手动创建 tmux 会话、拆分窗格、启动 Agent 比较繁琐。希望用一个快捷命令一键完成所有操作。

## 方案设计

### 目录结构

```
~/tmux/
  tmux-agents.sh          # 一键启动脚本
~/.zshrc                   # 快捷别名配置
```

### 快捷别名

在 `~/.zshrc` 中配置：

```bash
# Tmux Agent
alias ta='~/tmux/tmux-agents.sh'
alias tmux-agent='~/tmux/tmux-agents.sh'
```

### 核心脚本

`~/tmux/tmux-agents.sh` 实现以下功能：

1. **参数支持**：第一个参数选择 Agent（claude/codex/kimi-code），第二个参数自定义项目名称，默认使用当前目录名
2. **会话复用**：如果会话已存在，直接 attach，避免重复创建
3. **三窗格布局**：
   - 主窗格：启动 AI Agent
   - 右侧窗格：执行 `git pull && git status`，方便查看代码状态
   - 底部窗格：预留为资源监控或文件浏览
4. **自动切回主窗格**：创建完成后焦点回到 AI Agent 窗格

## 支持的 Agent

| Agent | 启动命令 | 参数 |
|-------|----------|------|
| Claude | `claude --dangerously-skip-permissions -c` | 跳过权限检查，连续模式 |
| Codex | `codex --workspace .` | 工作目录模式 |
| Kimi-Code | `kimi-code` | 直接启动 |

## 使用方式

```bash
# 启动当前项目的 Claude Agent
ta

# 启动 Codex
ta codex

# 启动指定项目的 Claude
ta claude my-project
```

会话命名规则：`{agent}-{project}`，例如 `claude-alarm-extension`。

## 注意事项

- Claude 使用了 `--dangerously-skip-permissions` 跳过权限确认，适合在受信任的项目目录下使用
- 脚本使用 `set -e`，任何命令失败都会终止执行
- tmux 会话名中不包含特殊字符，避免 attach 时需要转义
