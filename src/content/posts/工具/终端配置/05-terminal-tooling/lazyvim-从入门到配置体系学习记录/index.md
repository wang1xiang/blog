---
title: "LazyVim-从入门到配置体系学习记录"
published: 2026-05-25
description: "LazyVim 不是“帮你省掉学习 Vim 的发行版”，而是把现代 Neovim 插件生态整理成一套可用默认值，让开发者把注意力放回 Vim 的组合式编辑模型。"
tags: ["终端配置", "05-terminal-tooling"]
category: "工具"
image: api
draft: false
---
# LazyVim 从入门到配置体系学习记录

## 总体判断

LazyVim 不是“帮你省掉学习 Vim 的发行版”，而是把现代 Neovim 插件生态整理成一套可用默认值，让开发者把注意力放回 Vim 的组合式编辑模型。

它解决的核心问题不是“不会配置 Neovim”，而是：现代开发需要 LSP、TreeSitter、picker、Git、formatter、diagnostics、testing、debugging 等大量插件，而 Neovim 原生能力虽然强，但默认体验分散。LazyVim 的价值在于把这些能力组织成一致入口，同时保留 Vim 的编辑语言。

学习 LazyVim 的正确顺序应该是：先学 Vim 的编辑语法，再学 LazyVim 给这些能力配好的入口，最后才学插件配置和扩展。不要一上来研究插件，否则容易陷入“配置娱乐”。

## 基础心智模型

### Modal editing

Vim 的核心不是快捷键，而是模式切换：

| 模式    | 用途                 |
| ------- | -------------------- |
| Normal  | 移动、操作、组合命令 |
| Insert  | 输入文本             |
| Visual  | 选择文本             |
| Command | 执行命令             |

常用入口：

```text
i   当前光标前插入
a   当前光标后插入
I   行首插入
A   行尾插入
o   下方新开一行
O   上方新开一行
gi  回到上次插入位置
Esc 回 Normal
```

关键理解：Insert mode 只负责输入，Normal mode 才是真正的编辑状态。不要长期停在 Insert mode。

### 移动体系

基础移动是 `h/j/k/l`，但真正应该练的是更高层的语义移动：

```text
w / e / b / ge
W / E / B / gE
0 / ^ / $ / g_
gg / G / 100G
Ctrl-d / Ctrl-u
Ctrl-f / Ctrl-b
zt / zz / zb
f / F / t / T
s
Ctrl-o / Ctrl-i
```

`Ctrl-o` 和 `Ctrl-i` 类似浏览器后退/前进。`s` 来自 Flash.nvim，是 LazyVim 现代化跳转的重要入口。

## Vim 编辑语言

### `verb + motion`

Vim 的第一个核心语法是：

```text
<verb><count><motion>
```

示例：

```text
dw      删除一个 word
d2w     删除两个 word
c$      改到行尾
dd      删除整行
cc      改整行
```

常用命令：

```text
d{motion}
c{motion}
D
C
dd
cc
x
X
r<char>
J
gJ
u
<C-r>
.
```

`.` 是 Vim 编辑模型的放大器：先做一次可重复编辑，再用 `.` 复制动作。

### `verb + text object`

第二个核心语法是：

```text
<verb><context><object>
```

其中：

```text
i = inside
a = around
```

常用示例：

```text
diw   delete inside word
daw   delete around word
ci"   change inside quotes
da"   delete around quotes
di(   delete inside parentheses
da(   delete around parentheses
```

LazyVim 增强对象：

```text
caq / ciq   quote object
dib / dab   bracket object
yig         indent object
```

Surround 相关：

```text
cS
dS
yS
gsa
gsd
gsr
```

Text object 是 Vim 真正拉开差距的地方。它让编辑从“手动选择一段文本”变成“对语义对象执行动作”。

## 文件、搜索和导航

### 文件打开

LazyVim 默认文件入口主要有三种：

| 工具            | 用途                        |
| --------------- | --------------------------- |
| Snacks picker   | 快速搜索文件                |
| Snacks explorer | 类似文件树                  |
| mini.files      | 更接近可编辑文件系统 buffer |

