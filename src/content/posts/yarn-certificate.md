---
title: 使用yarn安装依赖报错 unable to get local issuer certificate
published: 2022-10-14T00:00:00.000Z
description: 使用yarn安装依赖报错 unable to get local issuer certificate
tags:
  - tool
category: tool
author: 翔子
---
  
使用yarn安装依赖的时候报错如下
![yarn-certificate.jpg](./images/yarn-certificate.jpg)

执行一下代码即可

```bash
yarn config  set strict-ssl false
```
