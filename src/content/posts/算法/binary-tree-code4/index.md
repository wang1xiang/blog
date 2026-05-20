---
title: "跟着卡哥学算法Day 17：二叉树常见题目5"
published: 2025-02-28
description: "二叉树常见题目5"
tags: ["leetcode"]
category: "算法"
image: api
draft: false
---

## 654.最大二叉树 🌟🌟

[力扣链接](https://leetcode.cn/problems/maximum-binary-tree/) 🌟🌟

### 题目描述

给定一个不含重复元素的整数数组。一个以此数组构建的最大二叉树定义如下：

- 二叉树的根是数组中的最大元素。
- 左子树是通过数组中最大值左边部分构造出的最大二叉树。
- 右子树是通过数组中最大值右边部分构造出的最大二叉树。

通过给定的数组构建最大二叉树，并且输出这个树的根节点。

示例 ：

输入：[3, 2, 1, 6, 0, 5]

```js
// 输出 树根节点
//       6
//      / \
//     3   5
//     \   /
//     2  0
//     \
//     1
```

### 解题思路

- 关键：构造二叉树一定是**前序遍历**，先有根节点，递归构造左右子树

递归三部曲：

1. 明确递归函数的参数和返回值

   - 参数 1：传入的数组
   - 返回值：根节点

2. 明确终止条件

   - 数组长度为 1 时，就是叶子节点，直接构造叶子节点并返回

3. 确定单层递归逻辑

   - 找最大值和对应下标，值用来构造根节点，下标用来分割数组（左右子树）

     ```js
     let max = nums[0]
     let maxIndex = 0
     for (let i = 1; i < nums.length; i++) {
       if (nums[i] > max) {
         max = nums[i]
         maxIndex = i
       }
     }
     const root = new TreeNode(max)
     ```

   - 分割数组
   - 用左区间构造左子树

     ```js
     root.left = constructMaximumBinaryTree(nums.slice(0, maxIndex))
     ```

   - 用右区间构造右子树

     ```js
     root.right = constructMaximumBinaryTree(nums.slice(maxIndex + 1))
     ```

```js
function constructMaximumBinaryTree(nums) {
  if (!nums.length) return null

  const max = num[0]
  const maxIndex = 0
  for (let i = i; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i]
      maxIndex = i
    }
  }

  const root = new TreeNode(max)
  root.left = constructMaximumBinaryTree(nums.slice(0, maxIndex))
  root.right = constructMaximumBinaryTree(nums.slice(maxIndex + 1))

  return root
}
```

## 617.合并二叉树 🌟

[力扣链接](https://leetcode.cn/problems/merge-two-binary-trees/) 🌟

### 题目描述

给定两个二叉树，想象当你将它们中的一个覆盖到另一个上时，两个二叉树的一些节点便会重叠。

你需要将他们合并为一个新的二叉树。合并的规则是如果两个节点重叠，那么将他们的值相加作为节点合并后的新值，否则不为 NULL 的节点将直接作为新二叉树的节点。

示例:

```js
//     Tree 1                     Tree 2
//       1                         2
//      / \                       / \
//     3  2                      1   3
//    /                           \   \
//   5                            4    7

// 合并后
//     3
//    / \
//   4  5
//  /\   \
// 5 4   7
```

### 解题思路

采用**前序遍历**最直观，与遍历一个树的逻辑一样

#### 递归

递归三部曲：

1. 确定递归函数的参数和返回值

   - 参数 1：Tree 1
   - 参数 2：Tree 2
   - 返回值：新二叉树的 root

2. 确定终止条件

   遍历同一个节点时，Tree 1 为空，返回 Tree 2；Tree 2 为空，返回 Tree 1

   ```js
   if (!root1) return root2
   if (!root2) return root1
   ```

3. 确定单层递归逻辑

   - 将两个树节点值相加 `root.val += root2.val`
   - 递归处理左子树
   - 递归处理右子树

```js
function mergeTrees(root1, root2) {
  if (!root1) return root2
  if (!root2) return root1

  root1.val += root2.val
  root1.left = mergeTrees(root1.left, root2.left)
  root1.right = mergeTrees(root1.right, root2.right)

  return root1
}
```

#### 迭代

步骤：

1. 初始化队列：root1 和 root2 进入队列
2. 遍历队列：弹出 root1 和 root2，累加 `root1.val += root2.val`
3. 压入左子节点：同时压入 root1.left 和 root2.left，都不为 null 时
4. 压入右子节点：同时压入 root1.right 和 root2.right，都不为 null 时
5. **注意**：如果 root1.left 或 root1.right 为 null 时，直接将 root2.left 或 root2.right 替换为 root1.left 或 root1.right

```js
function mergeTrees(root1, root2) {
  if (!root1) return root2
  if (!root2) return root1

  const queue = [root1, root2]
  while (queue.length) {
    const node1 = queue.shift()
    const node2 = queue.shift()

    node1.val += node2.val

    if (node1.left && node2.left) {
      queue.push(node1.left)
      queue.push(node2.left)
    }
    if (node1.right && node2.right) {
      queue.push(node1.right)
      queue.push(node2.right)
    }
    if (!node1.left && node2.left) {
      node1.left = node2.left
    }
    if (!node1.right && node2.right) {
      node1.right = node2.right
    }
  }
  return root1
}
```

## 700.二叉搜索树中的搜索 🌟

[力扣链接](https://leetcode.cn/problems/search-in-a-binary-search-tree/) 🌟

### 题目描述

给定二叉搜索树（BST）的根节点和一个值。 你需要在 BST 中找到节点值等于给定值的节点。 返回以该节点为根的子树。 如果节点不存在，则返回 NULL。

示例:

```js
// 给定二叉搜索树:
//       4
//      / \
//     2  7
//    / \
//   1  3
// 和值：2

// 返回
//     2
//    / \
//   1  3
```

### 解题思路

二叉搜索树：根节点比左子树所有节点的值都大、比右子树所有节点的值都小，同时左右子树都是二叉搜索树

#### 递归

递归三部曲：

1. 确定递归函数的参数和返回值

   - 参数 1：根节点
   - 参数 2：要搜索的值
   - 返回值：搜索的值所在的节点

2. 确定终止条件

   如果 root 为 null 或者找到数值了，返回 root

   ```js
   if (!root || node.val === val) return root
   ```

3. 确定单层递归逻辑

   **这里与普通二叉树的递归不同**

   - 若目标值小于当前节点值，递归搜索左子树
   - 若目标值大于当前节点值，递归搜索右子树

```js
function searchBST(root, val) {
  if (!root || root.val === val) return root

  if (root.val > val) {
    return searchBST(root.left, val)
  }
  if (root.val < val) {
    return searchBST(root.right, val)
  }
}
```

#### 迭代

- 使用循环代替递归，从根节点开始遍历
- 根据当前节点值与目标值的比较结果，移动到左子节点或右子节点
- 找到匹配的节点时立即返回，否则遍历结束返回 null

```js
function searchBST(root, val) {
  while (root) {
    if (root.val === val) return root

    if (root.val > val) {
      root = root.left
    }
    if (root.val < val) {
      root = root.right
    }
  }
  return root
}
```

## 98.验证二叉搜索树 🌟🌟

[力扣链接](https://leetcode.cn/problems/validate-binary-search-tree/description/) 🌟🌟

### 题目描述

给定一个二叉树，判断其是否是一个有效的二叉搜索树。

假设一个二叉搜索树具有如下特征：

- 节点的左子树只包含小于当前节点的数。
- 节点的右子树只包含大于当前节点的数。
- 所有左子树和右子树自身必须也是二叉搜索树。

```js
//       2
//      / \
//     1  3
// 输出 true
```

### 解题思路

常见错误：**只比较每个节点与其左右节点的关系，没有考虑全局上节点的关系**，如：某个右子树的左节点可能比父节点小，同时比根节点小

需要一个区间[min, max]来确定当前节点值是否在这个区间

#### 递归

三部曲

1. 确定递归函数的参数和返回值

   - 参数 1：根节点
   - 参数 2：最小值，从根节点开始为-Infinity，右子树需要不断更新最小值为当前值
   - 参数 3：最大值，从节点为最大值，左子树需要不断更新最大值为当前值
   - 返回值：根节点

2. 确定终止条件

   - 根节点为 null 时，返回 true
   - 当前值不在[min, max]区间时，返回 false

3. 确定单层递归逻辑

   - 递归左右子树

### 代码

```js
function isValidBST(root) {
  const traverse = (root, min, max) => {
    if (!root) return true
    if (root.val <= min || root.val >= max) return false

    return (
      traverse(root.left, min, root.val) && traverse(root.right, root.val, max)
    )
  }

  return traverse(root, -Infinity, Infinity)
}
```

#### 迭代

思路：

1. 使用栈存储节点及其允许的上下界
2. 遍历时检查节点值是否在范围内，并更新子节点的范围

```js
function isValidBST(root) {
  if (!root) return true

  const stack = [[root, -Infinity, Infinity]]

  while (stack.length) {
    const [node, min, max] = stack.pop()
    if (node.val <= min || node.val >= max) return false
    node.left && stack.push([node.left, min, node.val])
    node.right && stack.push([node.right, node.val, max])
  }

  return true
}
```
