---
title: moment使用记录
published: 2022-11-07T16:00:00.000Z
description: moment
tags:
  - tool
category: tool
author: 翔子
---
  
### 生成YYYY-MM-DD 00:00:00/23:59:59

```js
const before = moment().add(-7, 'days').startOf('day'); 
const now = moment().endOf('day');
```
