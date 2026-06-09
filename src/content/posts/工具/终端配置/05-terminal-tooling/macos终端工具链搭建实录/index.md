---
title: "macOS终端工具链搭建实录"
published: 2026-05-20
description: "翔子通过 Homebrew 安装了 cmux（基于 Ghostty 的终端），希望将它配置成跟之前 iTerm2 一致的使用体验，并在此基础上搭建一整套终端工具链，提升命令行工作效率。"
tags: ["终端配置", "05-terminal-tooling"]
category: "工具"
image: api
draft: false
---
# macOS 终端工具链搭建实录

> 2026-04-15 | 翔子 | 替换 iTerm2，搭建一套完整的终端工具链

## 背景

翔子通过 Homebrew 安装了 cmux（基于 Ghostty 的终端），希望将它配置成跟之前 iTerm2 一致的使用体验，并在此基础上搭建一整套终端工具链，提升命令行工作效率。

---

## 1. cmux 安装与配置

### 1.1 安装

```bash
brew install cmux
```

cmux 是基于 Ghostty 的终端模拟器，特点：
- 垂直 Tab 栏
- 对 AI 编码代理的通知支持
- 比 iTerm2 更轻量

### 1.2 oh-my-zsh 自动生效

cmux 默认使用系统 shell（zsh），所以 **oh-my-zsh 不需要额外配置**，打开即生效。

### 1.3 Dracula 配色迁移

从 iTerm2 导出配置，提取关键信息：

| 项目 | 值 |
|------|-----|
| 字体 | Hack Nerd Font 13pt |
| 背景色 | `#1e1f28` |
| 前景色 | `#e5e5e5` |
| Ansi 配色 | 完全匹配 Dracula |

通过对比 16 色 Ansi 值（`#ff5555`、`#50fa7b`、`#bd93f9`、`#8be9fd` 等），确认原配色方案就是 **Dracula**。

在 cmux 中设置：

```bash
cmux themes set --dark "Dracula"
```

配置文件写入：`/Users/xiangwang/Library/Application Support/com.cmuxterm.app/config.ghostty`

### 1.4 背景透明度 + 毛玻璃效果

Ghostty 配置文件中有 `background-blur` 选项，但该功能仅在 Linux Wayland/KDE 环境下受支持。cmux 基于 macOS AppKit 实现，目前**不支持窗口透明度/毛玻璃效果**。窗口透明度需要 cmux 开发者在 Swift 层添加 AppKit 窗口混合属性，等待后续版本支持。

### 1.5 选中即复制

```ini
copy-on-select = clipboard
```

默认 cmux 选中文字不会自动复制，需要 `Cmd+C`。加上这行后选中直接复制到剪贴板。

**踩坑**：Ghostty 的 `copy-on-select` 有两个值：
- `true` — 优先使用 X11 选区剪贴板（macOS 上无效）
- `clipboard` — 复制到系统剪贴板（macOS 用这个）

之前误写成 `copy-on-select = true` 和 `copy-to-clipboard = true` 都不生效。

### 1.6 最终配置文件

cmux 读取 `~/.config/ghostty/config`（字体、字号等基础配置）和 `~/Library/Application Support/com.cmuxterm.app/config.ghostty`（主题、外观等）。

**~/.config/ghostty/config**：
```ini
font-family = JetBrainsMono Nerd Font
font-size = 14
theme = One Dark
scrollback-limit = 50000
split-divider-color = #3e4451
working-directory = ~/code
copy-on-select = clipboard
```

**~/Library/Application Support/com.cmuxterm.app/config.ghostty**：
```ini
# cmux themes start
theme = dark:Dracula
# cmux themes end
copy-on-select = clipboard
```

---

## 2. Stop Hook 清理

去掉 `~/.claude/settings.json` 中 Stop hook 的声音和通知：

```json
// 修改前
"command": "afplay /System/Library/Sounds/Glass.aiff ...; osascript -e 'display notification ...'"

// 修改后
"command": "echo '{\"systemMessage\": \"会话结束 - 如果需要分析技术债务，请使用 /techdebt 命令；如果需要记录文档，请使用 /note 命令\"}'"
```

保留夸夸报告（`praise-report.sh`）和系统提示消息，去掉了：
- `afplay Glass.aiff` — 声音
- `osascript display notification` — macOS 系统通知

---

## 3. 终端工具链选型与安装

### 3.1 工具选型

| 工具          | 定位         | 替代              | 安装方式                        |
| ----------- | ---------- | --------------- | --------------------------- |
| **lazygit** | 终端 Git TUI | SourceTree      | `brew install lazygit`      |
| **Fresh**   | 终端编辑器      | Vim/Nano（零学习成本） | `brew install fresh-editor` |
| **Yazi**    | 终端文件管理器    | Finder 键盘操作     | `brew install yazi`         |

核心思路：**终端里完成所有操作**——文件管理、代码编辑、Git 操作都不离开终端。

### 3.2 核心五件套安装

```bash
brew install zoxide fzf bat eza ripgrep
```

其中 `bat` 和 `ripgrep` 之前已安装。

### 3.3 三大件使用方法

#### Yazi — 终端文件管理器

**启动**：

```bash
yazi          # 当前目录
yazi ~/docs   # 指定目录
```

