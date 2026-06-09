# 翔子的博客

个人技术博客，基于 Astro + Firefly 模板深度定制。

这个仓库现在不是原始 Firefly 模板的纯净副本，而是面向个人内容发布的博客项目：保留 Firefly 的内容系统、构建能力、评论、搜索、RSS、Sitemap 等基础能力，同时将核心阅读页面改造成一套极简单列设计。

## 当前状态

### 已改造成新版设计的页面

这些页面使用 `HomeLayout` 和 `src/components/pages/home/` 下的新组件：

- `/`：首页
- `/archive/`：归档页
- `/posts/[slug]/`：文章详情页
- `/about/`：关于页
- `/search/`：搜索页

### 仍保留 Firefly 旧布局的页面

这些页面仍使用 `MainGridLayout`、侧边栏和旧 widget 系统：

- `/friends/`
- `/bangumi/`
- `/gallery/`
- `/guestbook/`
- `/sponsor/`
- `/rss/`
- `/404`

因此不要直接删除 `MainGridLayout`、旧 Navbar/Footer、SideBar、widget 系统。删除旧代码前先确认引用关系并跑构建。

## 技术栈

- [Astro](https://astro.build/)
- TypeScript
- Svelte
- Tailwind CSS / Stylus
- Pagefind 本地搜索
- Biome 格式化与检查
- pnpm 包管理

## 环境要求

Astro 当前要求 Node.js 版本不低于 `22.12.0`。

推荐本地使用 Node 24：

```bash
nvm use 24
```

如果你在 `pnpm dev` 时看到类似错误：

```txt
Node.js v18.18.0 is not supported by Astro!
Please upgrade Node.js to a supported version: ">=22.12.0"
```

说明当前 shell 仍在使用旧 Node。可以执行：

```bash
nvm use 24 && pnpm dev
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 构建静态站点
pnpm build

# 预览构建结果
pnpm preview

# Astro 检查
pnpm check

# TypeScript 检查
pnpm type-check

# Biome 检查并自动修复
pnpm lint

# 格式化 src 目录
pnpm format

# 新建文章
pnpm new-post <filename>
```

> 注意：Pagefind 搜索索引只会在 `pnpm build` 后生成。`pnpm dev` 下搜索页只能验证 UI 和模拟搜索，真实搜索请使用 `pnpm build && pnpm preview`。

## 目录结构

```txt
src/
├── components/
│   ├── pages/home/          # 新版首页 / 归档 / 文章 / 关于 / 搜索组件
│   ├── layout/              # Firefly 旧布局组件
│   ├── widget/              # 旧侧边栏小部件
│   ├── common/              # 通用组件
│   ├── controls/            # 交互控件
│   ├── features/            # 全局功能组件
│   ├── comment/             # 评论系统
│   └── analytics/           # 统计脚本
├── config/                  # 站点配置
├── content/                 # Markdown / MDX 内容
├── layouts/
│   ├── Layout.astro         # 全局 HTML 壳、SEO、主题初始化、脚本
│   ├── HomeLayout.astro     # 新版极简页面布局
│   └── MainGridLayout.astro # Firefly 旧三栏布局
├── pages/                   # Astro 路由
├── styles/                  # 全局样式
└── utils/                   # 工具函数
```

更多组件说明见：

```txt
src/components/README.md
```

## 内容写作

文章位于：

```txt
src/content/posts/
```

文章 Frontmatter 示例：

```yaml
---
title: My First Blog Post
published: 2026-06-09
description: 文章摘要
tags: [Astro, Frontend]
category: 前端
draft: false
pinned: false
comment: true
---
```

常用字段：

| 字段           | 说明                             |
| -------------- | -------------------------------- |
| `title`        | 文章标题                         |
| `published`    | 发布时间                         |
| `updated`      | 更新时间，可选                   |
| `description`  | 摘要，会用于列表、搜索和 SEO     |
| `tags`         | 标签数组                         |
| `category`     | 分类                             |
| `draft`        | 是否草稿                         |
| `pinned`       | 是否优先展示在首页 Featured 卡片 |
| `comment`      | 是否开启评论                     |
| `password`     | 加密文章密码，可选               |
| `passwordHint` | 加密文章提示，可选               |

## 新版页面设计说明

新版页面采用 `HomeLayout`：

- 单列布局
- 无 Firefly 侧边栏
- 独立顶部导航与 Footer
- 统一 `oklch` 紫色主题
- 所有新版样式集中在 `src/components/pages/home/home.css`
- 样式以 `.home-page` 作用域隔离，避免污染旧布局页面

为了避免 Swup 局部切换导致样式丢失，核心导航链接使用 `data-no-swup` 走完整页面加载。

## 搜索

搜索页使用 Pagefind。

- 开发模式：模拟搜索结果，仅用于验证交互
- 构建模式：真实索引搜索

验证真实搜索：

```bash
nvm use 24
pnpm build
pnpm preview
```

然后访问：

```txt
http://localhost:4321/search/
```

## RSS 与 Sitemap

- `RSS`：给读者使用的订阅源，保留在可见 Footer 中
- `Sitemap`：给搜索引擎使用，不放在主 Footer 中，但构建时仍会生成

## 旧代码清理原则

删除旧代码前必须满足：

1. 使用 `rg` 确认没有实际代码引用
2. 不属于仍被 `MainGridLayout` 使用的旧布局系统
3. 不影响仍未迁移的页面
4. 删除后执行 `nvm use 24 && pnpm build` 通过
5. 删除操作单独提交，方便回滚

第一批高置信待清理候选见 `src/components/README.md`。

## 致谢

本项目基于 [Firefly](https://github.com/CuteLeaf/Firefly) 与 [Fuwari](https://github.com/saicaca/fuwari) 模板演进而来。保留原项目的基础能力，并在此基础上进行了个人博客设计与内容结构定制。

## License

本项目沿用上游模板的 MIT License。
