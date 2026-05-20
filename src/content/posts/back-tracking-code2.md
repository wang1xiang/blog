---
title: 跟着卡哥学算法Day 24：回溯算法part3
published: 2025-03-06T16:00:00.000Z
description: 回溯算法part3
tags:
  - leetcode
category: leetcode
author: 翔子
---

## 93.复原 IP 地址 🌟🌟

[力扣链接](https://leetcode.cn/problems/restore-ip-addresses/description/) 🌟🌟

### 题目描述

给定一个只包含数字的字符串，复原它并返回所有可能的 IP 地址格式。

有效的 IP 地址 正好由四个整数（每个整数位于 0 到 255 之间组成，且不能含有前导 0），整数之间用 '.' 分隔。

例如："0.1.2.201" 和 "192.168.1.1" 是 有效的 IP 地址，但是 "0.011.255.245"、"192.168.1.312" 和 "192.168@1.1" 是 无效的 IP 地址。

示例 1：

- 输入：s = "25525511135"
- 输出：["255.255.11.135","255.255.111.35"]

示例 2：

- 输入：s = "0000"
- 输出：["0.0.0.0"]

示例 3：

- 输入：s = "1111"
- 输出：["1.1.1.1"]

示例 4：

- 输入：s = "010010"
- 输出：["0.10.0.10","0.100.1.0"]

示例 5：

- 输入：s = "101023"
- 输出：["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]

提示：

- 0 <= s.length <= 3000
- s 仅由数字组成

### 解题思路

本题按照 [131.分割回文串](http://wangxiang.website/docs/leetcode/back-tracking-code1.html#_131-%E5%88%86%E5%89%B2%E5%9B%9E%E6%96%87%E4%B8%B2-%F0%9F%8C%9F%F0%9F%8C%9F)切割法思路解决。

#### 回溯法解题步骤

用数组 result 来保存结果

回溯三部曲：

1. 回溯函数返回值以及参数

   - 参数 1：str，记录当前字符串
   - 参数 2：startIndex，不能重复分割，记录下一层递归分割的起始位置
   - 参数 3：pointNum，用来记录已经添加逗号的数量

     ```js
     void backtracking(str, startIndex, pointNum)
     ```

2. 回溯函数终止条件

   - 已经存在三个逗号（说明已经分成 4 段了），分割结束，验证第 4 段子串是否合法，合法添加进 result

   ```js
   if (pointNum === 3) {
     if (isValid(str, startIndex, str.length - 1)) {
       result.push(str)
     }
     return
   }
   ```

3. 单层搜索的过程

   - for 循环从 startIndex 开始，截取到当前位置 i，判断[startIndex, i]子串是否合法
   - 合法，str 添加`.`，表示已经分割
   - 不合法结束本层循环

   - 下层递归从 i+2 开始（因为需要在字符串中加入分割符），pointNum++
   - 回溯需要删除`.`，pointNum--

   ```js
   for (let i = startIndex; i < candidates.length; i++) {
     const candidate = candidates[i]
     path.push(candidate)
     sum += candidate
     // 不用i+1了，表示可以重复读取当前的数
     backtracking(sum, i)
     sum -= candidate
     path.pop()
   }
   ```

#### 判断子串是否合法

- 子串长度大于 1 时，不能以 0 开头
- 子串数字在 0-255 之间，必须为整数

```js
const isValid = (str, startIndex, endIndex) => {
  if (startIndex > endIndex) return false

  if (str[startIndex] === '0' && startIndex !== endIndex) return false

  let num = 0
  for (let i = startIndex; i <= endIndex; i++) {
    if (str[i] > '9' || str[i] < '0') return false

    num = num * 10 + (str[i] - '0')
    if (num > 255) return false
  }

  return true
}
```

### 代码

```js
var restoreIpAddresses = function (s) {
  const res = []
  const backtrack = (segments, pos) => {
    if (segments.length === 4) {
      if (pos === s.length) {
        res.push(segments.join('.'))
      }
      return
    }
    // 尝试截取1到3个字符
    for (let i = 1; i <= 3; i++) {
      if (pos + i > s.length) break
      const segment = s.substring(pos, pos + i)
      // 检查有效性
      if (segment.length > 1 && segment[0] === '0') {
        continue // 前导零无效
      }
      if (parseInt(segment) > 255) {
        continue // 数值超过255
      }
      segments.push(segment)
      backtrack(segments, pos + i)
      segments.pop() // 回溯
    }
  }
  backtrack([], 0)
  return res
}
```

## 78.子集 🌟🌟

[力扣链接](https://leetcode.cn/problems/subsets/description/) 🌟🌟

### 题目描述

给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。

说明：解集不能包含重复的子集。

示例: 输入: nums = [1,2,3] 输出: [ [3], [1], [2], [1,2,3], [1,3], [2,3], [1,2], [] ]

### 解题思路

- 组合问题和分割问题都是收集树的叶子节点
- **子集问题需要收集树的所有节点**

回溯三部曲：

1. 回溯函数返回值以及参数

   - 参数 1：startIndex，用于记录当前递归的起始位置

2. 回溯函数终止条件

   当 startIndex 大于 nums.length 时，说明递归已经到了叶子节点，就终止了

   收集结果，只要进入递归，就收集

   ```js
   result.push([...path])
   if (startIndex >= nums.length) return
   ```

3. 单层搜索的过程

   最基本的逻辑

   - 收集
   - 递归
   - 回溯

   ```js
   for (let i = startIndex; i < nums.length; i++) {
     path.push(nums[i])
     backtracking(i + 1)
     path.pop()
   }
   ```

### 代码

```js
var subsets = function (nums) {
  const result = []
  const path = []

  const backtracking = (startIndex) => {
    result.push([...path])
    if (startIndex >= nums.length) return

    for (let i = startIndex; i < nums.length; i++) {
      path.push(nums[i])
      backtracking(i + 1)
      path.pop()
    }
  }
  backtracking(0)
  return result
}
```

## 90.子集 II 🌟🌟

[力扣链接](https://leetcode.cn/problems/subsets-ii/description/) 🌟🌟

### 题目描述

给定一个可能包含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。

说明：解集不能包含重复的子集。

示例:

- 输入: [1,2,2]
- 输出: [ [2], [1], [1,2,2], [2,2], [1,2], [] ]

### 解题思路

同 [78.子集](#78子集-) 和 [40.组合总和 II](http://wangxiang.website/docs/leetcode/back-tracking-code1.html#_40-%E7%BB%84%E5%90%88%E6%80%BB%E5%92%8C-ii-%F0%9F%8C%9F%F0%9F%8C%9F)的结合

- 收集所有的子集
- for 循环遇到重复元素时，跳过
- **排序**

### 代码

```js
var subsetsWithDup = function (nums) {
  const result = []
  const path = []

  nums.sort((a, b) => a - b)
  const backtracking = (startIndex) => {
    result.push([...path])
    if (startIndex >= nums.length) return

    for (let i = startIndex; i < nums.length; i++) {
      if (i > startIndex && nums[i] === nums[i - 1]) continue
      path.push(nums[i])
      backtracking(i + 1)
      path.pop()
    }
  }
  backtracking(0)
  return result
}
```
