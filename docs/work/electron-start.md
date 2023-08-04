---
date: 2023-8-2
title: electron-start
tags:
  - work
describe: electron-start
---

## 打包

electron-forge 构建步骤：package、make、publish

依赖前一个输出结果：publish 依赖 make、make 依赖 package

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

### publish

执行 package 打包，执行 make 制作 Forge 应用程序并将其发布到 Forge 配置中定义的发布目标。
