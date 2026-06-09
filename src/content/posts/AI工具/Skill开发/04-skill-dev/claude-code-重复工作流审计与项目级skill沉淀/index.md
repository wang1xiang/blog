---
title: "Claude-Code-重复工作流审计与项目级Skill沉淀"
published: 2026-05-25
description: "从 X 上 Vaibhav Srivastav 的 prompt 出发，核心思想是让 AI 回看最近工作记录、memory、sessions、已有 skills 和 automations，找出重复出现、值得沉淀的手动流程。"
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# Claude Code 重复工作流审计与项目级 Skill 沉淀

## 背景

从 X 上 [Vaibhav Srivastav](https://x.com/reach_vb/status/2058538305872949490) 的 prompt 出发，核心思想是让 AI 回看最近工作记录、memory、sessions、已有 skills 和 automations，找出重复出现、值得沉淀的手动流程。

关键判断不是“能不能自动化”，而是“是否有足够证据证明值得沉淀”，并且必须选择最小有用形态。

## 核心原则

- 复用已有 > 扩展已有 > 创建最小新资产 > 创建复杂系统
- 只对高置信度、输入稳定、输出清晰、会重复发生的流程做沉淀
- 不自动创建 speculative、overlap、过宽的资产
- 默认先输出候选清单，用户确认后再创建文件

## 试跑审计结论

审计当前工作区后，识别出几个高频模式：

1. Claude Code 版本变更分析
2. 外部 GitHub 项目调研
3. 每日/周期工作回顾
4. 微信/文章内容提取与归档
5. 知识库目录重组和分类维护
6. Skill 开发/封装

判断后认为最值得立即做的是：

- 扩展已有 `daily-recap`
- 新增 `repo-research`
- 新增当前项目级 `workflow-audit`

不建议立即做大而全的全局 `/workflow-audit`，因为范围过宽，容易与 `daily-recap`、`session-report`、memory、handoff/pickup 重叠。

## 实施内容

### 1. 扩展 daily-recap

修改文件：

`.claude/skills/daily-recap/SKILL.md`

新增“可沉淀资产候选”章节，要求：

- 只列候选，不创建文件
- 最多列 3 个候选，避免噪音
- 必须有稳定输入、可重复流程、清晰输出或停止条件
- 优先推荐 `extend existing`
- 无强候选时输出“今天没有足够证据表明需要沉淀新的自动化资产。”

### 2. 新增 repo-research skill

新增文件：

`.claude/skills/repo-research/SKILL.md`

用途：研究 GitHub 仓库或外部代码项目。

核心规则：

- 优先使用一手来源：GitHub README、源码、release、issues、官方文档
- GitHub URL 优先用 `gh` CLI 或 GitHub API
- 默认不创建文件
- 如果用户要求保存调研结果，必须调用或遵守 `note` skill 的归档确认规则
- 保存目录优先为 `markdown/02-主题/07-项目调研/`

输出结构包括：

- 一句话定位
- 解决什么问题
- 核心能力
- 技术栈与依赖
- 关键文件/目录
- 基本使用方式
- 维护状态
- 优点
- 风险和限制
- 适合谁用
- 不适合谁用
- 建议

### 3. 新增 workflow-audit skill

新增文件：

`.claude/skills/workflow-audit/SKILL.md`

用途：审计最近 Claude Code 工作，识别值得沉淀成 skill、subagent、command、hook、scheduled task 或扩展已有资产的重复流程。

核心规则：

- 默认最近 30 天
- 默认只输出候选清单，不落盘
- 每次最多推荐 1 个立即创建的新资产
- 优先指出“不该自动化”的项目
- 涉及 settings hooks、定时任务、写文件、删除文件、提交代码时必须等待用户明确同意

候选筛选条件：

- 至少出现 2 次，或明显会再次发生且重复成本高
- 输入稳定
- 步骤可重复
- 输出或停止条件清晰
- 能提升速度、质量、一致性或可靠性
- 没有被已有资产充分覆盖

## 关键决策

### 为什么不先做大而全的 workflow-audit？

因为这个能力本身容易变成“为了自动化而自动化”。更稳的路径是先把候选发现能力嵌入 `daily-recap`，让它在日常回顾中自然积累证据。

### 为什么 repo-research 值得单独做？

因为外部 GitHub 项目调研已经多次出现，流程稳定、输入明确、输出结构清晰，而且项目 CLAUDE.md 已规定调研内容应保存到 `markdown/02-主题/07-项目调研/`。

### 为什么要求遵守 note 的归档规则？

避免 skill 自行落盘造成知识库污染。归档前必须展示路径和摘要，等待用户确认，符合当前知识库的管理方式。

## 可复用经验

沉淀自动化资产时，不要问“还能自动化什么”，而要问：

> 哪些重复劳动已经被证据证明值得沉淀，而且最小有用形态是什么？

最小可用沉淀路径：

1. 先在已有回顾流程中列候选
2. 积累证据
3. 发现高频稳定流程
4. 优先扩展已有资产
5. 必要时才创建新 skill
