---
date: 2025-2-26
title: 跟着卡哥学算法Day 15：二叉树常见题目3
tags:
  - leetcode
describe: 二叉树常见题目3
---

## 110.平衡二叉树 🌟

[力扣链接](https://leetcode.cn/problems/balanced-binary-tree/description/) 🌟

### 题目描述

给定一个二叉树，判断它是否是高度平衡的二叉树。

本题中，一棵高度平衡二叉树定义为：一个二叉树每个节点 的左右两个子树的高度差的绝对值不超过 1。

示例 1:

给定二叉树 [3,9,20,null,null,15,7]

```js
//       3
//      / \
//     9  20
//       / \
//      15 7
```

返回 true

### 解题思路

#### 递归

递归三部曲：

1. 明确递归函数的参数和返回值

   - 参数：当前传入节点
   - 返回值：当前节点作为根节点的树高度

2. 明确终止条件

   - 节点为 null，返回 0
   - 左右子树不平衡，直接返回

3. 确定单层递归逻辑

   - 计算左子树高度和右子树高度
   - 如果已经返回 -1，则子树不平衡，直接返回 -1
   - 如果左右子树平衡，计算左右子树高度差是否大于 1，如果大于 1 则不平衡，返回-1
   - 继续返回当前子树的高度

```js
function isBalanced(root) {
  const getDepth = (root) => {
    if (!node) return 0
    let leftDepth = getDepth(root.left)
    let rightDepth = getDepth(root.right)
    if (leftDepth === -1 || rightDepth === -1) return -1

    if (Math.abs(leftDepth - rightDepth) > 1) return -1

    return Math.max(leftDepth, rightDepth) + 1
  }

  return getDepth(root) !== -1
}
```

## 257. 二叉树的所有路径 🌟

[力扣链接](https://leetcode.cn/problems/binary-tree-paths/description/) 🌟

### 题目描述

给定一个二叉树，返回所有从根节点到叶子节点的路径。

说明: 叶子节点是指没有子节点的节点。

示例：

```js
//       1
//      / \
//     2  3
//      \
//      5
```

输出：`['1 -> 2 -> 5','1 -> 3']`

### 解题思路

- **必须使用前序遍历**：获取从根节点到叶子节点的路径

递归三部曲：

1. 确定递归函数的参数和返回值

   - 参数 1：根节点
   - 参数 2：要递归记录每一条路径的 path，所以需要传入 path
   - 返回值：不需要

2. 确定终止条件

   路径是从根到叶子节点，所以遇到叶子节点时，就需要记录

   ```js
   if (!node.left && !node.right) {
     // 路径已经到叶子结点，记录并返回
   }
   ```

3. 确定单层递归逻辑

   - 将当前节点加入路径 `const currentPath = path ? path + ' -> ' + node.val : node.val`
   - 递归处理左右子树

### 代码

#### 递归

```js
function binaryTreePaths(root) {
  if (!root) return []
  const result = []

  const traverse = (node, path) => {
    const currentPath = path ? `${path}->${node.val}` : node.val

    if (!node.left && !node.right) {
      result.push(currentPath)
      return
    }

    node.left && traverse(node.left, currentPath)
    node.right && traverse(node.right, currentPath)
  }

  traverse(root, '')

  return result
}
```

## 404.左叶子之和 🌟

[力扣链接](https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/) 🌟

### 题目描述

给计算给定二叉树的所有左叶子之和。

示例：

```js
//       3
//      / \
//     9  20
//       / \
//      15 7
```

输出：24（有两个左叶子节点 9 和 15）

### 解题思路

**关键：如何判断一个节点是左叶子节点**

采用**后序遍历**，先处理叶子节点，再处理父节点，从而就能识别是否为左叶子节点

#### 递归三部曲

1. 确定递归函数的参数和返回值

   - 参数：当前节点
   - 返回值：左叶子之和

2. 确定终止条件

   - 节点为 null ，返回 0

3. 确定单层递归逻辑

   - 计算左子树左叶子之和
   - 计算右子树高度左叶子之和
   - 如果当前节点的左子节点为左叶子节点 `node.left && node.left.left === null && node.left.right === null`，则加上当前节点值，否则不加
   - 返回 **左子树左叶子之和 + 右子树左叶子之和 + 当前节点是否为左叶子节点**

### 代码

#### 递归

```js
var sumOfLeftLeaves = function (root) {
  const nodeSum = (node) => {
    if (!node) return 0

    const leftSum = nodeSum(node.left)
    const rightSum = nodeSum(node.right)

    let midSum = 0
    if (node.left && !node.left.left && !node.left.right) {
      midSum += node.left.val
    }

    return leftSum + rightSum + midSum
  }

  return nodeSum(root)
}
```

## 222.完全二叉树的节点个数 🌟

[力扣链接](https://leetcode.cn/problems/count-complete-tree-nodes/description/) 🌟

### 题目描述

给出一个完全二叉树，求出该树的节点个数。

示例 1:

- 输入: root = [1,2,3,4,5,6]
- 输出: 6

示例 2:

- 输入: root = []
- 输出: 0

示例 3:

- 输入: root = [1]
- 输出: 1

提示:

- 树中节点的数目范围是[0, 5 * 10^4]
- 0 <= Node.val <= 5 \* 10^4
- 题目数据保证输入的树是 完全二叉树

### 解题思路

#### 普通二叉树

递归三部曲：

1. 确定递归函数的参数和返回值

   - 参数：当前节点
   - 返回值：当前树的节点数

2. 确定终止条件

   - 节点为 null ，返回高度为 0

3. 确定单层递归逻辑

   - 求左子树节点数
   - 求右子树节点数
   - 返回左子树节点数 + 右子树节点数 + 1

#### 代码

```js
function countNodes(root) {
  const nodeNums = (node) => {
    if (!node) return 0

    const leftNums = nodeNums(node.left)
    const rightNums = nodeNums(node.right)
    return leftNums + rightNums + 1
  }

  return nodeNums(root)
}
```

#### 完全二叉树

完全二叉树的特点是最后一层节点尽可能靠左排列，这使得我们可以通过判断子树是否为满二叉树来快速计算节点数（`2 ** n - 1`）

```js
function countNodes(root) {
  if (!root) return 0

  let left = root.left
  let right = root.right
  let leftDepth = 0, rightDepth = 0
  while (lett) {
    left = left.left
    leftDepth++
  }
  while (right) {
    right = right.right
    rightDepth++
  }

  if (leftDepth === rightDepth) {
    return Math.pow(2, leftDepth + 1) - 1
  }
  return countNodes(root.left) + countNodes(root.right) + 1
}
```