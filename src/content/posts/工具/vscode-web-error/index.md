---
title: "vscode加载web视图错误"
published: 2022-10-25
description: "Could not register service workers..."
tags: ["tool"]
category: "工具"
image: api
draft: false
---

打开图片或markdown文件时，vscode提示加载web视图错误，解决方法如下

1. 关闭vscode
2. 在cmd中输入`code --no-sandbox`
3. 此时会重新打开vscode，再次查看报错消失
  