---
title: "从iTerm2到cmux终端工作流升级与自动化实录"
published: 2026-05-20
description: "之前已将终端从 iTerm2 切换到 cmux，搭建了基础工具链（lazygit/Yazi/Fresh 等）。本次继续完善：把 iTerm2 的外观配置（Dracula 主题、背景图、字体）完整迁移到 cmux，并基于 cmux 浏览..."
tags: ["终端配置", "05-terminal-tooling"]
category: "工具"
image: api
draft: false
---
# 从 iTerm2 到 cmux：终端工作流升级与自动化实录

> 2026-05-11 | 翔子 | 将 iTerm2 完整迁移到 cmux，搭建浏览器自动化工作流

---

## 背景

之前已将终端从 iTerm2 切换到 cmux，搭建了基础工具链（lazygit/Yazi/Fresh 等）。本次继续完善：把 iTerm2 的外观配置（Dracula 主题、背景图、字体）完整迁移到 cmux，并基于 cmux 浏览器自动化能力开发了一个 CDK 自动填表 Skill。

---

## 1. iTerm2 → cmux 配置迁移

### 1.1 迁移思路

cmux 底层是 Ghostty，终端行为配置走 `~/.config/ghostty/config`，外观/主题走 cmux 自身的主题系统。iTerm2 的配置存储在 `~/Library/Preferences/com.googlecode.iterm2.plist`，需要提取关键值。

### 1.2 提取 iTerm2 关键配置

通过读取 plist 文件获取：

| 项目       | iTerm2 值              |
| ---------- | ---------------------- |
| 字体       | HackNF-Regular 13pt    |
| 配色       | Dracula（非 One Dark） |
| 背景透明度 | 0.017（几乎不透明）    |
| 滚动缓冲   | 1000 行                |

**关键发现**：之前误以为 iTerm2 用的是 One Dark，实际提取 Ansi 色值后确认是 **Dracula**（`#ff5555`、`#50fa7b`、`#bd93f9`、`#8be9fd` 等）。

### 1.3 Ghostty 最终配置

`~/.config/ghostty/config`：

```ini
font-family = Hack Nerd Font
font-size = 13
theme = Dracula
scrollback-limit = 10000
split-divider-color = #3e4451
working-directory = ~/code
copy-on-select = clipboard

# Cursor (match iTerm2: no blink)
cursor-style = block
cursor-style-blink = false
cursor-color = #bbbbbb

# Background image
background-image = ~/Downloads/壁纸3/IMG_20250505_165711.jpg
background-image-opacity = 0.33
background-image-fit = stretch
background-opacity = 0.8

# Mouse
mouse-reporting = true

# Window
window-save-state = always
```

**踩坑**：

- `background-opacity` 与 `background-image-opacity` 是独立参数，前者控制终端整体透明度，后者控制背景图透明度。
- 背景图 opacity 从 0.05 调到 0.33 才看清，配合 `background-opacity = 0.8` 效果最佳。
- `copy-on-select` 的值要用 `clipboard` 而不是 `true`，后者在 macOS 上无效。

### 1.4 修改后无需重启

编辑 `~/.config/ghostty/config` 后，cmux 会自动热重载，无需重启终端。

---

## 2. cmux Skill 安装与使用

### 2.1 已安装 Skill 列表

```bash
# 在项目目录 ~/.claude/skills/ 下
cmux              # 核心窗口管理
cmux-browser      # 浏览器自动化
cmux-markdown     # Markdown 预览面板
cmux-debug-windows # 调试窗口（开发用）
```

安装方式：从 cmux 官网下载 skill 包，解压到 `~/.claude/skills/` 或项目 `.claude/skills/` 目录。

### 2.2 cmux-browser 核心能力

在 cmux 中打开浏览器 surface，支持完整的 DOM 操作：

```bash
# 打开网页（自动分屏）
cmux browser open https://example.com

# 获取页面可交互元素快照（含 ref）
cmux browser surface:2 snapshot --interactive

# 点击元素
cmux browser surface:2 click e47 --snapshot-after

# 填表
cmux browser surface:2 fill "#email" --text "ops@example.com"
cmux browser surface:2 select "#server" "10"

# 执行 JS
cmux browser surface:2 eval "document.title"

# 导航
cmux browser surface:2 navigate https://example.org
```

### 2.3 cmux-markdown

在侧边栏打开实时渲染的 markdown 面板：

```bash
cmux markdown open plan.md
```

