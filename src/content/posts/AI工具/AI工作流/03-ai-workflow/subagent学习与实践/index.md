---
title: "Subagent学习与实践"
published: 2026-05-20
description: "系统性地学习了 Claude Code 的 Subagent 机制，从理论理解到实际配置，建立了一套面向 Vue 3 开发的代码审查工具链。"
tags: ["AI工作流", "03-ai-workflow"]
category: "AI工具"
image: api
draft: false
---
# Subagent 学习与实践

## 背景

系统性地学习了 Claude Code 的 Subagent 机制，从理论理解到实际配置，建立了一套面向 Vue 3 开发的代码审查工具链。

---

## 核心认知

### Subagent 的本质

- **不是新窗口**，而是一次**独立的 API 调用**，带着空的历史对话和自己的 system prompt。
- **核心价值不是并行，而是上下文隔离**。实现代码的那个上下文里充满了"为什么这样写"的假设，独立的 reviewer 没有这些偏见，所以更客观。
- 界面上不弹新窗口，结果内联展示在主对话流中。按 `Ctrl+O` 可展开查看 agent 内部的完整执行过程。

### 触发方式

- **自动触发**：我根据任务场景自主判断是否启动 subagent（如识别到 Vue 代码审查需求时启动 vue-code-reviewer）。
- **手动触发**：用户直接说"用 xxx agent 审查"，或通过 Skill（如 `/full-review`）间接触发。
- **并行触发**：在同一消息中同时启动多个 agent，它们会真正并行执行。

### Skill 与 Agent 的区别

| 维度 | Skill | Agent |
|------|-------|-------|
| 执行者 | 主会话亲自干活 | 子会话独立干活 |
| 上下文消耗 | 消耗主会话上下文 | 不消耗，结果返回 |
| 比喻 | 《操作手册》给主脑看 | 《专业员工》独立干活 |
| 适用场景 | 写代码、做设计（需持续控制） | 审查、测试、调研（需隔离上下文） |

---

## 判断标准

### 什么时候用 Subagent

问自己三个问题：
1. **这个过程会产生大量中间信息吗？** → 隔离上下文
2. **我需要独立的视角/偏见吗？** → 客观性
3. **这个任务可以完全独立完成吗？** → 可并行

### 什么时候不用

- 简单修改（改个变量名、加个注释）
- 单文件小改动
- 已经清楚知道要做什么

### 自定义 Agent 能否在 Qwen 下使用

关键看 `model` 字段：
- `model: inherit` → 能，继承当前会话的调用方式
- `model: sonnet/opus/haiku` → 不能，底层调 Claude API

---

## 工作流设计

### 完整的 Vue 开发工具链

| 命令 | 触发方式 | 执行者 | 用途 |
|------|----------|--------|------|
| `/full-review` | 手动 | 3 个 agent 并行 | 全方位代码审查 |
| `/techdebt` | 手动 | tech-debt-scanner agent | 技术债务扫描 |
| `refactor-complex-component` | 自动识别 | refactor-agent | 复杂组件重构 |
| `article-summarizer` | 自动识别 | article-summarizer agent | 文章总结 |
| `/note` | 手动 | 主会话 | 随手记笔记 |

### 提交前工作流

```
写代码
  ↓ 写完一个组件 → "审查一下" → vue-code-reviewer（日常）
  ↓ 继续写...
  ↓ git add . → 说"提交" → PreToolUse hook 拦截
  ↓ 启动 full-review（3 agent 并行）
  ↓ 确认无误 → 执行 git commit
```

### 并行分派的最佳实践

- **纯审查**：并行非常完美，速度最快。
- **如果要自动修代码**：千万不要并行（两个 agent 同时修改同一文件会产生冲突）。
- **最佳模式**：Reviewer 只负责报警，Leader（你）负责决策，Fixer 负责干活。

---

## 实操记录

### 1. 创建 vue-code-reviewer Agent

**动机**：superpowers:code-reviewer 是通用的，不知道 Vue 3 Composition API 的最佳实践。

**覆盖的 Vue 特有问题**（通用 reviewer 看不到的）：
- 直接修改 prop（违反单向数据流）
- 滥用 watch 代替 computed
- 在 `<script setup>` 外定义响应式数据
- v-for 用 index 当 key
- computed 中有副作用
- 不必要的 reactive() 包裹原始值
- defineProps 没有 TypeScript 类型标注

**审查范围**：
1. 响应式系统（ref vs reactive 选择、computed 滥用、watch 滥用）
2. 组件数据流（props 违规、emits 违规、v-model 问题、provide/inject 问题）
3. 模板和 SFC 结构（模板安全、组件拆分、样式作用域）
4. Composables 设计（API 设计、readonly 状态、纯工具函数隔离）
5. 性能问题（渲染性能、资源管理）

### 2. 改造 /techdebt → Tech Debt Scanner Agent

**改造前**：Skill，主会话自己跑扫描，消耗上下文。
**改造后**：Skill 委托给 tech-debt-scanner agent，隔离执行。

