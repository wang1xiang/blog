---
title: "使用yarn安装依赖报错 unable to get local issuer certificate"
published: Fri Oct 14 2022 08:00:00 GMT+0800 (中国标准时间)
description: "使用yarn安装依赖报错 unable to get local issuer certificate"
tags: ["tool"]
category: "工具"
image: api
draft: false
---
  
使用yarn安装依赖的时候报错如下
![yarn-certificate.jpg](./yarn-certificate.jpg)

执行一下代码即可

```bash
yarn config  set strict-ssl false
```
