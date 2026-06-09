---
title: "Claude-Code-Hook-配置完整记录"
published: 2026-05-20
description: "为 Claude Code 配置了一系列自动化 Hook，提升开发体验和工作流效率。本文档记录所有 Hook 的配置详情和功能说明。"
tags: ["Claude Code", "Hook配置"]
category: "AI工具"
image: api
draft: false
---
# Claude Code Hook 配置完整记录

## 背景

为 Claude Code 配置了一系列自动化 Hook，提升开发体验和工作流效率。本文档记录所有 Hook 的配置详情和功能说明。

## 配置时间

2026-04-20

## 完整 Hook 列表

### SessionStart - 会话启动

**Hook**: `daily-fortune.sh`

**功能**: 会话启动时显示今日运势和幸运指数

**状态消息**: 🔮 今日运势

---

### PreToolUse - 工具执行前

**匹配器**: `Bash`

#### 1. audit-bash.sh

**功能**: 记录所有 Bash 命令到审计日志

- 按天分割日志文件
- 自动清理 7 天前的旧日志
- 记录当前工作目录和命令内容

#### 2. block-destructive.sh

**功能**: 拦截危险命令，包括：

- `rm -rf` / `rm -r` - 递归删除
- 修改 `.env` 文件
- 磁盘格式化/分区
- `git push --force` 到 main/master
- `DROP DATABASE` / `DROP TABLE`
- `sudo` 配合破坏性命令
- `dd` 命令
- `chmod 777` 到根目录

---

### PostToolUse - 工具执行后

#### 1. kill-counter.sh (匹配: Write|Edit|Bash)

**功能**: 统计文件操作数据

- 创建文件数
- 修改文件数
- 删除文件数
- 运行命令数
- 新增代码行数

#### 2. format-code.sh (匹配: Write|Edit)

**功能**: 自动格式化代码文件

- **支持格式**:
  - `js/jsx/ts/tsx/json/css/scss/md` → Prettier
  - `py` → Black
  - `go` → Gofmt

**状态消息**: 🎨 格式化代码...

---

### Stop - 会话结束

#### 1. 任务完成度检查 (Prompt Hook)

**类型**: `prompt`

**功能**: 检查对话中提到的所有任务是否完成

- 未完成 → 返回 `{"ok": false, "reason": "..."}`
- 已完成 → 返回 `{"ok": true}`

**超时**: 30 秒

**状态消息**: ✅ 检查任务完成度...

#### 2. praise-report.sh

**功能**: 生成"夸夸报告"

- 根据产出评定等级（传奇工程师/代码大师/高效产出/稳步前行/禅意模式）
- 伤害类型评定（毁灭之神/拆迁办主任/和平主义者）
- 详细数据统计
- 随机评委点评

**状态消息**: 📝 生成夸夸报告...

#### 3. complete-notification.sh

**功能**: 发送桌面通知（带声音）

- 标题: "Claude Code 已完成"
- 内容: 当前项目名称
- 声音: Glass

**状态消息**: 🔔 发送完成通知...

#### 4. 会话结束提示

**功能**: 显示系统提示信息

- 提醒使用 `/techdebt` 分析技术债务
- 提醒使用 `/note` 记录文档

**状态消息**: 📋 会话结束提示

---

### TeammateIdle - 空闲等待

**Hook**: `idle-notification.sh`

**功能**: Claude 等待用户输入时发送通知

- 标题: "Claude Code"
- 内容: "Claude Code 正在等待您的输入\n项目: [项目名]"
- 声音: Glass

**状态消息**: ⏰ 空闲通知...

---

## Hook 脚本位置

所有脚本位于: `~/.claude/hooks/`

```
~/.claude/hooks/
├── audit-bash.sh           # Bash 命令审计
├── block-destructive.sh    # 危险命令拦截
├── daily-fortune.sh        # 今日运势
├── kill-counter.sh         # 操作统计
├── praise-report.sh        # 夸夸报告
├── complete-notification.sh # 完成通知
├── idle-notification.sh    # 空闲通知
└── format-code.sh          # 代码格式化
```

## 关键决策

1. **任务完成度检查放在 Stop 最前面** - 确保在执行其他结束动作前先确认任务是否真的完成
2. **format-code.sh 只匹配 Write/Edit** - 避免在 Bash 命令后误触发
3. **block-destructive.sh 在 audit-bash.sh 之后** - 即使命令被拦截，也会先记录到审计日志

## 总结

本次配置完成了 Claude Code 的完整 Hook 体系：

- ✅ 会话启动有运势提示
- ✅ 命令执行有审计和安全拦截
- ✅ 文件写入自动格式化
- ✅ 操作数据全程统计
- ✅ 会话结束有任务检查和正向反馈
- ✅ 空闲状态有提醒通知

所有 Hook 协同工作，提供安全、高效、有趣的 AI 编程体验。