**扫描范围**：
1. 重复代码检测（相似函数、重复的工具函数）
2. 未使用代码（导入、变量、函数、死代码）
3. 代码质量问题（函数过长、嵌套过深、命名问题、硬编码）
4. 性能隐患（不必要的计算、资源泄漏风险）
5. 架构问题（组件耦合、状态管理混乱）

### 3. 创建 /full-review 全方位审查

**核心设计**：同时启动三个 agent，并行执行。

**三个 Agent 的边界**：
| Agent | 只管什么 | 不管什么 |
|-------|---------|---------|
| Vue | 响应式、Composition API、模板安全、生命周期 | 命名、重复代码、SOLID |
| General | 架构、错误处理、安全性、API 边界 | Vue 特有模式、重复代码、命名 |
| Debt | 重复代码、未使用代码、硬编码、命名 | Vue 特有模式、架构安全 |

**Common Context Block**（提交给每个 agent 的上下文）：
- Change Summary：这次改了啥（基于 git diff 统计）
- Module Context：每个文件是干嘛的（文件路径 + 头部代码推断）
- Target Files：文件列表
- Available Commands：怎么测试/怎么 lint/怎么构建

**兜底策略**：
- 没暂存文件 → 查未暂存的 diff
- 没 commit history → 根据文件名推断
- 没 package.json → 跳过测试命令部分

### 4. 改造 refactor-complex-component → Refactor Agent

**改造前**：Skill，主会话亲自重构，消耗大量上下文。
**改造后**：Skill 委托给 refactor-agent。

**重构目标结构**：
```
组件名/
├── components/          ← 子组件（负责展示/局部逻辑）
├── hooks/               ← 复用逻辑（composables）
├── constants.ts         ← 常量定义
├── enums.ts             ← 枚举定义（替代魔法值）
├── types.ts             ← 类型声明
└── index.vue            ← 入口组件（负责组织/编排）
```

**拆分触发条件**：
- 组件代码超过 300 行
- 包含 3+ 个独立的 UI 区块
- 同时处理数据获取 + 状态管理 + 复杂 UI 渲染
- 模板中有重复的组件块

### 5. 改造 article-summarizer → Article Summarizer Agent

**改造前**：Skill，主会话自己读文章，消耗大量上下文。
**改造后**：Skill 委托给 article-summarizer agent。

**文档结构**：
1. 核心思想（2-3 句话）
2. 我的理解（总体洞察）
3. 主要内容（分点列出）
4. 我的理解（分析、洞察、联系）
5. 总结
6. 我的扩展总结（深度分析、局限性、未来方向）

### 6. 配置 PreToolUse Hook 拦截 git commit

**配置位置**：`.claude/settings.local.json`（仅当前项目生效）
**效果**：每次尝试 git commit 时，系统拦截并提示先跑 vue-code-reviewer 审查。

---

## 关键决策

### 为什么不把 `/note` 也改成 Agent？

`/note` 的数据源是**当前对话历史**，就在主会话的上下文里。如果传给 Agent，需要把对话历史重新序列化一遍，反而更麻烦。笔记通常是"顺手"的事，主会话直接写最快。

### 为什么不把 security-review 改成 Agent？

安全审查查完通常需要**立刻修复**。主会话查 + 主会话修的闭环最快。如果 Agent 查完，再切回来修，容易断片。

### 为什么不嵌套 Agent？

Reviewer 发现 bug 后立刻自己修，会从"客观的审查者"变成"主观的实现者"。存在无限循环风险（修了 A 引入 B，修了 B 又引入 A）。最佳模式是 Reviewer 只负责报警，Leader 负责决策，Fixer 负责干活。

---

## 踩坑/注意

### 网上现成的 Agent 不一定好用

调研了 VoltAgent 的 `vue-expert` agent，发现：
- 定位是"实现 agent"（帮你写代码），不是"审查 agent"
- 格式是为其他 agent 框架设计的（期望与 context-manager 对话），在 Claude Code 里跑不起来
- 那些 JSON 进度报告是噪音，占用 token

**结论**：最好自己基于 code-reviewer 的结构，替换审查规则为 Vue 特有内容。

### `/agents` 列表不一定实时更新

新创建的 agent 可能需要 `/reload-plugins` 或重启会话才能识别。最直接的验证方式是尝试调用。

### Subagent 在 Qwen 模型下的限制

- 内置 agent（Explore、Plan、general-purpose）→ 不可用
- 自定义 agent（`model: inherit`）→ 可用
- subagent 内部跑的还是 Claude 模型，不是你当前的模型

---

## 总结

通过系统性学习 Subagent 机制，建立了一套面向 Vue 3 开发的代码审查工具链。核心收获：

1. **上下文隔离 > 并行**。Subagent 最大的价值是让 reviewer 不继承实现阶段的假设和盲区。
2. **Skill 和 Agent 各司其职**。Skill 适合主流程（写代码），Agent 适合独立任务（审查、测试、调研）。
3. **不要为了"集齐"而造 agent**。先跑起来，遇到覆盖不到的痛点再加。
4. **边界清晰是关键**。多个 agent 并行时，必须明确各自的审查范围，避免重复报告。
