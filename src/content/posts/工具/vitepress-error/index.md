---
title: "使用vitepress过程中遇到的问题积累"
published: Fri Oct 21 2022 08:00:00 GMT+0800 (中国标准时间)
description: "使用vitepress过程中遇到的问题积累"
tags: ["tool"]
category: "工具"
image: api
draft: false
---

1. markdown标题格式错误 incomplete explicit mapping pair; a key node is missed; 

   ![vitepree-md-error.jpg](./vitepree-md-error.jpg)

   报错原因：可能是因为 md 文件 title 中有冒号<br />
   解决方法：找到对应的地方删除冒号即可，明显是`describe`报错，找到对应的title解决即可

2.