常用快捷键：

```text
<Space><Space>  找文件
<Space>ff       find files
<Space>e        左侧导航
<Space>fm       mini.files
```

如果工作流以 tmux + Claude Code 为主，文件打开优先练 picker-first：`<Space><Space>`、`<Space>/`、`<Space>ff`，而不是依赖文件树。

### 搜索

当前文件搜索：

```text
/pattern
?pattern
n
N
3n
```

大小写控制：

```text
\C
\c
:set noignorecase
:set ignorecase
```

项目搜索：

```text
<Space>/
Alt-s
Alt-t
[q / ]q
```

关键区别：`/` 使用 Vim regex，`<Space>/` 使用 ripgrep regex。

### LSP 导航

常用 LSP 导航：

```text
gd       go to definition
gr       references
K        hover
```

Symbols：

```text
<Space>ss
<Space>sS
<Space>sR
Control-q
Alt-t
```

最重要的组合是：

```text
gd
Ctrl-o
```

`gd` 负责跳进去，`Ctrl-o` 负责回来。两者必须成对练。

Picker 和 Trouble 的区别：Picker 负责查找、筛选、快速跳转；Trouble 负责保留一组结果并逐项处理。

## Buffer、Window、Tab、Session

LazyVim 中这些概念不能按 VS Code 标签页理解：

| 概念    | 正确理解                           |
| ------- | ---------------------------------- |
| Buffer  | 打开的文件内容                     |
| Window  | 一个显示 buffer 的视图/pane        |
| Tab     | 一组 window 布局                   |
| Session | buffers/windows/tabs/layout 的保存 |

常用 buffer 操作：

```text
H / L
[b / ]b
<Space>,
<Space>bd
<Space>bD
```

Window：

```text
<Space>wv
<Space>ws
<Space>|
<Space>-
Ctrl-h / Ctrl-j / Ctrl-k / Ctrl-l
<Space>wq
<Space>wc
<Space>wo
<Space>w<Space>
```

Session：

```text
<Space>qq
<Space>qs
<Space>qS
<Space>qd
```

对 tmux 用户来说，Neovim window 和 tmux pane 容易重叠。更稳妥的做法是保持 Neovim 内部布局简单，不要同时把两边都复杂化。

## 语言支持、诊断和格式化

LazyVim 语言支持不是一个整体系统，而是多个工具的组合：

```text
Mason + LSP + TreeSitter + formatter + linter + diagnostics
```

常用入口：

```text
<Space>cm       Mason
<Space>cl       LSP info
:LspRestart
:checkhealth
:checkhealth vim.lsp
:checkhealth mason
:LazyHealth
```

Diagnostics：

```text
[d / ]d
[w / ]w
[e / ]e
<Space>cd
```

Trouble：

```text
<Space>x
<Space>xx
<Space>xX
```

Code action / format：

```text
<Space>ca
<Space>cf
```

典型 LSP 配置：

```lua
return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        -- server config
      },
    },
  },
}
```

典型 formatter 配置：

```lua
return {
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        typescript = { "prettier" },
      },
    },
  },
}
```

排查问题时不要笼统说“LazyVim 坏了”，要拆成 Mason、LSP、TreeSitter、formatter、linter、diagnostics 分别检查。

## 搜索替换和批量编辑

当前文件替换：

```vim
:s/pattern/replacement
:%s/pattern/replacement/g
:%s/pattern/replacement/gc
:s//replacement/
:%sg
```

项目替换：

```text
<Space>sr
```

rip-substitute：

```text
g/
```

批量 Normal：

```vim
:%norm commands
:<range>norm @q
```

Global command：

```vim
:%g/pattern/d
:g!/pattern/command
```

Vim 的批量编辑不只是 search/replace，更强的是“搜索筛选范围 + 对每一行执行 Normal 命令”，也就是 `:g` 和 `:norm` 的组合。

## Git 工作流

Git picker：

```text
<Space>gs
<Tab>
<Space>gl
:lua Snacks.picker.git_branches()
```

