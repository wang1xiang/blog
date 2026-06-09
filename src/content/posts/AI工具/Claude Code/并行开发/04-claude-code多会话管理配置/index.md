---
title: "04-Claude Code多会话管理配置"
published: 2026-05-20
description: "Claude Code 默认同一个目录下可以有多个会话，但："
tags: ["Claude Code", "并行开发"]
category: "AI工具"
image: api
draft: false
---
# Claude Code 多会话管理配置

> 配置时间：2026-04-14
> 最后更新：2026-04-23
> 涉及文件：`~/.zshrc`、`~/.claude/cs.sh`

---

## 背景

Claude Code 默认同一个目录下可以有多个会话，但：

1. 没有命令行工具查看当前目录的会话列表
2. 启动 `claude` 时默认加载最近的会话
3. 无法方便地管理/删除旧会话

目标：封装快捷命令，像 Codex 的线程管理一样管理会话。

---

## 实现

### 1. 核心函数：`_claude_project_key`

将当前目录的物理路径转换为 Claude Code 内部使用的项目目录名：

```bash
_claude_project_key() {
  local resolved=$(pwd -P 2>/dev/null || pwd)
  # Claude Code 的转换规则：/ → -, _ → -
  echo "$resolved" | sed 's|/|-|g' | sed 's/_/-/g'
}
```

> **转换规则示例：**
>
> - `/Users/xiangwang/claudecode/projects/alarm-extension` → `-Users-xiangwang-claudecode-projects-alarm-extension`
> - `项目目录/某 Vue 3 项目` → `-Users-xiangwang-My-公司项目-某 Vue 3 项目`

### 2. 命令一览

| 命令                 | 说明                             | 示例          |
| -------------------- | -------------------------------- | ------------- |
| `cs` / `cslist`      | 查看当前目录的会话列表           | `cs`          |
| `csclean`            | 删除当前目录的所有会话（带确认） | `csclean`     |
| `csdel <名称或UUID>` | 删除指定会话                     | `csdel 主`    |
| `cn`                 | 启动全新会话                     | 终端输入 `cn` |

### 3. 安装方式

将函数提取到 `~/.claude/cs.sh`，在 `~/.zshrc` 中 source：

```bash
# ~/.zshrc
source "$HOME/.claude/cs.sh"
alias claude-sessions='cs'
alias cslist='cs'
```

---

## 踩坑记录

### 问题：下划线转连字符导致路径匹配失败 (2026-04-14)

**现象：**

在 `项目目录/某 Vue 3 项目` 目录下执行 `cs`，输出：

```
当前目录没有 Claude 会话
```

但实际通过 `ls ~/.claude/projects/-Users-xiangwang-My-公司项目-某 Vue 3 项目/` 查看有 24 个会话。

**原因：**

Claude Code 在创建项目目录名时，会把下划线 `_` 也转换为连字符 `-`：

```
实际目录名: 某 Vue 3 项目
Claude 内部名: 某 Vue 3 项目   # _ 被转成了 -
```

初始脚本只处理了 `/` → `-` 的转换，没有处理 `_` → `-`，导致路径匹配不上。

**初始错误代码：**

```bash
local pwd_escaped=$(pwd | sed 's|/|-|g' | sed 's/^-/-/')
# 转换结果: -Users-xiangwang-My-公司项目-某 Vue 3 项目  ❌

# 而 Claude 内部实际目录名:
# -Users-xiangwang-My-公司项目-某 Vue 3 项目           ✅
```

**修复方案：**

新增 `_` → `-` 转换：

```bash
_claude_project_key() {
  local resolved=$(pwd -P 2>/dev/null || pwd)
  echo "$resolved" | sed 's|/|-|g' | sed 's/_/-/g'
}
```

**修复后效果：**

```
当前目录有 24 个会话：

名称         大小         最后活跃         文件
---------- ---------- ------------ ----
02405202   1.5M       04/10 11:23  02405202-94fc-4bf7-b6c8-aa30f2ec9503.jsonl
快搭         780K       04/14 10:20  1da26106-98e7-48cf-815e-7356e2015f82.jsonl
22c71a8e   5.7M       04/08 09:53  22c71a8e-6a97-414c-ae42-81cd4a04eb42.jsonl
...
```

### 问题：会话名称无法正确解析 (2026-04-14)

**现象：**

使用 `/rename` 命令重命名会话后，`cs` 仍显示 UUID 前缀而非自定义名称。

**原因：**

初始实现从 JSONL 文件的第一行查找 `name` 字段，但第一行是 `permission-mode` 类型，不包含名称。实际名称存储为 `"custom-title"` 类型。

**修复方案：**

