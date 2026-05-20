---
title: "跟着卡哥学算法Day 1：数组整体学习 & 常见题目"
published: 2025-02-12
description: "数组整体学习 & 常见题目"
tags: ["leetcode"]
category: "算法"
image: api
draft: false
---

数组在内存空间中连续存储的，这样会使得通过下标获取数组元素很方便，但删除或新增元素时，就需要移动其他元素的位置。

接下来都通过 🌟 来代表题目难度：

- 简单：🌟
- 中等：🌟🌟
- 困难：🌟🌟🌟

## 经典题目

### 704. 二分查找 🌟

[力扣链接](https://leetcode.cn/problems/binary-search/description/)

#### 前提

**有序排列**

**无重复值**

#### 题目描述

给定一个 n 个元素有序的（升序）整型数组 nums 和一个目标值 target ，写一个函数搜索 nums 中的 target，如果目标值存在返回下标，否则返回 -1。

示例 1:

```txt
输入: nums = [-1,0,3,5,9,12], target = 9
输出: 4
解释: 9 出现在 nums 中并且下标为 4
```

示例 2:

```txt
输入: nums = [-1,0,3,5,9,12], target = 2
输出: -1
解释: 2 不存在 nums 中因此返回 -1
```

提示：

- 你可以假设 nums 中的所有元素是不重复的。
- n 将在 [1, 10000]之间。
- nums 的每个元素都将在 [-9999, 9999]之间。

#### 解题思路

**重点：定好区间**

开闭：包含这个元素

左闭右闭：`[left, right]`

左闭右开：`[left, right)`

需要定义三个值：

- left：`0` 左侧初始下标
- right：`nums.length - 1` 右侧初始下标
- middle

判断条件：

确保 `left <= right`

- `left + ((right - left) >> 1)`：计算 middle
- `nums[middle] < target]`：中间值小于目标值，目标值在右侧，更新 left 为`middle + 1`
- `nums[middle] > target]`： 中间值大于目标值，目标值在左侧，更新 right 为`middle - 1`
- `nums[middle] === target`：等于目标值，返回 middle

#### 代码

```ts
function search(nums: number[], target: number): number {
  let left = 1
  let right = nums.length - 1
  while (left <= right) {
    const middle = left + ((right - left) >> 1)
    if (nums[middle] === target) return middle
    if (nums[middle] > target) {
      right = middle - 1
    } else {
      left = middle + 1
    }
  }
  return -1
}
```

#### 相似题目

[35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/description/) 🌟

思路：

- 按照二分法找到的返回下标
- 未找到则返回 `right + 1`（left 一直增加，当一直未找到 targe 时，left 会不满足条件，即 `left > right`，此时 right + 1 就是插入的位置）

```ts
function searchInsert(nums: number[], target: number): number {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {
    let middle = left + ((right - left) >> 1)
    if (nums[middle] > target) {
      right = middle - 1
    } else if (nums[middle] < target) {
      left = middle + 1
    } else {
      return middle
    }
  }
  return right + 1
}
```

[34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/description/) 🌟🌟

解题思路：

- 两次二分查找

  - 查找目标值第一次出现位置 `nums[middle] >= target`，一直移动 right
  - 查找目标值最后一次出现位置 `nums[middle] <= target`，一直移动 left

- target 在数组左或右，返回 `[-1, -1]`
- target 在数组范围内，但不存在 `right - left < 0`，返回 `[-1, -1]`
- target 在数组范围内，存在，返回 `[left, right]`

```ts
function searchRange(nums, target) {
  if (nums[0] > target || nums[nums.length - 1] < target) return [-1, -1]
  const left = searchLeft(nums, target)
  const right = searchRight(nums, target)
  if (right - left < 0) return [-1, -1]
  return [left, right]
}
function searchLeft(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {
    let middle = left + ((right - left) >> 1)
    if (nums[middle] < target) {
      left = middle + 1
    } else {
      right = middle - 1
    }
  }
  return left
}
function searchRight(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {
    let middle = left + ((right - left) >> 1)
    if (nums[middle] <= target) {
      left = middle + 1
    } else {
      right = middle - 1
    }
  }
  return right
}
```

[69. x 的平方根](https://leetcode.cn/problems/sqrtx/description/) 🌟

```js
function mySqrt(x: number): number {
  if (x < 2) return x
  let left = 0
  let right = x
  while (left <= right) {
    let mid = left + ((right - left) >> 1)
    if (mid * mid < x) {
      left = mid + 1
    } else if (mid * mid > x) {
      right = mid - 1
    } else {
      return mid
    }
  }
  return right
}
```

[367. 有效的完全平方数](https://leetcode.cn/problems/valid-perfect-square/description/) 🌟

```js
function isPerfectSquare(num: number): boolean {
  let left = 0
  let right = num
  while (left <= right) {
    let mid = left + ((right - left) >> 1)
    if (mid * mid === num) {
      return true
    } else if (mid * mid < num) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return false
}
```

### 27. 移除元素 🌟

[力扣链接](https://leetcode.cn/problems/remove-element/description/) 🌟

#### 题目描述

给你一个数组 nums 和一个值 val，你需要 原地 移除所有数值等于 val 的元素。元素的顺序可能发生改变。然后返回 nums 中与 val 不同的元素的数量。

假设 nums 中不等于 val 的元素数量为 k，要通过此题，您需要执行以下操作：

更改 nums 数组，使 nums 的前 k 个元素包含不等于 val 的元素。nums 的其余元素和 nums 的大小并不重要。
返回 k。

#### 解题思路

- 双指针
  - slow：填充进新数组的 value（只有 `nums[fast] !== val` 才填充进新数组）
  - fast：代表新数组的 index

**“一个萝卜一个坑”**

#### 代码

```js
function removeElement(nums: number[], val: number): number {
  let k = 0
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) {
      nums[k] = nums[i]
      k++
    }
  }
  return k
}
```

#### 相似题目

[26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/description/) 🌟

思路：

- 双指针
- 慢指针填充条件：当 `nums[fast + 1] !== nums[fast]` 时，填充进新数组

```js
function removeDuplicates(nums: number[]): number {
  let slow = 0
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast + 1] !== nums[fast]) {
      nums[slow] = nums[fast]
      slow++
    }
  }
  return slow
}
```

[283. 移动零](https://leetcode.cn/problems/move-zeroes/description/) 🌟

思路：

- 双指针
- 填充条件：当 `nums[fast] !== 0` 时，填充进新数组
- 最后使用 fill 填充数组

```js
function moveZeroes(nums: number[]): void {
  let slow = 0
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      nums[slow] = nums[fast]
      slow++
    }
  }
  nums.fill(0, slow)
}
```

[844. 比较含退格的字符串](https://leetcode.cn/problems/backspace-string-compare/description/) 🌟

思路：

```js
function backspaceCompare(s, t) {
  const s1 = getResult(s)
  const t1 = getResult(t)
  return s1 === t1
}

function getResult(s) {
  let slow = 0
  let count = 0
  s = s.split('')
  for (let fast = 0; fast < s.length; fast++) {
    if (s[fast] !== '#') {
      s[slow] = s[fast]
      slow++
    } else {
      if (slow !== 0) {
        slow--
        s[slow] = ''
        count++
      }
    }
  }
  s.fill('', s.length - 1 - count)
  return s.join('')
}
```

### 977. 有序数组的平方 🌟

[力扣链接](https://leetcode.cn/problems/squares-of-a-sorted-array/description/) 🌟

思路：

- 双指针

```js
function sortedSquares(nums: number[]): number[] {
  let i = 0
  const length = nums.length
  let j = length - 1
  let res = new Array(length).fill(0)
  let k = length - 1

  while (i <= j) {
    let left = nums[i] * nums[i]
    let right = nums[j] * nums[j]
    if (left < right) {
      res[k] = right
      j--
    } else {
      res[k] = left
      i++
    }
    k--
  }
  return res
}
```
