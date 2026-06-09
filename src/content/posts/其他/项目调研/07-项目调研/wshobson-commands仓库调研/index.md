---
title: "wshobson-commands仓库调研"
published: 2026-05-20
description: "在探索 Claude Code 周边工具时，发现了 wshobson/commands 仓库——一个提供 57 个生产级 slash commands 的命令集合库。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# wshobson/commands 仓库调研

## 背景

在探索 Claude Code 周边工具时，发现了 wshobson/commands 仓库——一个提供 57 个生产级 slash commands 的命令集合库。

## 仓库概况

### 核心内容

- **15 个 workflows** - 多 Agent 编排，处理复杂任务
- **42 个 tools** - 单用途工具

### 安装方式

```bash
# 完整安装
cd ~/.claude && git clone https://github.com/wshobson/commands.git

# 或使用 plugin
/plugin install claude-code-essentials
```

### 使用方式

```bash
# 带前缀调用（保留目录结构）
/workflows:feature-development implement OAuth2
/tools:api-scaffold create user endpoints

# 或单独复制文件到 ~/.claude/ 后无前缀调用
/tdd-cycle
```

## 15 个 Workflows 分类

### 核心开发工作流

1. feature-development - 端到端功能实现
2. full-review - 多角度代码分析
3. smart-fix - 智能问题解决
4. tdd-cycle - TDD 开发流程编排

### 流程自动化工作流

5. git-workflow - 版本控制流程自动化
6. improve-agent - Agent 优化
7. legacy-modernize - 代码库现代化
8. multi-platform - 跨平台开发
9. workflow-automate - CI/CD 流水线自动化

### 高级编排工作流

10. full-stack-feature - 全栈功能实现
11. security-hardening - 安全优先开发
12. data-driven-feature - ML 驱动功能
13. performance-optimization - 系统级优化
14. incident-response - 生产问题响应
15. git-workflow - 版本控制自动化

## 42 个 Tools 分类

### AI 与机器学习 (4)

- ai-assistant、ai-review、langchain-agent、prompt-optimize

### Agent 协作 (3)

- multi-agent-review、multi-agent-optimize、smart-debug

### 架构与代码质量 (4)

- code-explain、code-migrate、refactor-clean、tech-debt

### 数据与数据库 (3)

- data-pipeline、data-validation、db-migrate

### DevOps 与基础设施 (5)

- deploy-checklist、docker-optimize、k8s-manifest、monitor-setup、slo-implement

### 测试与开发 (6)

- api-mock - Mock API 生成
- api-scaffold - API 端点脚手架
- test-harness - 完整测试套件生成
- tdd-red - 生成失败测试
- tdd-green - 实现最小可用代码
- tdd-refactor - 重构优化

### 安全与合规 (3)

- accessibility-audit、compliance-check、security-scan

### 调试与分析 (4)

- debug-trace、error-analysis、error-trace、issue

### 依赖与配置管理 (3)

- config-validate、deps-audit、deps-upgrade

### 文档与协作 (3)

- doc-generate、pr-enhance、standup-notes

### 运营与上下文 (4)

- cost-optimize、onboard、context-save、context-restore

## 关键决策

### 部分安装可行性

每个命令都是独立的 markdown 文件，可以单独安装使用：

- 方式一：复制单个文件到 ~/.claude/，无前缀调用
- 方式二：保留完整仓库，使用目录前缀调用

### 设计理念

- 清晰分离：workflows 负责复杂编排，tools 负责单一任务
- 遵循 TDD、安全、性能最佳实践

## 总结

这是一个设计良好的 Claude Code 扩展库，命令覆盖了软件开发的全流程。可以根据实际需要选择性安装使用。
