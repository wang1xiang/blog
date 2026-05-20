---
title: "2026-05-20-blog-v2-migration-design"
published: 2026-05-20
description: ""
tags: ["superpowers"]
category: "其他"
image: api
draft: false
---
# Blog V2 迁移设计 — VitePress → Astro Firefly

## 概述

将现有 VitePress 0.7.2 博客（221 篇文章，270M 内容）迁移到 Astro + Firefly 主题。采用新仓库并行策略，迁移完成后切换域名。

## 决策记录

| 决策     | 选择                  | 理由                       |
| -------- | --------------------- | -------------------------- |
| 仓库策略 | 新分支                | 旧仓库保留，迁移完再切域名 |
| 内容范围 | 全部迁移 221 篇       | 保留完整历史               |
| 部署平台 | GitHub Pages          | 与现有一致，零成本         |
| 分类策略 | 23→9 分类重映射       | 浏览体验更好               |
| 封面图片 | 随机封面（api）       | 省事且统一                 |
| 迁移方式 | 脚本批量 + 手动修异常 | 效率最高                   |

## 分类映射

| 新分类   | 旧目录                                 | 文章数 |
| -------- | -------------------------------------- | ------ |
| 算法     | leetcode                               | 44     |
| 工作     | work                                   | 39     |
| 前端框架 | vue, react, reactNative, taro, flutter | 32     |
| 前端工程 | vite, pnpm, electron, nest, node       | 37     |
| 编辑器   | tiptap, prosemirror, vscode            | 13     |
| 语言基础 | javascript, css, http                  | 21     |
| DevOps   | docker, git, linux                     | 10     |
| 工具     | tool, wechat, mobile                   | 21     |
| 其他     | webrtc, photography                    | 4      |

## 仓库结构

新分支 `v2`，基于 Firefly 模板初始化：

```
blog/
├── src/
│   ├── content/
│   │   └── posts/              # 按分类建子目录，图片在同目录 images/ 下
│   │       ├── 算法/
│   │       ├── 前端框架/
│   │       ├── 前端工程/
│   │       ├── 编辑器/
│   │       ├── 语言基础/
│   │       ├── DevOps/
│   │       ├── 工具/
│   │       ├── 工作/
│   │       └── 其他/
│   ├── assets/                 # 全局静态资源（favicon 等）
│   └── config/                 # Firefly 配置
├── public/
└── ...
```

## Frontmatter 转换规则

旧格式：

```yaml
---
date: 2025-2-12
title: 跟着卡哥学算法Day 1
tags:
  - leetcode
describe: 数组整体学习 & 常见题目
---
```

新格式：

```yaml
---
title: 跟着卡哥学算法Day 1
published: 2025-02-12
description: 数组整体学习 & 常见题目
tags: [leetcode]
category: 算法
image: api
draft: false
---
```

转换规则：

- `date` → `published`，日期格式统一为 `YYYY-MM-DD`（补零）
- `describe` → `description`
- `tags` 保留原有值，格式改为数组行内写法 `[tag1, tag2]`
- 新增 `category`：根据源目录映射到 9 个分类
- 新增 `image: api`（随机封面）
- 新增 `draft: false`
- `title` 不变

## 图片迁移

现有图片存储：每个目录下有 `images/` 子目录，文章用相对路径引用（如 `./images/xxx.png`）。

迁移策略：

1. 每篇文章的图片复制到与文章 md 同目录下（如 `src/content/posts/算法/array-code/images/xxx.png`）
2. Astro Content Collections 支持文章同目录下的图片相对引用，脚本替换路径为 `./images/xxx.png`（保持原引用方式不变）
3. 迁移完成后验证所有图片路径可解析

## 迁移脚本

```
migrate.mjs
├── 1. 读取旧 docs/ 下所有 md 文件
├── 2. 解析 frontmatter，按映射表转换
├── 3. 按分类规则确定目标目录
├── 4. 复制 md 到 src/content/posts/<分类>/
├── 5. 复制图片到 src/content/posts/<分类>/<slug>/images/
├── 6. 替换 md 中的图片路径
└── 7. 生成迁移报告（成功/失败/需手动检查的 CSV）
```

## Firefly 配置

需配置的项：

- `src/config/siteConfig.ts`：站点语言设为 `zh_CN`
- `src/config/profileConfig.ts`：作者信息（翔子）
- `src/config/navBarConfig.ts`：导航栏（首页、归档、分类）
- `src/config/sidebarConfig.ts`：侧边栏布局
- `src/config/coverImageConfig.ts`：封面图配置
- `astro.config.mjs`：站点 URL、GitHub Pages base path

## 部署流程

1. 在当前仓库创建 `v2` 分支，初始化 Firefly 模板
2. 配置 `src/config/`
3. 运行迁移脚本
4. `pnpm dev` 本地验证
5. GitHub Actions 自动部署到 GitHub Pages
6. 确认无误后合并 `v2` 到 `master`

## 验收标准

- [ ] 221 篇文章全部迁移，frontmatter 格式正确
- [ ] 所有图片可正常显示
- [ ] 9 个分类页面正常展示
- [ ] 本地 `pnpm dev` 可正常运行
- [ ] GitHub Pages 部署成功