---

## 3. 自定义命令（cmux.json）

通过 `~/.config/cmux/cmux.json` 或项目根目录 `./cmux.json` 定义自定义命令和工作区布局。

常用 action 类型：

- `"builtin"` — 内置命令别名（如 `cmux.newTerminal`、`cmux.splitRight`）
- `"command"` — 在终端中运行 shell 命令
- `"agent"` — 启动编码代理（codex / claude）
- `"workspaceCommand"` — 运行命名工作区布局

编辑后按 `Cmd+Shift+，` 或运行 `cmux reload-config` 生效。

### 3.2 cmux.json 配置层级与优先级

cmux 的设置分两层存储：

1. **UI 直接修改** → 保存在 macOS `UserDefaults`（`com.cmuxterm.app`）内部存储
2. **手动编辑 `cmux.json`** → 文件级管理，优先级更高

规则：`cmux.json` 中**存在且未注释**的设置会覆盖 UI 的值；删掉或注释则回退到 UI 存储的值。

> 建议把需要固定下来的配置都写到 `cmux.json` 里做版本管理，换机器或重装时能直接恢复。

### 3.3 当前完整配置

`~/.config/cmux/cmux.json`：

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/manaflow-ai/cmux/main/web/data/cmux.schema.json",
  "schemaVersion": 1,

  "app": {
    "appearance": "system",
    "appIcon": "automatic",
    "commandPaletteSearchesAllSurfaces": false,
    "focusPaneOnFirstClick": false,
    "keepWorkspaceOpenWhenClosingLastSurface": false,
    "language": "system",
    "minimalMode": true,
    "newWorkspacePlacement": "afterCurrent",
    "preferredEditor": "",
    "renameSelectsExistingName": true,
    "reorderOnNotification": true,
    "sendAnonymousTelemetry": true,
    "warnBeforeQuit": true,
  },

  "notifications": {
    "command": "",
    "customSoundFilePath": "",
    "dockBadge": true,
    "paneFlash": true,
    "showInMenuBar": true,
    "sound": "default",
    "unreadPaneRing": true,
  },

  "sidebar": {
    "branchLayout": "vertical",
    "hideAllDetails": false,
    "openPortLinksInCmuxBrowser": true,
    "openPullRequestLinksInCmuxBrowser": true,
    "showBranchDirectory": true,
    "showCustomMetadata": true,
    "showLog": true,
    "showNotificationMessage": true,
    "showPorts": true,
    "showProgress": true,
    "showPullRequests": true,
    "showSSH": true,
  },

  "sidebarAppearance": {
    "darkModeTintColor": null,
    "lightModeTintColor": null,
    "matchTerminalBackground": false,
    "tintColor": "#000000",
    "tintOpacity": 0.1555706521739131,
  },

  "automation": {
    "claudeBinaryPath": "",
    "claudeCodeIntegration": true,
    "portBase": 9100,
    "portRange": 10,
    "socketControlMode": "cmuxOnly",
    "socketPassword": "",
  },

  "browser": {
    "defaultSearchEngine": "google",
    "hostsToOpenInEmbeddedBrowser": [],
    "insecureHttpHostsAllowedInEmbeddedBrowser": [
      "localhost",
      "127.0.0.1",
      "::1",
      "0.0.0.0",
      "*.localtest.me",
    ],
    "interceptTerminalOpenCommandInCmuxBrowser": true,
    "openTerminalLinksInCmuxBrowser": true,
    "reactGrabVersion": "0.1.29",
    "showImportHintOnBlankTabs": true,
    "showSearchSuggestions": true,
    "theme": "system",
    "urlsToAlwaysOpenExternally": ["localhost"],
  },
}
```

### 3.4 关键设置说明

| 设置                                                | 值              | 作用                                   |
| --------------------------------------------------- | --------------- | -------------------------------------- |
| `app.minimalMode`                                   | `true`          | 隐藏工作区标题栏，控件移到侧边栏       |
| `sidebarAppearance.tintOpacity`                     | `0.156`         | 侧边栏底色透明度（从默认 `0.18` 微调） |
| `browser.hostsToOpenInEmbeddedBrowser`              | `[]`            | 空数组 = 所有链接默认在内嵌浏览器打开  |
| `browser.urlsToAlwaysOpenExternally`                | `["localhost"]` | localhost 强制走外部浏览器             |
| `browser.insecureHttpHostsAllowedInEmbeddedBrowser` | `localhost` 等  | 这些 HTTP 地址不弹不安全警告           |

编辑后重载：

```bash
cmux reload-config
```

---

## 4. Dock 右侧边栏配置

### 4.1 Dock 功能概述

Dock 是 cmux 的右侧边栏终端控制面板，可以把常用的 TUI 工具钉在右侧边栏，不占用主终端空间。

- 每个 Dock 面板都是一个独立的 Ghostty 终端实例
- 保持正常键盘行为（j/k、Ctrl-C 等）
- 命令退出后自动进入交互式 shell，方便后续操作

### 4.2 配置结构

Dock 通过 JSON 配置文件管理，支持两层优先级：

| 路径                       | 用途       | 适用场景                                       |
| -------------------------- | ---------- | ---------------------------------------------- |
| `.cmux/dock.json`          | 项目级配置 | 项目专属的 TUI 工具（如特定项目的 dev server） |
| `~/.config/cmux/dock.json` | 全局配置   | 个人默认 Dock，所有项目通用                    |

**优先级规则**：项目级 > 全局。如果项目目录下存在 `.cmux/dock.json`，则忽略全局配置。

### 4.3 全局 Dock 配置

`~/.config/cmux/dock.json`（个人全局）：

```json
{
  "controls": [
    {
      "id": "git",
      "title": "Git",
      "command": "lazygit",
      "cwd": ".",
      "height": 400
    }
  ]
}
```

全局只保留 `lazygit`，因为其他功能（文件浏览、搜索）已经有左侧边栏常驻了。

### 4.4 字段说明

```json
{
  "controls": [
    {
      "id": "stable-unique-id", // 稳定唯一的标识符
      "title": "面板标题", // Dock 头部显示的标签
      "command": "要执行的命令", // 在登录 shell 中运行
      "cwd": ".", // 可选：工作目录
      "height": 400, // 可选：面板高度（points）
      "env": { "KEY": "value" } // 可选：环境变量（非机密）
    }
  ]
}
```

### 4.5 启用 Dock Beta 功能

Dock 目前是 Beta 功能，需要先手动启用：

1. 进入 cmux 设置 → **Beta Features**
2. 打开 **Dock** 开关
3. 完全退出 cmux App，重新打开

**踩坑**：

- **Dock 开关不在 `cmux.json` 里**——这是 App 级别的 Beta 功能，无法通过配置文件开启
- **右侧边栏需要手动打开**——按 `Cmd+Opt+B` 切换右侧边栏可见性，或 `Cmd+Shift+P` 打开命令面板搜索 "Show Sidebar Dock"
- **快捷键绑定**——在 `cmux.json` 的 `shortcuts.bindings` 中添加：
  ```json
  "toggleFileExplorer": "cmd+opt+b",   // 右侧边栏开关
  "focusRightSidebar": "cmd+shift+e"   // 聚焦右侧边栏
  ```

### 4.6 Trust Gate（信任确认）

项目级 Dock 配置第一次使用时会弹出信任确认——因为项目配置能执行任意命令，cmux 做了安全检查。全局配置不会弹。

### 4.7 命令退出后的行为

Dock 面板里的命令退出后（比如 lazygit 按了 q），面板不会消失，而是**自动进入交互式 shell**，可以继续操作或输入新命令。

---

## 5. Claude Code Teams / OMC 集成

cmux 内置对 Claude Code Teams 和 Oh My Claude Code (OMC) 的支持：

```bash
# Claude Code Teams（ teammate 面板自动转为 cmux splits）
cmux claude-teams

