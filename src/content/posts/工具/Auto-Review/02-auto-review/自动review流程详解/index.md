---
title: "自动Review流程详解"
published: 2026-05-20
description: "在本地用 Codex（GPT-5.4）+ 自己编排的 Superpowers Skills 开发，完成后提交 Pull Request。"
tags: ["Auto-Review", "02-auto-review"]
category: "工具"
image: api
draft: false
---
# 自动 Review 流程详解：Codex + Gemini + Self-hosted Runner

> 来源：别人分享的个人开发工作流，结合 Codex（GPT-5.4）、Gemini Code Assist 和自托管 Runner 实现自动化代码审查与修复循环。

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────┐
│                  你 (人类开发者)                       │
│  关键决策：是否合并？是否再跑一轮？                      │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ▼                          ▼
┌────────────────────┐    ┌────────────────────────┐
│  本地: Codex        │    │  GitHub PR             │
│  (GPT-5.4)         │    │  + Gemini Code Assist  │
│  + Superpowers     │    │  (Reviewer)            │
│  负责「写 + 修复」   │    │  负责「审查 + 提问题」   │
└────────┬───────────┘    └───────────┬────────────┘
         │                            │
         │  提交 PR                   │  Review 评论
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│           Self-hosted GitHub Runner              │
│   监听 Gemini Review 更新 → 触发 Codex 自动修复   │
└─────────────────────────────────────────────────┘
```

---

## 二、详细步骤拆解

### Step 1: 写代码，提交 PR

在本地用 Codex（GPT-5.4）+ 自己编排的 Superpowers Skills 开发，完成后提交 Pull Request。

**Superpowers Skills 的角色**：相当于一套可复用的「开发模板」。比如「写一个 API 端点」这个 Skill 会告诉 Codex 要遵循什么规范、写什么测试、怎么组织代码。把各种场景 Skill 组合起来，就像搭积木一样编排开发流程。

### Step 2: Gemini Code Assist 自动 Review

PR 提交后，GitHub 上接入的 Gemini Code Assist 自动跑代码审查，在 PR 里留下评论。

- 每天 33 个免费额度
- 会标出问题等级（critical / medium / low 等）

### Step 3: 本地 Runner 监听 + 自动修复

本地跑一个 self-hosted GitHub Runner，它做的事情：

1. **监听** GitHub PR 上的新评论（Gemini 的 Review 更新）
2. **触发** Codex 读取这些 Review 意见
3. **自动修复** medium 及以上级别的问题
4. **或者不修复**，如果 Codex 判断不是问题，会留评论解释原因
5. **提交** 修复后的代码更新到 PR

### Step 4: 循环

Gemini 看到新的代码提交后，会再次 Review → Runner 再次触发修复 → 如此循环。

一般跑 **2 轮**，把所有 medium 及以上问题清理完就手动合并。

---

## 三、核心优点

### 1. 两个模型，不同视角

| 模型 | 角色 | 特点 |
|------|------|------|
| **Gemini** | Reviewer（审查者） | 只看代码，找问题，心态是「挑刺」 |
| **Codex (GPT-5.4)** | Fixer（修复者） | 负责改代码，心态是「解决问题」 |

类比人类团队：写代码的人和 review 代码的人不是同一个，这样更容易发现盲点。Gemini 可能发现 Codex 没注意到的问题，Codex 也可能认为 Gemini 的判断不对并给出理由。

### 2. 修复跑在本地 Harness Engineering 环境

**Harness Engineering** 意思是「工具链/工程化基础设施」。修复不是跑在一个裸的 CI 环境，而是跑在本地完整的开发环境中：

- 有所有依赖、工具链、测试框架
- 有 Superpowers Skills 提供的规范和模板
- 修复的质量更高，不像 CI 环境可能缺东西导致修复不彻底

### 3. 人做关键决策

不是全自动合并，而是：
- AI 负责「发现问题 → 修复问题」的循环
- **人**决定：问题都修好了吗？要不要再跑一轮？最终合不合？

这避免了 AI 盲目合并不合适的代码。

---

## 四、技术实现要点

如果想搭建这套流程，需要以下几个组件：

| 组件 | 说明 |
|------|------|
| **GitHub webhook / polling** | Runner 监听 PR 评论变化 |
| **Codex CLI 自动化调用** | 把 Review 意见喂给 Codex，让它执行修复 |
| **Superpowers Skills 编排** | 定义「如何修复」的 Skill：读取 PR 评论 → 分类问题严重程度 → 逐个修复并 commit |
| **循环控制** | 跑 2 轮就停，或达到某个条件就停 |

---

## 五、总结

这套流程的本质是**「AI 双人对审 + 人类最终决策」**：

- Gemini 和 Codex 扮演两个不同角色的 AI 工程师，互相补盲
- 本地环境提供工程化保障，修复质量更稳定
- 人保留最终控制权，不被 AI 绑架

这是一个非常适合个人开发者或小团队的低成本、高质量 code review 方案。

---

## 六、迁移到 GitLab

这套流程可以完整地迁移到 GitLab，核心思路不变，只需要替换平台组件。

### 6.1 GitHub vs GitLab 映射

| GitHub 组件 | GitLab 等价物 | 说明 |
|-------------|--------------|------|
| Pull Request (PR) | Merge Request (MR) | 概念完全一样 |
| GitHub Runner (self-hosted) | GitLab Runner (self-hosted) | 更成熟，GitLab 原生支持 |
| PR Comments | MR Comments | 通过 API 读写，功能一样 |
| GitHub Webhook | GitLab Webhook / System Hook | 事件类型略有不同，但覆盖相同场景 |
| Gemini Code Assist | 需要替换（见下节） | Gemini Code Assist 目前只支持 GitHub |

### 6.2 Review 工具替代方案

Gemini Code Assist 目前只支持 GitHub，GitLab 上有以下替代方案：

| 方案 | 说明 | 成本 |
|------|------|------|
| **Gemini CLI / API** | 自己调 Gemini API，把 MR diff 喂进去，把结果通过 GitLab API 写成 MR Comment | API 费用（有免费额度） |
| **GitLab Duo** | GitLab 官方 AI，自带 Code Review 功能 | GitLab Ultimate 收费版 |
| **CodeRabbit** | 第三方 AI Review 工具，支持 GitLab | 有免费 tier |
| **自定义脚本** | 用任意 LLM（Claude/GPT/Gemini）分析 diff，通过 GitLab API 发评论 | API 费用 |

### 6.3 适配后的 GitLab 架构

```
┌─────────────────────────────────────────────────────┐
│                  你 (人类开发者)                       │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ▼                          ▼
┌────────────────────┐    ┌────────────────────────┐
│  本地: Codex        │    │  GitLab MR             │
│  (GPT-5.4)         │    │  + AI Review           │
│  + Superpowers     │    │  (Gemini API /         │
│  负责「写 + 修复」   │    │   CodeRabbit / 自定义)  │
└────────┬───────────┘    └───────────┬────────────┘
         │                            │
         │  提交 MR                   │  Review 评论
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│           Self-hosted GitLab Runner              │
│   监听 MR 评论更新 → 触发 Codex 自动修复           │
│   通过 GitLab API 读写评论                        │
└─────────────────────────────────────────────────┘
```

### 6.4 技术实现差异

| 方面 | GitHub | GitLab |
|------|--------|--------|
| Runner 注册 | `actions/runner` | `gitlab-runner register` |
| 事件监听 | Webhook `issue_comment` | Webhook `note`（评论事件） |
| API 读写评论 | `gh api` / GitHub REST API | GitLab API / `glab` CLI |
| CI 触发 | GitHub Actions | `.gitlab-ci.yml` |

GitLab 的 Runner 更成熟，配置也更灵活。GitLab Webhook 对 MR 评论事件（`note`）支持很好，监听 AI Review 更新完全没问题。

### 6.5 GitLab 推荐方案

| 组件 | 推荐方案 |
|------|---------|
| **Review** | Gemini API（自己调，把 MR diff 喂给 Gemini，结果写成 MR Comment） |
| **Runner** | GitLab Runner（self-hosted，原生支持，比 GitHub Runner 更稳定） |
| **修复** | Codex + Superpowers（不变，本地环境跟平台无关） |
| **循环控制** | GitLab CI pipeline 或 Runner 脚本 |

**结论**：可以完整迁移到 GitLab，且 GitLab 的 Runner 和 API 生态其实更适合这套玩法。唯一额外工作量是自己调用 Gemini API 做 Review（因为 Gemini Code Assist 不支持 GitLab），但技术上不复杂。
