---
title: "高德OPC+Harness自主增长系统方法论"
published: 2026-05-25
description: "X @hongming731 推荐 → BestBlogs 聚合页 → 阿里云开发者公众号原文《让 AI 自己做增长：基于 OPC 和 Harness 思想的自主增长系统探索》（作者：曼行，发布 2026-05-25）。"
tags: ["AI工作流", "03-ai-workflow"]
category: "AI工具"
image: api
draft: false
---
# 高德 OPC+Harness 自主增长系统方法论

## 来源链路

X [@hongming731](https://x.com/hongming731/status/2058744324511436823) 推荐 → BestBlogs 聚合页 → 阿里云开发者公众号原文《让 AI 自己做增长：基于 OPC 和 Harness 思想的自主增长系统探索》（作者：曼行，发布 2026-05-25）。

原文核心定位：把"AI 写代码"从单次对话式生成，升级成可长跑、可评估、可回滚的自主开发流水线。

## 它解决什么问题

单次对话型 AI 写代码的三大失败模式：

1. 上下文越长越混乱，到后期完全失控。
2. 生成-评估同一个 Agent，自己写自己评，永远说"通过"。
3. 没有状态机，任务跑一半挂掉无从恢复。

高德的解法是把"一人公司（OPC）"和"Harness 工程"两套思想搬进 AI 开发体系：用 workflow 编排流程，用状态机管理 agent 生命周期，用文件系统当持久 memory，用独立 Evaluator 做评审。

## 架构关键点

### 1. workflow + state machine

每个 agent 不是函数调用，是有生命周期的实体：

```text
DISPATCHED → ACKED → RUNNING → SUCCEEDED / FAILED
```

任意阶段挂掉都能 resume，状态变更落盘，全链路可观测。

### 2. agent 强制拆分

不允许"一个 Agent 干完所有事"：

- Planner 拆成 `product_agent` + `design_agent` + `arch_agent`
- Builder 拆成 `testcase_agent` + `builder_agent`
- 每个任务强制 fork 新 SubAgent，绝不在已有上下文上继续

目的：阻断上下文污染，让每个 SubAgent 在干净 context 中聚焦单一职责。

### 3. 三条设计原则

| 原则               | 含义                                                  |
| ------------------ | ----------------------------------------------------- |
| 评审与生成彻底分离 | Evaluator 和 Builder 必须是不同 agent，不同 context   |
| 零信任             | Evaluator 不读 Builder 的"我做完了"声明，独立验证产物 |
| 零 Broken Feature  | 任何 feature 没通过完整流水线，不算交付               |

### 4. Evaluator 元评估（核心创新）

谁来保证 Evaluator 本身靠谱？用 Benchmark 反向打分 Evaluator：

- 代码片段层：好例子 / 坏例子 / Golden Answer
- 全项目层：todo → blog → ecommerce 难度梯度，注入 OWASP Top 10 / CWE 漏洞

3 轮迭代结果：

- Evaluator 综合评分：64.5 → 67.5 → 83.4
- 漏洞精确匹配率：25% → 42% → 78%

启示：评审系统也要被评审，不能假设它天然正确。

### 5. 快速失败流水线

评估按耗时升序串联，任意一步失败立即退回：

```text
env check (<1s) → deps (5-10s) → tsc (10-30s) → dev server (15-30s) → ESLint (30-60s) → Playwright E2E (2-5min)
```

核心信念：**宁可让 Evaluator 花 10 次 1 秒钟快速退回，也不允许 1 次 4 分钟的无效评审**。

## 公开承认的踩坑

- 上下文污染是 #1 杀手，所有"为了省 token 复用 Agent"的优化最后都得回退。
- Evaluator 自评不可信，必须有独立 Benchmark 持续校准。
- 长任务没有状态机，必然在某个中间步骤失控且无法 resume。
- 不写文件只靠对话 context 当 memory，跨 session 全丢。

## 对我自己工作流的 5 条借鉴

按 ROI 排序，从最该立刻做的开始：

### ① 给 `note` skill 加自检（5 分钟，最高优先级）

`note` 是知识库写入流水线的最后一道闸。它声明"已写入"但实际没写入，是最致命的回归。

改动：写入后 `ls -la` / `stat` 验证文件存在且大小 > 0，失败时回报"声明失败"而不是"成功"。

对应原文思想：零信任 — Builder 的"我做完了"不能算数，必须有独立验证。

### ② 经期 App 的 preflight 流水线

当前是手动跑 build / lint / 预览。可以套用"快速失败流水线"思想：

```text
tsc --noEmit (秒级) → eslint (秒级) → wxml-loader 编译检查 → 微信开发者工具真机预览
```

按耗时排序，前面失败不进下一步。对应原文：用最便宜的检查先拦截最多的错误。

### ③ memory 文件化（已部分落地）

当前 `docs/HANDOFF.md` / `docs/memory/YYYY-MM-DD.md` 已经在做。可以扩展：

- 重要 decision 单独落盘到 `docs/decisions/`（不只靠 observations 检索）
- 任何"我后面会用到"的中间产物（design 草稿、技术选型对比）落盘，而非塞进 context

对应原文：prds/ designs/ architectures/ evaluations/ runs/ decisions/ 全文件化。

### ④ workflow-audit 引入 mini-benchmark

`workflow-audit` 现在的判断标准是经验性的（"重复 2 次以上"）。可以引入反向打分：

用历史已沉淀成功的 skill（如 `daily-recap`、`repo-research`）当 Golden Answer，让 `workflow-audit` 重新评估它们，看判断是否一致。不一致说明 audit 标准有偏差。

对应原文：Evaluator 元评估 — 评审系统也要被评审。

### ⑤ 一人监护多任务的心态

把自己定位成 Evaluator，不是 Builder。Claude 是 Builder，我只做：

- 任务派发（workflow 编排）
- 验收（不读它的"完成"声明，独立 verify）
- 决策（架构方向、归档与否）

对应原文 OPC（一人公司）思想：一个人靠 harness 同时监护多个 agent，关键不是手快，是验收纪律。

## 不要硬抄的部分

- **状态机 + workflow 编排器**：高德这套是企业级投入（几个工程师月），个人工作流别上来就建。先用 `TaskCreate` / `docs/HANDOFF.md` 这种最小形态。
- **Benchmark 自动化**：建 Golden Answer 集 + 自动跑分流水线对个人来说成本太高，先做一次性手工评估即可。
- **多 Agent 强制 fork**：Claude Code 已经有 SubAgent 机制，按需用，别为了"分离"硬拆。

保留思想，不抄结构。

## 一句话总结

> AI 写代码长跑要可控，靠的不是更强模型，是 workflow + 状态机 + 独立 Evaluator + 文件化 memory + 快速失败流水线这五件套。个人用最小形态，企业用完整体系。
