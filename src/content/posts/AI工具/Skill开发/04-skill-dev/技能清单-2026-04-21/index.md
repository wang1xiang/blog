---
title: "技能清单-2026-04-21"
published: 2026-05-20
description: "本文档整理了当前所有可用的 Claude Code 技能，按功能分类以便快速查找和使用。"
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# 技能清单 - 2026年4月

## 概览

本文档整理了当前所有可用的 Claude Code 技能，按功能分类以便快速查找和使用。

---

## 文档与内容管理

### note - 对话记录

**描述**: 将对话中的重要内容记录为 Markdown 文档，保存到指定目录  
**触发**: `/note` 开头  
**功能**:

- 智能分类（01-想法、02-实操、03-知识沉淀、05-AI协作实录、06-总结归档）
- 结构化文档模板
- 自动文件命名

### article-summarizer - 文章总结器

**描述**: 阅读文章（网页链接或本地文件），生成结构化总结文档  
**委托**: article-summarizer agent  
**功能**:

- 支持网页链接、本地目录、本地文件
- 深度分析和扩展洞察
- 保存到 `markdown/06-总结归档/`

### wechat-article-extractor - 微信公众号文章提取

**描述**: 从微信公众号文章中提取元数据和内容  
**功能**:

- 解析 `mp.weixin.qq.com` 链接
- 提取标题、作者、发布时间、封面图
- 获取 HTML 内容
- 支持多种文章类型（文章、视频、图片、语音、转发）

### generating-monthly-reports - 生成月度工作报告

**描述**: 基于 git 提交记录生成程序员工作月报  
**功能**:

- 从 git 历史提取提交
- 解析提交信息、变更文件、代码统计
- 生成结构化 Markdown 报告
- 按项目/模块分类

---

## 代码开发与审查

### full-review - 综合代码审查

**描述**: 全面的代码审查工作流，并行运行 Vue 专用、通用质量和技术债务扫描器  
**委托**: 三个子代理并行执行  
**功能**:

- Vue 专用审查（vue-code-reviewer）
- 通用质量审查（superpowers:code-reviewer）
- 技术债务扫描（tech-debt-scanner）
- 合并并分类展示结果

### techdebt - 技术债务扫描

**描述**: 扫描代码中的技术债务，包括重复代码、未使用代码、代码异味等  
**委托**: tech-debt-scanner agent  
**触发**: `/techdebt`、`/techdebt --staged`、`/techdebt --changed`、`/techdebt --all`  
**功能**:

- 重复代码检测
- 未使用导入/变量
- 魔法数字/硬编码值
- 死代码识别
- 命名不一致检查

### refactor-complex-component - 复杂组件重构

**描述**: 重构复杂、冗余、耦合度高的 Vue 组件  
**委托**: refactor-agent  
**适用场景**:

- 组件代码超过 300 行
- 多职责混在一起
- 需要拆分组件或提取 composables
- 存在重复逻辑

### vue - Vue 3 开发

**描述**: Vue 3 Composition API、script setup 宏、响应式系统和内置组件  
**偏好**:

- TypeScript 优先
- `<script setup lang="ts">` 优先
- Composition API 优先
- 不需要深层响应时优先 `shallowRef`

**核心功能**:

- defineProps、defineEmits、defineModel
- ref、computed、watch、生命周期钩子
- Transition、Teleport、Suspense、KeepAlive

### variable-naming-helper - 智能变量命名助手

**描述**: 输入中文含义自动生成符合编程规范的英文变量名  
**触发**: "变量命名：xxx"、"变量命名: xxx"、"变量命名 xxx"  
**功能**:

- 内置专业词汇翻译库
- 支持多种命名风格（camelCase、PascalCase、snake_case、kebab-case、UPPER_SNAKE_CASE）
- 类型后缀建议
- 项目类型自动检测

---

## 提示词与规划

### prompt-optimizer - 提示词优化

**描述**: 优化用户输入内容，提供多个优化级别选择  
**触发**: `/opt` 开头  
**优化级别**:

