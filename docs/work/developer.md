---
date: 2023-7-25
title: 作为一个开发者搭建体系
tags:
  - work
describe: 作为一个开发者搭建体系
---

## 跨平台开发/跨端开发

不管是跨平台还是跨端的终极奥义都是：**Write once, run everywhere。**

跨端一般指应用层的说法，对用户介绍的比较多，比如说移动端，PC 端，WEB 端。
而跨平台一般都是指比较专业的术语，面向专业的人员例如开发人员比较多，比如说 window，linux，unix 各系统平台。

**什么是跨平台？**
泛指编程语言、软件或硬件设备可以在多种操作系统或不同硬件架构的电脑上运作。一般来说，有这几种场景，分别是跨设备平台（如 PC 端和移动端），跨操作系统，（移动端中分 Android，IOS，PC 端中分 Windows，macOS，Linux），国内的小程序（微信，京东，百度，支付宝，字节跳动等等）

**什么是跨端**
跨平台指的是跨操作系统，而跨端是指客户端，主要的客户端有 web、安卓、ios 等
现在主流的跨端方案有： react native、weex、flutter、kraken 等
其实跨端和跨平台的思路类似，都是实现一个容器，给它提供统一的 api，这套 api 由不同的平台各自实现，保证一致的功能。

近些年来，跨平台跨端一直是比较热门的话题，Write once, run anywhere，一直是我们开发者所期望的，跨平台方案的优势十分明显，对于开发者而言，可以做到一次开发，多端复用，一套代码就能够运行在不同设备上，这在很大程度上能够降低研发成本，同时能够在产品效能上做到快速验证和快速上线。如今跨端跨平台的优秀技术方案也比较多，

移动端： React Native，Flutter，Weex；
小程序端： Taro，Uniapp；
桌面端： NW.js，Electron，Flutter for desktop，Tauri，Wails，

在上古时代，人们主要通过电脑浏览器上网冲浪，Web 技术占据了主导地位。然而，随着移动互联网时代的到来，各种设备和平台如安卓、苹果、鸿蒙等纷纷涌现。为了应对这种多样性，开发人员渴望能够编写一套代码，适用于多个平台。于是，跨端开发（Cross-platform development）应运而生。

首先理解：**什么是语言？**、**什么是框架？**

为什么我们需要跨平台开发？ 本质上，跨平台开发是为了增加代码复用，减少开发者对多个平台差异适配的工作量，降低开发成本，提高业务专注的同时，提供比 web 更好的体验。嗯～通俗了说就是：省钱、偷懒。

一套代码，多端运行(iOS、Android、MacOS、Windows、Linux、Web、小程序...)。

Flutter
基于绘图库 skia
自带渲染引擎，提供画布达到从业务逻辑到功能呈现的多端高度一致的渲染体验。

Web 开发+原生渲染
采用类 Web 标准进行开发，运行时把绘制和渲染交由原生系统接管
保留了构建移动端页面必要的 Web 标准，使用 JavaScript 开发保证了便捷的前端开发体验；放弃了浏览器控件渲染，使用原生 UI 组件代替核心的渲染引擎，仅保持必要的基本控件渲染能力，从而使得渲染过程更加简化，也保证了良好的渲染性能。】
渲染：组件——自己的 virtual dom——借助原生能力实现

React Native
React Native 的口号是“Learn once, write anywhere”
Weex 与 RN 的方案一直，只不过上层框架使用的是 Vue

Flutter 和 React Native 没有明显的差距，如果有，早就被市场所淘汰了。

Web 开发+Web 渲染
基于 Web 相关技术, 通过 Web 浏览器组件来实现界面及功能
使用 Web 开发+WebView/Chromium 加载网页
JS Bridge（桥): H5 与原生代码交互协议，将部分原生系统能力暴露给 H5，从而扩展 H5 的能力。
既有原生代码也有 Web 代码，因此被称为 Hybrid 开发模式。由于 H5 代码只需要开发一次，就能同时在多个系统运行，大大降低了开发成本。

