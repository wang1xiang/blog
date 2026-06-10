---
title: "我的Skill装备库"
published: 2026-06-01
description: "统计截至 2026-06-01，共安装 71 个 Skill，按功能域分为 11 类。"
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# 我的 Skill 装备库

统计截至 2026-06-01，共安装 **71 个 Skill**，按功能域分为 11 类。

## 一、💻 代码开发（16 个）

与编码、重构、代码质量直接相关。

| Skill                       | 来源        | 用途                                             |
| --------------------------- | ----------- | ------------------------------------------------ |
| vue                         | 自研        | Vue 3 Composition API、script setup、响应式系统  |
| vue-best-practices          | 自研        | Vue 架构/可维护性/重构/性能决策                  |
| refactor-complex-component  | 自研        | 重构复杂 Vue 组件 → refactor-agent               |
| neat-freak                  | 自研        | 代码整洁度检查                                   |
| techdebt                    | 自研        | 技术债务扫描：重复/未使用代码、代码异味          |
| full-review                 | 自研        | 综合代码审查：Vue + 通用质量 + 技债并行扫描      |
| systematic-debugging        | Superpowers | 系统化调试流程：遇 bug 先诊断再修复              |
| test-driven-development     | Superpowers | TDD 工作流：先写测试再实现                       |
| requesting-code-review      | Superpowers | 任务完成/合并前请求代码审查                      |
| receiving-code-review       | Superpowers | 接收审查反馈并修复                               |
| skill-creator               | 自研        | 创建/修改/测试/优化 Skill                        |
| skill-cleaner               | 项目级      | Skill 体检：检测重复/死链/低使用率               |
| prompt-optimizer            | 自研        | 优化提示词：让指令更清晰、结构化、可执行         |
| subagent-driven-development | Superpowers | 子代理驱动开发：实现→审查→迭代                   |
| dispatching-parallel-agents | Superpowers | 并行派发独立子任务给多个 agent                   |
| nopua                       | 自研        | 反 PUA：任务连续失败时驱动 AI 用信任和内驱力推进 |

## 二、📋 工作流管理（14 个）

覆盖从需求到交付的完整开发流程。

| Skill                          | 来源        | 用途                                            |
| ------------------------------ | ----------- | ----------------------------------------------- |
| brainstorming                  | Superpowers | 创意发散与收敛，任何新功能/设计决策前必须先调用 |
| writing-plans                  | Superpowers | 编写实现计划，输入规格/需求后输出分步方案       |
| executing-plans                | Superpowers | 执行已审批的实现计划，带审查节点                |
| make-plan                      | Claude-Mem  | 创建带文档发现的分阶段实现计划                  |
| do                             | Claude-Mem  | 用子代理执行 make-plan 生成的计划               |
| verification-before-completion | Superpowers | 完成前验证：测试/构建/功能检查                  |
| finishing-a-development-branch | Superpowers | 开发分支收尾：commit/PR/清理                    |
| using-git-worktrees            | Superpowers | Git worktree 隔离开发                           |
| using-superpowers              | Superpowers | Skills 查找与调用入口，会话开始时加载           |
| writing-skills                 | Superpowers | 编写新 Skill 的方法论                           |
| verify                         | 内置        | 验证代码变更是否按预期工作（启动应用+观察）     |
| simplify                       | 内置        | 审查代码的复用性、质量和效率                    |
| handoff                        | 内置        | 生成 HANDOFF.md，交接未完成工作                 |
| pickup                         | 内置        | 恢复上下文，继续上次工作                        |

## 三、🎨 UI/UX 设计（9 个）

界面设计、品牌识别、设计系统。