gitsigns/hunk：

```text
<Space>gh
[h / ]h
<Space>ghS
<Space>ghs
<Space>ghr
<Space>ghR
<Space>ghu
<Space>ghb
<Space>ghp
<Space>ghd
<Space>ghD
```

lazygit：

```text
<Space>gg
```

diff：

```bash
nvim -d file1 file2
```

```vim
:diffoff
:diffget
:diffput
do
dp
[c / ]c
```

对 Claude Code + CLI 工作流来说，不必把 Git 全搬进编辑器。最值得掌握的是看 hunk、stage/reset hunk、preview hunk 和进入 lazygit。

## AI、调试和测试

### AI

作者对 AI 的判断很现实：AI 很强，但不总是节省时间；AI 出错后的修正成本经常抵消收益。

作者更偏向在独立终端运行 Claude Code、Gemini CLI、Codex，而不是在 LazyVim 内深度集成 AI。

Sidekick.nvim 入口：

```text
<Space>a
<Space>aa
<Space>af
<Space>av
<Space>at
<Space>ap
```

Copilot Chat 魔法字符：

```text
#   添加上下文
>   持久上下文/会话级指令
$   选择模型
/   prompt
@   tool
```

上下文示例：

```text
#file:path/to/file.ext
#buffer:active
#buffer:visible
#selection
#url:<url>
```

对当前 Claude Code + tmux 工作流来说，不建议为了“Neovim 里也能 AI”而装一堆 AI 插件。Claude Code 已经是主力，Neovim 最多需要轻量入口，甚至完全不需要。

### Debugging

DAP 即 Debug Adapter Protocol。LSP 统一编辑器和语言服务，DAP 统一编辑器和调试器。

启用：

```text
dap.core
lang.python
lang.go
```

调试快捷键：

```text
<Space>d
<Space>db
<Space>da
<Space>dc
<Space>du
<Space>dB
<Space>dl
<Space>dO
<Space>do
<Space>di
```

调试器的真实成本在项目环境，不在编辑器 UI。LazyVim 的 DAP 体验不差，但每个语言、容器、路径映射都会有坑。前端场景下 Chrome DevTools 仍然更自然。

### Testing

核心插件是 Neotest。

启用：

```text
test.core
lang.python
```

常用快捷键：

```text
<Space>t
<Space>tt   当前文件测试
<Space>tr   当前测试
<Space>tT   全项目测试
<Space>ts   summary
<Space>tw   watch
<Space>td   debug test
<Space>to   最近输出浮窗
<Space>tO   输出窗口
```

Vitest adapter 示例：

```lua
return {
  { "marilari88/neotest-vitest" },
  {
    "nvim-neotest/neotest",
    opts = {
      adapters = { "neotest-vitest" },
    },
  },
}
```

Neotest 对 TDD 很有价值，但前提是项目测试框架稳定。JS/TS 不会因为开启 TypeScript Extra 就自动支持 vitest/jest，需要明确选择 adapter。

## LazyVim 配置体系

插件目录：

```text
~/.config/nvim/lua/plugins
```

如果使用 `NVIM_APPNAME`：

```text
~/.config/$NVIM_APPNAME/lua/plugins
```

单插件：

```lua
return {
  "user/repo",
  opts = {},
  keys = {},
}
```

多插件：

```lua
return {
  { "user/one", opts = {} },
  { "user/two" },
}
```

插件 spec 会合并：`opts` 可以合并，`keys` 可以合并，但 `config` 不会像 `opts` 那样合并。

最重要原则：能用 `opts` 就不要用 `config`。

推荐写法：

```lua
return {
  "user/plugin",
  opts = {
    key = "value",
  },
}
```

避免直接写：

```lua
require("plugin").setup({
  key = "value",
})
```

特殊情况下才写：

```lua
return {
  "user/plugin",
  opts = {},
  config = function(plugin, opts)
    require("plugin").setup(opts)
  end,
}
```

普通选项放在：

```text
lua/config/options.lua
```

示例：

