---
title: "Claude-Code-Agent-View-使用指南"
published: 2026-05-20
description: "Claude Code v2.1.139+ 引入了 Agent View（研究预览阶段），用于在一个终端窗口中管理多个后台运行的 Claude Code 会话。无需开多个终端来回切换，所有后台任务集中管理。"
tags: ["Claude Code", "任务与Agent"]
category: "AI工具"
image: api
draft: false
---
# Claude Code Agent View 使用指南

## 背景

Claude Code v2.1.139+ 引入了 Agent View（研究预览阶段），用于在一个终端窗口中管理多个后台运行的 Claude Code 会话。无需开多个终端来回切换，所有后台任务集中管理。

## 核心概念

Agent View 不是「单项目的多会话管理」，而是**全局后台会话管理中心**：

- 打开 Agent View 后，列表显示**所有后台会话**（跨所有项目）
- 但派发新任务时，默认在当前目录运行
- 交互式终端里直接 `claude` 启动的会话不会自动出现在 Agent View 中

## 启动方式

```bash
claude agents          # 打开 Agent View
```

首次打开时列表为空，显示提示文案和底部输入框，直接输入任务描述即可派发。

## 会话状态

| 状态        | 图标     | 含义                          |
| ----------- | -------- | ----------------------------- |
| Working     | 动态旋转 | Claude 正在运行工具或生成回复 |
| Needs input | 黄色     | 等待用户回答问题或确认权限    |
| Idle        | 暗淡     | 已完成，等待下一步输入        |
| Completed   | 绿色     | 任务成功完成                  |
| Failed      | 红色     | 任务以错误结束                |
| Stopped     | 灰色     | 会话被终止                    |

图标形状额外表示进程状态：

- `✻` / `✽` — 进程存活，回复即时
- `∙` — 进程已退出，可 attach 后从断点恢复
- `✢` — `/loop` 轮询任务，显示运行次数和倒计时

## 核心操作

### 1. 派发新任务

在底部输入框输入任务描述，按 `Enter` 启动新后台会话。每个 Enter 都启动**独立的新会话**，不是给已有会话发 follow-up。

特殊输入前缀：

| 输入                    | 效果                         |
| ----------------------- | ---------------------------- |
| `<agent-name> <prompt>` | 指定 subagent 作为会话主代理 |
| `@<agent-name>`         | 显式调用 subagent            |
| `@<repo>`               | 在指定兄弟仓库运行           |
| `/<skill>`              | 调用 skill 启动工作流        |
| `#<number>` 或 PR URL   | 选中正在处理该 PR 的现有会话 |
| `Shift+Enter`           | 派发并直接进入新会话         |

### 2. Peek 快速查看

选中会话行 → `Space` 打开 Peek 面板：

- 显示最近输出或等待的问题（不需要打开完整对话）
- 在 Peek 面板输入 → `Enter` 直接回复
- 多选题按数字键选择
- 按 `Tab` 填充建议回复
- `↑/↓` 切换相邻会话的 Peek
- `→` 从 Peek 直接进入完整会话

### 3. Attach / Detach

- **Attach**：选中会话 → `Enter` 或 `→`，进入完整交互式对话
- **Detach**：空输入时按 `←` 或 `Ctrl+Z`，返回 Agent View 列表

Detach 不会停止会话，所有后台会话继续运行。

### 4. 现有会话后台化

**方式一**：在交互式会话中输入

```bash
/bg
# 或
/background
```

**方式二**：在交互式会话的空输入框按 `←`，自动后台化并打开 Agent View。

注意：如果当前会话有正在运行的 subagent 或后台任务，Claude 会要求确认。

### 5. Shell 直接派发

```bash
claude --bg "investigate the flaky test"
claude --agent code-reviewer --bg "review PR 1234"
```

派发后输出短 ID 和管理命令。

**跨目录派发**

Agent View 底部输入框里的 `@<repo>` 前缀只能在**同级兄弟仓库**间切换。如果目标目录不满足这个条件，最稳的方式是先 `cd` 再派发：