**核心快捷键**（Vim 风格）：

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 上下移动 | `j` / `k` | 选择文件/目录 |
| 进入目录 | `l` | 或回车 |
| 返回上级 | `h` | |
| 标记文件 | `Space` | 多选文件 |
| 复制 | `y` | 标记后复制 |
| 剪切 | `x` | 标记后剪切 |
| 粘贴 | `p` | 粘贴已复制/剪切的文件 |
| 删除 | `d` | 移入回收站 |
| 重命名 | `r` | 批量重命名 |
| 搜索 | `/` | fuzzy 搜索文件名 |
| 命令行 | `:` | 输入命令 |
| 新建文件 | `n` | 创建新文件/目录 |
| 打开文件 | `Enter` | 用默认程序打开 |
| 预览 | 右侧自动 | 代码高亮、图片、PDF 等 |
| 退出 | `q` | |

**进阶功能**：

- **Tab**：`t` 新建 Tab，`1/2/3` 切换
- **双栏模式**：左右并排浏览
- **Git 状态**：文件旁显示未提交/已修改标记
- **插件**：通过 `ya pack -i <插件名>` 安装社区插件

#### Fresh — 终端编辑器

**启动**：

```bash
fresh              # 直接启动
fresh file.ts      # 打开文件
fresh -r dir/      # 打开目录（类似 VS Code）
```

**核心快捷键**（VS Code 风格）：

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 保存 | `Cmd+S` / `Ctrl+S` | |
| 命令面板 | `Cmd+Shift+P` / `Ctrl+Shift+P` | 搜索所有命令 |
| 文件搜索 | `Cmd+P` / `Ctrl+P` | fuzzy 搜索文件 |
| 行跳转 | `Ctrl+G` | 跳到指定行 |
| 查找 | `Cmd+F` / `Ctrl+F` | |
| 替换 | `Cmd+H` / `Ctrl+H` | |
| 多光标 | `Cmd+D` / `Ctrl+D` | 选下一个相同词 |
| 多光标手动 | `Cmd+Click` | 在任意位置加光标 |
| 分屏 | `Cmd+\` | 垂直分割 |
| 侧边栏 | `Cmd+B` | 切换文件树 |
| 撤销 | `Cmd+Z` | |
| 终端 | `` Ctrl+` `` | 内置终端 |

**特点**：

- 零配置开箱即用，不需要像 Vim 那样学命令
- 支持 LSP（代码跳转定义、补全、诊断）
- 支持 TypeScript 插件（沙盒环境）
- 大文件性能优秀，GB 级文件流畅编辑

#### lazygit — 终端 Git TUI

**启动**：

```bash
lazygit          # 在 Git 仓库目录内启动
```

**核心快捷键**：

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 切换面板 | `Tab` | 文件/分支/提交等面板 |
| 上下移动 | `j` / `k` | |
| 选择/取消 | `Space` | 暂存/取消暂存文件 |
| 半暂存 | `Enter` | 逐行选择暂存 |
| 提交 | `c` | 弹出提交输入框 |
| 推送 | `P` | 推送到远程 |
| 拉取 | `p` | 从远程拉取 |
| 创建分支 | `n` | 新建分支 |
| 切换分支 | `Space` 在分支面板 | |
| stash | `$` | 创建 stash |
| 查看 stash | `Shift+S` | stash 面板 |
| 回退 | `Shift+R` | reset 菜单 |
| 查看 diff | `Enter` 在文件上 | |
| 过滤文件 | `/` | fuzzy 过滤文件列表 |
| 帮助 | `?` | 查看完整快捷键 |
| 退出 | `q` | |

**面板导航**（按 `Tab` 切换）：

1. **Status** — 分支、远程状态
2. **Files** — 工作区变更
3. **Submodules** — 子模块
4. **Branches** — 分支列表
5. **Commits** — 提交历史
6. **Stash** — 暂存列表

### 3.4 .zshrc 配置

```bash
# 替代 cat
alias cat='bat'

# 替代 ls
alias ls='eza --icons'
alias ll='eza -la --icons --git'
alias tree='eza --tree --icons'

# zoxide: 智能 cd（找不到时 fallback 到原生 cd）
eval "$(zoxide init zsh)"
alias cd='_zoxide_cd() { if zi "$@" 2>/dev/null; then return 0; else builtin cd "$@" 2>/dev/null; fi; }; _zoxide_cd'

# fzf: shell 集成
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
```

### 3.5 zoxide 踩坑

刚安装时 `cd` 报错 `zoxide: no match found`。

**原因**：zoxide 数据库是空的，需要学习你去过的目录。

**解决**：alias 加了 fallback 逻辑——zoxide 找不到匹配时自动走原生 `cd`，不会报错。

### 3.6 工具速查

| 原命令 | 新命令 | 说明 |
|--------|--------|------|
| `cat` | `cat` (alias → bat) | 语法高亮 + 行号 |
| `ls` | `ls` (alias → eza) | 图标 + 颜色 |
| `ll` | `eza -la --icons --git` | 列表 + git 状态 |
| `tree` | `eza --tree --icons` | 树状结构 |
| `cd` | `cd` (alias → zoxide) | 智能跳转，关键词模糊匹配 |
| `grep` | `rg` (ripgrep) | 快 10 倍+，自动忽略 .gitignore |
| `Ctrl+R` | `Ctrl+R` (fzf) | 模糊搜索历史记录 |
| `Ctrl+T` | `Ctrl+T` (fzf) | 模糊搜索文件系统 |

---

## 总结

这套工具链的核心思想：**键盘党在终端里完成一切**。

- **cmux**：终端外壳，Dracula 配色
- **eza + bat**：看文件/看代码更舒服
- **zoxide + fzf**：跳转和搜索零成本
- **Yazi**：文件管理不离开终端
- **lazygit**：Git 操作可视化
- **Fresh**：远程/终端里写代码不求人
- **ripgrep**：搜内容快

全部安装配置完毕，新开终端即可生效。