# OMC 多代理编排
cmux omc
```

原理：创建 tmux shim 脚本，拦截 OMC/Claude 的 tmux 命令并翻译为 cmux API 调用。

---

## 5. CDK Exchanger Skill 开发实录

基于 cmux-browser 开发了一个项目级 Skill，用于《向僵尸开炮BT版》每日签到 CDK 自动填表。

### 5.1 需求分析

手动兑换流程繁琐：

1. 打开 `https://jsbt.thecm8.com/index/cdk/`
2. 关闭公告弹窗
3. 选区服 → 填账号 → 点击获取角色
4. 选角色 → 填 CDK
5. 看验证码 → 输入 → 点击领取

前 4 步完全固定，可以自动化；第 5 步验证码需手动（OCR 识别率太低）。

### 5.2 技术方案

- **页面自动化**：cmux-browser API（`open`、`click`、`fill`、`select`、`eval`）
- **弹窗处理**：snapshot 获取元素 ref，点击 Close
- **角色获取**：点击"获取"后轮询 `roles.options.length`，再用 eval 遍历匹配角色名
- **验证码**：脚本填完表单后退出，用户在浏览器面板手动输入

### 5.3 踩坑记录

| 问题                                 | 原因                   | 解决                                       |
| ------------------------------------ | ---------------------- | ------------------------------------------ |
| Bash 3.2 不支持中文关联数组          | macOS 默认 Bash 3.2    | 改用 `case` 函数映射区服                   |
| cmux browser eval 不支持 `return`    | 执行环境限制           | 用全局变量 `window.__rv` 传值              |
| `click --snapshot-after` 后 URL 没变 | 单页应用弹窗，非跳转   | 用 `eval` 直接 `window.location.href` 导航 |
| 验证码提交后自动刷新                 | 后端每次生成新验证码   | 脚本不处理提交，留给用户手动               |
| tesseract OCR 识别率接近 0           | 验证码有干扰线、粘连字 | 直接弃用 OCR，改手动输入                   |