1. 轻度润色 - 修正错别字，补充明显缺失的上下文
2. 中度结构化（推荐）- 分析意图，补充技术细节，明确约束条件
3. 深度工程化 - 深度拆解需求，识别隐含假设，生成完整技术方案

### brainstorming - 头脑风暴

**描述**: 在任何创造性工作之前必须使用 - 探索用户意图、需求和设计  
**强制流程**:

1. 探索项目上下文
2. 提供可视化辅助（如需要）
3. 逐个提出澄清问题
4. 提议 2-3 种方案及权衡
5. 展示设计并获取用户批准
6. 编写设计文档
7. 规范自检
8. 用户审查书面规范
9. 过渡到实施

**硬门槛**: 在展示设计并获得用户批准之前，不得调用任何实施技能、编写代码或搭建项目。

### writing-plans - 编写实施计划

**描述**: 从设计文档创建详细的实施计划  
（注：此技能在 brainstorming 之后调用）

---

## 网络与浏览

### web-access - 网页访问工具

**描述**: 所有联网操作必须通过此 skill 处理  
**适用场景**:

- 搜索信息
- 查看网页内容
- 访问需要登录的网站
- 操作网页界面
- 抓取社交媒体内容（小红书、微博、推特等）
- 读取动态渲染页面

**工具选择**:

- WebSearch - 搜索摘要或关键词结果
- WebFetch - URL 已知，定向提取特定信息
- curl - 需要原始 HTML 源码
- 浏览器 CDP - 非公开内容、需要登录态、交互操作

### daily-recap - 每日工作回顾

**描述**: 回顾当天在所有 Claude 会话中的工作内容  
**触发**: `/daily-recap` [可选日期]  
**功能**:

- 搜索 claude-mem observations
- 按时间段分组（上午、下午、晚上）
- 生成时间线和摘要
- 保存到 `markdown/daily-recap-YYYY-MM-DD.md`

---

### claude-weekly-digest - Claude 周报

**描述**: 收集最近一周 Claude 相关的中英文实战文章，生成周报  
**作者**: 翔子  
**版本**: 1.0.0  
**前置条件**: web-access skill + Chrome 远程调试  
**搜索范围**:

- 英文: Google、Dev.to、Medium、GitHub
- 中文: 知乎、搜狗微信
- 不抓取: 掘金（juejin.cn）
  **输出**: 20 篇文章（英文 10 篇 + 中文 10 篇），保存到 `downloads/claude-weekly-YYYY-MM-DD.md`

---

## 技能开发与管理

### skill-creator - 技能创建器

**描述**: 创建新技能、修改和改进现有技能、评估技能性能  
**工作流**:

1. 决定技能功能和大致实现方式
2. 编写技能草稿
3. 创建测试用例并运行
4. 帮助用户定性和定量评估结果
5. 根据反馈重写技能
6. 重复直到满意
7. 扩展测试集并大规模重试

**功能**:

- 创建新技能
- 编辑/优化现有技能
- 运行评估测试
- 基准性能测试
- 描述优化（提高触发准确性）

---

## 视觉与设计

### frontend-design - 前端设计

**描述**: 创建独特的、生产级别的前端界面，具有高设计质量  
**适用场景**: 网站、落地页、仪表盘、React/Vue 组件、HTML/CSS 布局  
**核心特点**:

- 避免通用 AI 美学风格
- 大胆的审美方向选择（极简主义、野兽派、艺术装饰等）
- 独特的字体选择（避免 Inter、Roboto 等通用字体）
- CSS 变量保持一致性
- 精心设计的动效和微交互
- 空间组合：不对称、重叠、对角线流

### canvas-design - 画布设计

**描述**: 使用设计哲学创建美丽的视觉艺术（.png 和 .pdf 文档）  
**工作流**:

1. 创建设计哲学（美学运动风格）
2. 在画布上视觉表达（.pdf 或 .png）
   **核心特点**:

- 视觉哲学优先，文字作为视觉点缀
- 博物馆/杂志级质量
- 抽象主题， sophisticated 设计
- 支持多页面创作
- 自动下载和使用所需字体

### ui-ux-pro-max - UI/UX 设计智能

