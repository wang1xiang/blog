---
title: 跟着卡哥学算法Day 9：字符串常见题目2
published: 2025-02-19T16:00:00.000Z
description: 字符串常见题目2
tags:
  - leetcode
category: leetcode
author: 翔子
---

## 151.翻转字符串里的单词 🌟🌟

[力扣链接](https://leetcode.cn/problems/reverse-words-in-a-string/description/)

### 题目描述

给定一个字符串，逐个翻转字符串中的每个单词。

示例 1：

```text
输入: "the sky is blue"
输出: "blue is sky the"
```

示例 2：

```text
输入: "  hello world!  "
输出: "world! hello"
```

解释: 输入字符串可以在前面或者后面包含多余的空格，但是反转后的字符不能包括。

示例 3：

```text
输入: "a good   example"
输出: "example good a"
```

解释: 如果两个单词间有多余的空格，将反转后单词间的空格减少到只含一个

### 解题思路

#### 什么时候不能使用库函数？

本题如果使用库函数 `split` 分割字符串，然后定义新的字符串，将单词倒叙添加到新字符串，那么也就失去了算法的意义，这时候就不能使用库函数。

不能使用库函数的几种场景：

1. 明确提出使用某种特定算法，如使用快排等
2. 库函数很简单就能解出答案，如本题
3. 库函数隐藏性能问题，如

#### 解题步骤

- 移除多余空格

  整体思路按照[移除元素](./array-code.md/#27-移除元素-)快慢指针

- 整个字符串反转

  整体思路按照[反转字符串](./string-code.md/#344反转字符串-)左右指针

- 字符串中的每个单词反转

  左右指针

```js
let s = 'the sky is blue '
// 移除多余空格
s = 'the sky is blue'
// 字符串反转
s = 'eulb si yks eht'
// 单词反转
s = 'blue is sky the'
```

### 代码

```js
/**
 * @param {string} s
 * @return {string}
 */

var reverseWords = function (s) {
  const strArr = Array.from(s)

  // 移除多余空格
  removeExtraSpaces(strArr)
  // 反转
  reverse(strArr, 0, strArr.length - 1)
  // 对单个单词反转

  let start = 0
  for (let i = 0; i <= strArr.length; i++) {
    if (strArr[i] === ' ' || i === strArr.length) {
      reverse(strArr, start, i - 1)
      start = i + 1
    }
  }

  return strArr.join('')
}

function removeExtraSpaces(strArr) {
  let fast = 0
  let slow = 0

  while (fast < strArr.length) {
    if (strArr[fast] === ' ' && (fast === 0 || strArr[fast - 1] === ' ')) {
      fast++
    } else {
      strArr[slow] = strArr[fast]
      slow++
      fast++
    }
  }

  // 上面操作末尾还会剩余一个空格
  strArr.length = strArr[slow - 1] === ' ' ? slow - 1 : slow
}
function reverse(strArr, start, end) {
  let left = start
  let right = end

  while (left < right) {
    ;[strArr[left], strArr[right]] = [strArr[right], strArr[left]]
    left++
    right--
  }
}
```

## 右旋字符串 🌟🌟

### 题目描述

字符串的右旋转操作是把字符串尾部的若干个字符转移到字符串的前面。给定一个字符串 s 和一个正整数 k，请编写一个函数，将字符串中的后面 k 个字符移到字符串的前面，实现字符串的右旋转操作。

例如，对于输入字符串 "abcdefg" 和整数 2，函数应该将其转换为 "fgabcde"。

输入：输入共包含两行，第一行为一个正整数 k，代表右旋转的位数。第二行为字符串 s，代表需要旋转的字符串。

输出：输出共一行，为进行了右旋转操作后的字符串。

样例输入：

```js
2
abcdefg
```

样例输出：

```js
fgabcde
```

数据范围：1 <= k < 10000, 1 <= s.length < 10000;

### 解题思路

依然反转字符串

```js
let s = 'abcdefg'
let k = 2
```

- 首先反转 0 ～ s.length - 1 - k 字符 `edcbafg`
- 反转 arr.length - 1 - k + 1 ～ s.length - 1 字符 `edcbagf`
- 最后整体反转 `fgabcde`

### 代码

```js
var rightTurnStr = function (s, k) {
  let arr = s.split('')

  reverse(arr, 0, s.length - 1 - k)
  reverse(arr, k + 1, arr.length - 1)
  reverse(arr, 0, arr.length - 1)

  return arr.join('')
}
function reverse(strArr, start, end) {
  while (start < end) {
    ;[strArr[start], strArr[end]] = [strArr[end], strArr[start]]
    start++
    end--
  }
}
```

## 28. 找出字符串中第一个匹配项的下标 🌟

[力扣链接](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/description/)

### 题目描述

实现 strStr() 函数。

给定一个 haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从 0 开始)。如果不存在，则返回 -1。

```text
示例 1: 输入: haystack = "hello", needle = "ll" 输出: 2

示例 2: 输入: haystack = "aaaaa", needle = "bba" 输出: -1
```

说明: 当 needle 是空字符串时，我们应当返回什么值呢？这是一个在面试中很好的问题。 对于本题而言，当 needle 是空字符串时我们应当返回 0 。这与 C 语言的 strstr() 以及 Java 的 indexOf() 定义相符。

### KMP 算法

#### 什么是 KMP 算法

因为是由这三位学者发明的：Knuth，Morris 和 Pratt，所以取了三位学者名字的首字母。所以叫做 KMP

#### KMP 用来做什么

KMP主要应用在字符串匹配上。

### 解题思路

-

### 代码

```js
var replaceNumber = function (s) {
  let arr = s.split('')
  const a = 'a'.charCodeAt()
  const z = 'z'.charCodeAt()
  const isStr = (str) => str.charCodeAt() >= a && str.charCodeAt() <= z

  let n = 0
  for (let i of arr) {
    n += isStr(i) ? 1 : 6
  }

  const newArr = new Array(n).fill(0)
  let index = arr.length - 1
  for (let i = n - 1; i >= 0; i--) {
    if (isStr(arr[index])) {
      newArr[i] = arr[index]
    } else {
      newArr[i] = 'r'
      newArr[i - 1] = 'e'
      newArr[i - 2] = 'b'
      newArr[i - 3] = 'm'
      newArr[i - 4] = 'u'
      newArr[i - 5] = 'n'
      i -= 5
    }
    index--
  }

  return newArr.join('')
}
```
