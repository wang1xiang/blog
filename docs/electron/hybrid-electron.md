---
date: 2023-8-6
title: 前端项目在桌面端中的离线包实现及发布流程
tags:
  - electron
describe: hybrid-electron
---

![electron-hybrid](./images/electron-hybrid.png)

## 背景

在使用离线包策略之前，前端的项目方案是：vue + hybird 开发，之后把开发打包完成的 dist 文件传到服务器，桌面端使用 webview 引入页面，这样的方式造成每次浏览页面会去 webview 页面里请求前端资源文件，导致效果慢。

## 核心思想

将 css、图片等静态资源打包成压缩包，然后下载到客户端并解压，H5 加载时直接从本地读取静态资源文件，减少网络请求，提高速度。

## 解决方案

基于上面的问题，解决如下：**生成一个记录版本的管理 json 里面有版本号和文件地址**，第一次打开对前端的资源文件下载到本地（文件就是上面说的 dist 里面的所有文件），第二次打开会就走离线包资源，这个版本号前端每次发版会更新这个版本号，桌面端根据这个版本号的改变下载新的包文件，然后桌面端对页面的资源请求进行拦截，拦截后使用本地的文件进行页面渲染，这样省去了包下载的过程以达到渲染页面更快。

## 前端实现

离线包是用 gitlab CI 流程实现的，CI 的功能就是 install - build - delopy 就是打包部署然后上传到 OSS 指定路径，具体文件参考

运行流水线之前根据项目需要配置了变量
![electron-hybrid-ci](./images/electron-hybrid-ci.png)

DEPLOYPATH 是环境变量用来判断打什么环境的包，默认是测试环境，如需打其他环境需要运行之前再次定义 DEPLOYPATH 的值

![electron-hybrid-ci-param](./images/electron-hybrid-ci-param.png)

之后点击运行流水线就会运行了，完成之后（把包文件推到了 OSS 特定目录里面）

查看文件如下：
![electron-hybrid-list](./images/electron-hybrid-list.png)

且维护一个 JSON 文件

![electron-hybrid-json](./images/electron-hybrid-json.png)

这里记载了项目文件的版本号、路径（也就是上面说的 APP 对比的版本号），APP 在进入之后请求这个文件，对比决定要不要使用本地的文件还是下载新的版本，目前这个 JSON 文件是手动维护的。

```bash
releases_private.json // 私有云
releases_public.json // 体验版
releases_dev.json // 测试环境
```

```json
{
  "status": 0,
  "message": "ok",
  "data": {
    "global_enable": 1,
    "pages": [
      {
        "key": "test",
        "version": "1.0.0",
        "domainNames": ["http://www.baidu.com"],
        "url": "https://qtable.oss-cn-beijing.aliyuncs.com/apps/hy-desktop/test/test.zip"
      },
      {
        "key": "doc",
        "version": "1.0.3",
        "domainNames": ["https://docdev.qimingpian.cn", "https://dochy.qimingpian.cn"],
        "url": "https://qtable.oss-cn-beijing.aliyuncs.com/apps/hy-desktop/doc-dev/0825.zip"
      }
    ]
  }
}
```

更新完成后，也就完成了离线包的发布，目前离线包的发布与不离线包发布是分开的，这一系列流程走下来确实有些繁琐，也就有了第二次迭代的优化版本

## 后续优化

1. 版本 JSON 文件创建、更新走接口，这也就是需要一个管理平台页面
2. 本地的版本更新走项目的 version 版本，走 git 版本来更新
3. 离线包与非离线包统一发布（jenkins 或者 gitlab CI/CD）

## 主要流程

1. 请求离线包管理配置服务，接口返回离线包下载地址和相应版本号、需要拦截的域名；
2. 比对远端和本地离线包版本号， 按需下载相应离线包资源;
3. 检查要更新的离线包服务是否正在使用;
   1. 正在使用，稍后更新;
   2. 未使用，立即更新;
4. 加载 WebView，拦截请求，并查找本地离线包缓存，如果命中则返回缓存，未命中以域名加载;

### 离线包检查时机

1. 打开应用时
2. 窗口隐藏时（2 分钟内仅检查一次）

**需关注**

1、离线包下载失败；
2、离线包解压失败；
3、本地缓存未命中；
