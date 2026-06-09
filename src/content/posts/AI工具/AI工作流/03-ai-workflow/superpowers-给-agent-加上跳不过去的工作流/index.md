---
title: "Superpowers-给-Agent-加上跳不过去的工作流"
published: 2026-06-02
description: "来源：dev.to/arshtechpro，2026-05-18"
tags: ["AI工作流", "03-ai-workflow"]
category: "AI工具"
image: api
draft: false
---
# Superpowers：给 Coding Agent 加上跳不过去的工作流

来源：[dev.to/arshtechpro](https://dev.to/arshtechpro/superpowers-giving-your-coding-agent-a-workflow-it-cant-skip-41m3)，2026-05-18

## 核心问题

> "你要个功能，Agent 立刻开始写代码。没有 spec，没有 plan，没有测试。20 分钟后你得到一个看起来对但微妙地错了的东西。"

**解法不是更聪明的模型，而是更好的流程。**

## Superpowers 是什么

开源软件开发方法论，以"技能（skills）"库的形式封装为插件。支持 Claude Code、Codex、Cursor、Copilot CLI 等。

**关键设计：技能自动触发** — 不需要你记住去调用什么，Agent 看到你在构建东西时，自动停下来跑标准流程。

## 标准工作流（6 步）

| 步骤                | 做什么                                                            |
| ------------------- | ----------------------------------------------------------------- |
| **Brainstorming**   | 提问、把粗糙想法精炼成书面 spec，分块展示给你确认                 |
| **Git Worktrees**   | 新建隔离分支，验证测试基线干净                                    |
| **Writing Plans**   | 拆成 2-5 分钟粒度的小任务，每个任务写清文件路径、代码、验证步骤   |
| **Subagent-driven** | 每个任务派一个新鲜子 Agent，两步 review：是否符合 spec + 代码质量 |
| **TDD**             | 严格的 RED-GREEN-REFACTOR，先写失败测试再写代码                   |
| **Code Review**     | 任务之间做 review，关键问题 blocking 进度                         |

> "计划要写得足够清楚，让一个没有上下文、讨厌测试的初级工程师都能照做。"

## 四条原则

1. TDD 永远优先
2. 系统化流程优于即兴猜测
3. 简单是首要目标
4. 证据胜于断言 — 声明成功前必须先验证

## 适用场景

- **适合**：非 trivial 的工作，被 Agent 自信地交付烂代码坑过的人
- **不适合**：改变量名、修 typo — 流程太重，杀鸡用牛刀

## 总结

> "瓶颈已经不是模型了。瓶颈是 Agent 跳过了工程中无聊但有纪律的部分。Superpowers 让那些部分变成强制的。"
