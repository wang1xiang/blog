---
title: "放弃Vibe Coding：我用Superpowers+gstack沉淀出一套大幅减少返工的skill组合工作流（附案例）"
published: 2026-05-20
description: "原创 是Aren吖 *2026年3月28日 20:27*"
tags: ["AI工作流", "03-ai-workflow"]
category: "AI工具"
image: api
draft: false
---
原创 是Aren吖 *2026年3月28日 20:27*

很多人用 AI 写代码还停留在 Vibe Coding 的阶段：有个想法，让 AI 写代码，跑通了就继续，跑不通就改，改不好就重写。

这种方式在个人项目、探索阶段还能应付。但一旦进入正式产品，问题就暴露出来了：需求模糊、架构混乱、代码质量不稳定。今天改好的 bug 明天又出现，同一个功能改了 N 个版本，AI 自己跟自己打架。

问题的根源不是 AI 不够聪明，而是整个开发过程缺乏规范。Vibe Coding 本质上是「跟着感觉走」，而正式产品需要的是「工程化」。

解决这个问题的思路叫做 **规范驱动开发** （Spec-Driven Development，简称 SDD）。核心理念是：以规格说明作为「单一真相源」，在编写代码前先构建结构化的规格，把传统软件工程的严谨性融入 AI 编程。

我用了一套 Skill 组合来实践这套方法论，从需求验证、方案设计、架构评审、到分阶段开发，每一步都有对应的 Skill 来把关。整个过程中最大的感受是： **返工大幅减少，质量可控，效率提升明显。**

## 我是怎么组织这套工作流的

整体流程分三个阶段：规划阶段、开发阶段、发布阶段。

**规划阶段** 用的是 gstack 里的 Skill：

