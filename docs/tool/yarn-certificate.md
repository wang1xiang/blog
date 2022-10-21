---
date: 2022-10-14
title: 使用yarn安装依赖报错 unable to get local issuer certificate
tags:
  - tool
describe: 使用yarn安装依赖报错 unable to get local issuer certificate
---
  
使用yarn安装依赖的时候报错如下
![yarn-certificate.jpg](./images/yarn-certificate.jpg)

执行一下代码即可

```bash
yarn config  set strict-ssl false
```
