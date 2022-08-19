---
date: 2022-06-10
title: 搭建博客记录
tags:
  - tool
describe: 使用vitepress搭建博客，通过github pages生成在线访问地址
---


因为是使用vitepress搭建博客，所以先需要了解一下[vitepress](https://vitejs.cn/vitepress/)

## vitepress文档

### 配置

- 文档目录下创建一个 `.vuepress` 目录，存放所有 `VuePress` 相关的文件
- 配置文件 `.vuepress/config.js`，导出一个 JavaScript 对象

  ```js
  module.exports = {
    title: 'Hello VitePress',
    description: 'Just playing around.'
  }
  ```

### markdown拓展

[原文链接](https://vitejs.cn/vitepress/guide/markdown.html)

- 文件夹下的 `index.md` 文件都会被自动编译为 `index.html`，对应的链接将被视为 `/`

  ```bash
  .
  ├─ index.md
  ├─ foo
  │  ├─ index.md
  │  ├─ one.md
  │  └─ two.md
  └─ bar
    ├─ index.md
    ├─ three.md
    └─ four.md
  ```

  会被编译为

  ```bash
  [Home](/) <!-- 跳转到根目录的index.md -->
  [foo](/foo/) <!-- 跳转到 foo 文件夹的 index.html-->
  [foo heading](./#heading) <!-- 跳转到 foo/index.html 的特定标题位置 -->
  [bar - three](../bar/three) <!-- 你可以忽略扩展名 -->
  [bar - three](../bar/three.md) <!-- 具体文件可以使用 .md 结尾（推荐）-->
  [bar - four](../bar/four.html) <!-- 也可以用 .html-->
  ```

- Frontmatter

  任何包含YAML frontmatter块的Markdown文件都将由gray-matter处理。Frontmatter块必须位于在Markdown文件的顶部，必须是有效的YAML格式，放置在三点划线之间。例如：

  ```md
  ---
  title: Docs with VitePress
  editLink: true
  ---

  ```

### 创建博客项目

> 可以使用[vitepress官方文档](https://vitejs.cn/vitepress/)按照步骤创建，我是直接在github上克隆别人已有的博客进行修改<br />
> 博客地址：jexlau.github.io/blog/

- 克隆项目

  ```bash
  git clone https://github.com/JexLau/blog.git
  cd blog

  # 安装依赖
  yarn

  # 在本地启动服务器
  yarn dev

  # 构建静态文件 > .vitepress/dist
  yarn build
  ```

- 修改配置
  - .vitepress 是项目页面的配置，可以根据自己的想法更改
  - docs中用于存放自己的md文档，存放你自己的文档，注意格式如下

    ```md
    ---
    date: 2022-06-10
    title: 搭建博客记录
    tags:
      - 博客
    describe: 使用vitepress搭建博客，通过github pages生成在线访问地址
    ---
    ```

  - more中用于存放导航栏的标签

### 发布到github pages

- github创建blog仓库`Create a new repository`
- 先将本地代码推到远程仓库，便于存储及之后修改
- 修改deploy.sh脚本文件
  - 先将本地文件提交到github master分支
  - 修改deploy.sh，将github地址改为你自己的地址

    ```bash
    # 如果发布到 https://<USERNAME>.github.io/<REPO>
    git push -f https://github.com/wang1xiang/blog.git master:gh-pages
    ```

  - yarn deploy发布，如果没有成功，可以按照deploy.sh的文件一步步执行，看是哪里的问题

- 查看发布成功后的地址<https://wang1xiang.github.io/blog/>，如果没有刷新，强制刷新一下试试

### 发布到gitlab pages