```lua
vim.opt.number = true
vim.opt.wrap = false
```

全局变量：

```lua
vim.g.varname = value
```

Autocmd 放在：

```text
lua/config/autocmds.lua
```

示例：

```lua
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  pattern = "*.svx",
  command = "setlocal filetype=markdown",
})
```

项目级配置使用：

```text
.lazy.lua
```

示例：

```lua
return {
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        typescript = { "biome" },
      },
    },
  },
}
```

配置纪律：

1. 插件配置进 `lua/plugins`。
2. 普通选项进 `lua/config/options.lua`。
3. autocmd 进 `lua/config/autocmds.lua`。
4. 项目差异进 `.lazy.lua`。
5. 优先 `opts`。
6. 慎用 `config`。
7. 插件异常先试 `lazy = false`。
8. 不要复制大段默认配置，除非 `opts` 覆盖不了。

## 对 Claude Code + tmux 工作流的取舍

当前工作流以 Claude Code + tmux 为主，因此不建议把 LazyVim 搞成完整 IDE。更合适的方向是极简辅助。

推荐保留：

- LazyVim 默认 LSP
- TreeSitter
- picker
- diagnostics
- formatter
- gitsigns
- lazygit
- basic testing，可选
- minimal theme

暂不建议折腾：

- Avante.nvim
- 多套 AI chat 插件
- 复杂 DAP 容器调试
- 过度 session/tab/window 工作流
- 大量 snippets
- 大量主题切换
- 花时间优化 lazy loading

最值得定制的点：

1. TypeScript / Vue / Node.js extras。
2. Prettier / Biome 的项目级 `.lazy.lua`。
3. tmux pane 和 Neovim window 快捷键不要冲突。
4. clipboard 行为是否和系统剪贴板同步。
5. 是否禁用 bufferline 或 explorer，保持极简。
6. Git hunk 和 lazygit 快捷键保留。
7. 不内置复杂 AI，把 Claude Code 放 tmux pane。

## 7 天最小练习路线

### 第 1 天：模式和移动

```text
Esc
i / a / o
w / e / b
0 / ^ / $ / g_
gg / G
Ctrl-d / Ctrl-u
s
```

目标：减少 `hjkl` 连按。

### 第 2 天：编辑语言

```text
dw
cw
dd
cc
D
C
ci"
di(
daw
.
u
<C-r>
```

目标：开始用“句子”编辑，而不是手动选。

### 第 3 天：文件和搜索

```text
<Space><Space>
<Space>ff
<Space>/
/
n / N
Ctrl-o / Ctrl-i
```

目标：能在项目里快速打开和定位。

### 第 4 天：LSP 和 diagnostics

```text
gd
gr
K
<Space>ca
<Space>cf
[d / ]d
<Space>x
```

目标：能读代码、跳定义、处理错误。

### 第 5 天：buffer/window

```text
H / L
[b / ]b
<Space>,
<Space>bd
<Space>wv
<Space>ws
Ctrl-h/j/k/l
```

目标：理解 Neovim 工作区。

### 第 6 天：Git hunk

```text
[h / ]h
<Space>ghp
<Space>ghs
<Space>ghr
<Space>gg
```

目标：不用离开编辑器也能处理局部 diff。

### 第 7 天：再开始改配置

只改三类：

1. 明确不想要的插件。
2. 明确冲突的快捷键。
3. 明确项目需要的 formatter、linter、test adapter。

## 总结

LazyVim 的价值不是让 Neovim 像 VS Code，而是让 Vim 的编辑语言获得现代开发环境的支撑。

真正应该学的是：modal editing、motion、text object、register、macro、picker、quickfix/Trouble、LSP navigation、Lazy.nvim 配置合并模型。

真正不急着学的是：复杂 AI 插件、远程 DAP、自写 Neotest adapter、深度 lazy-loading 优化、大规模主题和 UI 调整。

落地时应先装一个极简 LazyVim，连续用 7 天，只记录阻碍工作的摩擦点。第 7 天再统一改配置，避免还没开始用就先配置三天。
