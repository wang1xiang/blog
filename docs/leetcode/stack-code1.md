---
date: 2025-2-22
title: 跟着卡哥学算法Day 11：栈与队列中等题目
tags:
  - leetcode
describe: 栈与队列中等题目
---

## 150. 逆波兰表达式求值 🌟🌟

[力扣链接](https://leetcode.cn/problems/evaluate-reverse-polish-notation/description/) 🌟🌟

### 题目描述

根据 逆波兰表示法，求表达式的值。

有效的运算符包括  + ,  - ,  \* ,  / 。每个运算对象可以是整数，也可以是另一个逆波兰表达式。

说明：

整数除法只保留整数部分。 给定逆波兰表达式总是有效的。换句话说，表达式总会得出有效数值且不存在除数为 0 的情况。

示例  1：

- 输入: ["2", "1", "+", "3", " * "]
- 输出: 9
- 解释: 该算式转化为常见的中缀算术表达式为：((2 + 1) \* 3) = 9

示例  2：

- 输入: ["4", "13", "5", "/", "+"]
- 输出: 6
- 解释: 该算式转化为常见的中缀算术表达式为：(4 + (13 / 5)) = 6

示例  3：

- 输入: ["10", "6", "9", "3", "+", "-11", " * ", "/", " * ", "17", "+", "5", "+"]
- 输出: 22
- 解释:该算式转化为常见的中缀算术表达式为：

  ```text
  ((10 * (6 / ((9 + 3) * -11))) + 17) + 5
  = ((10 * (6 / (12 * -11))) + 17) + 5
  = ((10 * (6 / -132)) + 17) + 5
  = ((10 * 0) + 17) + 5
  = (0 + 17) + 5
  = 17 + 5
  = 22
  ```

### 什么是逆波兰表达式

**逆波兰表达式：是一种后缀表达式，所谓后缀就是指运算符写在后面。**

平常使用的算式则是一种中缀表达式，如 `( 1 + 2 ) * ( 3 + 4 )`

该算式的逆波兰表达式写法为 `1 2 + 3 4 + *`，相当于**二叉树的后序遍历**，即运算符为中间节点，数字为叶子结点

逆波兰表达式主要有以下两个优点：

- 去掉括号后表达式无歧义，上式即便写成 `1 2 + 3 4 + *` 也可以依据次序计算出正确结果。
- 适合用栈操作运算：遇到数字则入栈；遇到运算符则取出栈顶两个数字进行计算，并将结果压入栈中。

**后缀表达式对计算机来说非常友好**，如中缀表达式 `4 + 13 / 5`，如果计算机从左往右扫描进行计算，当到 13 时还需要考虑后面的符号优先级；而如果转为后缀表达式 `4 13 5 / +`，则只需要利用栈顺序计算即可。

### 解题思路

- 遇到数字，则入栈
- 遇到运算符，则取出栈顶两个数字进行计算，并将结果压入栈中
- 最终栈中剩一个元素，就是结果

### 代码

```js
/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function (tokens) {
  const result = []

  for (let i of tokens) {
    if (!isNaN(Number(i))) {
      result.push(Number(i))
    } else {
      const num1 = result.pop()
      const num2 = result.pop()
      switch (i) {
        case '+':
          result.push(num2 + num1)
          break
        case '-':
          result.push(num2 - num1)
          break
        case '*':
          result.push(num2 * num1)
          break
        case '/':
          result.push((num2 / num1) | 0)
          break
      }
    }
  }
  return result[0]
}
```

## 239. 滑动窗口最大值 🌟🌟🌟

[力扣链接](https://leetcode.cn/problems/sliding-window-maximum/description/) 🌟🌟🌟

### 题目描述

给定一个数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。

返回滑动窗口中的最大值。

```text
示例 1：

输入：nums = [1,3,-1,-3,5,3,6,7], k = 3
输出：[3,3,5,5,6,7]
解释：
滑动窗口的位置                  最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7

示例 2：
输入：nums = [1], k = 1
输出：[1]
```

### 解题思路

#### 暴力解法

1. 滑动次数：滑动 `n - k + 1` 次
2. 求最大值：滑动窗口内，每次遍历 k 个元素，求最大值
3. 时间复杂度：O(n \* k)

#### 使用单调队列 维护窗口内最大值

**单调队列：维护元素单调递减或单调递增的序列**

1. 队列内不需要维护所有元素，只需要按递减顺序记录有可能成为最大值的元素

   ```text
   如：[2, 3, 5, 1, 4]

   只需要维护 [5, 4]
   ```

2. 窗口移动时，新元素添加进队列，**队列需要弹出元素，如何弹出队列？（不一定是最大值，即不一定是队首元素）**

   - push 操作：如果 push 进的元素大于队列首元素，则队列全部弹出，只需要 push 进新元素即可
   - pop：

3. 每次窗口移动时，只需要获取队首元素就是最大值

### 代码

```js
var maxSlidingWindow = function (nums, k) {
  class MonoQueue {
    queue
    constructor() {
      this.queue = []
    }
    enqueue(value) {
      let back = this.queue[this.queue.length - 1]
      while (back !== undefined && back < value) {
        this.queue.pop()
        back = this.queue[this.queue.length - 1]
      }
      this.queue.push(value)
    }
    dequeue(value) {
      let front = this.front()
      if (front === value) {
        this.queue.shift()
      }
    }
    front() {
      return this.queue[0]
    }
  }
  let helperQueue = new MonoQueue()
  let i = 0,
    j = 0
  let resArr = []
  while (j < k) {
    helperQueue.enqueue(nums[j++])
  }
  resArr.push(helperQueue.front())
  while (j < nums.length) {
    helperQueue.enqueue(nums[j])
    helperQueue.dequeue(nums[i])
    resArr.push(helperQueue.front())
    i++, j++
  }
  return resArr
}
```

## 347.前 K 个高频元素 🌟🌟

[力扣链接](https://leetcode.cn/problems/top-k-frequent-elements/) 🌟🌟

### 题目描述

给定一个非空的整数数组，返回其中出现频率前 k 高的元素。

示例 1:

- 输入: nums = [1,1,1,2,2,3], k = 2
- 输出: [1,2]

示例 2:

- 输入: nums = [1], k = 1
- 输出: [1]

提示：

- 你可以假设给定的 k 总是合理的，且 1 ≤ k ≤ 数组中不相同的元素的个数。
- 你的算法的时间复杂度必须优于 $O(n \log n)$ , n 是数组的大小。
- 题目数据保证答案唯一，换句话说，数组中前 k 个高频元素的集合是唯一的。
- 你可以按任意顺序返回答案。

### 解题思路

### 代码