```bash
cd /path/to/target && claude --bg "你要执行的任务"
```

**自动跳过权限确认**

后台任务如果中途弹窗等你确认，就失去了"后台"的意义。可以在启动时加上 `--dangerously-skip-permissions`，让任务全自动跑完：

```bash
claude --dangerously-skip-permissions --bg "run all tests"
```

> 这个参数只对**本次启动**生效，不会修改全局权限设置。如果你经常需要全自动后台任务，可以在 `~/.zshrc` 里设个别名：
>
> ```zsh
> alias cb='claude --dangerously-skip-permissions --bg'
> ```
>
> 之后直接 `cb "review the latest PR"` 即可。

## 快捷键汇总

| 快捷键        | 作用                          |
| ------------- | ----------------------------- |
| `↑/↓`         | 切换会话行                    |
| `Enter`       | 进入选中会话 / 派发输入框任务 |
| `Space`       | 打开/关闭 Peek 面板           |
| `Shift+Enter` | 派发并立即进入                |
| `→`           | 进入选中会话                  |
| `Alt+1-9`     | 快速进入当前分组第 N 个会话   |
| `Tab`         | 空输入时浏览 subagents        |
| `Ctrl+S`      | 切换分组方式（状态 / 目录）   |
| `Ctrl+T`      | 置顶/取消置顶                 |
| `Ctrl+R`      | 重命名会话                    |
| `Ctrl+G`      | 在 `$EDITOR` 中编辑任务描述   |
| `Ctrl+X`      | 停止；2 秒内再按一次删除      |
| `Shift+↑/↓`   | 调整会话顺序                  |
| `?`           | 显示所有快捷键                |
| `Esc`         | 关闭 Peek / 清空输入 / 退出   |

## 文件隔离机制

每个后台会话启动时，Claude 自动将其移动到独立的 git worktree（`.claude/worktrees/`），并行会话读写互不干扰。

**注意**：删除会话时会清理 worktree，重要改动先 commit/push。

## Shell 管理命令

```bash
claude agents              # 打开 Agent View
claude attach <id>         # 进入指定会话
claude logs <id>           # 打印最近输出
claude stop <id>           # 停止会话
claude respawn <id>        # 重启已停止会话
claude respawn --all       # 重启所有已停止会话
claude rm <id>             # 移除会话（清理 worktree）
```

## 会话持久化

- 后台会话由 supervisor 进程托管，不依赖终端
- 关闭终端、退出 Agent View 后，会话继续运行
- 机器休眠/关机后，运行中的会话显示为 Failed
- 恢复：`claude respawn --all` 或 attach 后自动从断点恢复
- 状态存储在 `~/.claude/jobs/<id>/state.json`

## 限制

- 预览阶段，需要 Claude Code v2.1.139+
- 后台会话消耗订阅配额（10 个并行 ≈ 10 倍消耗）
- 会话跑在本地机器上，休眠/关机后停止
- worktree 随会话删除而删除

## 与相关功能的对比

| 特性     | Agent View       | Subagent     | Agent Teams    | Worktrees      |
| -------- | ---------------- | ------------ | -------------- | -------------- |
| 管理粒度 | 独立会话         | 会话内子代理 | 多会话互相通信 | 文件隔离环境   |
| 使用场景 | 并行多个独立任务 | 复杂任务分解 | 多代理协作     | 并行编辑不冲突 |

## 适用场景

适合「把重复 3 遍的事 AI 化」的工作流：

- 批量派发代码审查、测试修复、文档生成等独立任务
- 一个窗口监控所有任务进度，只在需要决策时介入
- 避免开 N 个终端来回切换的低效操作

## 总结

Agent View 的本质是**任务队列**：把任务丢给 Claude，去做别的事，过会儿回来看进度，只在需要输入时介入。对于需要批量管理后台 AI 任务的场景，比多终端方案更高效。
