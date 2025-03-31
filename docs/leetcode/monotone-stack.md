---
date: 2025-3-31
title: 跟着卡哥学算法Day 48：单调栈概念 & part1
tags:
  - leetcode
describe: 单调栈概念 & part1
---

## 单调栈

单调栈是一种特殊的栈结构，常用于解决**下一/前一个更大（小）元素**相关的问题，能在 O(n)时间复杂度内完成处理，适用于区间性质的计算，如柱状图最大矩形面积、每日温度、接雨水等问题。

### 单调栈原理

**本质：空间换时间**

单调栈的原理是通过维护一个单调递增或递减的栈（记录已经遍历过的元素），来快速找到当前元素的前一个或下一个更大（小）元素

- 单调递增栈：栈内元素**从栈顶到栈底递增**（用于求 下一/前一个更大元素）
- 单调递减栈：栈内元素**从栈顶到栈底递减**（用于求 下一/前一个更小元素）

当新元素入栈时，会不断弹出不符合单调性的元素，从而保持栈的单调性

## 739. 每日温度 🌟🌟

[力扣链接](https://leetcode.cn/problems/daily-temperatures/description/) 🌟🌟

### 题目描述

请根据每日 气温 列表，重新生成一个列表。对应位置的输出为：要想观测到更高的气温，至少需要等待的天数。如果气温在这之后都不会升高，请在该位置用 0 来代替。

例如，给定一个列表 temperatures = [73, 74, 75, 71, 69, 72, 76, 73]，你的输出应该是 [1, 1, 4, 2, 1, 1, 0, 0]。

提示：气温 列表长度的范围是 [1, 30000]。每个气温的值的均为华氏度，都是在 [30, 100] 范围内的整数。

### 解题思路

对于每天的温度 t[i]，找出未来温度比当前温度更高的最短天数

- 维护一个单调递增栈，存储温度索引，用于记录尚未找到更高温度的天数，默认添加第一个元素
- 维护结果数组 result，初始值全为 0，表示默认未来没有更高温度

主要有三个判断条件：

1. 当前元素 t[i]大于栈顶元素 stack.pop()，弹出栈顶元素 i 再入栈，表示找到了一个更大的元素
2. 当前元素等于栈顶元素，i 入栈
3. 当前元素 t[i]小于栈顶元素 stack.pop()，i 入栈

### 代码

```js
var dailyTemperatures = function (temperatures) {
  const n = temperatures.length
  const result = new Array(n).fill(0)

  const stack = [0]

  for (let i = 1; i < n; i++) {
    while (
      stack.length &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const top = stack.pop()
      result[top] = i - top
    }

    stack.push(i)
  }

  return result
}
```

## 496.下一个更大元素 I 🌟🌟

[力扣链接](https://leetcode.cn/problems/next-greater-element-i/description/) 🌟🌟

### 题目描述

给你两个 没有重复元素 的数组  nums1 和  nums2 ，其中 nums1  是  nums2  的子集。

请你找出 nums1  中每个元素在  nums2  中的下一个比其大的值。

nums1  中数字  x  的下一个更大元素是指  x  在  nums2  中对应位置的右边的第一个比  x  大的元素。如果不存在，对应位置输出 -1 。

示例 1:

输入: nums1 = [4,1,2], nums2 = [1,3,4,2].  
输出: [-1,3,-1]  
解释:  
对于 num1 中的数字 4 ，你无法在第二个数组中找到下一个更大的数字，因此输出 -1 。  
对于 num1 中的数字 1 ，第二个数组中数字 1 右边的下一个较大数字是 3 。  
对于 num1 中的数字 2 ，第二个数组中没有下一个更大的数字，因此输出 -1 。

示例 2:  
输入: nums1 = [2,4], nums2 = [1,2,3,4].  
输出: [3,-1]  
解释:  
对于 num1 中的数字 2 ，第二个数组中的下一个较大数字是 3 。  
对于 num1 中的数字 4 ，第二个数组中没有下一个更大的数字，因此输出-1 。

提示：

- 1 <= nums1.length <= nums2.length <= 1000
- 0 <= nums1[i], nums2[i] <= 10^4
- nums1 和 nums2 中所有整数 互不相同
- nums1 中的所有整数同样出现在 nums2 中

### 解题思路

找到 nums1 中每个元素在 nums2 中的下一个更大元素，使用**单调递增栈**来解决

1. 单调栈处理 nums2：遍历 nums2，记录每个元素右侧第一个更大的元素
2. 哈希表记录结果：在处理 nums2 的过程中，使用哈希表记录每个元素的下一个更大元素 map(index -> value)
3. 查询结果：遍历 nums1，根据哈希表生成结果列表

### 代码

```js
var nextGreaterElement = function (nums1, nums2) {
  const n = nums1.length
  const m = nums2.length

  const result = []
  const stack = [0]

  const map = new Map()
  for (let i = 1; i < m; i++) {
    while (stack.length && nums2[i] > nums2[stack[stack.length - 1]]) {
      const index = stack.pop()
      map.set(nums2[index], nums2[i])
    }
    stack.push(i)
  }

  for (let i = 0; i < n; i++) {
    result[i] = map.get(nums1[i]) || -1
  }

  return result
}
```

## 503.下一个更大元素 II 🌟🌟

[力扣链接](https://leetcode.cn/problems/next-greater-element-ii/description/) 🌟🌟

### 题目描述

给定一个循环数组（最后一个元素的下一个元素是数组的第一个元素），输出每个元素的下一个更大元素。数字 x 的下一个更大的元素是按数组遍历顺序，这个数字之后的第一个比它更大的数，这意味着你应该循环地搜索它的下一个更大的数。如果不存在，则输出 -1。

示例 1:

- 输入: [1,2,1]
- 输出: [2,-1,2]
- 解释: 第一个 1 的下一个更大的数是 2；数字 2 找不到下一个更大的数；第二个 1 的下一个最大的数需要循环搜索，结果也是 2。

提示:

- 1 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9

### 解题思路

类似[739.每日温度](#739-每日温度-)，因为是循环数组，所以需要遍历两次（`n * 2`），使用单调栈来维护下一个更大元素

此时循环中的 i 需要取模，**i % n，表示当前元素在 nums 中的位置**

### 代码

```js
var nextGreaterElements = function (nums) {
  const n = nums.length
  const stack = [0]
  const result = new Array(n).fill(-1)

  for (let i = 1; i < n * 2; i++) {
    while (stack.length && nums[i % n] > nums[stack[stack.length - 1]]) {
      const index = stack.pop()
      result[index] = nums[i % n]
    }
    stack.push(i % n)
  }

  return result
}
```