Ionic
微信小程序

TAURI/Electron：基于 Chromium 和 Node.js 的桌面应用程序开发框架
Electron 基本可以归属于上个时代的产物，和 React 同年 2013 年面世，彼时还处于前端高速发展的初期，Angular 和 React 刚从 jQuery 中抢过来一小部分用户，Vue 还在胎中，webpack 刚发布还不足两年……
Tauri 是一款用 Rust 编写的桌面应用程序开发框架，它结合了 Web 技术和本地应用程序的优点，可以使用常见的 Web 技术（如 HTML、CSS 和 JavaScript）来构建应用程序，并将其封装在一个本地应用程序中。

C++
利用高性能可移植的 C++语言, 一次编码多端编译来实现跨平台开发, 适用于核心平台是桌面端的企业

原生 UI + C++
QT + C++

### React Native

使用 React Native 进行跨平台开发是当前最热门的选择之一。它是 FaceBook 推出的一种跨平台开发框架，可以让开发者使用 JavaScript 或 TypeScript 编写应用程序，并将代码编译为原生的 iOS 或 Android 应用。
React Native 学习曲线较为平缓，它提供了大量的组件和 API 来帮助你创建应用程序。React Native 还可以与其他第三方库和框架配合使用，从而为开发者提供更多的选择。

### Weex

采用类 Web 标准进行开发，运行时把绘制和渲染交由原生系统接管

1.0 原生渲染组件，类似 RN
2.0 基于系统图形库 Skia，类似 Flutter，技术架构上完全推倒 1.0 重新研发

更多关于 Weex 的，请参考下面几篇文章
[五年陈的 Weex，聊聊它的过去现在和未来](https://zhuanlan.zhihu.com/p/373582962)
[如何评价阿里无线前端发布的 Weex?](https://www.zhihu.com/question/37636296)
[如何看待 Weex 未能从 Apache Incubator 毕业？](https://www.zhihu.com/question/459369570)

weex 一出生处境就很尴尬，前有前辈 RN，后有新秀 flutter，注定没多少空间发展

### Flutter

Flutter 是一种 Google 推出的跨平台移动应用程序开发框架。它允许开发者使用 Dart 编写应用程序，并将代码编译为原生 iOS 和 Android 应用程序。Flutter 支持 iOS、Android、桌面和 Web 平台，它具有快速开发、高性能和美丽 UI 界面等优点。

### uniapp

uni-app 是一个基于 Vue.js 开发的跨平台应用框架，可以快速构建出同时支持多个平台的应用程序，包括 iOS、Android、H5、以及微信小程序等。该框架允许开发者使用 Vue.js 进行开发，然后将代码编译为原生应用或 H5 页面。

Uni 在客户端 APP 这方面很垃圾，但是用来写个小程序个人觉得还是可以的，开发很快
是的 只是单小程序而已 开发效率比原生快

Elector 原理

## 原声开发

原生开发

使用语言：Kotlin/Java/Swift/OC
优势：

官方原生支持，功能强大健全，性能和体验是最好的
组件丰富，社区强大

劣势：

Android 和 IOS 需要分别开发，开发人力、测试人力翻倍，bug 数量翻倍
容易出现 ios 和 Android 表现不一致的情况

社区：官方社区，比较活跃

总结：不能多端开发，开发，测试，维护成本都偏高，直接淘汰

## 多端开发

## 混合开发

## Hybrid

基于 webview 渲染，通过 JS Bridge 把一部分系统能力给 JS 调图

## H5

## 语言

## 原生

## 框架

Vue、React、Servelet
JavaSpring
Python

## 体系

## 百花齐放的跨端方案

## 虚拟机

## 渲染引擎

## 开发环境

## 总结

所以，在当下掌握一门跨平台的技术栈还是很有必要的，无论从广度还是从深度都会有所帮助。
市面上仅剩两种主流方案，就是经常听到的 React Native 和 Flutter。一个出自 Facebook，一个出自 Google。