```bash
# 错误：从第一行查找 name 字段
local name=$(head -1 "$session" | grep -o '"name":"[^"]*"' | head -1 ...)

# 正确：查找 custom-title 类型行
local name=$(grep -m1 '"custom-title"' "$session" | grep -o '"customTitle":"[^"]*"' | sed ...)
```

### 问题：会话名称只显示第一次 rename 的结果 (2026-04-23)

**现象：**

同一个会话多次使用 `/rename` 改名后，`cs` 只显示第一次设置的名称，不显示最新名称。

**原因：**

`cs` 使用 `grep -m1` 只查找第一个 `"custom-title"` 事件，但每次 `/rename` 都会在 JSONL 文件末尾追加一条新的 `custom-title` 事件，所以最新名称在最后面。

**修复方案：**

使用 `tac` 先把文件倒序，再找第一个 `custom-title`（即原文件的最后一个）：

```bash
# 错误：只找第一个 custom-title
local name=$(grep -m1 '"custom-title"' "$session" | ...)

# 正确：找最后一个 custom-title（最新名称）
local name=$(tac "$session" 2>/dev/null | grep -m1 '"customTitle":"[^"]*"' | ...)
```

### 问题：\_claude_project_key 多余的 sed 's/^-/-/' (2026-04-23)

**原因：**

之前的代码有一个多余的 `sed 's/^-/-/'`，这个命令不会改变任何字符串（把开头的 `-` 替换成 `-`），属于冗余代码。

**修复方案：**

直接删除这个多余的 sed 命令。

---

## 会话存储结构

Claude Code 的会话数据存储在：

```
~/.claude/projects/
├── -Users-xiangwang-claudecode-projects-alarm-extension/
│   ├── 724a2c08-002c-4e45-ac81-618aa6e50640.jsonl   # 会话记录
│   ├── a6617c75-8890-4034-940e-b197c37b60f4.jsonl   # 会话记录
│   └── memory/                                        # 记忆目录
├── -Users-xiangwang-My-公司项目-某 Vue 3 项目/
│   ├── 1da26106-98e7-48cf-815e-7356e2015f82.jsonl
│   ├── ...
```

每个 `.jsonl` 文件是一个独立会话，按行存储 JSON 对象。

---

## /new vs /fork 的区别

| 命令    | 行为                     | 继承上下文          | 典型场景                           |
| ------- | ------------------------ | ------------------- | ---------------------------------- |
| `/new`  | 创建一个全新的会话       | ❌ 不继承           | 切换到完全不同的任务               |
| `/fork` | 从当前会话分叉一个新会话 | ✅ 继承当前对话历史 | 想在当前讨论基础上另开一个分支尝试 |

> 类比 Git：`/new` 类似从空仓库开始，`/fork` 类似 `git branch` 从当前 commit 分出一条新分支。

---

## 会话记忆机制

### 跨会话保留

Claude Code 通过 `claude-mem` 插件实现了跨会话的记忆系统：

- 记忆存储在 `~/.claude/projects/<project-key>/memory/` 目录下
- 新开一个会话时，之前的记忆仍然可以被检索到
- 这是**预期行为**，不是 bug — 设计目标是让未来会话能参考过去的内容

### 注意

如果期望"干净的重新开始"，需要：

1. 删除旧会话文件（用 `csclean`）
2. 记忆目录中的内容仍然会被保留和检索

---

## 命令参考

### cs - 查看会话列表

```bash
$ cs
当前目录有 4 个会话：

名称         大小         最后活跃         文件
---------- ---------- ------------ ----
查看当前仓库信息 (Branch) 356K       04/14 09:59  56478a34...jsonl
主          672K       04/14 10:25  724a2c08...jsonl
a6617c75    64K       04/14 10:06  a6617c75...jsonl
d6aab07c   4.0K       04/14 09:55  d6aab07c...jsonl
```

### csdel - 删除指定会话

```bash
# 按名称删除
$ csdel 主
已删除会话: 724a2c08-002c-4e45-ac81-618aa6e50640.jsonl

# 按 UUID 前缀删除
$ csdel 724a2c08
已删除会话: 724a2c08-002c-4e45-ac81-618aa6e50640.jsonl
```

### csclean - 清空当前目录所有会话

```bash
$ csclean
将删除当前目录的 4 个会话：
  56478a34-4eb4-45f5-860f-b1ff255d65eb.jsonl
  724a2c08-002c-4e45-ac81-618aa6e50640.jsonl
  a6617c75-8890-4034-940e-b197c37b60f4.jsonl
  d6aab07c-e736-4b1d-9c7c-c4e0ce7673d5.jsonl

确认删除？(y/N): y
已删除 4 个会话
```

### cn - 启动新会话

```bash
# 在终端输入
$ cn
# 等价于: claude -c --new-session
```
