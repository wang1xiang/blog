---
title: "Claude-Code-plan-mode-与-Superpowers-brainstorming-配合使用"
published: 2026-05-25
description: "Claude Code 内置 plan mode 偏工程执行规划，解决“怎么做、先做什么、如何验证”的问题；Superpowers 的 brainstorming 偏需求澄清与方案收敛，解决“到底要做什么、为什么做、哪种方案更合理”的问题。"
tags: ["AI工作流", "03-ai-workflow"]
category: "AI工具"
image: api
draft: false
---
# Claude Code plan mode 与 Superpowers brainstorming 配合使用

## 核心区别

Claude Code 内置 plan mode 偏工程执行规划，解决“怎么做、先做什么、如何验证”的问题；Superpowers 的 `brainstorming` 偏需求澄清与方案收敛，解决“到底要做什么、为什么做、哪种方案更合理”的问题。

两者不是替代关系，而是前后关系：

```text
brainstorming = 想清楚
plan mode = 规划清楚
普通执行模式 = 动手实现
```

## 各自适用场景

### 适合使用 brainstorming 的情况

当任务存在以下特征时，应先用 `brainstorming`：

- 目标模糊，需求还没有完全说清楚
- 存在多种实现方案，需要比较取舍
- 涉及产品体验、交互设计、架构决策
- 影响范围较大，可能超过 3 个文件
- 容易出现“代码写对了，但问题解决错了”的风险

典型例子：

- 设计一个新 skill
- 重构知识库目录结构
- 做一个小程序或产品原型
- 优化复杂开发流程

### 适合使用 plan mode 的情况

当目标已经基本明确，但实现会影响多个文件或需要谨慎规划时，适合进入 Claude Code 内置 plan mode。

它适合回答：

- 要改哪些文件？
- 分几步做？
- 每一步的风险是什么？
- 怎么验证改动有效？
- 用户确认前是否应该暂停？

## 推荐组合流程

复杂任务的推荐顺序是：

```text
进入 plan mode
→ 使用 brainstorming 澄清目标、约束、方案
→ 收敛成明确方向
→ 在 plan mode 中生成实施计划
→ 用户批准计划
→ 退出 plan mode
→ 开发实现
→ 运行验证
```

这个组合的价值在于：

- `plan mode` 防止 Claude 在需求未确认前直接改代码
- `brainstorming` 防止计划建立在错误需求上
- 用户批准之后再进入实现，降低返工概率

## 使用边界

在 plan mode 里可以：

- 阅读代码
- 分析结构
- 讨论方案
- 使用 brainstorming 澄清需求
- 生成实施计划

但不应该在 plan mode 里直接修改代码。真正的文件修改应等用户批准计划之后再执行。

## 可直接使用的提示词

```text
先进入 plan mode，用 brainstorming 帮我理清这个需求，再给实施计划，等我确认后再开发。
```

也可以更明确：

```text
这个需求还不清楚，先 brainstorming，不要急着写代码。
```

## 判断规则

- 小修小改：直接做，不需要 brainstorming，也不需要 plan mode
- 需求明确但改动较大：用 plan mode
- 需求不清或存在方案取舍：先 brainstorming，再 plan mode
- 复杂开发任务：brainstorming → plan mode → 执行 → 验证
