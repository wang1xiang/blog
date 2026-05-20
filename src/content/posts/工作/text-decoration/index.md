---
title: "为元素添加下划线"
published: 2022-06-10
description: "为元素添加下划线的两种方法"
tags: ["work", "react"]
category: "工作"
image: api
draft: false
---


1. background: linear-gradient(to right, currentColor, currentColor 4px, transparent 4px) repeat-x 0 bottom/7px 1px;
缺点：换行有问题
2. 控制text-decoration:underline 下划线显示位置
使用属性text-underline-offset: 2px;即可