| Skill           | 来源            | 用途                                                  |
| --------------- | --------------- | ----------------------------------------------------- |
| ui-ux-pro-max   | UI/UX Pro Max   | 核心入口：50+ 风格、161 色板、57 字体搭配、99 UX 准则 |
| design (UI/UX)  | UI/UX Pro Max   | 品牌识别 + Logo 生成（55 风格）+ CIP + 图标 + 社交图  |
| banner-design   | UI/UX Pro Max   | 社交/广告/Web/印刷 Banner 设计（22 风格）             |
| brand           | UI/UX Pro Max   | 品牌语音、视觉识别、信息框架、资产管理                |
| slides          | UI/UX Pro Max   | HTML 演示文稿（Chart.js + 设计令牌）                  |
| design-system   | UI/UX Pro Max   | 三层令牌架构 + 组件规格                               |
| ui-styling      | UI/UX Pro Max   | shadcn/ui + Radix UI + Tailwind CSS 组件构建          |
| frontend-design | Frontend Design | 创建高质量前端界面，避免通用 AI 审美                  |
| design (UI)     | 自研            | 生产级 UI 组件/页面设计，基于截图迭代                 |

## 四、🧠 代码理解与知识图谱（8 个）

代码库分析、知识图谱、领域理解。

| Skill                | 来源                | 用途                           |
| -------------------- | ------------------- | ------------------------------ |
| understand           | Understand Anything | 分析代码库生成交互式知识图谱   |
| understand-chat      | Understand Anything | 基于知识图谱对话式问答         |
| understand-dashboard | Understand Anything | 启动 Web 仪表盘可视化知识图谱  |
| understand-diff      | Understand Anything | 分析 git diff/PR 的影响和风险  |
| understand-domain    | Understand Anything | 提取业务领域知识，生成领域流图 |
| understand-explain   | Understand Anything | 深度解释特定文件/函数/模块     |
| understand-knowledge | Understand Anything | 分析 LLM 知识库，生成知识图谱  |
| understand-onboard   | Understand Anything | 生成新成员 onboarding 指南     |

## 五、📝 内容与文档（8 个）

文章处理、笔记整理、文档生成。

| Skill                      | 来源   | 用途                                      |
| -------------------------- | ------ | ----------------------------------------- |
| note                       | 自研   | 将对话内容整理为结构化 Markdown 文档保存  |
| article-summarizer         | 自研   | 阅读文章/本地文件，生成结构化总结文档     |
| claude-weekly-digest       | 自研   | 收集 Claude 相关中英文文章，生成月报      |
| generating-monthly-reports | 自研   | 基于 git 提交记录生成程序员月报           |
| tts                        | 自研   | Markdown → Claude 口语化讲解 → 百聆转 MP3 |
| wechat-article-extractor   | 自研   | 提取微信公众号文章的元数据和内容          |
| aihot                      | 项目级 | AI HOT 中文资讯查询（curl 公开 API）      |
| repo-research              | 项目级 | 调研公开 GitHub 仓库，生成结构化项目笔记  |

## 六、🔍 记忆与搜索（5 个）

跨会话记忆、历史检索、代码搜索。

| Skill           | 来源       | 用途                                           |
| --------------- | ---------- | ---------------------------------------------- |
| mem-search      | Claude-Mem | 搜索历史会话记忆：「上次怎么解决 X 的？」      |
| smart-explore   | Claude-Mem | 基于 tree-sitter AST 的 token 优化代码结构搜索 |
| timeline-report | Claude-Mem | 生成项目开发历史叙事报告                       |
| find-skills     | 自研       | 发现和安装新的 Skill                           |
| daily-recap     | 项目级     | 回顾今天所有 Claude 会话的工作内容             |

## 七、🌐 网络与浏览器（2 个）

联网操作、网页抓取、浏览器自动化。

| Skill          | 来源 | 用途                                             |
| -------------- | ---- | ------------------------------------------------ |
| web-access     | 自研 | 所有联网操作的中枢：搜索、抓取、CDP 浏览器自动化 |
| kimi-webbridge | 自研 | 通过 Kimi WebBridge 访问需要登录的网页           |

## 八、🖥️ 环境与配置（2 个）

环境配置、权限管理。

| Skill                    | 来源 | 用途                                        |
| ------------------------ | ---- | ------------------------------------------- |
| update-config            | 内置 | 配置 settings.json（权限、环境变量、Hooks） |
| fewer-permission-prompts | 内置 | 扫描常用只读操作，自动生成权限白名单        |

## 九、🔧 运维与部署（6 个）

