---
title: "使用yarn安装依赖报错 unable to get local issuer certificate"
published: 2022-10-14
description: "使用yarn安装依赖报错 unable to get local issuer certificate"
tags: ["tool"]
category: "工具"
image: api
draft: false
---
  
使用yarn安装依赖的时候报错如下
<!-- yarn-certificate.jpg 原图已丢失 -->

执行一下代码即可

```bash
yarn config  set strict-ssl false
```
