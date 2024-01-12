---
date: 2022-06-10
title: 搭建博客记录
tags:
  - tool
describe: 使用vitepress搭建博客，通过github pages生成在线访问地址
---

因为是使用 vitepress 搭建博客，所以先需要了解一下[vitepress](https://vitejs.cn/vitepress/)

## vitepress 文档

### 配置

- 文档目录下创建一个 `.vuepress` 目录，存放所有 `VuePress` 相关的文件
- 配置文件 `.vuepress/config.js`，导出一个 JavaScript 对象

  ```js
  module.exports = {
    title: 'Hello VitePress',
    description: 'Just playing around.',
  }
  ```

### markdown 拓展

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

  任何包含 YAML frontmatter 块的 Markdown 文件都将由 gray-matter 处理。Frontmatter 块必须位于在 Markdown 文件的顶部，必须是有效的 YAML 格式，放置在三点划线之间。例如：

  ```md
  ---
  title: Docs with VitePress
  editLink: true
  ---
  ```

### 创建博客项目

> 可以使用[vitepress 官方文档](https://vitejs.cn/vitepress/)按照步骤创建，我是直接在 github 上克隆别人已有的博客进行修改<br />
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
  - docs 中用于存放自己的 md 文档，存放你自己的文档，注意格式如下

    ```md
    ---
    date: 2022-06-10
    title: 搭建博客记录
    tags:
      - 博客
    describe: 使用vitepress搭建博客，通过github pages生成在线访问地址
    ---
    ```

  - more 中用于存放导航栏的标签

### 发布到 github pages

- github 创建 blog 仓库`Create a new repository`
- 先将本地代码推到远程仓库，便于存储及之后修改
- 修改 deploy.sh 脚本文件

  - 先将本地文件提交到 github master 分支
  - 修改 deploy.sh，将 github 地址改为你自己的地址

    ```bash
    # 如果发布到 https://<USERNAME>.github.io/<REPO>
    git push -f https://github.com/wang1xiang/blog.git master:gh-pages
    ```

  - yarn deploy 发布，如果没有成功，可以按照 deploy.sh 的文件一步步执行，看是哪里的问题

- 查看发布成功后的地址<https://wang1xiang.github.io/blog/>，如果没有刷新，强制刷新一下试试

### 发布到 gitlab pages

## Final cut pro 教程

1. 资源库

   fcpx 的工程文件，包含多个事件

   资源库创建成功后，会自动创建一个事件，日期命名（2023-12-19），相当于一个文件夹，在访达目录中可找到

2. 事件

   事件就是文件夹，如：按日期分类，可以包含多个项目

3. 项目

   项目就是时间线上的所有内容，当前剪辑的内容
   ![final-cut-pro-new](./images/final-cut-pro-new.png)

   使用自定义设置，完成后
   自动设置也可

   ![final-cut-pro-three](./images/final-cut-pro-three.png)

   左上角音效、字幕，右下角转场和效果可以运用在所有事件中

4. 添加视频素材

   拖到时间线当中

![final-cut-pro-window](./images/final-cut-pro-window.png)

- 素材窗口
- 预览窗口
- 检查器窗口：调整片段参数
- 时间线窗口：剪辑、加工工作

## 视频剪辑

### 素材窗口

可用于粗剪，如选择视频片段

- 查看片段：j 后退、k 暂停、l 前进、ll 快进
- 选择片段：i 选择开头、o 选择结尾
- 插入片段/添加字幕

  e 直接添加到片段末尾、w 插入到红线位置

  q 直接添加到红线前、shift + q 添加到红线之后

### 时间线

- 时间线大小调整
  cmd+/- 调整大小
  shift + z 适应大小

- 片段删除
  delete 删除
  option + cmd + delete 仅删除主时间线

- 速度控制

  30 帧的片段，需要 60 帧的片段，才能无损的以 50%的速度慢放
  cmd + r 调出速度控制器
  shift + b 将片段速度切割成不同的部分进行调整

A-roll：主时间线，Vlog 的主线内容，能够保证整个 vlog 的连续性，让观看的人明白你要干什么、你在做什么
B-roll：主时间线上方的视频：当播放到此位置时，画面会从主时间线跳转到上面的视频，能够强化 Vlog 内容

## 关键帧

完成两个关键状态帧之间的过渡画面，动画如何产生：两个帧的参数不一样，就会有动画效果。

- 模拟运动镜头，可以在关键帧处放大或缩小视频
- 视频慢慢放大
- 文本慢慢消失：不透明的关键帧，下一个关键帧设为透明

## 视频导出

cmd + e

![final-cut-pro-mind](./images/final-cut-pro-mind.png)

图像纠正和畸变修复是视频编辑中常见的任务之一。在使用 Final Cut Pro 进行视频编辑时，掌握一些图像纠正和畸变修复的技巧，可以让你的视频更加专业和令人印象深刻。下面将介绍一些 Final Cut Pro 中常用的图像纠正和畸变修复技巧。

1. 手动校正
   Final Cut Pro 提供了一些手动校正工具，可以帮助你调整图像的水平和垂直位置以及旋转角度。首先，在选定需要调整的视频素材后，点击“效果”选项卡，并选择“视频效果”中的“校正”。在校正的选项中，你可以通过调整滑块来实现图像的自由旋转和缩放，以及对齐图像的水平和垂直位置。
2. 视频稳定
   图像抖动是拍摄视频过程中常见的问题之一。Final Cut Pro 提供了视频稳定工具，可以帮助你稳定抖动的视频素材。选中需要修复的视频素材后，点击“效果”选项卡，并在“视频效果”中选择“稳定”。在稳定的选项中，你可以通过调整滑块来对视频进行稳定处理。
3. 镜头畸变修复
   镜头畸变是一种常见的问题，尤其是广角镜头拍摄的素材中容易出现畸变效果。Final Cut Pro 提供了镜头畸变修复工具，可以帮助你修复广角镜头拍摄的素材中的畸变效果。选择需要修复的视频素材后，点击“效果”选项卡，并在“视频效果”中选择“畸变修复”。在畸变修复的选项中，你可以通过调整滑块来修复不同类型的畸变效果。
4. 色彩校正
   在一些情况下，视频素材的色彩可能不准确，需要进行校正。Final Cut Pro 提供了多种色彩校正工具，可以帮助你调整视频素材的亮度、对比度、色相和饱和度等参数。选择需要调整的视频素材后，点击“效果”选项卡，并在“视频效果”中选择“色彩校正”。在色彩校正的选项中，你可以通过调整各个参数的滑块来实现色彩的修正。
5. 去噪和修复
   视频素材中可能存在噪点或其他干扰，Final Cut Pro 提供了去噪和修复工具，可以帮助你清除噪点和修复干扰。选中需要处理的视频素材后，点击“效果”选项卡，并在“音频效果”中选择“去噪”或“修复”。在去噪和修复的选项中，你可以通过调整滑块来降低噪点和修复干扰。

## 视频效果

- 风格化
  超级 8 毫米：复古效果
  摄录机：vlog 专用的视频框

- 聚焦
  模糊 -> 聚焦（整体模糊，局部清晰效果，制造“伪景深效果”；极大提升画面的通透感，凸显画面主体）
- 抠像
  抠像 -> 抠像（从画面抠选出一部分，将其他部分从画面抹去，类似色彩被抹去）
  显示选择遮罩：白色表示要留的部分，黑色表示要抹去的部分
  抠像 -> 亮度抠像器
  将亮部或暗部从画面中抹去
- 遮罩
  遮罩 -> 绘制遮罩
  被抹去的部分变成透明

## 音频效果

## 色彩校正

也就是后期调色

- 颜色

  全局、阴影、中间调、曝光

- 饱和度

  阴影、中间调、曝光

- 曝光

  阴影、中间调、曝光

## 常用快捷键

![fcpx-shortcut-keys](./images/fcpx-shortcut-keys.png)
