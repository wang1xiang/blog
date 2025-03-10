---
date: 2025-3-10
title: 跟着卡哥学算法Day 27：贪心算法理论 & part1
tags:
  - leetcode
describe: 贪心算法理论 & part1
---

## 贪心算法

**贪心的本质是选择每一阶段的局部最优，从而达到全局最优**。

### 核心思想

- **局部最优选择**：每一步只考虑当前最优解，不关系后序步骤的影响
- **不可逆性**：没有类似回溯的步骤

举例：有一堆钞票，只能拿 10 张，如果想要达到最大金额，应该怎么拿？

指定每次拿最大的，最终结果就是拿走最大数额的钱。

### 什么时候用贪心

没有固定套路

贪心法适用于满足以下两个条件的问题：

- **贪心选择性质（Greedy Choice Property）**：通过每一步的局部最优选择，最终能构造出全局最优解
- **最优子结构（Optimal Substructure）**：问题的最优解包含其子问题的最优解

### 贪心法经典场景

1. 活动选择问题

   - 问题：从多个时间不重叠的活动中选出最多的活动
   - 贪心策略：每次选择结束时间最早的活动，为后续留出更多时间

2. 霍夫曼编码（Huffman Coding）

   - 问题：用最短的二进制编码表示字符，实现数据压缩
   - 贪心策略：优先合并频率最低的两个节点，生成最优前缀码

3. 最小生成树（Prim/Kruskal 算法）

   - 问题：在带权图中找连接所有顶点的最小权值和的树
   - 贪心策略
     - Prim：每次选当前已选顶点到未选顶点的最小边
     - Kruskal：每次选全图未选的最小边，且不形成环

4. 最短路径问题（Dijkstra 算法）

   - 问题：在带权图中找单源最短路径
   - 贪心策略：每次从未处理的顶点中选择距离起点最近的顶点，更新其邻居的最短路径

5. 零钱兑换问题（部分场景）

   - 问题：用最少的硬币数凑出某个金额
   - 贪心策略：优先使用面值最大的硬币（需满足硬币面值满足贪心条件，如美元中的 1, 5, 10, 25 分）

### 贪心法解题步骤

一般分为如下四步：

1. 将问题分解为若干个子问题
2. 找出适合的贪心策略
3. 求解每一个子问题的最优解
4. 将局部最优解堆叠成全局最优解

## 455.分发饼干 🌟

