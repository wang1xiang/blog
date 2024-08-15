---
date: 2024-1-2
title: 使用axios请求，返回long类型数字精度丢失问题处理
tags:
  - work
describe: 使用axios请求，返回long类型数字精度丢失问题处理
---

## 问题描述

服务器后端返回 Long 类型的字段（如 id），传到前端会出现精度丢失，如：`164379764419858435`，前端会变成 `164379764419858000`。导致 id 匹配出问题

## 问题原因

在 JavaScript 中，JSON.parse() 函数用于将一个 JSON 字符串转换为 JavaScript 对象。但是，如果 JSON 字符串中包含的数字太长，超出了 JavaScript 安全数字范围（即小于 `-(2^53 - 1) 和 大于(2^53 - 1)）`，那么 JSON.parse() 可能会导致精度丢失，从而解析出不正确的数字

## 解决方案

1. 手动替换，把大数替换成字符串

   ```js
   JSON.parse('{"a": 1234567890123456789}', (k, v, o) => 	if (o.source > Number.MAX_SAFE_INTEGER) return o.source
       else return v
   })
   ```

2. 使用第三方库 json-bigint

   ```js
   import JSONBig from 'json-bigint'
   //创建一个axios实例
   const instance = axios.create({
     // withCredentials: true,
     timeout: 5000, //5秒
   })
   // 处理返回数据
   instance.defaults.transformResponse = [
     (data: any) => {
       return JSONBig.parse(data)
     },
   ]
   ```
