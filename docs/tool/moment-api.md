---
date: 2022-11-8
title: moment使用记录
tags:
  - tool
describe: moment
---
  
### 生成YYYY-MM-DD 00:00:00/23:59:59

```js
const before = moment().add(-7, 'days').startOf('day'); 
const now = moment().endOf('day');
```
