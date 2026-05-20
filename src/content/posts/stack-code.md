---
title: 跟着卡哥学算法Day 10：栈与队列理论 & 常见题目
published: 2025-02-20T16:00:00.000Z
description: 栈与队列理论 & 常见题目
tags:
  - leetcode
category: leetcode
author: 翔子
---

JavaScript 没有独立的数据结构，但可通过数组模拟，或自行封装类。

## 栈 LIFO

后进先出：最后添加的元素最先被移除

### 操作

- push：元素入栈（添加到栈顶）
- pop：元素出栈（移除栈顶元素）
- peek：查看栈顶元素（不移除）

### 实现方式

1. 使用数组实现

   ```js
   const stack = []
   stack.push(1) // 入栈 [1]
   stack.push(2) // 入栈 [1, 2]
   const top = stack.pop() // 出栈 2，栈变为 [1]
   ```

2. 定义 Stack 类

   ```js
   class Stack {
     constructor() {
       this.items = []
     }
     push(item) {
       this.items.push(item)
     }
     pop() {
       return this.items.pop()
     }
     peek() {
       return this.items[this.items.length - 1]
     }
     isEmpty() {
       return this.items.length === 0
     }
   }

   const s = new Stack()
   s.push(10)
   s.push(20)
   s.pop() // 返回 20
   ```

## 队列 FIFO

先进先出：最先添加的元素最先被移除

### 操作

- enqueue：元素入队（添加到队尾）
- dequeue：元素出队（移除队首元素）
- front：查看队首元素（不移除）

### 实现方式

1. 使用数组实现

   ```js
   const queue = []
   queue.push(1) // 入队 [1]
   queue.push(2) // 入队 [1, 2]
   const front = queue.shift() // 出队 1，队列变为 [2]
   ```

   性能较差，因为**shift()操作会导致所有元素前移，时间复杂度是 O(n)**，频繁操作可能影响性能

2. 定义 Queue 类

   ```js
   class Queue {
     constructor() {
       this.items = {}
       this.frontIndex = 0 // 队首指针
       this.rearIndex = 0 // 队尾指针
     }
     enqueue(item) {
       this.items[this.rearIndex] = item
       this.rearIndex++
     }
     dequeue() {
       if (this.isEmpty()) return null
       const item = this.items[this.frontIndex]
       delete this.items[this.frontIndex]
       this.frontIndex++
       return item
     }
     front() {
       return this.items[this.frontIndex]
     }
     isEmpty() {
       return this.rearIndex === this.frontIndex
     }
   }

   const q = new Queue()
   q.enqueue(10)
   q.enqueue(20)
   q.dequeue() // 返回 10
   ```

   通过指针追踪队首和队尾，性能更优

接下来都通过 🌟 来代表题目难度：

- 简单：🌟
- 中等：🌟🌟
- 困难：🌟🌟🌟

## 经典题目

### 232.用栈实现队列 🌟