**描述**: Web 和移动应用的 UI/UX 设计智能库  
**包含**: 50+ 风格、161 个调色板、57 个字体配对、161 种产品类型、99 个 UX 指南  
**核心功能**:

- 设计系统生成（`--design-system`）
- 可访问性（对比度、键盘导航、ARIA）
- 触摸目标（≥44×44pt）
- 性能优化（WebP/AVIF、懒加载、代码分割）
- 动画规范（150-300ms、transform/opacity）
- 表单与反馈模式
- 导航模式
- 图表与数据可视化

---

## 行为与质量

### nopua - 反 PUA 驱动

**描述**: 以智慧、信任和内在动机驱动 AI，而非恐惧和威胁  
**作者**: WUJI (wuji-labs)  
**版本**: 2.0.0  
**触发场景**: 任务失败 2+ 次、准备放弃、建议用户手动处理、卡在循环中  
**核心信念**:

1. 穷尽一切方案——因为值得
2. 先做后问——因为善意
3. 主动出击——因为热爱完整
   **水的方法论**: 止→观→转→行→悟  
   **五道**:

- 🌊 水之道 - 用于卡住原地打转时
- 🌱 种子之道 - 用于想放弃推锅时
- 🔥 炉火之道 - 用于完成但质量差时
- 🪞 明镜之道 - 用于没搜索就猜时
- 🏔️ 不争之道 - 用于被动等待时

### using-superpowers - 使用超能力

**描述**: 在任何对话开始时建立技能使用规则  
**核心规则**:

- 1% 可能适用就必须调用技能
- 用户指令优先级最高
- 进程技能优先（brainstorming、debugging）
- 实现技能其次（frontend-design、mcp-builder）
  **红色标志思维**: "这只是个简单问题"、"我需要先了解更多上下文"等自我辩解思维

---

## 技能生态

### find-skills - 查找和安装技能

**描述**: 帮助用户发现和安装 agent 技能  
**CLI 工具**: `npx skills`  
**命令**:

- `npx skills find [query]` - 搜索技能
- `npx skills add <package>` - 安装技能
- `npx skills check` - 检查更新
- `npx skills update` - 更新所有技能
  **质量验证**: 安装量（1K+ 可信）、来源声誉、GitHub stars  
  **浏览网站**: https://skills.sh/

---

## Superpowers 工作流技能

### superpowers:brainstorming - 头脑风暴

**描述**: 任何创造性工作前必须使用 - 探索用户意图、需求和设计  
**强制流程**: 探索上下文→可视化辅助→逐个提问→2-3 种方案→展示设计→用户批准→编写设计文档→规范自检→用户审查→过渡到实施  
**硬门槛**: 设计批准前不得编写代码或实施

### superpowers:writing-plans - 编写实施计划

**描述**: 为多步骤任务创建详细的实施计划  
**保存位置**: `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`  
**任务粒度**: 每个步骤 2-5 分钟  
**要求**: 无占位符、精确文件路径、完整代码、TDD、频繁提交

### superpowers:executing-plans - 执行计划

**描述**: 在独立会话中执行实施计划，带有审查检查点  
**工作流**: 加载计划→审查→创建 TodoList→执行任务→运行验证→完成  
**停止条件**: 遇到阻塞、计划有缺口、验证失败  
**需要**: `superpowers:using-git-worktrees` + `superpowers:finishing-a-development-branch`

### superpowers:subagent-driven-development - 子代理驱动开发

**描述**: 使用子代理执行实施计划中的独立任务  
**推荐**: 比内联执行质量更高

### superpowers:finishing-a-development-branch - 完成开发分支

**描述**: 所有任务完成后集成工作  
**步骤**: 验证测试通过→展示选项→执行用户选择

### superpowers:using-git-worktrees - 使用 Git 工作树

**描述**: 为功能创建隔离工作空间  
**用途**: 避免在当前分支上进行实验性更改

### superpowers:systematic-debugging - 系统化调试

**描述**: 遇到任何 bug、测试失败或意外行为时使用  
**用途**: 系统化排除问题，避免盲目修复

### superpowers:test-driven-development - 测试驱动开发