CI/CD、部署、Git 操作、安全、会话分析。

| Skill           | 来源           | 用途                                   |
| --------------- | -------------- | -------------------------------------- |
| deploy          | 内置           | 部署                                   |
| run             | 内置           | 启动项目应用并验证变更                 |
| review          | 内置           | 审查 Pull Request                      |
| security-review | 内置           | 安全审查                               |
| git-commit-plan | 内置           | 基于已完成的修改拆分 Git 提交方案      |
| session-report  | Session Report | 会话使用报告（token/cache/子代理统计） |

## 十、🎮 生活与娱乐（4 个）

个人生活相关的自动化。

| Skill                | 来源   | 用途                                     |
| -------------------- | ------ | ---------------------------------------- |
| baoyu-wechat-summary | 项目级 | 微信群聊精华总结 + 毒舌版 + 用户画像回溯 |
| cdk-exchanger        | 项目级 | 向僵尸开炮 BT 版每日签到 CDK 自动填表    |
| jd-bean-sign         | 项目级 | 京东豆签到                               |
| video-use            | 项目级 | 视频对话式编辑：转录、剪辑、调色、字幕   |

## 十一、🔄 循环与定时（1 个）

| Skill | 来源 | 用途                                   |
| ----- | ---- | -------------------------------------- |
| loop  | 内置 | 定时循环执行命令（如 `/loop 5m /foo`） |

---

## 统计总览

| 功能域          | 数量   | 命令级（可 `/` 调用） | 语义级（模型自动触发） |
| --------------- | ------ | --------------------- | ---------------------- |
| 💻 代码开发     | 16     | 11                    | 5                      |
| 📋 工作流管理   | 14     | 10                    | 4                      |
| 🎨 UI/UX 设计   | 9      | 9                     | 0                      |
| 🧠 代码理解     | 8      | 8                     | 0                      |
| 📝 内容与文档   | 8      | 4                     | 4                      |
| 🔍 记忆与搜索   | 5      | 5                     | 0                      |
| 🌐 网络与浏览器 | 2      | 1                     | 1                      |
| 🖥️ 环境与配置   | 2      | 2                     | 0                      |
| 🔧 运维与部署   | 6      | 6                     | 0                      |
| 🎮 生活与娱乐   | 4      | 1                     | 3                      |
| 🔄 循环与定时   | 1      | 1                     | 0                      |
| **合计**        | **75** | **58**                | **17**                 |

> 注：合计 75 ≠ 71 是因为 `design` 同时出现在「自研 UI」和「UI/UX Pro Max → design」两个位置，存在功能重叠。去重后为 **71 个独立 Skill**。

## 来源分布

| 来源                             | 数量   |
| -------------------------------- | ------ |
| 自研（全局 `~/.claude/skills/`） | 19     |
| 自研（项目级 `.claude/skills/`） | 9      |
| Superpowers 插件                 | 14     |
| Claude-Mem 插件                  | 5      |
| Understand Anything 插件         | 8      |
| UI/UX Pro Max 插件               | 7      |
| Frontend Design 插件             | 1      |
| Session Report 插件              | 1      |
| 内置                             | 7      |
| **合计**                         | **71** |

## 高频使用 Top 10

1. **note** — 几乎每次会话结束都用
2. **web-access** — 所有联网操作的中枢
3. **brainstorming** — 复杂任务前的标准流程
4. **handoff / pickup** — 会话衔接
5. **aihot** — 每日 AI 资讯速览
6. **prompt-optimizer** — 提示词打磨
7. **baoyu-wechat-summary** — 群聊总结
8. **techdebt** — 代码质量检查
9. **find-skills** — 发现新能力
10. **daily-recap** — 回顾今天的工作

## 变更记录

| 日期       | 变更                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-06-01 | 按功能域重新分类；删除已不存在的 cmux 系列 4 个；补充遗漏的 repo-research/skill-cleaner/video-use/workflow-audit；修复 skill-cleaner 重复条目；session-report 归入运维分类；更新日期与统计 |
| 2026-05-20 | 初版创建（按插件来源分类）                                                                                                                                                                 |
