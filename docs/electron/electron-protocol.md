---
date: 2024-3-26
title: 浏览器如何打开Electron应用？
tags:
  - electron
describe:
---

## 省流

通过自定义协议可以打开 Electron 应用。

Electron 中提供了一个 Protocol API，用于注册自定义协议并拦截基于现有协议的请求。

## 什么是自定义协议

自定义协议是一种定义在应用程序或系统中的特殊协议，用于指示应用程序如何处理特定类型的资源或请求。与标准的 HTTP、FTP 等协议不同，自定义协议通常不是由网络标准组织定义的，而是由应用程序开发者根据自己的需求定义的。

自定义协议可以用于许多不同的场景，例如：

1. **应用程序间通信：** 两个或多个本地应用程序之间可以通过自定义协议进行通信，传递数据或命令。

2. **内部资源访问：** 应用程序可以使用自定义协议来访问本地系统中的资源，如文件、数据库等，而无需暴露这些资源的实际路径或位置。

3. **自定义 URL 方案：** 应用程序可以注册自定义的 URL 协议来打开应用程序内部的特定页面或执行特定操作。

4. **安全性：** 通过自定义协议可以实现一些额外的安全性措施，例如应用程序可以要求访问资源时验证用户身份或权限。

自定义协议的实现通常涉及以下步骤：

- 定义协议格式和语法：定义自定义协议的 URI 格式，包括协议名称、路径、参数等。
- 在应用程序中注册协议处理器：应用程序需要注册用于处理自定义协议的处理器，以便在接收到相关请求时执行相应的操作。
- 实现协议处理逻辑：实现处理自定义协议请求的逻辑，包括解析请求、执行操作、生成响应等。

需要注意的是，使用自定义协议可能会带来一些安全风险，特别是在处理用户提供的输入时。因此，在实现自定义协议时需要谨慎处理输入，以防止安全漏洞的发生。

## Electron 中的自定义协议是什么

在 Electron 中，你可以注册自定义协议以处理应用程序内部资源或特定操作。这对于访问本地文件系统或执行应用程序特定的操作非常有用。通常情况下，这种自定义协议注册在应用程序启动时。

以下是注册自定义协议的一般步骤：

1. 在 Electron 主进程中，使用 `protocol.registerSchemesAsPrivileged` 或 `protocol.registerSchemesAsPrivileged` 方法注册自定义协议。这些方法允许你将自定义协议注册为特权协议，以便在渲染进程中使用。
2. 实现处理自定义协议的逻辑，包括解析请求、执行操作等。
3. 在渲染进程中，使用注册的自定义协议来请求资源或执行操作。

以下是一个简单的示例，展示了如何在 Electron 中注册自定义协议：

```javascript
const { app, protocol, BrowserWindow } = require('electron')
const path = require('path')

// 注册自定义协议
app.on('ready', () => {
  protocol.registerFileProtocol('myapp', (request, callback) => {
    const url = request.url.substr(8) // 去除协议部分
    const filePath = path.normalize(`${__dirname}/${url}`)
    callback({ path: filePath })
  })
})

// 创建窗口并加载自定义协议资源
app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL('myapp://example.html')
})
```

在这个示例中：

- `protocol.registerFileProtocol` 方法用于注册一个名为 "myapp" 的自定义协议。在请求这个协议时，它会解析请求的 URL 并返回对应的本地文件路径。
- `mainWindow.loadURL` 方法加载了一个使用了自定义协议的 URL（`myapp://example.html`），这会触发 Electron 的协议处理逻辑，并加载相应的本地文件。

你可以根据自己的需求和场景来实现更复杂的自定义协议逻辑，比如访问数据库、执行特定操作等。

### 如何在网页打开应用

要在网页中直接打开 Electron 应用程序，你可以注册一个自定义协议，并在网页中通过该自定义协议的链接来触发 Electron 应用的启动。

以下是一种实现方法：

1. **注册自定义协议：** 在 Electron 主进程中注册一个自定义协议，并指定该协议的处理逻辑，以便在接收到相关请求时启动 Electron 应用。

2. **在网页中创建链接：** 在网页中创建一个链接，链接的 URL 使用注册的自定义协议。

以下是一个示例代码，演示了如何在网页中创建链接来触发 Electron 应用的启动：

在 Electron 主进程中：

```javascript
const { app, protocol, shell } = require('electron')
const path = require('path')

// 注册自定义协议
app.on('ready', () => {
  protocol.registerHttpProtocol('openapp', (request, callback) => {
    // 启动应用程序
    app.relaunch()
    app.exit()
  })
})
```

在网页中：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Open Electron App</title>
  </head>
  <body>
    <!-- 创建链接 -->
    <a href="openapp://open">Open Electron App</a>
  </body>
</html>
```

在上述示例中，我们注册了一个名为 "openapp" 的自定义协议。当网页中的链接被点击时，会发送一个使用该协议的请求。在 Electron 主进程中，我们监听这个自定义协议的请求，并在收到请求时重新启动应用程序。

需要注意的是，自定义协议的注册必须在应用程序启动时进行。因此，在示例中，我们将注册代码放在了 `app.on('ready', ...)` 回调中。

这样，当用户点击网页中的链接时，就会触发 Electron 应用的重新启动。

### 网页打开应用

vscode://open

baiduyunguanjia://open

## session

管理浏览器会话、cookie、缓存、代理设置等。
