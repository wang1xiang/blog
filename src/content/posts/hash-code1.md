---
title: 跟着卡哥学算法Day 7：哈希表中等题目
published: 2025-02-17T16:00:00.000Z
description: 哈希表中等题目
tags:
  - leetcode
category: leetcode
author: 翔子
---

## 454. 四数相加 II 🌟🌟

[力扣链接](https://leetcode.cn/problems/reverse-string/description/)

### 题目描述

编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 char[] 的形式给出。

不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。

你可以假设数组中的所有字符都是 ASCII 码表中的可打印字符。

```text
示例 1：
输入：["h","e","l","l","o"]
输出：["o","l","l","e","h"]

示例 2：
输入：["H","a","n","n","a","h"]
输出：["h","a","n","n","a","H"]
```

### 解题思路

- 四个数组 A、B、C、D

- 暴力法：O(N^4) `A(i) + B(j) + C(k) + D(l) = 0`

#### 使用哈希表解决

- 遍历 A、B，将 `A(i) + B(j)` 添加到集合、遍历 C、D，将 `C(k) + D(l)` 添加到集合，O(N^2)

- 使用 map 作为哈希表，`A(i) + B(j)` 的结果作为 key，value 存储相同结果出现的次数

- 定义 count 保存出现的次数

- 遍历 C、D，找到 `0 - C(k) + D(l)` 是否在 map 中，在就`count + map[C(k) + D(l)]`统计最后的 count

### 代码

```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @param {number[]} nums3
 * @param {number[]} nums4
 * @return {number}
 */
var fourSumCount = function (nums1, nums2, nums3, nums4) {
  const twoSumMap = new Map()
  let count = 0

  for (let num1 of nums1) {
    for (let num2 of nums2) {
      const sum = num1 + num2
      twoSumMap.set(sum, (twoSumMap.get(sum) || 0) + 1)
    }
  }
  for (let num3 of nums3) {
    for (let num4 of nums4) {
      const target = 0 - (num3 + num4)
      if (twoSumMap.get(target)) {
        count += twoSumMap.get(target)
      }
    }
  }
  return count
}
```

## 383. 赎金信 🌟

[力扣链接](https://leetcode.cn/problems/ransom-note/description/) 🌟

### 题目描述

给定一个赎金信 (ransom) 字符串和一个杂志(magazine)字符串，判断第一个字符串 ransom 能不能由第二个字符串 magazines 里面的字符构成。如果可以构成，返回 true ；否则返回 false。

(题目说明：为了不暴露赎金信字迹，要从杂志上搜索各个需要的字母，组成单词来表达意思。杂志字符串中的每个字符只能在赎金信字符串中使用一次。)

注意：

你可以假设两个字符串均只含有小写字母。

```text
canConstruct("a", "b") -> false
canConstruct("aa", "ab") -> false
canConstruct("aa", "aab") -> true
```

### 解题思路

- 同[242.有效的字母异位词](./hash-code.md#242有效的字母异位词-)

### 代码

```js
/**
 * @param {string} ransomNote
 * @param {string} magazine
 * @return {boolean}
 */
var canConstruct = function (ransomNote, magazine) {
  const record = new Array(26).fill(0)
  const base = 'a'.charCodeAt()
  for (let i of magazine) {
    record[i.charCodeAt() - base]++
  }
  for (let j of ransomNote) {
    if (!record[j.charCodeAt() - base]) return false
    record[j.charCodeAt() - base]--
  }
  return true
}
```

## 15. 三数之和 🌟🌟

[力扣链接](https://leetcode.cn/problems/3sum/description/) 🌟🌟

### 题目描述

给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。

注意： 答案中不可以包含重复的三元组。

示例：

```text
给定数组 nums = [-1, 0, 1, 2, -1, -4]，

满足要求的三元组集合为： [ [-1, 0, 1], [-1, -1, 2] ]
```

### 解题思路

#### 哈希解法

固定一个数，转换为两数之和，用哈希表找另外两个数，时间复杂度 O(n^2)

```js
// for循环固定一个数
for (let i = 0; i < nums.length; i++) {
  let target = 0 - nums[i]
  // 求 两数之和 = target即可
}
```

- **题目需要去重**，三个数都需要去重

#### 代码

```js
function threeSum(nums) {
  let result = []
  nums.sort((a, b) => a - b)

  for (let i = 0; i < nums.length; i++) {
    // 如果当前数大于0，则不可能找到和为0的三元组
    if (nums[i] > 0) break

    // 去重a
    if (i > 0 && nums[i] === nums[i - 1]) continue

    let set = new Set()

    for (let k = i + 1; k < nums.length; k++) {
      // 去重b=c时的b和c
      if (k > i + 2 && nums[k] === nums[k - 1] && nums[k - 1] === nums[k - 2])
        continue

      let target = 0 - (nums[i] + nums[k])

      if (set.has(target)) {
        result.push([nums[i], target, nums[k]])
        set.delete(target) // 避免重复
      } else {
        set.add(nums[k])
      }
    }
  }

  return result
}
```

#### 双指针法

- 排序
- 固定第一个数 i
- 左(i + 1)右(nums.length - 1)两个指针，向中间移动；大于 0 时，右指针往左移动，小于 0 时，左指针往右移动
- **去重：**第一个数与前一个数相同，则跳过；左指针与下一个数相同，跳过；右指针与上一个数相同，跳过

### 代码

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  let result = []
  nums.sort((a, b) => a - b)

  const length = nums.length
  for (let i = 0; i < length; i++) {
    const num = nums[i]
    if (num > 0) break
    if (num === nums[i - 1]) continue

    let left = i + 1
    let right = length - 1
    while (left < right) {
      const sum = num + nums[left] + nums[right]
      if (sum > 0) {
        right--
      } else if (sum < 0) {
        left++
      } else {
        result.push([num, nums[left], nums[right]])
        while (left < right && nums[left] === nums[left + 1]) left++
        while (left < right && nums[right] === nums[right - 1]) right--
        left++
        right--
      }
    }
  }
  return result
}
```

## 18. 四数之和 🌟🌟

[力扣链接](https://leetcode.cn/problems/4sum/description/) 🌟🌟

### 题目描述

题意：给定一个包含 n 个整数的数组 nums 和一个目标值 target，判断 nums 中是否存在四个元素 a，b，c 和 d ，使得 a + b + c + d 的值与 target 相等？找出所有满足条件且不重复的四元组。

注意：

答案中不可以包含重复的四元组。

示例：

```text
给定数组 nums = [1, 0, -1, 0, -2, 2]，和 target = 0

满足要求的四元组集合为： [ [-1, 0, 0, 1], [-2, -1, 1, 2], [-2, 0, 0, 2] ]
```

### 解题思路

在三数之和的基础上，再套一层 for 循环，也就是固定前两个数

剪枝操作：

- 不能判断 `nums[i] > target` 就返回，target 可能为负数，比如 `nums = [-4, -3, -2, -1]]`，target 为 `-5`，如果 `nums[i] > target` 就返回，则无法找到满足条件的四元组
- 需要判断 `num[i] > target && (nums[i] >= 0 || target >= 0)`

### 代码

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
  const result = []
  nums.sort((a, b) => a - b)

  const length = nums.length
  for (let i = 0; i < length - 3; i++) {
    const fNum = nums[i]
    if (fNum > target && (fNum >= 0 || target >= 0)) break
    if (fNum === nums[i - 1]) continue
    for (let j = i + 1; j < length - 2; j++) {
      const sNum = nums[j]
      if (j > i + 1 && sNum === nums[j - 1]) continue
      let left = j + 1
      let right = length - 1
      while (left < right) {
        const tNum = nums[left]
        const lNum = nums[right]
        const sum = fNum + sNum + tNum + lNum
        if (sum > target) {
          right--
        } else if (sum < target) {
          left++
        } else {
          result.push([fNum, sNum, tNum, lNum])
          while (left < right && tNum === nums[left + 1]) left++
          while (left < right && lNum === nums[right - 1]) right--
          left++
          right--
        }
      }
    }
  }

  return result
}
```
