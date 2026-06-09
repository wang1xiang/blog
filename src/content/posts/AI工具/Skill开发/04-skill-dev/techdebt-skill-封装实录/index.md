---
title: "TechDebt-Skill-封装实录"
published: 2026-05-20
description: "在 Claude Code 日常使用中，代码审查和技术债务检查是高频需求。希望封装一个 /techdebt 命令，能够在会话中随时扫描代码库的技术债务，也能在会话结束时自动触发。"
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# TechDebt Skill 封装实录

## 背景

在 Claude Code 日常使用中，代码审查和技术债务检查是高频需求。希望封装一个 `/techdebt` 命令，能够在会话中随时扫描代码库的技术债务，也能在会话结束时自动触发。

## 参考研究

封装前先研究了现有 skill 的结构：

1. **generating-weekly-reports** — 通过 bash 命令从 git 历史提取数据，生成 Markdown/HTML 报告，了解 skill 可以内嵌 shell 命令
2. **variable-naming-helper** — 确认 skill 结构极简：只需 `~/.claude/skills/<name>/SKILL.md` 一个文件
3. **writing-skills**（superpowers 内置）— 提供了创建新技能的完整指南

结论：Claude Code 的 skill 本质就是一个 `SKILL.md` 文件，无需代码，纯 Markdown 定义即可。

## Skill 结构

位置：`~/.claude/skills/techdebt/SKILL.md`

核心内容包括：

| 部分 | 作用 |
|------|------|
| When to Use | 触发条件：`/techdebt` 手动触发 + 会话结束自动触发 |
| Core Pattern | 工作流程：确定分析范围 → 探索代码 → 识别问题 → 生成报告 |
| 分析范围选项 | `--all`（默认）、`--staged`（仅已暂存）、`--changed`（仅未暂存） |
| 分析内容 | 代码质量、重复代码、架构问题、效率问题四大维度 |
| Git 命令参考 | 获取暂存/未暂存/近期修改文件的命令速查 |
| 输出格式 | 结构化 Markdown：问题摘要、文件:行号、严重程度、优化建议 |
| 工作流程示例 | 提交前审查、快速检查、全面审查三种场景 |

## 功能迭代

### 初始版本

第一版只支持 `/techdebt` 扫描整个 `src/` 目录。

### 扩展分析范围

增加了三个选项，适配不同场景：

- `--staged` — 仅分析 `git add` 后的文件，适合提交前审查，通过 `git diff --cached --name-only` 获取文件列表
- `--changed` — 仅分析已修改未暂存的文件，适合编码中快速检查，通过 `git diff --name-only` 获取文件列表
- `--all` — 明确指定分析所有代码

### 完善分析维度

将分析内容细分为四大类：

**代码质量**：函数长度、条件复杂度、魔法数字、DRY 原则、类型安全、冗余状态、参数膨胀、泄漏的抽象

**重复代码检测**：相似函数、重复组件、新函数是否复用现有工具

**架构问题**：组件耦合、状态管理、错误处理、可扩展性

**效率问题**：N+1 查询、顺序执行的并发机会、热路径阻塞、无界数据结构、事件监听器泄漏

## 关键决策

1. **纯 Markdown 实现** — 不写一行代码，靠 prompt 指令驱动 Claude 执行分析
2. **Git 集成** — 内嵌 Git 命令参考，让 skill 能感知版本控制状态
3. **双触发方式** — 手动 `/techdebt` + Stop hook 自动触发
4. **严重程度分级** — 高/中/低三级，帮助优先处理关键问题

## 注意事项

- skill 目录在 `~/.claude/skills/techdebt/`，Claude Code 启动时自动扫描注册
- 后续可将 skill 移到 `~/.agents/skills/` 并通过软链接到 `~/.claude/skills/`，统一管理能力
- Stop hook 中的自动触发需要在 `settings.json` 中配置对应的钩子命令
