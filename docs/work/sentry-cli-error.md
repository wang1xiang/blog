---
date: 2022-10-19
title: sentry-cli报错修复
tags:
  - work
describe: Unable to download sentry-cli binary from https://downloads.sentry-cdn.com/
---
  
- 使用sentry-cli安装依赖时出现以下报错

  ```bash
  Error: Unable to download sentry-cli binary from https://downloads.sentry-cdn.com/
  ```

- yarn报错解决方式

  修改.yarnrc文件，C:\Users\xiang wang\.yarnrc，添加以下配置

  ```bash
  registry "https://registry.npm.taobao.org"
  ENTRYCLI_CDNURL "https://cdn.npm.taobao.org/dist/sentry-cli"
  sentrycli_cdnurl "https://cdn.npm.taobao.org/dist/sentry-cli"
  ```

  重新执行yarn即可

- npm报错解决方式
  
  1. 修改.npmrc，如上
  2. npm执行命令

    ```bash
    npm set ENTRYCLI_CDNURL=https://cdn.npm.taobao.org/dist/sentry-cli

    npm set sentrycli_cdnurl=<https://cdn.npm.taobao.org/dist/sentry-cli
    ```