[力扣链接](https://leetcode.cn/problems/implement-queue-using-stacks/description/)

#### 题目描述

使用栈实现队列的下列操作：

- push(x) -- 将一个元素放入队列的尾部。
- pop() -- 从队列首部移除元素。
- peek() -- 返回队列首部的元素。
- empty() -- 返回队列是否为空。

示例：

```js
MyQueue queue = new MyQueue();
queue.push(1);
queue.push(2);
queue.peek();  // 返回 1
queue.pop();   // 返回 1
queue.empty(); // 返回 false
```

说明:

- 你只能使用标准的栈操作 -- 也就是只有 push to top, peek/pop from top, size, 和 is empty 操作是合法的。
- 你所使用的语言也许不支持栈。你可以使用 list 或者 deque（双端队列）来模拟一个栈，只要是标准的栈操作即可。
- 假设所有操作都是有效的 （例如，一个空的队列不会调用 pop 或者 peek 操作）

#### 解题思路

队列先进先出，如 `1 -> 2 -> 3`，3 先进队列，同样也是先出队列

如果想用栈来模拟队列，需要两个栈来实现

1. 进栈：将元素压入输入栈
2. 出栈：如果输出栈不为空，则直接从栈顶弹出；为空时，需要将输入栈所有元素压入输出栈，再从输出栈弹出数据
3. 如果两个栈都为空，则模拟队列为空

#### 代码

```js
var MyQueue = function () {
  this.stackIn = []
  this.stackOut = []
}

/**
 * @param {number} x
 * @return {void}
 */
MyQueue.prototype.push = function (x) {
  this.stackIn.push(x)
}

/**
 * @return {number}
 */
MyQueue.prototype.pop = function () {
  if (this.stackOut.length) {
    return this.stackOut.pop()
  }
  while (this.stackIn.length) {
    this.stackOut.push(this.stackIn.pop())
  }
  return this.stackOut.pop()
}

/**
 * @return {number}
 */
MyQueue.prototype.peek = function () {
  const x = this.pop()
  this.stackOut.push(x)
  return x
}

/**
 * @return {boolean}
 */
MyQueue.prototype.empty = function () {
  return !this.stackIn.length && !this.stackOut.length
}
```

### 225. 用队列实现栈 🌟

[力扣链接](https://leetcode.cn/problems/implement-stack-using-queues/description/) 🌟

#### 题目描述

使用队列实现栈的下列操作：

- push(x) -- 元素 x 入栈
- pop() -- 移除栈顶元素
- top() -- 获取栈顶元素
- empty() -- 返回栈是否为空

注意:

- 你只能使用队列的基本操作-- 也就是 push to back, peek/pop from front, size, 和 is empty 这些操作是合法的。
- 你所使用的语言也许不支持队列。 你可以使用 list 或者 deque（双端队列）来模拟一个队列 , 只要是标准的队列操作即可。
- 你可以假设所有操作都是有效的（例如, 对一个空的栈不会调用 pop 或者 top 操作）。

#### 解题思路

类比用栈实现队列，使用两个栈来实现，那么此处也可以用两个队列来实现栈

**如何用一个队列实现栈？**

1. 入队列：添加元素进队列
2. 出队列：获取队列长度，将对首元素重新入队列，直到只剩最后一个元素
3. 如果队列为空，则模拟栈为空

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

### 20. 有效的括号 🌟

[力扣链接](https://leetcode.cn/problems/valid-parentheses/description/) 🌟

#### 题目描述

给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。

有效字符串需满足：

- 左括号必须用相同类型的右括号闭合。
- 左括号必须以正确的顺序闭合。
- 注意空字符串可被认为是有效字符串。

示例 1:

```text
输入: "()"
输出: true

输入: "()[]{}"
输出: true

输入: "([)]"
输出: false
```

#### 解题思路

**栈结构非常适合做匹配类的题目**

1. 遇到左括号，则入栈
2. 遇到右括号，则判断栈顶元素是否匹配，匹配则出栈，否则返回 false
3. 循环结束后，栈为空，则返回 true

#### 代码

```js
var isValid = function (s) {
  const map = new Map()
  map.set('(', ')')
  map.set('[', ']')
  map.set('{', '}')

  const arr = Array.from(s)
  let result = []
  for (let i of arr) {
    const right = map.get(i)
    if (right) {
      result.unshift(i)
      continue
    }
    if (map.get(result.shift()) !== i) {
      return false
    }
  }
  return !result.length
}
```

### 1047. 删除字符串中的所有相邻重复项 🌟

[力扣链接](https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string/description/) 🌟

#### 题目描述

给出由小写字母组成的字符串 S，重复项删除操作会选择两个相邻且相同的字母，并删除它们。

在 S 上反复执行重复项删除操作，直到无法继续删除。

在完成所有重复项删除操作后返回最终的字符串。答案保证唯一。

示例：

```text
输入："abbaca"
输出："ca"
解释：例如，在 "abbaca" 中，我们可以删除 "bb" 由于两字母相邻且相同，这是此时唯一可以执行删除操作的重复项。之后我们得到字符串 "aaca"，其中又只有 "aa" 可以执行重复项删除操作，所以最后的字符串为 "ca"。
```

提示：

- 1 <= S.length <= 20000
- S 仅由小写英文字母组成。

#### 解题思路

**遍历字符串数组，如果当前字符等于栈顶元素，出栈，否则入栈**

#### 代码

```js
var removeDuplicates = function (s) {
  const arr = Array.from(s)

  const result = []
  for (let i of arr) {
    if (result[result.length - 1] !== i) {
      result.push(i)
    } else {
      result.pop()
    }
  }
  return result.join('')
}
```
