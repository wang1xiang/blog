---
date: 2025-3-8
title: 跟着卡哥学算法Day 25：回溯算法part4
tags:
  - leetcode
describe: 回溯算法part4
---

## 491.递增子序列 🌟🌟

[力扣链接](https://leetcode.cn/problems/non-decreasing-subsequences/description/) 🌟🌟

### 题目描述

给定一个整型数组, 你的任务是找到所有该数组的递增子序列，递增子序列的长度至少是 2。

示例:

- 输入: [4, 6, 7, 7]
- 输出: [[4, 6], [4, 7], [4, 6, 7], [4, 6, 7, 7], [6, 7], [6, 7, 7], [7,7], [4,7,7]]

说明:

- 给定数组的长度不会超过 15。
- 数组中的整数范围是 [-100,100]。
- 给定数组中可能包含重复数字，相等的数字应该被视为递增的一种情况。

### 解题思路

**求递增子序列，并且不能有重复的递增子序列**，去重很容易联想到[90.子集 II](http://wangxiang.website/docs/leetcode/back-tracking-code2.html#_90-%E5%AD%90%E9%9B%86-ii-%F0%9F%8C%9F%F0%9F%8C%9F)，通过对数组排序去重。

此处不能对原数组进行排序，排序完就全是递增子序列了，所以**不能使用之前的去重逻辑**，记录一个 set，判断当前元素是否已经出现过，出现过就 continue，避免重复。

#### 回溯法解题步骤

用数组 result 来保存结果，依旧是收集所有节点的值，要求个数大于 2

回溯三部曲：

1. 回溯函数返回值以及参数

   - 参数：startIndex，元素不能重复使用，所以需要 startIndex

     ```js
     void backtracking(startIndex)
     ```

2. 回溯函数终止条件

   - 类似求子集问题，收集树上的每一个节点，所以不需要终止条件，直接收集

     ```js
     if (path.length >= 2) {
       result.push([...path])
     }
     ```

3. 单层搜索的过程

   - for 循环从 startIndex 开始

     - 剪枝 1: 如果当前元素已经在同层出现过，continue
     - 剪枝 2: 如果当前元素小于路径中的最后一个元素，continue

   - path 添加当前元素
   - 递归处理下一个位置
   - 回溯

   ```js
   const used = new Set()
   for (let i = startIndex; i < nums.length; i++) {
     const num = nums[i]
     if (used.has(num)) continue
     if (path.length > 0 && num < path[path.length - 1]) continue

     path.push(num)
     used.add(num)
     backtracking(i + 1)
     path.pop()
   }
   ```

### 代码

```js
var findSubsequences = function (nums) {
  const result = []
  const path = []

  const backtracking = (startIndex) => {
    const set = new Set()
    if (path.length >= 2) {
      result.push([...path])
    }
    for (let i = startIndex; i < nums.length; i++) {
      const num = nums[i]
      if (set.has(num)) continue
      if (path.length > 0 && num < path[path.length - 1]) continue

      path.push(num)
      set.add(num)
      backtracking(i + 1)
      path.pop()
    }
  }
  backtracking(0)
  return result
}
```

## 46.全排列 🌟🌟

[力扣链接](https://leetcode.cn/problems/permutations/description/) 🌟🌟

### 题目描述

给定一个 没有重复 数字的序列，返回其所有可能的全排列。

示例:

- 输入: [1,2,3]
- 输出: [ [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1] ]

### 解题思路

和组合问题很像，都是从数组中选择元素，但是组合问题要求元素不能重复，而排列问题可以重复。

回溯三部曲：

**排列问题不需要 startIndex，因为可以重复使用**

1. 回溯函数返回值以及参数

   - 参数 1：used 数组，表示已经选择的元素，避免重复选择

2. 回溯函数终止条件

   收集元素的数组 path 长度等于 nums 数组时，说明找到了一个全排列，记录

   ```js
   if (path.length === nums.length) {
     result.push([...path])
     return
   }
   ```

3. 单层搜索的过程

   - 与组合问题不同，每次 for 循环都从 0 开始
   - 如果 used 中包含存在的元素，continue

   ```js
   for (let i = 0; i < nums.length; i++) {
     if (used[i]) continue
     path.push(nums[i]) // 选择当前元素
     used[i] = true
     backtrack(path) // 递归处理下一层
     path.pop() // 撤销选择
     used[i] = false
   }
   ```

### 代码

```js
var permute = function (nums) {
  const result = []
  const path = []

  const used = new Array(nums.length).fill(false)
  const backtracking = (used) => {
    if (path.length === nums.length) {
      result.push([...path])
      return
    }

    for (let i = 0; i < nums.length; i++) {
      // 跳过已使用的元素
      if (used[i]) continue

      used[i] = true
      path.push(nums[i])
      backtracking(used)
      path.pop()
      used[i] = false
    }
  }
  backtracking(used)

  return result
}
```

## 47.全排列 II 🌟🌟

[力扣链接](https://leetcode.cn/problems/permutations-ii/description/) 🌟🌟

### 题目描述

给定一个可包含重复数字的序列 nums ，按任意顺序 返回所有不重复的全排列。

示例 1：

- 输入：nums = [1,1,2] -输出： [[1,1,2], [1,2,1], [2,1,1]]

示例 2：

- 输入：nums = [1,2,3]
- 输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

提示：

- 1 <= nums.length <= 8
- -10 <= nums[i] <= 10

### 解题思路

这与上一题的区别：**去重**

- 去重：去重需要对元素进行排序，如果当前元素等于上一个元素，则跳过

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function (nums) {
  const result = []
  const path = []
  const used = new Array(nums.length).fill(false)

  nums = nums.sort((a, b) => a - b)

  const backtracking = (used) => {
    if (path.length === nums.length) {
      result.push([...path])
      return
    }

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i]
      // 跳过已使用的元素
      if (used[i]) continue
      // 若当前元素与前一个元素相同且前一个元素未被使用，则跳过，避免同一层级重复选择
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue

      path.push(num)
      used[i] = true
      backtracking(used)
      path.pop()
      used[i] = false
    }
  }
  backtracking(used)
  return result
}
```
