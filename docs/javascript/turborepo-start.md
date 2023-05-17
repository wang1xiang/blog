---
date: 2023-4-26
title: turborepo笔记
tags:
  - javascript
describe: turborepo-start
---

## turborepo

官网介绍：Turborepo 是一个针对 JavaScript 和 TypeScript 代码库优化的智能构建系统。

如果直接说如何使用的话，那么感觉会有点乏味，那我们先看下 turborepo 的作用。看完作用，再看如何使用。

### turborepo 作用

根据[官网 QuickStart](https://turbo.build/repo/docs)快速创建一个项目

1. 将已有项目改在成 turborepo
2. 新建 turborepo 项目
3. 将已有 monorepo 项目改造为 turborepo

### 安装

- 全局安装

  全局安装 turbo 后，可用于任何项目，并根据运行 turbo 的目录启用自动工作区选择。

  ```bash
  # use npm
  npm install turbo --global
  # use yarn
  yarn global add turbo
  # use pnpm
  pnpm install turbo --global
  ```

- 使用

  一旦全局安装，那么在任何项目中都可以使用

  ```bash
  # 假设项目为apps/web项目
  turbo build
  # 与下面命令相似
  turbo build --filter=web
  ```

也可以在当前项目中安装 turborepo，只针对当前项目

根目录的 package.json 有一个 workspaces 字段，该字段用来让 turborepo 知道目录下有哪些 workspace，这些 workspace 就交给 turborepo 管理；
在根目录 npm i，会把各 workspace 的 npm 依赖安装在根目录的 node_modules 中，而不是安装在各 workspace 的 node_modules 中；

全局安装

```bash
npm i vue -w
```

单独为某一个 workspace 安装 npm 依赖：

```bash
npm i vue-router -w=workspace_name
```

各 workspace 的 package.json 中的 name 字段很关键，它是 turborepo 用来区分不同 workspace 的字段；