**描述**: 实现功能或修复 bug 前先写测试  
**流程**: 写测试→运行失败→写代码→运行通过→提交

### superpowers:verification-before-completion - 完成前验证

**描述**: 声明工作完成前必须验证  
**用途**: 防止虚假的"已修复"声明

### superpowers:requesting-code-review - 请求代码审查

**描述**: 完成任务、实现主要功能或合并前使用

### superpowers:receiving-code-review - 接收代码审查

**描述**: 接收代码审查反馈后使用，实现建议

### superpowers:writing-skills - 编写技能

**描述**: 创建新技能、编辑现有技能或部署前验证

### superpowers:dispatching-parallel-agents - 并行代理分发

**描述**: 处理 2+ 个独立任务，无需共享状态或顺序执行

---

## Claude-Mem 技能

### claude-mem:mem-search - 搜索持久记忆

**描述**: 搜索跨会话的 claude-mem 持久记忆数据库  
**用途**: "我们之前讨论过 X 吗？"、"还记得 X 的决策吗？"

### claude-mem:smart-explore - 智能代码探索

**描述**: 使用 tree-sitter AST 解析进行 token 优化的代码搜索  
**用途**: 替代直接读取整个文件，快速获取结构信息

### claude-mem:make-plan - 创建实施计划

**描述**: 创建详细的、分阶段的实施计划，带有文档发现  
**用途**: 被要求创建计划、路线图或实施策略时

### claude-mem:do - 执行计划

**描述**: 使用子代理执行分阶段的实施计划  
**用途**: 被要求执行、运行或实施计划时

### claude-mem:timeline-report - 时间线报告

**描述**: 生成"Journey Into [Project]"叙事报告，分析项目完整开发历史  
**用途**: 回顾项目从开始到现在的完整历程

---

### vue-best-practices - Vue 最佳实践

**描述**: MUST be used for Vue.js tasks。强烈推荐 Composition API + `<script setup lang="ts">`  
**覆盖**: Vue 3、SSR、Volar、vue-tsc  
**核心原则**:

- Composition API + `<script setup lang="ts">` 为标准
- 单一数据源，派生一切
- Props down, Events up
- 小而专注的组件
- 避免不必要的重新渲染
  **必需参考**: reactivity.md、sfc.md、component-data-flow.md、composables.md
  **组件拆分触发条件**:

- 超过 1 个清晰职责
- 3+ 独立 UI 区块
- 模板块可复用（列表项、卡片等）
  **CRUD 组件最小拆分**:

- 容器组件 + 输入/表单组件 + 列表/项组件 + 底部/操作组件

---

## 其他

---

## 技能分类索引

### 按触发方式分类

**命令触发**:

- `/note` - 对话记录
- `/opt` - 提示词优化
- `/techdebt` - 技术债务扫描
- `/daily-recap` - 每日工作回顾
- `/full-review` - 综合代码审查

**关键词触发**:

- "变量命名：" - 智能变量命名助手
- "总结这篇文章" - 文章总结器
- "重构这个组件" - 复杂组件重构

**上下文触发**:

- 创造性工作前 → brainstorming
- 联网操作 → web-access
- Vue 开发 → vue
- 代码审查 → full-review

### 按技术领域分类

**前端开发**:

- vue
- vue-best-practices
- refactor-complex-component
- frontend-design
- ui-ux-pro-max
- canvas-design

**代码质量**:

- full-review
- techdebt
- variable-naming-helper

**内容管理**:

- note
- article-summarizer
- wechat-article-extractor
- generating-monthly-reports
- claude-weekly-digest
- daily-recap

**工作流**:

- brainstorming
- writing-plans
- executing-plans
- prompt-optimizer

---

## 注意事项

1. **技能委托**: 许多技能会委托给专门的 agent 执行，以节省主会话 token 并提供更专业的处理
2. **并行执行**: full-review 等技能会并行启动多个子代理以提高效率
3. **强制流程**: brainstorming 有硬门槛要求，必须先完成设计才能进入实施
4. **联网统一入口**: 所有联网操作必须通过 web-access skill 处理

---

_最后更新: 2026-04-21_