### 5.4 最终脚本

`claudecode/.claude/skills/cdk-exchanger/scripts/exchange.sh`：

- 参数硬编码（十区 / 18507730419 / seeing / js2024666）
- 5 步自动化：打开页面 → 关弹窗 → 填表单 → 获取角色 → 提示手动完成
- 仅通过 `/cdk-exchanger` 命令触发

### 5.5 文件结构

```
claudecode/.claude/skills/cdk-exchanger/
├── SKILL.md              # Skill 说明
└── scripts/
    └── exchange.sh       # 主脚本
```

---

## 6. 当前完整终端工具链

| 层级     | 工具                | 说明                                     |
| -------- | ------------------- | ---------------------------------------- |
| 终端     | **cmux**            | 基于 Ghostty，垂直 Tab，支持浏览器自动化 |
| Shell    | **zsh + oh-my-zsh** | Powerlevel10k 主题，git/autojump 插件    |
| 文件管理 | **Yazi**            | 终端文件管理器，Vim 快捷键               |
| Git      | **lazygit**         | 终端 Git TUI                             |
| 编辑器   | **Fresh**           | 终端编辑器，VS Code 快捷键               |
| 搜索     | **fzf + ripgrep**   | 模糊搜索 + 快速文本搜索                  |
| 跳转     | **zoxide**          | 智能 cd，关键词匹配                      |
| 查看     | **bat + eza**       | 语法高亮 cat + 图标版 ls                 |

---

## 总结

从 iTerm2 到 cmux 的迁移已全部完成：

1. **视觉还原**：Dracula 主题、Hack Nerd Font 13、背景图、光标样式，与 iTerm2 完全一致
2. **能力升级**：cmux-browser 让终端具备了浏览器自动化能力，可以操作网页、填表、抓数据
3. **工作流自动化**：基于 cmux-browser 开发了 CDK 自动填表 Skill，每日签到从 5 步手动操作缩减为 1 步（只看验证码）
4. **项目级隔离**：Skill 放在项目 `.claude/skills/` 下，不污染全局

---

## 7. cmux 与 iTerm2 内存占用对比实录

### 7.1 现象

迁移到 cmux 后发现 Lemon（腾讯柠檬清理）显示 cmux 内存占用高达 **2-3 GB**，而 iTerm2 仅 338 MB。产生疑问：cmux 本身是否比 iTerm2 更吃内存？

### 7.2 排查过程

**第一步：拆解 cmux 进程树**

```bash
ps -eo pid,ppid,rss,comm | grep -E "cmux|claude"
```

发现 cmux 主进程本身只有 **~180 MB**，但底下挂了多个 Claude Code 会话，每个 300-400 MB。

**第二步：对比统计口径**

| 终端          | Claude 归属                   | Lemon 显示                     |
| ------------- | ----------------------------- | ------------------------------ |
| cmux          | Claude 是 cmux 的直接子孙进程 | **全部归到 cmux** 名下         |
| iTerm2 + tmux | Claude 是 tmux → zsh 的子进程 | **tmux 单独统计**，不归 iTerm2 |

**关键发现**：iTerm2 的 338 MB 只是 iTerm2 自身，Claude 进程挂在 tmux 名下，Lemon 不会把它们加在一起。

**第三步：关掉自动挂载对比**

将 `automation.claudeCodeIntegration` 从 `true` 改为 `false`：

