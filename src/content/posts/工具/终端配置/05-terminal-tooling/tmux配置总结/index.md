---
title: "tmux配置总结"
published: 2026-05-20
description: "在终端开发中，tmux 是必备工具。本文记录从零搭建一套实用 tmux 配置的过程，包括状态栏美化、快捷键优化、复制模式打通系统剪贴板等。"
tags: ["终端配置", "05-terminal-tooling"]
category: "工具"
image: api
draft: false
---
# tmux 配置总结

## 背景

在终端开发中，tmux 是必备工具。本文记录从零搭建一套实用 tmux 配置的过程，包括状态栏美化、快捷键优化、复制模式打通系统剪贴板等。

---

## 配置文件路径

`~/.tmux.conf`

---

## 基础设置

### 终端与按键优化

```tmux
# 终端类型与真彩色支持
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",xterm-256color:Tc"
set -s escape-time 50          # 加快按键响应（默认500ms）
set -g focus-events on
```

- `escape-time 50`：将按键延迟从 500ms 降到 50ms，组合键响应更快
- `terminal-overrides Tc`：启用真彩色，终端内 vim/nvim 等工具颜色正确显示

### 窗口编号与命名

```tmux
set -g base-index 1                    # 从 1 开始编号（默认 0）
set -g renumber-windows on             # 关闭当前窗口后自动重排编号
set-window-option -g automatic-rename off  # 关闭自动重命名，保留手动命名
```

### 多客户端优化

```tmux
setw -g aggressive-resize on  # 每个窗口大小按该窗口客户端调整，不被最大客户端撑大
```

### 历史记录与鼠标

```tmux
set -g history-limit 50000
set -g mouse on  # 点击切换窗格、滚轮查看历史
```

### 活动监控

```tmux
setw -g monitor-activity on  # 非活跃窗口有输出时状态栏闪烁提示
```

### 分屏编号颜色

```tmux
set-option -g display-panes-active-colour colour166  # 橙色（激活 pane）
set-option -g display-panes-colour colour33           # 蓝色（普通 pane）
```

---

## 快捷键

### 面板切换

```tmux
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -n M-Up select-pane -U
bind -n M-Down select-pane -D
```

Alt + 方向键切换 pane，无需先按 prefix。

### 窗口切换

```tmux
bind -n M-1 select-window -t 1
bind -n M-2 select-window -t 2
bind -n M-3 select-window -t 3
bind -n M-4 select-window -t 4
```

Alt + 数字直接跳转窗口。

### 分屏（保留当前路径）

```tmux
bind | split-window -h -c "#{pane_current_path}"  # 垂直分屏
bind - split-window -v -c "#{pane_current_path}"  # 水平分屏
bind c new-window -c "#{pane_current_path}"       # 新窗口保留当前目录
```

`-c "#{pane_current_path}"` 确保新开分屏/窗口时工作目录不变。

---

## Vi 复制模式 + 系统剪贴板

```tmux
set-window-option -g mode-keys vi

if-shell -F "#{>=:#{version},3.2}" {
    bind-key -T copy-mode-vi v send -X begin-selection
    bind-key -T copy-mode-vi y send -X copy-pipe-and-cancel "pbcopy"
    bind-key -T copy-mode-vi C-v send -X rectangle-toggle
    set -g copy-mode-match-style "bg=colour136,fg=colour235"
    set -g copy-mode-current-match-style "bg=colour166,fg=colour235,bold"
    set -s set-clipboard on
    set -s copy-command "pbcopy"
}
```

**效果**：在 tmux 复制模式里选中文字后按 `y`，内容自动写入 macOS 系统剪贴板，可以直接在浏览器/VS Code 里 `⌘+V` 粘贴。

操作流程：

1. `Ctrl+B` 进入复制模式
2. `v` 开始选择
3. 方向键 / hjkl 移动选择
4. `y` 复制（同时写入系统剪贴板）
5. `C-v` 切换为矩形选择模式

---

## 状态栏配置

### 整体布局

