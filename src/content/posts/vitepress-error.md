---
title: 使用vitepress过程中遇到的问题积累
published: 2022-10-21T00:00:00.000Z
description: 使用vitepress过程中遇到的问题积累
tags:
  - tool
category: tool
author: 翔子
---

1. markdown标题格式错误 incomplete explicit mapping pair; a key node is missed; 

   ![vitepree-md-error.jpg](./images/vitepree-md-error.jpg)

   报错原因：可能是因为 md 文件 title 中有冒号<br />
   解决方法：找到对应的地方删除冒号即可，明显是`describe`报错，找到对应的title解决即可

2.
