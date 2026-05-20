---
title: "跟着卡哥学算法Day 8：字符串常见题目"
published: 2025-02-19
description: "字符串常见题目"
tags: ["leetcode"]
category: "算法"
image: api
draft: false
---

接下来都通过 🌟 来代表题目难度：

- 简单：🌟
- 中等：🌟🌟
- 困难：🌟🌟🌟

## 344.反转字符串 🌟

[力扣链接](https://leetcode.cn/problems/valid-anagram/description/)

### 题目描述

给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。

示例 1: 输入: s = "anagram", t = "nagaram" 输出: true

示例 2: 输入: s = "rat", t = "car" 输出: false

说明: 你可以假设字符串只包含小写字母。

### 解题思路

**数指针**

左右指针同时向中间移动，并交换左右指针的位置即可

### 代码

```js
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function (s) {
  const length = s.length
  for (let i = 0, j = length - 1; i < length / 2; i++, j--) {
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s
}
```

## 541. 反转字符串 II 🌟

[力扣链接](https://leetcode.cn/problems/reverse-string-ii/description/) 🌟

### 题目描述

给定一个字符串 s 和一个整数 k，从字符串开头算起, 每计数至 2k 个字符，就反转这 2k 个字符中的前 k 个字符。

如果剩余字符少于 k 个，则将剩余字符全部反转。

如果剩余字符小于 2k 但大于或等于 k 个，则反转前 k 个字符，其余字符保持原样。

示例:

```text
输入: s = "abcdefg", k = 2
输出: "bacdfeg"
```

### 解题思路

**依然双指针**

外层循环每次移动 `2 * k` 位，内层双指针交换前 `k` 个字符

**右指针超出剩余长度时，右指针指向 length - 1**

### 代码

```js
/**
 * @param {string} s
 * @param {number} k
 * @return {string}
 */
var reverseStr = function (s, k) {
  let arr = s.split('')
  for (let i = 0; i < arr.length; i += 2 * k) {
    let left = i
    let right = i + k - 1 >= length - 1 ? length - 1 : i + k - 1
    while (left < right) {
      ;[arr[left], arr[right]] = [arr[right], arr[left]]
      left++
      right--
    }
  }
  return arr.join('')
}
```

## 替换数字 🌟

### 题目描述

给定一个字符串 s，它包含小写字母和数字字符，请编写一个函数，将字符串中的字母字符保持不变，而将每个数字字符替换为 number。

例如，对于输入字符串 "a1b2c3"，函数应该将其转换为 "anumberbnumbercnumber"。

对于输入字符串 "a5b"，函数应该将其转换为 "anumberb"

输入：一个字符串 s,s 仅包含小写字母和数字字符。

输出：打印一个新的字符串，其中每个数字字符都被替换为了 number

```text
样例输入：a1b2c3

样例输出：anumberbnumbercnumber
```

数据范围：1 <= s.length < 10000。

### 解题思路

- 根据原字符串，得到将数字变为 "number" 后的长度，初始化数组，长度为此时的长度
- 双指针：i 新数组末尾，j 原数组末尾
- 字符串直接赋值，数字变为 number 后开始**从后往前**填充

**数组填充类问题，预先给数组扩容带填充后的大小，从后往前操作**，好处：

1. 不用申请新数组
2. 从前往后添加元素时，都需要将添加元素之后的所有元素向后移动，导致时间复杂度提升为 O(n^2)


### 代码

```js

var replaceNumber = function (s) {
  let arr = s.split("");
  const a = "a".charCodeAt();
  const z = "z".charCodeAt();
  const isStr = (str) => str.charCodeAt() >= a && str.charCodeAt() <= z;

  let n = 0;
  for (let i of arr) {
    n += isStr(i) ? 1 : 6;
  }

  const newArr = new Array(n).fill(0);
  let index = arr.length - 1;
  for (let i = n - 1; i >= 0; i--) {
    if (isStr(arr[index])) {
      newArr[i] = arr[index];
    } else {
      newArr[i] = "r";
      newArr[i - 1] = "e";
      newArr[i - 2] = "b";
      newArr[i - 3] = "m";
      newArr[i - 4] = "u";
      newArr[i - 5] = "n";
      i -= 5;
    }
    index--;
  }

  return newArr.join("");
};
```