1. **office-hours** ：验证需求真实性。它会用 YC 的六步框架逼你想清楚——你解决的问题是不是真的存在？你的方案是不是真的有价值？
2. **plan-ceo-review** ：战略评审。从市场规模、竞争壁垒、商业模式角度挑战你的方案。
3. **plan-eng-review** ：架构评审。审视数据流、性能瓶颈、测试覆盖。
4. **plan-design-review** ：设计评审。从视觉层级、信息架构、交互状态等七个维度评分。
	![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/gicwqF173AkMINtDKdibAx7SOQQRvAwFXUxRlPiaQxPHX5Mm7iafvOI0Q4e366ChYlF8A49ThSs685cbRc6lcAN18llRvd33154cDnvArUZ7NG4/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

**开发阶段** 用的是 superpowers 里的 Skill：

1. **brainstorming** ：结构化对话，把模糊想法转化为清晰设计方案。
2. **write-a-prd** ：产出结构化的 PRD 文档。
3. **writing-plans** ：把大任务拆成 2-5 分钟的 bite-sized 小任务。
4. **subagent-driven-development** ：每个任务用独立的 subagent 执行，两阶段评审。
<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

**发布阶段** 回到 gstack：

1. **review** ：代码评审，找生产环境才会暴露的 bug。
2. **qa** ：用真实浏览器测试，找到 bug 后自动修复并提交。
3. **ship** ：同步主分支、运行测试、推送代码、创建 PR。
	<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

每一步的文档我都沉淀到一个文件夹里。这样做的好处是：后面的 AI 不需要从头理解项目，直接读文档就知道要做什么。

这也是规范驱动开发的核心——把所有决策、规范、最佳实践都沉淀成文档，防止记忆压缩导致混乱。

---

## gstack + superpowers：两套 Skill 组合

上面列的这些 Skill，分别来自两套工具：gstack 和 superpowers。

**gstack** 我在上一篇文章 [试了一下这个skill确实很好用](https://mp.weixin.qq.com/s?__biz=MzkzNTk3NTYyNA==&mid=2247484314&idx=1&sn=8f4c9d1727e95381e5cacc9bc9666dec&scene=21#wechat_redirect) 中也推荐过，里面一共有 28 个 Skill， 用下来感觉最有价值的是 office-hours 和三套评审——它们逼着你在动手写代码之前先把事情想清楚。

Garry Tan 自己说用这套工具 60 天写了 60 万行代码，我觉得这个数据的重点不是"写了多少行"，而是"返工了多少次"。

如果需求模糊、架构混乱，写再多代码也是白搭。GitHub 地址：https://github.com/garrytan/gstack

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

**superpowers** 在github上已经有120k+star，它是一套行之有效的agentic skills框架和软件开发方法论。

subagent-driven-development的核心思路是把大任务拆成 2-5 分钟的小任务，每个任务用独立的 subagent 跑，强制 TDD(测试驱动开发）。这样做的好处是每个任务都是干净的，不会互相干扰，质量可控。GitHub 地址：https://github.com/obra/superpowers

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

**write-a-prd** 来自 mattpoclock/skills，不归在上面两套里，但我觉得它跟 brainstorming 配合得很好——一个帮你发散，一个帮你收敛。GitHub 地址：https://github.com/mattpocock/skills

我试过不少 Skill，最后沉淀下来的就是这套组合。不是它们功能最多，而是它们之间能形成闭环：gstack 在前面把关，superpowers 在后面执行，每一步都有文档沉淀，每一步都有质量评审。

---

## 我是如何实践这个流程的？

### 第一步：需求验证

我最开始的想法是「做一个涉及多智能体的 AI 产品」，需求很模糊，要做什么也不清楚。我直接把skill的调用流程告诉AI，让它按顺序调用。

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

调用 office-hours 后，AI 用 YC 的六步框架问我：

- ① 需求现实：你解决的问题是不是真的存在？有什么证据？
- ② 现状分析：现有方案是什么？它们为什么不够好？
- ③ 具体性：你能不能用一个具体的场景描述这个问题？
- ④ 最小切入点：你能做的最小有用产品是什么？
- ⑤ 观察：你有没有和潜在用户聊过？
- ⑥ 未来适配：如果这个方向成功了，下一步是什么？

一轮聊下来，我把方向定在了「Agent 竞技场」——一个让多个 AI Agent 进行博弈对战、观察策略演化的平台。

### 第二步：方案设计

方向确定后，我用 brainstorming 进行方案设计。AI 不是直接给方案，而是逐步提问：

- 「你希望 Agent 支持哪些博弈场景？囚徒困境？猎鹿博弈？还是自定义博弈？」
- 「用户是被动观察还是可以干预 Agent 的策略？」
- 「策略演化需要可视化呈现吗？用什么形式？」

讨论下来，方案基本确定：支持经典博弈场景（囚徒困境、猎鹿博弈等），用户可以创建自定义博弈规则，Agent 自主博弈并展示策略演化过程，提供回放和分析功能。

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### 第三步：PRD 撰写

方案确定后，用 write-a-prd 产出 PRD 文档。它会追问每个设计细节：

- 「用户创建自定义博弈时，收益矩阵如何输入？」
- 「Agent 的策略选择算法是用什么？固定策略还是学习型策略？」
- 「回放功能需要支持哪些操作？快进、暂停、分步查看？」

最终产出的 PRD 包含：用户视角的问题描述、解决方案、用户故事列表、模块划分、接口设计、测试策略等。

### 第四步：评审

PRD 写完之后，进入评审环节。

**plan-ceo-review** 从战略角度挑战方案：

- 「博弈论教育市场有多大？这个产品是解决教学痛点还是技术自嗨？」
- 「和现有的 Gambit、Game Theory Explorer 相比，差异化在哪里？」
- 「商业模式是什么？」
	<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

plan-eng-review 从工程架构角度审视。它关注的是系统设计层面的问题，比如它会问：Agent 博弈引擎怎么设计、需要支持并行执行吗、策略演化数据怎么存储...这个 Skill 会评估依赖关系、数据流瓶颈、单点故障风险、安全边界，还会检查测试覆盖和性能问题。

plan-design-review 从产品设计角度评分。它用 0-10 分评估七个维度：信息架构是否清晰、交互状态是否完整、用户旅程的设计、AI slop 风险...

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

评审完成后，Agent就综合以上评审结果及沉淀文档更新了 PRD，补充了遗漏的边界情况和设计细节。

这是我一轮skill组合使用下来沉淀出的文档：

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### 第五步：分阶段开发

PRD 终稿确定后，进入开发阶段。

首先是 **writing-plans** ，它把整个项目拆分成几个 Phase，分别对标不同开发阶段。每个 Phase 又拆成十几个 bite-sized 任务，每个任务 2-5 分钟，包含：具体的文件路径、完整的代码示例、验收标准等等。

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

然后会自动加载 **subagent-driven-development** 这个skill。每个任务用一个独立的 subagent 执行，不共享 context，避免上下文污染。完成后进行两阶段评审：第一轮检查是否符合规格，第二轮检查代码质量。

整个过程中， **test-driven-development** 强制执行。每个任务开始前，先写测试。测试写完后才能写实现代码。这保证了代码质量，也减少了后期返工。

### 第六步：发布

开发完成后，用 gstack 的 **review** 进行代码评审，找出潜在的 bug。然后用 **qa** 用真实浏览器测试，发现问题后自动修复并提交。最后用 **ship** 完成发布：同步主分支、运行测试、推送代码、创建 PR。

## 核心价值

这套流程用下来，给我三个最直接的价值：

**一是返工大幅减少。** 需求验证阶段就把模糊的想法厘清了，评审阶段把架构和设计漏洞堵住了，开发阶段 TDD 强制保证质量。每一步都有把关，不会因为「偷懒」而跳过。

**二是效率提升明显。** 所有决策都在前面做好了，后面就是纯粹的执行。AI 可以并行执行多个任务，不需要等一个写完另一个才能开始。

**三是过程可复用。** 每个项目积累的文档、规范、最佳实践，都是下一个项目的资产。PRD 模板、架构模式、测试策略都可以复用。

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 写在最后

以前用 AI 写代码，很多时候是在「凭感觉」。需求模糊、设计随意、测试缺失，最后代码质量全看运气。

规范驱动开发（SDD）的核心，就是把这整套流程固化下来。先想清楚要做什么，再设计怎么做，然后拆成可执行的任务，最后才是写代码。每一步都有评审，每一步都有文档沉淀。

gstack 和 superpowers 这两个 Skill 集合，正好覆盖了 SDD 的完整链路。不是让 AI 随便写代码，而是按一套结构化的开发流程来。从「氛围编程」到「工程化开发」，这才是 AI Coding的正确打开方式。

—The End—

如果你看到这里， **或许这篇内容对你来说是有价值的。**  

点亮 **「赞」 和 「推荐」** ，让更多人也看到它❤️  
你的认可是我继续创作下去的动力~

**▍往期文章推荐**

- [为什么你的 Claude Code 总是跑偏？问题出在这两个机制上](https://mp.weixin.qq.com/s?__biz=MzkzNTk3NTYyNA==&mid=2247484287&idx=1&sn=8996847309f62ad0050d74678a8dfa23&scene=21#wechat_redirect)
- [Claude Code 为什么能同时干多件事？子代理与上下文压缩的底层逻辑](https://mp.weixin.qq.com/s?__biz=MzkzNTk3NTYyNA==&mid=2247484305&idx=1&sn=78388978d911467eda51c1dd0669fe75&scene=21#wechat_redirect)
- [聊聊最近很火的 Harness Engineering：结合 OpenClaw 和 OpenCode 的详细拆解](https://mp.weixin.qq.com/s?__biz=MzkzNTk3NTYyNA==&mid=2247484278&idx=1&sn=5e3ea21409e756846ee53c964307e751&scene=21#wechat_redirect)
- [让多个 Claude 并行工作：多智能体团队协作机制详解及启动方法](https://mp.weixin.qq.com/s?__biz=MzkzNTk3NTYyNA==&mid=2247484306&idx=1&sn=06969ca22660f16c863269365cfd23db&scene=21#wechat_redirect)
- [告别重复劳动：如何用Skill Creator把工作流变成可复用技能 （账号分析skill分享）](https://mp.weixin.qq.com/s?__biz=MzkzNTk3NTYyNA==&mid=2247484241&idx=1&sn=ca6ebf13981cefc0b5bb29b7d5b21254&scene=21#wechat_redirect)

**关于作者 · Aren**

06intj | 211计算机本科在读

AI实战 | 产品拆解 | 干货分享 | 效率提升

欢迎添加我的个人微信，一起交流学习👇

<!-- 图片 (原图已丢失) -->' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

作者提示: 个人观点，仅供参考

继续滑动看下一个

反时钟效率笔记

向上滑动看下一个

---

## AI 总结

# 放弃Vibe Coding：我用Superpowers+gstack沉淀出一套大幅减少返工的skill组合工作流

## 核心思想

Vibe Coding（跟着感觉走的AI编程）在正式产品中会暴露需求模糊、架构混乱、代码质量不稳定等问题。作者通过 **规范驱动开发（Spec-Driven Development, SDD）**，将 gstack 和 superpowers 两套 Skill 集合组合使用，从需求验证、方案设计、架构评审到分阶段开发，每一步都有文档沉淀和质量把关，从而 **大幅减少返工、提升效率、保证质量可控**。

---

## 我的理解

这篇文章的核心价值不在于推荐了哪些工具，而在于提出了一个 **从"氛围编程"到"工程化开发"的范式转变**。Vibe Coding 的问题本质上是 **决策前置不足**——在没想清楚做什么、怎么做、为什么做之前就开始写代码。SDD 的核心是用结构化的流程把决策提前，用文档沉淀把决策固化，用独立 subagent 把执行隔离。这其实是把传统软件工程的"先设计后编码"思想重新引入 AI 编程，但用 Skill 自动化了评审环节。

---

## 主要内容

### 一、Vibe Coding 的问题与 SDD 的解法

| Vibe Coding 的问题 | SDD 的解法 |
|---|---|
| 需求模糊 | 用 YC 六步框架验证需求真实性 |
| 架构混乱 | 三轮评审（战略/工程/设计） |
| 代码质量不稳定 | 强制 TDD，subagent 独立执行 |
| 反复返工 | 每一步有文档沉淀，后续 AI 直接读文档 |

### 二、三阶段工作流

**1. 规划阶段（gstack）**
- `office-hours`：用 YC 六步框架验证需求
- `plan-ceo-review`：战略评审（市场/竞争/商业模式）
- `plan-eng-review`：架构评审（数据流/性能/测试覆盖）
- `plan-design-review`：设计评审（7 个维度打分）

**2. 开发阶段（superpowers）**
- `brainstorming`：结构化对话，发散设计
- `write-a-prd`：产出结构化 PRD 文档
- `writing-plans`：拆成 2-5 分钟的小任务
- `subagent-driven-development`：独立 subagent 执行 + 两阶段评审

**3. 发布阶段（gstack）**
- `review`：代码评审，找生产 bug
- `qa`：真实浏览器测试 + 自动修复
- `ship`：同步/测试/推送/创建 PR

### 三、实践案例：Agent 竞技场

作者从一个模糊的想法（"做一个涉及多智能体的 AI 产品"）出发：
1. **需求验证** → 收敛到「Agent 竞技场」——多 AI Agent 博弈对战平台
2. **brainstorming** → 确定支持经典博弈场景 + 自定义规则 + 回放分析
3. **write-a-prd** → 产出完整的 PRD（用户故事/模块划分/接口设计/测试策略）
4. **三轮评审** → 补充遗漏的边界情况和设计细节
5. **分阶段开发** → 按 Phase 拆分，每个任务独立 subagent + TDD
6. **发布** → review → qa → ship

### 四、三个核心价值

1. **返工大幅减少**：需求验证 + 评审堵漏 + TDD 保证
2. **效率提升明显**：决策前置，AI 可并行执行
3. **过程可复用**：文档、规范、模板沉淀为资产

---

## 我的理解

这篇文章最被低估的一点是：**它揭示了 AI 编程的两个截然不同的阶段**。

- **探索阶段**（Vibe Coding 适用）：你不知道要什么，AI 也不知道。这时候"跟着感觉走"是对的，因为快速迭代比架构完美更重要。
- **产品阶段**（SDD 适用）：你知道要什么，需要高质量、可维护、可复用的代码。这时候需要流程。

很多人用 Vibe Coding 做产品之所以痛苦，是因为用错了工具。就像用 sketch 画建筑图纸——能画出来，但施工时一定会出问题。

另一个关键洞察是：**文档不是给人类看的，是给 AI 看的上下文**。在 AI 编程中，文档的作用是替代人类记忆中丢失的上下文。每次 Claude Code 启动新会话，它需要重新理解项目。如果所有决策都沉淀在文档里，AI 就不需要"猜"。

---

## 总结

作者通过 gstack + superpowers 的实践，证明了一个观点：**AI 编程不是让 AI 随便写代码，而是按一套结构化的开发流程来**。核心公式是：

> 需求验证 → 方案设计 → 三轮评审 → PRD → 任务拆分 → Subagent 执行 → 评审发布

每一步都有文档沉淀，每一步都有质量把关。

---

## 我的扩展总结

### SDD 对传统软件工程的映射

| 传统软件工程 | SDD 中的对应 |
|---|---|
| 需求调研 | office-hours（YC 六步框架） |
| 技术方案设计 | brainstorming + write-a-prd |
| 设计评审会 | plan-ceo-review / plan-eng-review / plan-design-review |
| 任务拆解 | writing-plans |
| 编码 | subagent-driven-development + TDD |
| 测试 | qa + test-driven-development |
| 代码审查 | review |
| CI/CD | ship |

这说明 AI 编程并没有发明新的方法论，而是 **把已经被验证过的软件工程最佳实践，用 Skill 自动化了**。

### SDD 的局限性与适用边界

1. **适合**：中型以上项目、需要多人协作、有质量要求的产品
2. **不太适合**：快速原型验证、个人玩具项目、一次性脚本
3. **过度工程风险**：对于一个 50 行代码的小工具，跑完这套流程可能比直接写代码花更多时间

### 关键洞察：文档 = AI 的长期记忆

Claude Code 的 context window 是有限的，每次新会话都会丢失之前的理解。SDD 通过文档沉淀解决了这个问题：

```
PRD + 架构文档 + 设计规范 + 测试策略 = AI 的"项目记忆库"
```

这比任何 memory 插件都有效，因为它是 **结构化的、经过评审的、针对当前项目的**。

### 对你当前项目的启发

你已经在用 superpowers 的 `writing-plans`、`brainstorming`、`executing-plans`，并且配置了有趣的 hooks（每日运势、夸夸报告、审计日志）。可以考虑：

1. **加 `write-a-prd`**：在写 plan 之前先产出 PRD，让 plan 有更清晰的输入
2. **加 gstack 的评审**：对于复杂功能，在 implementation 之前跑一轮 plan-eng-review
3. **文档沉淀目录**：在项目里建一个 `docs/specs/` 目录，每次评审结果都存进去

---

*本文档基于[微信公众号原文链接](https://mp.weixin.qq.com/s/Lxz87OZXpnlv5keNaH_1-Q)整理总结，并加入了扩展理解*
