---
title: "如何让Claude Code永远按你的代码风格输出？"
published: 2026-03-18
description: "!图片"
tags: ["Claude Code", "记忆系统"]
category: "AI工具"
image: api
draft: false
---
![图片](https://mmbiz.qpic.cn/mmbiz_png/B19QjeJMDNAlLWEQfy4vfAQasygZTC7NCfEibicad3Gq1t9EAl390Wjr4pRxUboZbGKUnmeOX6RSK1NmUcJxh4FAaXvIZqibqjBX3okhWYQmVA/640?wx_fmt=png&from=appmsg)

我用 Claude Code 写了 15 万行代码之后，发现了一个让 90% 的人头疼的问题：

**每次新开一个项目，Claude 就像失忆了一样，完全不记得你之前教过它的代码风格。**

你让它用函数式组件，它给你吐 class；你让它变量命名用驼峰，它给你整下划线；你明明说不要写注释，它每行代码后面都给你加个 `// end of function`。

我之前就是这么过来的，每次都在 Prompt 里重复那几句话："用 TypeScript"、"用 tailwind"、"不要写冗余注释"……

直到我发现了 Claude Code 的**三层记忆系统**。

## 为什么你的 Claude 总是"失忆"？

大多数人用 Claude Code 的方式是：每次对话都在第一句话把要求再说一遍。

这有两个问题：

**第一，你累。** 每次都要打那几十个字的要求，而且稍微漏掉一个细节，Claude 就给你整出幺蛾子。

**第二，Claude 也累。** 每次都要重新理解你的偏好，而且你说的"简洁风格"和它理解的"简洁风格"可能不是一回事。

说人话就是：**你在做一次性教育，而不是系统化培养。**

Claude Code 其实内置了三层"记忆系统"，可以让你的偏好**永久生效**。

## 第一层：CLAUDE.md —— 项目级"宪法"

这是最重要的一层。每个项目根目录下可以放一个 `CLAUDE.md` 文件，Claude Code **每次启动都会自动读取**它。

### 一个真实的 CLAUDE.md 长什么样？

这是我一个 Next.js 项目的配置：

`# 项目规范

## 技术栈
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## 代码风格

### 命名规范
- 组件：PascalCase（如 `UserProfile.tsx`）
- 工具函数：camelCase（如 `formatDate.ts`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- 文件夹：kebab-case（如 `user-profile/`）

### React 规范
- 只用函数式组件 + Hooks
- 优先使用 Server Components
- 状态管理优先用 Zustand，避免 Redux
- 不要在组件里写复杂逻辑，抽到 hooks 里

### TypeScript 规范
- 所有函数必须有返回类型注解
- 避免使用 `any`，实在不行用 `unknown`
- 类型定义放在同目录的 `types.ts` 里

### 样式规范
- 只用 Tailwind，不要写内联 style
- 颜色只使用 Tailwind 预设，不要硬编码
- 响应式设计：mobile-first

## 禁止事项
- 不要写注释，代码自解释
- 不要用 class 组件
- 不要用 var
- 不要在客户端组件里直接调数据库
`**关键点：这个文件会跟着项目走。** 你推到 Git 上，团队成员 clone 下来，Claude Code 也会遵守同样的规范。

### CLAUDE.md 应该写什么？

我建议分成三个部分：

**1. 硬性约束（必须写）**
- 技术栈声明（让 Claude 不瞎猜）

- 命名规范

- 绝对禁止的操作

**2. 风格偏好（建议写）**
- 代码组织方式

- 错误处理风格

- 注释程度

**3. 项目上下文（可选）**
- 业务背景

- 特殊约定

- 已知坑点

## 第二层：Memory —— 跨项目的"长期记忆"

CLAUDE.md 是项目级的，但有些偏好是你**所有项目都通用的**。

比如：
- 你喜欢用中文写 commit message

- 你讨厌写冗余注释

- 你习惯用 pnpm 而不是 npm

这时候就要用 Claude Code 的 Memory 功能。

### 怎么用？

直接在对话里说：

> 
> 记住，以后所有项目都优先用 pnpm，不要用 npm
> 

或者：

> 
> 记住，我写文章的时候不要用 emoji，除非我明确要求
> 

Claude Code 会把这些偏好存储到 `~/.claude/memory/` 目录下，**所有项目共享**。

### 我踩过的一个坑

我之前跟 Claude 说"记住，我写代码不喜欢写注释"。结果它真的**一个注释都不写**，连复杂算法也不解释了。

后来我发现 Memory 要写得更具体：

> 
> 记住，简单代码不要写注释，但复杂逻辑要在函数开头用一行注释说明意图
> 

**说人话就是：Memory 要写边界条件，否则 Claude 会过度执行。**

## 第三层：对话级 Prompt —— 临时"微调"

有时候某个任务有特殊要求，跟你的常规风格不一样。

比如你平时用 TypeScript，但这个任务需要写一个简单的脚本，你想用 JavaScript。

这时候可以在对话开始时说：

> 
> 这个脚本用 JavaScript 写，不用 TypeScript，因为是一次性工具
> 

**注意：这只是"临时覆盖"，不会影响你的长期配置。**

## 实战：一个完整的工作流

假设你新开了一个项目，想让 Claude Code 完全按你的风格来，怎么做？

### 步骤 1：创建 CLAUDE.md

在项目根目录创建 `CLAUDE.md`，写上你的硬性约束和风格偏好。

我有个技巧：**先让 Claude 帮你写初稿**。

> 
> 帮我创建一个 CLAUDE.md，这是一个 Next.js 14 + TypeScript + Tailwind 的项目，我喜欢函数式组件、讨厌冗余注释、用 Zustand 管状态
> 

然后它会给你一个初稿，你再手动微调。

### 步骤 2：设置全局 Memory

在任意项目的对话里设置你的通用偏好：

> 
> 记住，我是一名中国开发者，commit message 用中文 记住，我的代码风格是简洁优先，能用一行解决的不要写三行 记住，测试优先用 Jest，不要用 Vitest
> 

### 步骤 3：验证生效

让 Claude 做一个任务，看它是否遵守你的规范。

> 
> 创建一个用户列表组件，从 `/api/users` 获取数据
> 

看它生成的代码是否符合你的 CLAUDE.md 规范。

## 踩坑记录

### 坑一：CLAUDE.md 写得太长

我之前把 CLAUDE.md 写了 500 多行，连"不要用 var"这种废话都写进去了。

结果 Claude Code 的上下文被这个文件占了一大截，反而理解不好任务本身。

**解决方法：CLAUDE.md 控制在 100 行以内，只写真正有用的约束。**

### 坑二：Memory 和 CLAUDE.md 冲突

我在 Memory 里写了"用 pnpm"，但某个项目的 CLAUDE.md 里写了"用 npm"。

Claude Code 的优先级是：**CLAUDE.md > Memory > 对话级 Prompt**。

所以它会用 npm，因为项目级配置优先。

**解决方法：冲突时，在对话里明确覆盖。**

> 
> 这个项目也用 pnpm，忽略 CLAUDE.md 里的 npm 配置
> 

### 坑三：以为 CLAUDE.md 会自动更新

很多人以为改了代码风格，CLAUDE.md 会自动跟着变。

**不会的。** CLAUDE.md 是静态文件，需要你手动维护。

我的习惯是：每次发现 Claude 输出了我不想要的风格，我就更新 CLAUDE.md，把这条规则加进去。

## 总结

Claude Code 的三层记忆系统，本质上是在做一件事：

**把"一次性教育"变成"系统化培养"。**

你花 10 分钟写好 CLAUDE.md，以后这个项目里每次对话，Claude 都会遵守你的规范。

你花 5 分钟设置几个 Memory，以后所有项目，Claude 都会记住你的偏好。

这不是省时间的问题，这是**让 AI 真正成为你的协作伙伴**的问题。

**你用过 CLAUDE.md 或 Memory 吗？有没有踩过什么坑？评论区聊聊。**

          
        <

---

## AI 总结

# 如何让Claude Code永远按你的代码风格输出？

## 核心思想

文章揭示了 Claude Code 内置的**三层记忆系统**（CLAUDE.md → Memory → 对话级 Prompt），将"每次重复教育 AI"转变为"一次性系统化培养"，让代码风格偏好永久生效。

---

## 我的理解

这篇文章解决的是一个高频痛点：每次新建项目都要重复告诉 AI 代码规范。作者从自身 15 万行代码的实践经验出发，给出了分层解决方案。核心洞察是**不同粒度的偏好应该存储在不同层级**，而不是混在对话中反复输入。

---

## 主要内容

### 问题背景

- 大多数用户每次对话都要重复输入代码风格要求（"用 TypeScript"、"不要写冗余注释"等）
- 这种方式既低效又容易遗漏细节，导致 AI 输出不符合预期

### 第一层：CLAUDE.md —— 项目级"宪法"

- 每个项目根目录放置 `CLAUDE.md`，Claude Code 每次启动**自动读取**
- 内容分为三部分：
  1. **硬性约束**（必须写）：技术栈、命名规范、禁止操作
  2. **风格偏好**（建议写）：代码组织、错误处理、注释程度
  3. **项目上下文**（可选）：业务背景、特殊约定、已知坑点
- 文件跟随项目走，push 到 Git 后团队成员共享

### 第二层：Memory —— 跨项目"长期记忆"

- 存储在 `~/.claude/memory/`，所有项目共享
- 通过对话直接指令："记住，以后所有项目都优先用 pnpm"
- **关键教训**：Memory 要写边界条件，否则 AI 会过度执行（如"不写注释"变成连复杂算法也不注释）

### 第三层：对话级 Prompt —— 临时"微调"

- 针对单次任务的特殊需求，作为"临时覆盖"
- 不影响长期配置，用后即弃

### 完整工作流

1. 创建 CLAUDE.md（可以让 AI 生成初稿后手动微调）
2. 设置全局 Memory（通用偏好）
3. 验证生效（让 AI 执行任务观察是否符合规范）

### 三个常见踩坑

| 坑 | 原因 | 解决 |
|---|---|---|
| CLAUDE.md 写得太长（500+ 行） | 占用过多上下文，影响任务理解 | 控制在 100 行以内，只写真正有用的约束 |
| Memory 和 CLAUDE.md 冲突 | 优先级：CLAUDE.md > Memory > 对话 Prompt | 冲突时在对话中明确覆盖 |
| 以为 CLAUDE.md 会自动更新 | CLAUDE.md 是静态文件 | 每次发现 AI 输出不想要的风格时，手动更新 |

---

## 总结

三层记忆系统的本质是**把"一次性教育"变成"系统化培养"**。花 10 分钟写好 CLAUDE.md + 5 分钟设置 Memory，后续所有对话都能自动遵守规范，让 AI 从"临时工具"升级为"协作伙伴"。

---

## 我的扩展总结

### 与翔子工作流的关联

你已经在项目中大量使用 CLAUDE.md（包括全局 `~/.claude/CLAUDE.md` 和项目级），这篇文章的价值在于给出了**分层存储的最佳实践**：

- **全局 CLAUDE.md** 实际上扮演了文中"Memory"的角色（中文优先、第一性原理、交互设计原则）
- **项目 CLAUDE.md** 负责项目特定规范
- 建议：可以考虑将部分全局偏好从 CLAUDE.md 迁移到真正的 Memory 系统（`~/.claude/memory/`），让项目级 CLAUDE.md 更精简

### 关于"100 行以内"的思考

这个建议对当前工作空间有实际影响。你的全局 CLAUDE.md 已经相当长（包含了第一性原理、约束先行、交互设计原则、工作方式、开发习惯等多个章节）。可以考虑：
- 把通用开发习惯移到 Memory
- 项目级 CLAUDE.md 只保留技术栈和代码规范
- 这样每个项目的上下文占用更少，AI 理解能力更强

### 一个值得验证的假设

文章提到优先级是 CLAUDE.md > Memory > 对话 Prompt。这个优先级链意味着 Memory 只能作为"默认值"，无法覆盖项目级约束。如果未来需要全局覆盖某个项目的特定规则，目前只能通过对话级显式声明，这是一个 UX 短板。

### 对 /note skill 的启发

可以考虑扩展 /note skill，自动将对话中出现的"记住..."类指令提取并写入 Memory，而不是每次都手动告知。

---

*本文档基于 [原文链接](https://mp.weixin.qq.com/s/IHcvoh3Wa-G7A-o50F9GRQ) 整理总结，作者：Sam，公众号：三木AI编程，发布于 2026-03-18*

---

原文链接：https://mp.weixin.qq.com/s/IHcvoh3Wa-G7A-o50F9GRQ