```
[会话名] | [窗口列表] | [prefix提示] | [时间] | [日期]
 左侧        中间         右侧          右侧     右侧
```

### 配色方案

| 元素       | 前景色            | 背景色            | 效果 |
| ---------- | ----------------- | ----------------- | ---- |
| 会话名     | colour16（黑）    | colour81（亮蓝）  | bold |
| 当前窗口   | colour16（黑）    | colour81（亮蓝）  | bold |
| 非活跃窗口 | colour248（亮灰） | colour234（深灰） | 默认 |
| 时间       | colour255（白）   | colour240（中灰） | 默认 |
| 日期       | colour220（亮黄） | colour234（深灰） | bold |

### 配置代码

```tmux
set -g status-left-length 40
set -g status-right-length 150

# 左侧：会话名（亮蓝色箭头样式）
set -g status-left '#[fg=colour16,bg=colour81,bold] 󰣇 #S #[fg=colour81,bg=colour234,nobold]'

# 右侧：时间 + 日期（带箭头分隔）
set -g status-right '#[fg=colour234,bg=colour240]#[fg=colour255,bg=colour240] %H:%M:%S #[fg=colour240,bg=colour234,nobold]#[fg=colour220,bg=colour234,bold] %Y-%m-%d #{prefix_highlight} '

# 窗口列表
setw -g window-status-format '#[fg=colour248,bg=colour234] #I:#W '
setw -g window-status-current-format '#[fg=colour16,bg=colour81,bold] #I:#W #[fg=colour81,bg=colour234,nobold]'
setw -g window-status-separator ''

# 状态栏基础样式
set -g status-style 'bg=colour234,fg=colour255'
set -g status-interval 1
```

### iTerm2 集成注意事项

iTerm2 自带 tmux 状态栏集成功能，会用自己的主题覆盖 `.tmux.conf` 配置。

**解决方法**：

1. iTerm2 → Preferences (⌘,)
2. Profiles → Terminal → 找到 Status bar
3. 将 Enabled 改为 No 或 Only when tmux status line is off

---

## tmux-prefix-highlight 插件

### 安装

```bash
git clone https://github.com/tmux-plugins/tmux-prefix-highlight.git ~/.tmux/plugins/tmux-prefix-highlight
```

### 配置

```tmux
set -g @prefix_highlight_output_prefix '#[fg=colour196,bg=colour234] '
set -g @prefix_highlight_output_suffix ''
set -g @prefix_highlight_copy_mode_attr 'fg=colour196,bg=colour234,bold'
set -g @prefix_highlight_show_copy_mode 'on'

run-shell '~/.tmux/plugins/tmux-prefix-highlight/prefix_highlight.tmux'
```

**效果**：按下 `Ctrl+B` 后，状态栏右侧显示红色提示，告知 prefix 已激活。进入复制模式时也会高亮。

---

## 配置参考来源

参考了 [tony/tmux-config](https://github.com/tony/tmux-config) 的配置，借鉴了：

- `escape-time` 优化
- `aggressive-resize` 多客户端优化
- Vi 复制模式快捷键
- 分屏保留当前路径
- 系统剪贴板集成
- 活动监控

---

## 插件评估

从 tmux-plugins 官方列表中评估过，最终选择**只装 tmux-prefix-highlight**，其他如 tmux-resurrect、tmux-continuum、tmux-yank 等暂不安装，原因：

- 当前需求通过基础配置已满足
- 越少插件 = 越少维护成本
- 系统剪贴板功能已通过 `copy-command "pbcopy"` 实现

---

## 重新加载配置

每次修改配置后执行：

```bash
tmux source-file ~/.tmux.conf
```

或在 tmux 内按 `Ctrl+B` 然后按 `r`（已绑定快捷命令）。

---

## 完整配置文件

见 `~/.tmux.conf`，当前配置按功能模块分为：

1. 基础设置（终端、按键、窗口编号、历史记录）
2. 快捷键（面板切换、窗口切换、分屏）
3. Vi 复制模式 + 系统剪贴板
4. 状态栏配置
5. tmux-prefix-highlight 插件

---

最后更新：2026-04-23
