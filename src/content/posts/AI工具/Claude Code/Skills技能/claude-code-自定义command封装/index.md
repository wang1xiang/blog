---
title: "Claude-Code-自定义Command封装"
published: 2026-05-20
description: "在日常开发中，有些操作是固定流程、反复执行的，比如\"部署\"就是：读 README → 打开 Jenkins → 点击构建。每次手动操作很重复，想封装成一个 /deploy 命令一键执行。"
tags: ["Claude Code", "Skills技能"]
category: "AI工具"
image: api
draft: false
---
# Claude Code 自定义 Command 封装

## 背景

在日常开发中，有些操作是固定流程、反复执行的，比如"部署"就是：读 README → 打开 Jenkins → 点击构建。每次手动操作很重复，想封装成一个 `/deploy` 命令一键执行。

## 发现

Claude Code 支持两种方式封装可复用指令：

### 1. Skill（技能）

- 放在 `~/.claude/skills/<name>/SKILL.md`
- 功能更重，可以定义复杂的触发条件、多步工作流
- 适合需要逻辑判断、多步交互的场景

### 2. Command（命令）

- 放在 `~/.claude/commands/<name>.md`
- 轻量，每个 `.md` 文件对应一个 `/命令`
- 适合固定流程、简单步骤的场景
- **项目级**：放在项目根目录 `.claude/commands/` 下，跟随仓库
- **全局级**：放在 `~/.claude/commands/` 下，所有项目可用

## 关键决策

### 为什么选 Command 而不是 Skill？

部署流程是固定步骤（读文件 → 打开浏览器 → 点击按钮），不需要复杂逻辑判断。Command 更轻量、更直观。

### 为什么选全局级而不是项目级？

部署命令可能在不同项目中都要用，放在全局目录 `~/.claude/commands/` 更通用。

### 踩坑：settings.json 不支持 commands 字段

最初尝试在 `~/.claude/settings.json` 中添加 `commands` 字段，验证时报错 "Unrecognized field: commands"。Claude Code 的 settings.json 不支持这种方式，必须用 `.md` 文件。

## 封装步骤

1. 创建目录：`mkdir -p ~/.claude/commands/`
2. 创建命令文件：`~/.claude/commands/deploy.md`
3. 文件内容就是 prompt 文本，不需要 frontmatter 或特殊格式
4. 重载插件后即可使用 `/deploy` 调用

### deploy.md 内容

```markdown
读取项目根目录的 README.md，从中提取 jenkins 构建页面的 URL（匹配 `企业内部 Jenkins` 或 `jenkins` 相关链接）。

然后通过 cmux 内置浏览器打开该 URL：

1. `cmux --json browser open '<url>'`
2. 等页面加载完成：`cmux browser <surface> wait --load-state complete --timeout-ms 15000`
3. 获取页面快照找到「开始构建」按钮：`cmux browser <surface> snapshot --interactive`
4. 点击「开始构建」按钮
```

## 同理封装的其他命令

| 命令               | 路径                                    | 用途                                               |
| ------------------ | --------------------------------------- | -------------------------------------------------- |
| `/deploy`          | `~/.claude/commands/deploy.md`          | 读取 README 中的 Jenkins URL，浏览器打开并点击构建 |
| `/git-commit-plan` | `~/.claude/commands/git-commit-plan.md` | 拆分未提交修改为多个逻辑提交                       |

## 总结

- **轻量固定流程 → Command**（`.claude/commands/` 下的 `.md` 文件）
- **复杂多步逻辑 → Skill**（`.claude/skills/` 下的 `SKILL.md`）
- 不要试图在 settings.json 里配 commands，不支持
- 全局命令放 `~/.claude/commands/`，项目命令放 `.claude/commands/`
