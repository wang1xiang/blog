---
title: "skill-cleaner-开发与首轮审计"
published: 2026-05-26
description: "参考 steipete/agent-scripts/skills/skill-cleaner 写一个中文版本，针对本机 Claude Code 三个 skill 位置做体检：用户全局 ~/.claude/skills/、项目级 .cl..."
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# skill-cleaner 开发与首轮审计

## 背景

参考 `steipete/agent-scripts/skills/skill-cleaner` 写一个中文版本，针对本机 Claude Code 三个 skill 位置做体检：用户全局 `~/.claude/skills/`、项目级 `.claude/skills/`、`~/.claude/plugins/cache/`。

直接复用上游思路是因为 Claude Code 装多了之后没人审计，重复 skill、死链、装了从没用的 skill、description 写太长占 prompt budget 都会悄悄堆积。

## 实现要点

### 4 个模块

1. **全景**：3 个位置各有多少 SKILL.md
2. **重复+死链**：同名 skill 多位置注册、plugin 多版本残留（hash 目录）、symlink 死链
3. **使用率**：扫 `~/.claude/projects/*.jsonl` 找 `<command-name>/xxx` 调用证据
4. **description 长度**：超阈值的 skill 列出来（每个常驻 desc 都占 prompt budget）

### macOS bash 3.2 兼容

第一版用 `declare -A` 跑不起来，重写成全部 tempfile + awk 聚合的方案。所有中间状态走 `$TMPDIR_BASE/`，进程结束 trap 清理。

```bash
TMPDIR_BASE="${TMPDIR:-/tmp}/skill-cleaner-$$"
mkdir -p "$TMPDIR_BASE"
trap 'rm -rf "$TMPDIR_BASE"' EXIT
```

### find -L 必须加

```bash
find -L "$USER_SKILLS_DIR" -maxdepth 4 -name "SKILL.md"
```

不加 `-L` 只能数到 4 个用户 skill，实际是 23 个——18 个是 `~/.claude/skills/` 软链到 `~/.agents/skills/`，默认 `find` 不跟随软链。

### 使用率检测：并行 grep 而非 jq

876MB 的 JSONL 用 jq 全解析会很慢，改用 grep 提模式：

```bash
find "$PROJECTS_DIR" -name "*.jsonl" -mtime -"$DAYS" \
    | xargs -P 4 -I {} grep -hoE '<command-name>/[a-zA-Z0-9_-]+' {} \
    | sed 's|<command-name>/||' \
    | sort | uniq -c | sort -rn
```

`xargs -P 4` 并行加速。

### plugin 多版本检测

```bash
awk -F/ '{
    for (i=1; i<=NF; i++) if ($i=="skills") { sidx=i; break }
    plugin=$(sidx-2); skill=$(sidx+1)
    count[plugin"/"skill]++
} END { for (k in count) if (count[k]>1) print ... }'
```

按路径段拆 `cache/<marketplace>/<plugin>/<hash>/skills/<skill>/SKILL.md`，发现同 plugin 多个 hash 目录就报告。

## 首轮审计结论

- **总数**：67 SKILL.md = 用户 23 + 项目 8 + plugin 36（之前清理过一波，原本 plugin cache 有 63 个）
- **重复**：仅 `nopua` 三层嵌套（`~/.claude/skills/nopua/{SKILL.md, codex/nopua/SKILL.md, skills/nopua/SKILL.md}`）
- **Top 10 高频**：note(79)、daily-recap(35)、cdk-exchanger(24)、prompt-optimizer(22)、claude-weekly-digest(14)、neat-freak(13)、aihot(13)、ui-ux-pro-max(5)、find-skills(5)、tts(4)
- **45 个 0 显式触发**：但绝大多数是自然语言激活，不能直接判定"没用"
- **19 个 description 超 200 字符**，前几名：
  - ui-ux-pro-max 914
  - baoyu-wechat-summary 654
  - ckm:design 614
  - aihot 528
  - ckm:banner-design 495

## 已知盲区

使用率检测只看 `<command-name>/xxx` 这种显式 slash command 触发，**通过自然语言激活的 skill 不会被计入**。0 触发 ≠ 没用，可能只是从来没人打过 `/xxx`。

所以"建议先看不要急着删"是设计原则之一。

## 教训：Claude Code 没有 per-skill disable

中途想批量 disable 部分 superpowers 子 skill，让 sub-agent (`claude-code-guide`) 调研语法。结果它**直接修改了** `~/.claude/settings.json`，加了一个 `disabledSkills` 数组字段：

```json
"disabledSkills": [
  "superpowers:using-git-worktrees",
  "superpowers:requesting-code-review",
  "superpowers:receiving-code-review",
  "superpowers:finishing-a-development-branch"
]
```

重启后没生效。`/reload-plugins` 测试，4 个 skill 还在列表里。

验证：`claude plugin --help` 只有 `enable/disable/details/install/list/marketplace/remove/uninstall/update`，**没有任何 per-skill disable 子命令**。Claude Code 实际只支持：

- `enabledPlugins` 字段（整 plugin 维度）
- `claude plugin disable <name>` CLI（整 plugin 维度）

`disabledSkills` 是 sub-agent 凭直觉编造的字段，已 `jq 'del(...)'` 清除。

**教训**：

- 派 sub-agent 调研功能时，prompt 里要明确"只调研，不要动配置文件"
- sub-agent 写出的配置语法没经验证就是猜，必须自己验一遍
- Claude Code 当前的 skill 控制粒度只到 plugin，要禁用某些 superpowers 子 skill 只能 fork 整个 plugin

## 后续动作

已完成的清理：

- plugin cache 27 个冗余 SKILL.md 删除（10 frontend-design + 5 session-report + 4 cmux + 1 temp_git + 7 superpowers 旧 hash）
- `disabledSkills` 死配置删除（备份在 `~/.claude/settings.json.bak`）

剩余可做但未做：

- 压缩自己写的两个长 description（baoyu-wechat-summary 654、aihot 528）
- nopua 三层嵌套拍平
