---
title: "git-reflog-找回丢失代码教程"
published: 2026-05-20
description: "在分支合并过程中，如果不小心执行了 git reset --hard 或 git push -f 覆盖了远程，本地和远程的提交历史都会丢失。但 Git 实际上不会立即删除这些提交，它们仍然可以通过 git reflog 找回。"
tags: ["终端配置", "05-terminal-tooling"]
category: "工具"
image: api
draft: false
---
# Git reflog 找回丢失代码教程

## 背景

在分支合并过程中，如果不小心执行了 `git reset --hard` 或 `git push -f` 覆盖了远程，本地和远程的提交历史都会丢失。但 Git 实际上不会立即删除这些提交，它们仍然可以通过 `git reflog` 找回。

## 真实场景

在 `feat-knowledgebase` 分支上开发完知识库模块独立重构后，合入了 `feat-without-claw-dpy` 分支的代码。合并完成后不小心执行了类似 `git reset --hard origin/feat-knowledgebase` 的操作，把本地提交全部覆盖了，然后又 `git push -f` 推到了远程。

## 找回步骤

### 1. 查看 reflog 定位丢失的提交

```bash
# 查看所有分支的 reflog 记录
git reflog --all

# 只看当前分支的 HEAD 移动记录
git reflog HEAD
```

reflog 会显示每次 HEAD 的移动历史，格式如下：

```
9c64dbd HEAD@{0}: reset: moving to 9c64dbd1bce0d0502b4f3cc1ed80134627f61cd5
b9509c1 HEAD@{1}: commit (merge): fix: merge
033931f HEAD@{2}: reset: moving to HEAD
033931f HEAD@{3}: checkout: moving from master-tens to feat-knowledgebase
```

关键信息：

- `HEAD@{1}` 指向丢失的合并提交 `b9509c1`
- `HEAD@{0}` 是 reset 之后的当前状态

### 2. 对比确认丢失的内容

```bash
# 查看丢失的提交包含哪些文件变更
git diff 当前HEAD 丢失的commit --stat

git diff 9c64dbd b9509c1 --stat
```

输出示例：

```
 src/main/knowledgebase/env.ts   |   9 ++
 src/main/knowledgebase/index.ts | 244 +++++++++++++++++++++++++++++
 src/main/knowledgebase/ipc.d.ts |  53 +++++++
 src/main/knowledgebase/preload.ts|  26 +++
 ...
 13 files changed, 390 insertions(+)
```

### 3. 恢复丢失的文件

**方法一：从丢失的 commit 中检出文件**（推荐，最精准）

```bash
git checkout <丢失的commit> -- <文件路径>

# 示例：恢复整个知识库模块
git checkout b9509c1 -- src/main/knowledgebase/

# 恢复其他相关文件
git checkout b9509c1 -- src/main/ipc-manager/index.ts
git checkout b9509c1 -- src/main/ipc-manager/preload.ts
```

**方法二：回退到丢失的提交**（如果后面的提交不需要保留）

```bash
git reset --hard b9509c1
```

### 4. 提交并推送

```bash
git add .
git commit -m "refactor: 知识库模块独立为 src/main/knowledgebase，与 claw 解耦"
git push -f origin feat-knowledgebase
```

## reflog 核心概念

| 概念                      | 说明                                        |
| ------------------------- | ------------------------------------------- |
| **reflog**                | 记录引用（分支、HEAD）每次移动的历史        |
| **HEAD@{n}**              | HEAD 第 n 次移动前的位置，0 是当前          |
| **refs/heads/分支名@{n}** | 特定分支的 reflog                           |
| **过期时间**              | 默认 90 天（已合并的提交），30 天（未合并） |

## 常用 reflog 命令

```bash
# 查看 reflog
git reflog
git reflog HEAD
git reflog --all

# 查看某个时间点 HEAD 在哪里
git reflog show HEAD

# 回到 n 步之前
git reset --hard HEAD@{n}

# 从 reflog 中恢复某个 commit 的文件
git checkout <commit> -- <file>

# 查看 reflog 中某个 commit 的变更
git show <commit>

# 对比两个 reflog 位置的差异
git diff HEAD@{1} HEAD@{2}
```

## 注意事项

1. **reflog 不是永久的**：默认 90 天自动清理，执行 `git gc` 会加速清理
2. **只记录本地操作**：reflog 是本地引用日志，不会推送到远程
3. **尽快恢复**：发现丢失后立即操作，时间越久越难找回
4. **谨慎 force push**：`git push -f` 会覆盖远程历史，操作前确认当前分支没有别人在开发
5. **备份重要分支**：在做可能丢失提交的操作前，可以先 `git branch backup-xxx` 打个标签

## 预防建议

```bash
# 做危险操作前先备份当前分支
git branch backup-before-reset

# 使用 --dry-run 预览操作
git reset --dry-run <target>

# 合并时使用 --no-ff 保留合并记录
git merge <branch> --no-ff
```

## 总结

- `git reflog` 是 Git 的后悔药，能找回几乎所有本地丢失的提交
- 找回的核心是找到丢失 commit 的哈希值，然后用 `git checkout <commit> -- <file>` 恢复
- 不要恐慌，Git 很少真正删除数据，只是从当前分支移除了引用
