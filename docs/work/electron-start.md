---
date: 2023-8-2
title: electron-start
tags:
  - work
describe: electron-start
---

## 介绍

Electron 是一个使用 JavaScript、HTML 和 CSS 构建桌面应用程序的框架。Electron 将 Chromium 和 Node.js 嵌入到了一个二进制文件中，并且集成了跨平台的 Native 方案，使得同一个项目可以打包成不同的原生应用。

## Electron 中的流程

Electron 继承 Chromium 的多进程架构，Chrome 页签、扩展等都有自己的渲染进程，避免单进程崩溃不影响整个浏览器，浏览器控制这些标签页的渲染进程，以及整个应用程序的生命周期。

Electron 类似于上述 Chrome 的架构，包含主进程和渲染进程，类似于 Chrome 的浏览器和渲染进程。

### 主进程

每个 Electron 应用都有一个单一的主进程，作为应用程序的入口。主进程运行在 Node 环境，可以调用任何 node 模块、操作本地文件等。

#### 窗口管理

主进程的主要目的是使用 [BrowserWindow](https://www.electronjs.org/zh/docs/latest/api/browser-window) 模块创建和管理应用程序窗口。

可以在主进程中通过 window 的 [webContent](https://www.electronjs.org/zh/docs/latest/api/web-contents) 对象与网页内容进行交互。

```js
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({ width: 800, height: 1500 })
win.loadURL('https://github.com')

const contents = win.webContents
console.log(contents)
```

#### 应用程序生命周期

主进程可以通过 Electron 的 [app](https://www.electronjs.org/zh/docs/latest/api/app) 模块控制当前应用程序的生命周期。

```js
const { app } = require('electron')
// 在最后一个窗口被关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

- ready
  当 Electron 完成初始化时，发出一次
- window-all-closed
  当所有窗口都被关闭时触发
- quit
  在应用程序退出时发出
- activate
  当应用程序被激活时触发

#### 原声 API

为了使 Electron 的功能不仅仅限于对网页内容的封装，主进程也添加了自定义的 API 来与用户的作业系统进行交互。 Electron 有着多种控制原生桌面功能的模块，例如菜单、对话框以及托盘图标。

### 渲染进程

通过 BrowserWindow 打开的页面都是一个渲染进程，不能使用 Node 相关的 API 和模块。

### Preload 脚本

使主进程和渲染进程桥接在一起。

在渲染进程加载之前执行的脚本，可以访问 Node.js API，并且可以访问 Window 对象，通过 Preload 脚本在全局 window 中暴露任意 API，在渲染进程中使用。

由于安全问题，在 Preload 脚本中直接设置`window.xxx = 'xxx'`时，获取到的`window.xxx`是 undefined，需要通过 [contextBridge](https://www.electronjs.org/zh/docs/latest/api/context-bridge) 来实现交互。

```js
// preload.js
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('IS_MAC', process.platform === 'darwin')
```

在渲染进程中，就可以使用`window.IS_MAC`来判断环境。

### 进程间通信 IPC

主进程和渲染进程各司其职，意味着主进程没法访问 DOM 元素，渲染进程无法访问 Node.js API。

使用进程间通信 IPC 可以解决。Electron 提供 ipcMain（从主进程到渲染进程的异步通信） 模块和 ipcRenderer（从渲染器进程到主进程的异步通信） 模块实现 IPC 以在两种进程之间传输任意信息，例如从 UI 调用原生 API 或从原生菜单触发 Web 内容的更改。

#### 渲染进程到主进程

实现在渲染进程中调用主进程的 API，渲染进程中使用 ipcRenderer.send 发送消息，在主进程中使用 ipcMain.on 接收消息

#### 主进程到渲染进程

## 打包

electron-forge 构建步骤：package、make、publish

依赖前一个输出结果：publish 依赖 make、make 依赖 package

![electron-pmp.png](./images/electron-pmp.png)

### package

将 electron 应用打包为特定平台的可执行包，例如（windows 上的.exe，mac 上的.app，M1M2 芯片的.dmg），会打包到/out/文件夹中，`--arch`代表要打包的目标架构

```bash
electron-forge package --arch=arm64
electron-forge package --arch=x64
```

需要处理：

1. macOS 上应用程序分发有两层安全技术：`代码签名`和`公证`

- 代码签名

  是一种安全技术，用于证明应用程序是本人创建

- 公证

### make

将通过 forge 配置和传入的参数，为 electron 应用制作可分发文件

可执行包（Executable Package）：通过 Electron 打包工具构建的最终应用程序。通常是一个可执行文件（如 .exe、.app 或 .dmg 文件），可直接运行。这个可执行包包含了应用的源代码、依赖库、资源文件等一切必要的内容，以便用户能够在其计算机上运行应用。

分发包（Distribution Package）：将可执行包分发给最终用户的打包版本。分发包可能包含了额外的文件，如安装向导、许可协议、应用图标等。它的目的是将应用程序交付给最终用户，以便他们能够方便地安装和使用你的应用。

总结起来，可执行包是你实际构建的应用程序，而分发包是包含了可执行包及其他用于分发和展示的资源的打包版本。分发包可以用于在不同平台上分发你的应用，并确保用户能够顺利安装和使用它。

### publish

执行 package 打包，执行 make 制作 Forge 应用程序并将其发布到 Forge 配置中定义的发布目标。

## 为什么主进程到渲染进程没有双向通信

Electron 选择了一种主进程到渲染进程单向通信的架构，主要基于以下原因：

安全性和隔离：渲染进程通常运行应用程序的界面部分，而主进程则处理底层系统交互。将主进程到渲染进程的通信限制为单向可以更好地隔离不同层次的操作，防止渲染进程直接访问可能会影响系统稳定性和安全性的功能。

控制和稳定性： 将主进程作为中心控制点可以更好地管理应用程序的整体状态。如果允许主进程直接访问渲染进程，可能会导致难以预测的交互，从而影响应用程序的稳定性。

开发者体验： 限制通信方向可以简化通信模型，使开发者更容易理解和处理通信。如果允许双向通信，可能会引入更多的复杂性，增加代码编写和调试的难度。

尽管主进程到渲染进程的通信是单向的，但 Electron 提供了一种名为 "ipcRenderer" 的机制，允许渲染进程向主进程发送异步消息，然后主进程可以通过 "ipcMain" 监听这些消息并做出响应。这种机制允许渲染进程请求主进程执行特定的操作，同时通过限制通信方向来保持架构的稳定性和安全性。
