---
title: "Claude-Code-Task系统详解"
published: 2026-05-20
description: "在 Claude Code 中执行多步骤任务时，Task 系统提供了进度追踪和状态管理的能力。理解其工作原理有助于选择合适的执行方式，避免效率瓶颈。"
tags: ["Claude Code", "任务与Agent"]
category: "AI工具"
image: api
draft: false
---
## 背景

在 Claude Code 中执行多步骤任务时，Task 系统提供了**进度追踪**和**状态管理**的能力。理解其工作原理有助于选择合适的执行方式，避免效率瓶颈。

## Task 是什么

Task 是一个**带状态的 TODO 列表**，通过 `TaskCreate`、`TaskUpdate`、`TaskList`、`TaskGet` 四个工具操作。

核心字段：

| 字段 | 说明 |
|------|------|
| `subject` | 任务标题 |
| `description` | 详细描述 |
| `status` | 状态：`pending` → `in_progress` → `completed` |
| `blockedBy` | 必须先完成的任务 ID 列表 |
| `blocks` | 本任务完成后才能开始的任务 ID 列表 |

**Task 只负责记录和展示进度，不负责执行。** 实际执行靠 `Agent` tool call 或直接在会话中写代码。

## 执行方式对比

| 方式 | 行为 | 适用场景 |
|------|------|----------|
| 子代理驱动 | 每个 Task 派一个 `Agent` 调用，独立上下文 | 任务间无依赖、可独立验证 |
| 本会话内执行 | 在当前会话一步步做 | 任务间有强依赖、需要上下文传递 |

**关于并行性**：

- Task 系统本身**支持并行**，但 AI 通常按顺序派发
- 要真正并行，需要在一条消息里同时发多个 `Agent` 调用
- 设置了 `blockedBy` 的 Task 必须串行

## Task 与 Agent 的关系

Task **不能绑定特定的 Agent**——`TaskCreate` 没有 `subagent_type` 参数。

执行哪个 Agent 由 AI 在执行时自行判断，用户可以明确指示：

> "Task 2 用 vue-code-reviewer 来做"

如果不指定，默认使用 `general-purpose` agent。

## Task 的创建

1. **AI 主动创建** — 遇到多步骤复杂任务时自动拆解
2. **技能触发** — 如 `brainstorming` 技能会为每个步骤自动创建
3. **用户要求** — 直接说「帮我列个任务清单」

## 常见误区

| 误解                | 实际情况                 |
| ----------------- | -------------------- |
| Task 是并行执行的       | 默认串行，需要显式并行派发        |
| Task 可以绑定特定 agent | 不能，执行时由 AI 判断        |
| 选了「子代理驱动」就会并行     | 只是用 Agent 执行，仍然按顺序派发 |

## 实用技巧

- **无依赖的多个 Task**：可以让 AI 同时派发多个 `Agent` 并行跑
- **有依赖的 Task**：用 `blockedBy` 精确控制顺序
- **想看进度**：通过 `/tasks` 命令查看当前列表
- **想加 Task**：直接说「加一个 Task：XXX」
