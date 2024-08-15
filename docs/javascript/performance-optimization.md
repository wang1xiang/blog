---
date: 2024-7-24
title: 性能优化
tags:
  - javascript
describe: 性能优化
---

## 编译

### webpack

前端工程化就是 webpack 吗？

webpack 只是前端工程化中的一个工具。

#### webpack 自身优化

webpack 4 升级 webpack 5（非常大的升级）

1. 引入持久化缓存：构建结果持久化缓存到本地

   配置未发生改变，整体结构没发生变化时，只是某一个模块的某一部分需要重新编译时，会利用当前的缓存去反向跳过构建部分（比如构建过程经过多个 plugin、比如 js 处理、css 处理、html 处理，只改动 js 时，css、html 对应的插件就可以跳过，直接利用持久化缓存的结果）

   利用缓存结果反向跳过构建过程，减少构建时间

2. 资源模块的优化

   额外引用 loader

3. 打包优化

   跨模块的 tree-shaking

4. split-chunks

   超过固定尺寸拆包

#### webpack 插件机制

##### 缓存加速

不升级 v5 的情况下，如何做缓存加速

cache-loader

##### 代码压缩

purifycss-plugin: css 未使用的 css 会被提出

### vite

#### 缓存

预构建存储在 node_modules/.vite 中，删除此文件会重新进行预构建

package.json lockfile vite.config.js 三个文件决定 vite 的缓存，三者之一发生改变时都会强制进行预构建，并且清除当前页面缓存。

## 部署

### 预处理部分优化

1. 寻址：域名到 IP 的解析（同域名寻址一次）DNS 解析 prefetch 优化
2. 静态资源加载优化：CDN
3. SSR 服务端渲染

防抖、节流、并发控制

### 防恶化

监控、指标等

## 项目优化

- FP: 用户首屏时间
- FMP:
- TTL: 可交互时间（一般比 FP 时间长，没关系）
- LongTask：超过 50ms 的时间

## 提升

- script 异步加载：async、defer（vue、react 等都已经做了）
- tree-shaking
- 按需加载：视野内部的先加载

提前的性能优化，代价和收益不一定划算

初中级：
高级：技术底蕴好，独挡一面，快速上手，指导初级，接触大部分第三方库，协助 leader 把控项目进度
前端专家：偏管理，前端专，非前端也得懂（CICD 等），某个领域有丰富的知识
技术负责人：团队 leader（虚线）

## 工程化

### 什么是工程化

自动化、脚本化方法，结合工具能力，解决纯人工处理的低效、非标准问题，提升整体质量、性能。
包括：git、工作流 flow、npm script、package manage、构建工具、组件库、node、babel、lint、mock、cicd、微前端、性能质量等

### ast

AST（Abstract Syntax Tree）抽象语法树，前端基建和工程化基石，会利用一些工具对代码进行转义，比如 babel、eslint、webpack、postcss 等，这些工具都会用到 AST。

### babel

- parser 解析：把源码转为 AST(babe/parser)
- transform 转换：基于 AST，
  dbabel/traverse
  遍历 AST，最后调用 visitor 修改 AST
  @babel/types
  创建、修改、删除，需要用到 types
  Gbabe l/temp late
  如果需要批量的处理，是需要的

- generate 生成新代码：改造后的代码生成目标代码

#### 如何配置

.babelrc

presets 和 plugins

### 模块化

#### 解决问题

1. 私有、变量不会被外界污染，避免命名冲突、全局污染
2. 模块设计更加清晰：import、export
3. 解决依赖顺序问题

#### 模块化方式

- ES5
- ESM

  大部分浏览器均支持

- CJS

  commonJS 规范，无法在浏览器执行

  required、module、exports

- AMD

  CJS 的异步版本

- CMD

  依赖后置

- UMD

  通用的规范，兼容 ESM 和 CJS

- IIFE

#### 在 Node 中使用 ESM 规范

1. 后缀改为.mjs
2. package.json 声明 type: module，不能混用
3. 封装好的第三方工具

#### 浏览器支持 js 形式

1. 直接加载 js

   ```js
   <script src="xxx.js" />
   ```

2. 动态加载
3. esm

#### 构建公共库考虑构建产物

1. 支持 ESM：大部分，结合
2. 支持 CJS
3. 支持 UMD 或 IIFE：可以支持 cdn 引入方式 xxx.umd.min.js

#### monorepo

1. 代码复用
2. 易于抽象公共方法
3. 协作方便

## react 项目

### 如何使用 ts 编译器

1. tsc 官方编译器，依赖于 tsconfig.js
2. ts-loader webpack 插件，默认可以使用 tsconfig.js

以上两种不太灵活，使用 babel，打包工具基本都使用 babel 作为构建工具

一般大型项目中，为了保证编译的统一，一般不会用 tsc 作为代码产出，仅仅做类型检查，tsconfig.js 中 `noEmit; true`，表示不生成代码

用@babel/preset-typescript + tsc 的类型检查

## 前端 js 方案

### 选型

1. 团队技术力量
2. 和其他应用的关系，代码复用等