- 之前：cmux 2-3 GB（含多个自动挂载的 Claude 会话）
- 之后：cmux ~1.2 GB（仅剩当前会话）

**结论**：内存高不是 cmux 本身的问题，而是 `claudeCodeIntegration: true` 时，每个新终端 tab 都会自动启动一个 Claude Code 进程。

### 7.3 隐藏的常驻进程

排查中还发现一个**不属于 cmux 但挂在 cmux 名下**的进程：

```
PPID 11689 → /Users/xiangwang/.bun/bin/bun .../claude-mem/10.6.2/scripts/worker-service.cjs --daemon
```

这是 **claude-mem MCP 插件的守护进程**（常驻后台搜索服务），PID 88742，常驻内存 ~280 MB。它是 `--daemon` 模式，不会自动退出。

### 7.4 统计口径差异

`ps` 统计的 cmux 直系子进程 ~1 GB，但 Lemon 显示 1.6-2 GB，差距来自：

| 来源                | ps 能看到  | Lemon 统计 |
| ------------------- | ---------- | ---------- |
| cmux 主进程         | 181 MB     | ✓          |
| Claude 会话         | 400-500 MB | ✓          |
| claude-mem 守护进程 | 280 MB     | ✓          |
| GPU 渲染内存        | **看不到** | ✓          |
| 共享库 / 系统框架   | **看不到** | ✓          |

cmux 基于 Metal GPU 加速，内嵌浏览器引擎、字体缓存等共享内存 `ps` 的 RSS 不计入，但系统级监控工具会算进去。

### 7.5 关键决策

**是否关掉 `claudeCodeIntegration`？**

| 方案                | 内存                           | 通知                                   | 便利性 |
| ------------------- | ------------------------------ | -------------------------------------- | ------ |
| `true`（自动挂载）  | 高（每个 tab 自动启动 Claude） | **有**（cmux dock badge / pane flash） | 高     |
| `false`（手动启动） | 低（需要时才启动 Claude）      | **无**（通知通道断开）                 | 低     |

**最终选择**：改回 `true`。因为桌面通知和 Claude 完成任务的反馈对 workflow 更重要，内存开销是 Claude Code 本身特性，不是 cmux 的问题。

### 7.6 踩坑

- **Homebrew formula 版本滞后**：`brew info claude-code` 显示 2.1.126，但实际 cmux 内置版本已是 2.1.138。Claude Code 不是通过 Homebrew 安装的，而是通过 cmux 内置的 `/Applications/cmux.app/Contents/Resources/bin/claude`。
- **Agent View 需要 v2.1.139**：当前 cmux 内置版本 2.1.138 尚不支持，需等 cmux App 更新。
- **claude-mem 守护进程常驻**：如果不需要跨会话记忆检索，可以在 `/config` 里移除 claude-mem MCP server 来释放 ~280 MB 内存。

### 7.7 经验

1. **cmux 自身内存并不高**（~180 MB），高的是它集成的 AI 代理进程
2. **每个 Claude Code 会话 ~300-400 MB** 是正常开销，跟终端无关
3. **监控工具的统计口径不同**会导致认知偏差——Lemon 把 cmux 所有子孙进程都算到 cmux 头上，而 iTerm2 的 Claude 进程被 tmux 隔离了
4. **不要凭单一监控工具做判断**，要结合 `ps`、`top`、Activity Monitor 多方验证

---

## 8. Agent View 初探

Claude Code v2.1.139 新增了 **Agent View**（研究预览），是一个统一的会话管理界面：

```bash
claude agents          # 打开 Agent View
claude --bg "prompt"   # 直接后台启动会话
```

**核心能力**：

- 一个屏幕管理所有后台会话（运行中 / 等待输入 / 已完成）
- 输入 prompt 直接派发新会话并行工作
- `Space` peek 查看会话状态，`Enter` attach 进入完整对话
- `←` detach 回到列表，会话继续后台运行
- `Ctrl+X` 停止/删除会话
- `Ctrl+S` 按状态或目录分组

**与 iTerm2 + tmux 的区别**：Agent View 的会话由 supervisor 进程托管，不依赖终端附着，关闭 cmux 后会话仍继续运行。tmux 的会话则必须保持 tmux server 运行。

---

下一步可探索：

- cmux-markdown 实时预览写文档
- cmux.json 自定义命令绑定快捷键
- 更多浏览器自动化场景（自动化测试、数据抓取）
- Agent View 实际使用体验
