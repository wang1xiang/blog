---
title: "understand-anything插件使用指南"
published: 2026-05-20
description: "接手陌生代码库时，传统方式是逐文件阅读、手动梳理架构，效率低且容易遗漏。Understand-Anything 通过多 Agent 协作将代码库转化为交互式知识图谱，实现\"分析—可视化—问答\"全流程闭环。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: true
---
# Understand-Anything 插件使用指南

## 背景

接手陌生代码库时，传统方式是逐文件阅读、手动梳理架构，效率低且容易遗漏。Understand-Anything 通过多 Agent 协作将代码库转化为交互式知识图谱，实现"分析—可视化—问答"全流程闭环。

## 工具概况

- **项目地址**: https://github.com/Lum1104/Understand-Anything
- **Stars**: 13.3k
- **语言**: TypeScript
- **协议**: MIT
- **发布**: 2026-03-15
- **兼容平台**: Claude Code、Cursor、VS Code + Copilot、Codex、Gemini CLI、OpenCode、OpenClaw、Antigravity、Pi Agent

## 安装方式

```bash
# Plugin 安装（推荐，包含 Agents + Hooks + Skills）
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything
/reload-plugins
```

## 核心架构：6 Agent 协作流水线

| Agent                     | 职责                                                    |
| ------------------------- | ------------------------------------------------------- |
| **Project Scanner**       | 扫描项目文件，检测语言和框架                            |
| **File Analyzer**         | 提取函数、类、导入关系，生成图谱节点和边（支持 3 并发） |
| **Architecture Analyzer** | 识别架构层级（API、服务、数据、UI、系统工具）           |
| **Tour Builder**          | 生成引导式学习路径                                      |
| **Graph Reviewer**        | 验证图谱完整性和引用准确性                              |
| **Domain Analyzer**       | 提取业务领域和核心流程                                  |

## 8 个 Skills 命令

| 命令                         | 功能                         | Token 消耗   |
| ---------------------------- | ---------------------------- | ------------ |
| `/understand`                | 全量分析代码库，生成知识图谱 | 高（一次性） |
| `/understand-dashboard`      | 打开交互式可视化看板         | 低           |
| `/understand-chat <问题>`    | 基于图谱自然语言问答         | 低           |
| `/understand-explain <文件>` | 解释指定文件逻辑             | 低           |
| `/understand-diff`           | 增量分析变更文件，更新图谱   | 低           |
| `/understand-domain`         | 业务领域分析                 | 中           |
| `/understand-knowledge`      | Wiki 知识库分析              | 中           |
| `/understand-onboard`        | 新人入职导览路径             | 中           |

## 接手陌生项目工作流

```
/understand          → 全量分析，建立底图
/understand-dashboard → 可视化看板，5 分钟建立全局认知
/understand-onboard  → 自动生成学习路径
/understand-chat     → 按需问答深挖细节
/understand-diff     → 日常增量更新图谱
```

### 第一步：全量分析

```bash
cd /path/to/project
/understand
```

生成 `.understand-anything/knowledge-graph.json`

### 第二步：可视化全局

```bash
/understand-dashboard
```

浏览器打开交互式看板，支持平移、缩放、搜索、按架构层级筛选、点击节点看摘要、双击看源码

### 第三步：新人导览

```bash
/understand-onboard
```

### 第四步：按需深挖

```bash
/understand-domain                           # 业务领域
/understand-explain src/auth/login.ts        # 解释文件
/understand-chat 认证流程是怎么走的？          # 问答
```

### 后续：增量维护

```bash
/understand-diff    # 只分析变更文件
```

## 技术实现

- **可视化**: React 19 + React Flow + Dagre
- **图谱存储**: JSON 文件，可提交到 Git 团队共享
- **分析引擎**: Tree-sitter AST 解析 + LLM 语义分析
- **支持语言**: TypeScript、JavaScript、Python、Go、Java、Rust、C++、C# 等 20+ 语言
- **框架识别**: Next.js、React、Django、FastAPI、Express、Gin、Rails 等

## Token 消耗评估

- **全量分析**（`/understand`）: 一次性高消耗，大型项目数万到数十万 Token
- **增量更新**（`/understand-diff`）: 只分析变更文件，很低
- **问答/解释**: 基于图谱检索，比直接读代码省
- **整体策略**: 一次性投入换长期节省，后续边际成本低

## 优缺点

### 优点

- 语义解析深，能挖掘业务逻辑和隐式关系
- 可视化交互好，全局与细节兼顾
- 多角色适配（初级开发/项目经理/高级用户）
- 图谱提交 Git 团队共享
- 支持 9 大平台

### 缺点

- 全量分析 Token 消耗高
- 超大图谱（>10MB）浏览器可能卡顿
- 首次使用建议小项目试水

## 踩坑/注意

1. **安装方式**: 必须用 Plugin 安装，软链只注册 Skills 不注册 Agents 和 Hooks
2. **大项目策略**: 先用小项目试水，熟悉后再用于大型项目
3. **图谱管理**: 超大图谱用 git-lfs 跟踪
4. **数据安全**: 注意知识图谱的共享范围，避免敏感信息泄露
5. **增量优先**: 日常开发用 `/understand-diff`，不要反复全量跑

## 总结

Understand-Anything 是目前最强的代码库理解工具，核心价值在于将"盲读代码"转变为"图谱导航"。一次性全量分析的 Token 投入，换来后续所有问题的低成本精准回答。接手陌生项目时，按 `understand → dashboard → onboard → chat → diff` 的流程使用即可。
