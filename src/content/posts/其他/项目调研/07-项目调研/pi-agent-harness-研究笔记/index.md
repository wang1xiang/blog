---
title: "pi-agent-harness-研究笔记"
published: 2026-05-20
description: "Pi 是一个「自扩展编程代理平台」（self-extensible coding agent），以 monorepo 形式组织，定位与 Claude Code 直接对标。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# Pi Agent Harness 研究笔记

> 仓库：https://github.com/earendil-works/pi
> 时间：2026-05-20
> 标签：#ai-agent #cli-tool #monorepo #coding-agent

---

## 项目概览

**Pi** 是一个「自扩展编程代理平台」（self-extensible coding agent），以 monorepo 形式组织，定位与 Claude Code 直接对标。

| 指标     | 数据                       |
| -------- | -------------------------- |
| Stars    | 51.8k                      |
| Forks    | 6.2k                       |
| 协议     | MIT                        |
| 技术栈   | TypeScript 96.2%           |
| 最新版本 | v0.75.3（2026-05-18）      |
| 文档站   | https://pi.dev/docs/latest |

---

## 核心架构（4 个包）

```
packages/
├── pi-ai              # 统一多提供商 LLM API（OpenAI, Anthropic, Google...）
├── pi-agent-core      # Agent 运行时：工具调用 + 状态管理
├── pi-coding-agent    # 交互式编程代理 CLI（对标 Claude Code）
└── pi-tui             # 终端差分渲染 TUI 库
```

另有一个独立仓库 `earendil-works/pi-chat` 处理 Slack 集成。

**关键设计**：`pi-ai` 提供统一 LLM 接口层，不绑定单一提供商——这与 Claude Code 只调 Anthropic API 不同。

---

## AGENTS.md —— 给 AI 的「行为宪章」

Pi 的 `AGENTS.md` 是一份给 AI Agent 看的开发指南，规则极其严格：

### 沟通风格

- 回答必须简短、直接
- 技术散文，友善但直接
- **禁止 emoji**（代码、commit、issue、review 中均不可出现）

### 代码规范

- 改代码前必须读完完整文件，不能只看片段
- 禁止 `any` 类型（除非不可避免）
- **禁止内联导入（inline imports）**，只能顶层静态导入
- TypeScript 只能用 Node 可直接 strip 的语法（不用 parameter properties、enum、namespace）
- 单行工具函数不要抽离
- 删除功能前必须确认
- 键盘快捷键必须通过默认绑定映射配置，不能写死
- 生成的模型文件禁止手改

### Git 安全规则（针对并行 Agent）

- **禁止 `git add -A` 或 `git add .`**
- 只能提交当前 session 自己改的文件
- 禁止：hard reset、checkout .、clean -f、stash all、跳过 hooks
- 如果用户指令与这些规则冲突，必须先确认

### 测试与提交

- 改完代码必须跑 `npm run check`（格式+类型检查）
- **禁止跑 build/test suite 脚本**（太重）
- 跑测试只能用包根目录作为 working directory
- coding-agent 测试必须用提供的 harness + faux provider，不能用真实 API
- **禁止未经用户同意就创建 commit**

### 发布流程

- 每个包独立 changelog，遵循标准格式（Added/Changed/Fixed/Removed/Breaking）
- 采用 **Lockstep versioning**（所有包共用一个版本号）
- 加新 LLM provider 需要：更新类型联合、实现流式函数、注册懒加载、检测凭证、生成模型列表、加跨 provider 测试

---

## 社区治理特点

1. **防御性贡献管理**：新贡献者的 issue/PR 会被自动关闭，维护者每日手动审查
2. **鼓励透明**：鼓励用户公开开源编码代理的会话数据，提供工具向 Hugging Face 发布会话记录
3. **贡献者白名单**：特定批准短语可授予未来创建 issue/PR 的权限

---

## 与 Claude Code 的对比

| 维度       | Pi                                     | Claude Code                |
| ---------- | -------------------------------------- | -------------------------- |
| 开源       | ✅ MIT                                 | ❌ 闭源                    |
| 多模型支持 | ✅ 统一接口（OpenAI/Anthropic/Google） | ❌ 仅 Anthropic            |
| 自托管     | ✅                                     | ❌                         |
| TUI 库     | ✅ 自研差分渲染                        | ✅                         |
| Skill 系统 | 未知                                   | ✅ Superpowers             |
| 社区规模   | 51.8k Stars                            | 更大（内置在 Claude 生态） |
| 插件生态   | 未知                                   | 36+ 官方插件               |

---

## 可借鉴之处

### 1. AGENTS.md 的严格性

Pi 的 `AGENTS.md` 是我见过最严格的 Agent 行为约束文档，尤其是：

- Git 安全规则（禁止 `git add -A`）
- 测试纪律（只跑 check，不跑全量 test）
- 沟通规范（禁止 emoji、强制简短）

### 2. 统一 LLM API 层

`pi-ai` 的设计思路值得参考——如果你未来需要切换模型或在多个 LLM 间做 fallback，这种抽象层很有价值。

### 3. Lockstep Versioning

Monorepo 下所有包共用一个版本号，减少版本混乱。

### 4. 并行 Agent 的 Git 安全

明确禁止破坏性操作，这是多 Agent 协作的基础。

---

## 待深入

- [ ] 实际安装体验 `npm install + npm run build`
- [ ] `pi-coding-agent` 的交互体验与 Claude Code 对比
- [ ] Skill/插件扩展机制（如果有的话）
- [ ] `pi-tui` 的差分渲染实现原理
