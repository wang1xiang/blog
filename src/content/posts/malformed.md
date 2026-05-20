---
title: URI malformed
published: 2022-06-10T00:00:00.000Z
description: 解决URI malformed
tags:
  - work
category: work
author: 翔子
---

URI malformed：使用decodeURI对文本转码时，如果存在%，会报错<br />
<br />
解决方法：1.需要将%替换为25% 2.对转码前的文本执行encodeComponentURI方法