[力扣链接](https://leetcode.cn/problems/assign-cookies/description/) 🌟

### 题目描述

假设你是一位很棒的家长，想要给你的孩子们一些小饼干。但是，每个孩子最多只能给一块饼干。

对每个孩子 i，都有一个胃口值 g[i]，这是能让孩子们满足胃口的饼干的最小尺寸；并且每块饼干 j，都有一个尺寸 s[j] 。如果 s[j] >= g[i]，我们可以将这个饼干 j 分配给孩子 i ，这个孩子会得到满足。你的目标是尽可能满足越多数量的孩子，并输出这个最大数值。

示例 1:

- 输入: g = [1,2,3], s = [1,1]
- 输出: 1
- 解释:你有三个孩子和两块小饼干，3 个孩子的胃口值分别是：1,2,3。虽然你有两块小饼干，由于他们的尺寸都是 1，你只能让胃口值是 1 的孩子满足。所以你应该输出 1。

示例 2:

- 输入: g = [1,2], s = [1,2,3]
- 输出: 2
- 解释:你有两个孩子和三块小饼干，2 个孩子的胃口值分别是 1,2。你拥有的饼干数量和尺寸都足以让所有孩子满足。所以你应该输出 2.

提示：

- `1 <= g.length <= 3 * 10^4`
- `0 <= s.length <= 3 * 10^4`
- `1 <= g[i], s[j] <= 2^31 - 1`

### 解题思路

**局部最优：大饼干尽量满足胃口大的小孩，充分利用饼干尺寸喂饱一个**
**全局最优：喂饱尽可能多的小孩**

局部最优能满足全局最优，并且找不出反例否决我们的想法

1. 排序：对胃口数组 g 和饼干数组 s 排序
2. 双指针遍历：两个数组都从尾部可是递减，如果 g[i] <= s[j]，则满足一个小孩，两个指针前移

### 代码

```js
var findContentChildren = function (g, s) {
  g.sort((a, b) => a - b)
  s.sort((a, b) => a - b)

  let result = 0
  let j = s.length - 1

  // 遍历胃口  无论是否满足，移动到上一个胃口
  for (let i = g.length - 1; i >= 0; i--) {
    // 遍历饼干 当前孩子被满足，移动到上一个饼干
    if (j >= 0 && g[i] <= s[j]) {
      result++
      j--
    }
  }

  return result
}
```

## 376. 摆动序列 🌟🌟

[力扣链接](https://leetcode.cn/problems/wiggle-subsequence/description/) 🌟🌟

### 题目描述

如果连续数字之间的差严格地在正数和负数之间交替，则数字序列称为摆动序列。第一个差（如果存在的话）可能是正数或负数。少于两个元素的序列也是摆动序列。

例如， [1,7,4,9,2,5] 是一个摆动序列，因为差值 (6,-3,5,-7,3) 是正负交替出现的。相反, [1,4,7,2,5] 和 [1,7,4,5,5] 不是摆动序列，第一个序列是因为它的前两个差值都是正数，第二个序列是因为它的最后一个差值为零。

给定一个整数序列，返回作为摆动序列的最长子序列的长度。 通过从原始序列中删除一些（也可以不删除）元素来获得子序列，剩下的元素保持其原始顺序。

示例 1:

- 输入: [1,7,4,9,2,5]
- 输出: 6
- 解释: 整个序列均为摆动序列。

示例 2:

- 输入: [1,17,5,10,13,15,10,5,16,8]
- 输出: 7
- 解释: 这个序列包含几个长度为 7 摆动序列，其中一个可为[1,17,10,13,10,16,8]。

示例 3:

- 输入: [1,2,3,4,5,6,7,8,9]
- 输出: 2

### 解题思路

难度一下飙升

**局部最优：删除单调坡上节点（非顶点），那么这个坡度就有两个局部峰值**
**整体最优：整个序列有最多的局部峰值，从而达到最长摆动序列**

1. 初始化处理：直接处理数组长度小于等于 1 的情况
2. 遍历数组：计算当前差值 currDiff
3. 符号交替判断：比较 prevDiff 和 currDiff，增加计数并更新 prevDiff

可分为三种情况

- 情况一：上下坡中有平坡

  - 如[1,2,2,2,2,1]
  - i 指向第一个 2，currDiff = 0，prevDiff > 0
  - i 指向第二个 2，currDiff = 0，prevDiff = 0
  - i 指向最后一个 2，currDiff < 0，prevDiff = 0
  - 可以得到条件如下

  ```js
  for (i = 2; i < nums.length; i++) {
    const currDiff = nums[i + 1] - nums[i]
    if ((preDiff <= 0 && currDiff > 0) || (preDiff >= 0 && currDiff < 0)) {
      count++
    }
    prevDiff = currDiff
  }
  ```

- 情况二：数组首尾两端
- 情况三：单调坡中有平坡

  - 如[1,2,2,2,3,4]
  - 按照情况一 每次遍历都会更新 prevDiff
  - 到 3 时，此时 prevDiff = 0，currDiff = 1 > 0，满足上述条件，count++，导致误统计
  - **如何更新 prevDiff？**
  - 每次坡度摆动变化的时候，在更新 prevDiff 即可

  ```js
  for (let i = 2; i < nums.length; i++) {
    const currDiff = nums[i + 1] - nums[i]
    if ((prevDiff <= 0 && currDiff > 0) || (prevDiff >= 0 && currDiff < 0)) {
      count++
      prevDiff = currDiff
    }
  }
  ```

### 代码

```js
var wiggleMaxLength = function (nums) {
  if (nums.length <= 1) return nums.length
  let prevDiff = 0
  let count = 1
  for (let i = 0; i < nums.length; i++) {
    const currDiff = nums[i + 1] - nums[i]
    if ((prevDiff >= 0 && currDiff < 0) || (prevDiff <= 0 && currDiff > 0)) {
      count++
      prevDiff = currDiff
    }
  }
  return count
}
```

## 53. 最大子序和 🌟🌟

[力扣链接](https://leetcode.cn/problems/maximum-subarray/description/) 🌟🌟

### 题目描述

给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

示例:

- 输入: [-2,1,-3,4,-1,2,1,-5,4]
- 输出: 6
- 解释: 连续子数组 [4,-1,2,1] 的和最大，为 6

### 解题思路

#### 暴力法：

- 两层 for 循环
- 外层 for 循环控制起始位置
- 内层 for 循环遍历子数组，计算和，并更新最大和

```js
var maxSubArray = function (nums) {
  let maxSum = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      maxSum = Math.max(maxSum, sum)
    }
  }
  return maxSum
}
```

暴力法时间复杂度为 O(n^2)，在 leetcode 中会超时

#### 贪心法

**局部最优：当前连续和为负数，则丢弃，从下一个元素开始重新计算，因为负数加上下一个元素，连续和会越来越小**
**全局最优：最大连续子数组和**

以[-2,1,-3,4,-1,2,1,-5,4]为例：

- 遍历 nums，[-2,1,-3]相加连续和为负数，此时就需要从 4 开始重新计算

```js
var maxSubArray = function (nums) {
  let maxSum = -Infinity
  let currentSum = 0
  for (let i = 0; i < nums.length; i++) {
    currentSum += nums[i]

    maxSum = Math.max(maxSum, currentSum)
    if (currentSum < 0) currentSum = 0
  }
  return maxSum
}
```
