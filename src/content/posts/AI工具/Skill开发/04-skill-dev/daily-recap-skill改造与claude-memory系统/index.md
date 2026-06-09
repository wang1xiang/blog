---
title: "daily-recap-skill改造与Claude-Memory系统"
published: 2026-05-20
description: "用户需要每日工作回顾功能，从最初的简化版本逐步优化到按项目整理的详细版本。整个过程涉及对 Claude-Memory 系统的深入理解和应用。"
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# Daily-Recap Skill 改造与 Claude-Memory 系统

## 背景

用户需要每日工作回顾功能，从最初的简化版本逐步优化到按项目整理的详细版本。整个过程涉及对 Claude-Memory 系统的深入理解和应用。

## 方案/过程

### 1. 初期简化版（时间线模式）

- 按时间段（上午、下午、晚上）分组
- 生成简化的任务总结
- 用户反馈不够详细

### 2. 详细版改造

- 从数据库获取完整 observation 数据
- 使用实际的 `title` 和 `subtitle` 字段
- 保留所有任务细节

### 3. 最终版（按项目整理）

- 按 `project` 字段分组
- 每个项目带 emoji 图标
- 包含时间段、关键任务列表
- 添加完成的主要工作表格
- 添加备注/关键洞察

### 4. Skill 改造

- 更新 `daily-recap` skill 的指令
- 定义项目分组规则
- 规范输出结构

## Claude-Memory 系统详解

### 数据存储结构

Claude-Memory 使用两层存储：

**1. SQLite 数据库（持久层）**

- 位置：`~/.claude-mem/claude-mem.db`
- 主要表：`observations`
- 关键字段：
  - `id`: 唯一标识符
  - `type`: 类型（feature, discovery, change, bugfix, decision 等）
  - `title`: 任务标题
  - `subtitle`: 任务副标题/详情
  - `project`: 项目名称
  - `created_at`: 创建时间（ISO格式）
  - `created_at_epoch`: 创建时间（时间戳）
  - `memory_session_id`: 会话ID

**2. Session Cache（会话层）**

- 当前会话内存中的数据
- 优先读取，数据库作为补充

### 数据同步机制

通过日志分析发现同步规律：

- **同步时间**：隔天上午 9 点左右
- **证据**：
  - `claude-mem-2026-04-20.log` 最后修改：4月21日 09:28
  - `claude-mem-2026-04-17.log` 最后修改：4月17日 18:31
- **策略**：缓存优先，数据库补充

### 查询方式

**1. MCP 工具（推荐）**

```
mcp__plugin_claude-mem_mcp-search__search(
    dateStart="YYYY-MM-DD",
    dateEnd="YYYY-MM-DD",
    limit=200,
    orderBy="date_asc"
)
```

**2. SQLite 直接查询**

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
    SELECT id, type, title, subtitle, project, created_at
    FROM observations
    WHERE strftime('%Y-%m-%d', created_at) = 'YYYY-MM-DD'
    ORDER BY created_at_epoch ASC;
"
```

**3. 分组统计查询**

```bash
sqlite3 ~/.claude-mem/claude-mem.db "
    SELECT project, COUNT(*) as count,
           MIN(created_at) as first,
           MAX(created_at) as last
    FROM observations
    WHERE strftime('%Y-%m-%d', created_at) = 'YYYY-MM-DD'
    GROUP BY project
    ORDER BY count DESC;
"
```

## 关键决策

### 1. 为什么用 SQLite 而不是 MCP

- **数据完整性**：SQLite 有完整历史数据
- **性能**：大量数据查询更高效
- **灵活性**：可以自定义复杂查询

### 2. 缓存优先策略

- **解决问题**：当天数据未同步到数据库
- **实现方式**：先查会话缓存，缺失的用数据库补充
- **去重**：通过 ID 避免重复

### 3. 按项目而非时间分组

- **用户价值**：更清晰看到每个项目的进展
- **组织方式**：`project` 字段天然支持
- **视觉优化**：emoji 图标提升可读性

## 踩坑/注意

### 1. 字段名混淆

- **错误**：一开始用 `path` 字段，实际不存在
- **正确**：使用 `project` 字段
- **解决**：查看表 schema

### 2. 数据同步延迟

- **现象**：当天数据查不到
- **原因**：数据次日同步
- **解决**：缓存优先策略

### 3. 文件位置混乱

- **问题**：子代理生成到错误目录
- **解决**：统一保存到 `markdown/` 目录

## 输出结构规范

### 最终版结构

```markdown
# 每日工作回顾 - YYYY年MM月DD日

## 📅 概览

**日期**: YYYY-MM-DD
**主要工作目录**: ...

---

## 🕐 时间线（按项目整理）

### [emoji] 项目：[项目名称] - [项目描述]

**时间**: [时间段]
**主要任务**:

1. **[关键任务1]**: 任务描述
2. **[关键任务2]**: 任务描述

---

## ✅ 完成的主要工作

| 项目 | 内容 |
| ---- | ---- |
| ...  | ...  |

---

## 📝 备注

1. **[关键发现1]**: 发现描述

---

_生成时间: YYYY-MM-DD_
```

### Emoji 选择规则

- 📊 数据分析、报表、系统项目
- 🔍 调查、研究、问题解决项目
- 🛠️ 开发、工具、技能开发项目
- 📄 文档、内容、Markdown管理项目
- 🔵 通用、未分类项目

## 总结

### 可复用经验

1. **先了解数据结构**：查看数据库 schema，避免字段错误
2. **理解同步机制**：通过日志分析同步规律
3. **分层读取策略**：缓存优先，数据库补充
4. **用户反馈驱动**：从简化到详细，从时间到项目
5. **标准化输出**：统一结构，提升可读性

### 技术栈

- **数据库**：SQLite
- **查询工具**：Bash + sqlite3
- **数据访问**：MCP 工具 + 直接查询
- **输出格式**：Markdown

### 后续可优化

1. 自动判断当天数据是否需要手动整理
2. 支持自定义时间段和项目筛选
3. 添加可视化图表（工作时间分布、项目占比）
4. 集成 Git 提交记录
