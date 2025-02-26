---
date: 2025-2-25
title: 跟着卡哥学算法Day 14：二叉树常见题目2
tags:
  - leetcode
describe: 二叉树常见题目2
---

## 226.翻转二叉树 🌟

[力扣链接](https://leetcode.cn/problems/invert-binary-tree/description/) 🌟

### 题目描述

给你一棵二叉树的根节点 root ，翻转这棵二叉树，并返回其根节点。

### 解题思路

**翻转：将每个节点的左右子节点进行交换**

- 通常可以用**前序或后序**，因为可以在访问中节点的时候直接交换左右子树
- 中序遍历，先处理完左子树之后交换左右，可能会导致原来的左子树被处理两次

如：

```js
//       1
//      / \
//     2   3
//    / \
//   4   5
```

- 前序遍历：

  1. 处理中间节点 1（交换 2 和 3）
  2. 再处理左节点（此时为 3）
  3. 最后右节点（此时为 2）

- 中序遍历

  1. 处理左子树（节点 4）
  2. 回到中间节点 2，交换左右子树（4 和 5 互换位置）
  3. 处理新的右子树（原左子树 4），导致节点 4 被重复处理，而节点 5 未被处理

#### 递归

```js
// 前序遍历
function invertTree(root) {
  if (!root) return null
  ;[root.right, root.left] = [root.left, root.right]
  invertTree(root.left)
  invertTree(root.right)

  return root
}
```

#### 迭代

```js
// 统一模板的前序遍历
function invertTree(root) {
  if (!root) return root
  const invertNode = (root, left, right) => {
    const temp = right
    right = left
    left = temp
    root.left = left
    root.right = right
  }

  const stack = [root]

  while (stack.length) {
    let node = stack.pop()
    if (!node) {
      node = stack.pop()
      invertNode(node, node.left, node.right)
    } else {
      node.right && stack.push(node.right)
      node.left && stack.push(node.left)
      stack.push(node)
      stack.push(null)
    }
  }
  return root
}
```

#### 层序

```js
function invertTree(root) {
  const invertNode = (root, left, right) => {
    const temp = right
    right = left
    left = temp
    root.left = left
    root.right = right
  }
  if (!root) return root
  const queue = [root]
  while (queue.length) {
    let node = queue.shift()
    invertNode(node, node.left, node.right)
    node.left && queue.push(node.left)
    node.right && queue.push(node.right)
  }
  return root
}
```

## 101. 对称二叉树 🌟

[力扣链接](https://leetcode.cn/problems/symmetric-tree/description/) 🌟

### 题目描述

给定一个二叉树，检查它是否是镜像对称的。

### 解题思路

- **必须使用后序遍历**：需要先获取左右子树的信息，才能确定当前节点是否满足对称条件
- 如果前序遍历：先处理根节点，此时左右节点都还没有处理，那么就无法判断是否对称

递归三部曲：

1. 确定递归函数的参数和返回值

   - 参数：比较左右子树是不是对称树，所以参数自然是左子树节点和右子树节点
   - 返回值：bool

2. 确定终止条件

   比较两个节点数值是否相同，一共三种情况：

   1. 左右同时为 null，对称
   2. 一个为 null，另一个不为 null，不对称
   3. 都不为 null，值不想等，不对称

   ```js
   // 同时为空，对称
   if (!left && !right) return true
   // 一个为空，另一个非空，不对称
   if (!left || !right) return false
   // 值不相等，直接返回 false
   if (left.val !== right.val) return false
   ```

3. 确定单层递归逻辑

   - 比较左节点的左孩子和右节点的右孩子 `compare(left.left, right.right)`
   - 以及左节点的右孩子和右节点的左孩子 `compare(left.right, right.left)`
   - 同时为 true，则相等

### 代码

#### 递归

```js
function isSymmetric(root) {
  if (!root) return true

  const compare = (left, right) => {
    // 左右都为null
    if (!left && !right) return true
    // 左右一个为null
    if (!left || !right) return false
    // 左右都不为null，值不想等
    if (left.val !== right.val) return false

    return compare(left.left, right.right) && compare(left.right, right.left)
  }

  return compare(root.left, root.right)
}
```

#### 迭代

```js
function isSymmetric(root) {
  if (!root) return true
  const stack = []
  stack.push(root.left)
  stack.push(root.right)

  while (stack.length) {
    let left = stack.pop()
    let right = stack.pop()
    if (!left && !right) continue
    if (!left || !right || left.val !== right.val) {
      return false
    }

    stack.push(left.left)
    stack.push(right.right)
    stack.push(left.right)
    stack.push(right.left)
  }

  return true
}
```

## 二叉树的最大深度

[力扣链接](https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/)

### 题目描述

给定一个二叉树 root ，返回其最大深度。

二叉树的 最大深度 是指从根节点到最远叶子节点的最长路径上的节点数。

说明: 叶子节点是指没有子节点的节点。

示例： 给定二叉树 [3,9,20,null,null,15,7]，

```js
//       3
//      / \
//     9  20
//       / \
//      15 7
```

返回它的最大深度 3

### 解题思路

- 二叉树节点深度：从根节点到该节点的路径长度
- 二叉树节点高度：指从该节点到叶子节点的最长路径

#### 遍历方式

- 二叉树节点深度

  使用前序遍历 `中 -> 左 -> 右`，节点的深度由其父节点的深度决定（**深度 = 父节点深度 + 1**）。在遍历时，需要先访问当前节点（记录其深度），再递归处理子节点。

- 二叉树节点高度

  使用后序遍历 `左 -> 右 -> 中`，节点的高度取决于其左右子树的高度。必须先知道左右子树的高度，才能计算当前节点的高度（**当前高度 = max(左子树高度, 右子树高度) + 1**）。

**根节点的高度就是二叉树的最大深度**

#### 递归三部曲

1. 确定递归函数的参数和返回值

   - 参数：当前节点
   - 返回值：当前树的高度

2. 确定终止条件

   - 节点为 null ，返回高度为 0

3. 确定单层递归逻辑

   - 求左子树高度
   - 求右子树高度
   - 返回左右子树高度的较大值 + 1

### 代码

#### 递归

```js
function maxDepth(root) {
  if (!root) return 0
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1
}
```

#### 迭代

```js
function maxDepth(root) {
  if (!root) return 0
  let queue = [root]
  let depth = 0
  while (queue.length) {
    depth++
    let len = queue.length
    while (len) {
      const node = queue.shift()
      node.left && queue.push(node.left)
      node.right && queue.push(node.right)
      len--
    }
  }
  return depth
}
```

## 二叉树的最小深度

[力扣链接](https://leetcode.cn/problems/minimum-depth-of-binary-tree/description/)

### 题目描述

给定一个二叉树，找出其最小深度。

最小深度是从根节点到最近叶子节点的最短路径上的节点数量。

说明: 叶子节点是指没有子节点的节点。

示例:

给定二叉树 [3,9,20,null,null,15,7],

```js
//       3
//      / \
//     9  20
//       / \
//      15 7
```

返回它的最大深度 2

### 解题思路

- 二叉树节点深度：指从根节点到该节点的最长简单路径边的节点数
- 二叉树节点高度：指从该节点到叶子节点的最长简单路径边的节点数

**根节点的高度就是二叉树的最大深度**

#### 递归三部曲

1. 确定递归函数的参数和返回值

   - 参数：当前节点
   - 返回值：当前树的高度

2. 确定终止条件

   - 节点为 null ，返回高度为 0

3. 确定单层递归逻辑

   - 求左子树高度
   - 求右子树高度
   - 左子树为空，右子树不为空，返回右子树高度 + 1
   - 右子树为空，左子树不为空，返回左子树高度 + 1
   - 左右子树都不为空，返回左右子树高度的较小值 + 1

### 代码

#### 递归

```js
function minDepth(root) {
  if (!root) return 0
  // 到叶子节点 返回 1
  if (!root.left && !root.right) return 1
  // 只有右节点时 递归右节点
  if (!root.left) return 1 + minDepth(root.right)
  // 只有左节点时 递归左节点
  if (!root.right) return 1 + minDepth(root.left)
  return Math.min(minDepth(root.left), minDepth(root.right)) + 1
}
```

#### 迭代

```js
function minDepth(root) {
  if (root === null) return 0
  let queue = [root]
  let depth = 0
  while (queue.length) {
    let length = queue.length
    depth++
    while (length) {
      const node = queue.shift()

      if (!node.left && !node.right) {
        return depth
      }

      node.left && queue.push(node.left)
      node.right && queue.push(node.right)
      length--
    }
  }
  return depth
}
```
