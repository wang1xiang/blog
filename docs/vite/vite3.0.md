---
date: 2022-7-28
title: vite3.0版本更新
tags:
  - vite
describe: vite3.0已经更新，抓紧时间体验吧。
---
  
2020年7月份，vite3.0发布，一起来看一下vite3.0版本都有哪些变化。

##### 官方文档变化

[vite3.0](https://cn.vitejs.dev/)简约大气上档次

![截图](./images/vite3.0image.jpg)

#### 开发阶段变动

1. 默认端口：由原来的3000改为5173，避免与其他开发服务端口冲突
2. 服务冷启动速度提升

   vite2.0时代使用Esbuild进行以来与构建，也就是将项目中的依赖扫描出来并进行一次打包<br />

   **存在问题**
   - 打包的过程阻塞Dev Serve的启动
   - 二次预构建情况
  
   **解决问题**
   vite2.9版本启动后预构建(Optimize 阶段)在后台执行，成功解决预构建时阻塞服务器问题，但二次预构建仍然存在

   
3. import.meta.glob语法更新


更多变化参考[官网](https://cn.vitejs.dev/guide/migration.html#config-options-changes)