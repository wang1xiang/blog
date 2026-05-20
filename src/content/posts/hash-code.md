---
title: 跟着卡哥学算法Day 6：哈希表整体学习 & 常见题目
published: 2025-02-16T16:00:00.000Z
description: 哈希表整体学习 & 常见题目
tags:
  - leetcode
category: leetcode
author: 翔子
---

哈希表是通过关键码的值直接进行访问的数据结构。如：通过索引下标获取数组元素。

**解决问题：快速判断一个元素是否出现在集合中**

## 哈希函数

如查询一个名字是否在学校中，首先需要将所有的学生名字存入哈希表中，通过索引直接查询学生是否在这所学校中。

而将学生名字映射到哈希表就是哈希函数（**以时间换空间**）。

一般的哈希函数如下所示：

```js
hashFunction = hashCode(name) % tabSize
```

`hashCode` 通过特定编码，可以将其他数据格式转为不同的数值，作为哈希表的索引。

### 取模操作

如果哈希表是一个 tabSize 长度的数组，那么它的有效索引范围是`[0, tabSize - 1]`，如果计算数组大于 tabSize 时，就需要对进行 tabSize 求余，无论结果多大，都会在索引范围内。
如：

- 哈希表大小 tableSize = 10
- 某个姓名的 hashCode = 123
- 通过 123 % 10 = 3，索引被限制在有效范围内（0-9）。

此时又会导致另一个问题，即**导致多个名字映射到同一索引**，这就是哈希碰撞。

## 哈希碰撞

哈希碰撞有两种解决方式：拉链法或线性探测法。

### 拉链法

在冲突的索引位置维护一个链表，所有映射到该索引的元素都存储在链表中，这样就能通过索引找到冲突的名字。

### 线性探测法

**前提：tabSize 必须大于 dataSize，依靠哈希表中的空位来解决碰撞问题**

如冲突位置已经存在数值时，向下找空位放置当前的数值。

好的哈希函数应尽量均匀分布哈希值，减少冲突概率；哈希表的大小应根据数据规模合理选择，并在必要时动态扩容。

## 常见三种哈希结构

- 数组：适合顺序数据和连续的数值索引操作；不适合索引很大或者数值分布分散（0， 5， 10000）的情况
- Set：适合需要存储唯一值并进行快速存在性检查的场景，如上述不能使用数组的情况，缺点：占用空间大，速度比数组慢，set 将数值映射到 key 时需要做 hash 计算
- Map：适合需要键值映射、支持任意类型键以及有序遍历的场景

接下来都通过 🌟 来代表题目难度：

- 简单：🌟
- 中等：🌟🌟
- 困难：🌟🌟🌟

## 经典题目

### 242.有效的字母异位词 🌟

[力扣链接](https://leetcode.cn/problems/valid-anagram/description/)

#### 题目描述

给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。

示例 1: 输入: s = "anagram", t = "nagaram" 输出: true

示例 2: 输入: s = "rat", t = "car" 输出: false

说明: 你可以假设字符串只包含小写字母。

#### 解题思路

**重点：定义哈希表**

1. 创建一个长度为 26 的数组，用于存储字母在字符串中出现的次数（初始化为[0,0,0,...]）。
2. 遍历第一个字符串，对应字母在数组中对应位置++
3. 遍历第二个字符串，对应字母在数组中对应位置--
4. 判断数组是否全部为 0，全部为 0 则返回 true，否则返回 false

#### 代码

```js
var isAnagram = function (s, t) {
  if (s.length !== t.length) return false

  const record = new Array(26).fill(0)

  const firstCharCode = 'a'.charCodeAt()
  for (let i of s) {
    record[i.charCodeAt() - firstCharCode]++
  }
  for (let i of t) {
    record[i.charCodeAt() - firstCharCode]--
  }

  return record.every((r) => !r)
}
```

### 349. 两个数组的交集 🌟

[力扣链接](https://leetcode.cn/problems/intersection-of-two-arrays/description/) 🌟

#### 题目描述

给定两个数组 nums1 和 nums2 ，返回 它们的交集。输出结果中的每个元素一定是 唯一 的。我们可以 不考虑输出结果的顺序 。

示例 1：

```text
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2]
```

示例 2：

```text
输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[9,4]
解释：[4,9] 也是可通过的
```

#### 解题思路

**哈希表擅长解决：给定一个元素，判断在一个集合中是否出现过**

- 将第一个数组转为哈希表
- 遍历第二个数组是否在哈希表中出现过

#### 代码

```js
// 使用set解决
var intersection = function (nums1, nums2) {
  const set1 = new Set(nums1)
  const result = new Set()

  for (let i of nums2) {
    if (set1.has(i)) {
      result.add(i)
    }
  }
  return [...result]
}
// 使用数组解决
var intersection = function (nums1, nums2) {
  const record = new Array(1000).fill(0)
  const result = new Set()
  for (let i of nums1) {
    record[i] = 1
  }
  for (let i of nums2) {
    if (record[i] === 1) result.add(i)
  }

  return [...result]
}
```

- 用 set 作为哈希表时，每次 insert 值时都需要对这个值做哈希运算，转变为另一个内部存储的值，同时需要开辟新的空间存储，相对来说需要花费时间更多。
- 用数组作为哈希表效率高，用下标做哈希映射，速度是最快的

### 202. 快乐数 🌟

[力扣链接](https://leetcode.cn/problems/happy-number/) 🌟

#### 题目描述

编写一个算法来判断一个数 n 是不是快乐数。

「快乐数」定义为：对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。如果 可以变为 1，那么这个数就是快乐数。

如果 n 是快乐数就返回 true ；不是，则返回 false 。

示例：

```text
输入：19
输出：true
解释：
1^2 + 9^2 = 82
8^2 + 2^2 = 68
6^2 + 8^2 = 100
1^2 + 0^2 + 0^2 = 1
```

#### 解题思路

条件：一直计算知道变为 1，或进入循环即结束

#### 代码

```js
var isHappy = function (n) {
  const getSum = (m) => {
    let sum = 0
    while (n) {
      sum += (n % 10) ** 2
      n = Math.floor(n / 10)
    }
    return sum
  }
  let result = new Set()
  while (n !== 1 && !result.has(n)) {
    result.add(n)
    n = getSum(n)
  }

  return n === 1
}
```

### 1. 两数之和 🌟

[力扣链接](https://leetcode.cn/problems/two-sum/description/) 🌟

#### 题目描述

给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。

示例:

```text
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9

所以返回 [0, 1]
```

#### 解题思路

- map 作为哈希表，遍历数组
- 值作为 key，下标作为 value

#### 代码

```js
var twoSum = function (nums, target) {
  const map = new Map()
  for (let index = 0; index < nums.length; index++) {
    const num = nums[index]

    if (map.has(target - num)) {
      return [map.get(target - num), index]
    } else {
      map.set(num, index)
    }
  }
}
```
