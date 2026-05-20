---
title: "跟着卡哥学算法Day 36：动态规划part4"
published: 2025-03-19
description: "动态规划part4"
tags: ["leetcode"]
category: "算法"
image: api
draft: false
---

**找问题最好的方式就是把 dp 数组打印出来，看看是不是和我们推导的公式一致。**

**做动规题目前，一定要把状态转移在 dp 数组上的具体情况模拟一遍，确定最后推出的是想要的结果。**

## 1049.最后一块石头的重量 II 🌟🌟

[力扣链接](https://leetcode.cn/problems/last-stone-weight-ii/description/) 🌟🌟

### 题目描述

有一堆石头，每块石头的重量都是正整数。

每一回合，从中选出任意两块石头，然后将它们一起粉碎。假设石头的重量分别为  x 和  y，且  x <= y。那么粉碎的可能结果如下：

如果  x == y，那么两块石头都会被完全粉碎；

如果  x != y，那么重量为  x  的石头将会完全粉碎，而重量为  y  的石头新重量为  y-x。

最后，最多只会剩下一块石头。返回此石头最小的可能重量。如果没有石头剩下，就返回 0。

示例：

- 输入：[2,7,4,1,8,1]
- 输出：1

解释：

- 组合 2 和 4，得到 2，所以数组转化为 [2,7,1,8,1]，
- 组合 7 和 8，得到 1，所以数组转化为 [2,1,1,1]，
- 组合 2 和 1，得到 1，所以数组转化为 [1,1,1]，
- 组合 1 和 1，得到 0，所以数组转化为 [1]，这就是最优值。

提示：

- 1 <= stones.length <= 30
- 1 <= stones[i] <= 1000

### 解题思路

**尽量让石头分成重量相同的两堆（尽可能相同），这样相撞之后剩下的石头就是最小的。**

转换为 01 背包问题：有一堆石头 stores，每块石头的重量和价值多是 stores[i]，问是否能装满最大重量为 sum/2 的背包。

动规五部曲：

1. 确定 dp 数组及下标的含义

   - dp[j] 表示容量为 j 的背包最多可以背的最大重量

2. 确定递推公式

   dp[j]的最大重量等于不放入石头（当前背包重量 dp[j]）和放入石头（dp[j - stores[i]] + stores[i]）的最大值

   ```js
   dp[j] = Math.max(dp[j], dp[j - stores[i]] + stores[i])
   ```

3. dp 数组初始化

   dp 数组的大小等于 sum/2

   dp 数组初始化都为 0，因为通过递推公式 dp[j] = Math.max(dp[j], dp[j - stores[i]] + stores[i])都会被覆盖

   ```js
   dp = new Array(sum / 2 + 1).fill(0)
   ```

   以[2,7,4,1,8,1]为例，初始化 dp 数组为[0,0,0,0,0,0,0,0,0,0,0]

4. 确定遍历顺序

   如果使用一维数组，先正序遍历物品，再逆序遍历背包

   ```js
   for (let i = 0; i < stores.length; i++) {
     for (let j = sum / 2; j >= 0; j--)
   }
   ```

5. 举例推导 dp 数组

   以[2,7,4,1,8,1]为例，dp 数组最终输出为：

   ```js
   dp = [
     // 遍历2
     [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
     // 遍历7
     [0, 0, 2, 2, 2, 2, 2, 7, 7, 9, 9, 9],
     // 遍历4
     [0, 0, 2, 2, 4, 4, 6, 7, 7, 9, 9, 11],
     // 遍历1
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
     // 遍历8
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
     // 遍历1
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
   ]
   ```

最后 dp[target]里是容量为 target 的背包所能背的最大重量

那么分成两堆石头，一堆石头的总重量是 dp[target]，另一堆就是 sum - dp[target]

**在计算 target 的时候，target = sum / 2 因为是向下取整，所以 sum - dp[target] 一定是大于等于 dp[target]的**

### 代码

```js
var lastStoneWeightII = function (stores) {
  const sum = stores.reduce((acc, cur) => acc + cur)
  const target = Math.floor(sum / 2)
  const len = stores.length

  const dp = new Array(target + 1).fill(0)

  for (let i = 0; i < len; i++) {
    const store = stores[i]
    for (let j = target; j >= store; j--) {
      dp[j] = Math.max(dp[j], dp[j - store] + store)
    }
    console.log(dp)
  }

  return sum - dp[target] - dp[target]
}
```

### 二维 dp 数组版本代码

```js
// 1. dp[i][j]表示[0, i - 1]个石头放入背包容量为j的情况下的最大重量
// 2. 每块石头可选可不选 dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - stores[i]] + stores[i])
// 3. 初始化 dp[i][0] = 0 背包容量为0，最大重量为0；dp[0][j] = stores[0]，背包容量为j时，装入第一块石头的重量
var lastStoneWeightII = function (stores) {
  const sum = stores.reduce((acc, cur) => acc + cur)
  const target = Math.floor(sum / 2)
  const len = stores.length

  const dp = new Array(len).fill().map(() => new Array(target + 1).fill(0))

  // 处理第一个石头的情况
  for (let j = 0; j <= stores[0]; j++) {
    dp[0][j] = stores[0]
  }

  for (let i = 1; i < len; i++) {
    const store = stores[i]
    for (let j = 1; j <= target; j++) {
      if (j >= store) {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - store] + store)
      } else {
        dp[i][j] = dp[i - 1][j]
      }
    }
  }
  console.log(dp)

  return sum - dp[len - 1][target] - dp[len - 1][target]
}
```

## 494.目标和 🌟🌟

[力扣链接](https://leetcode.cn/problems/target-sum/description/) 🌟🌟

### 题目描述

给定一个非负整数数组，a1, a2, ..., an, 和一个目标数，S。现在你有两个符号  +  和  -。对于数组中的任意一个整数，你都可以从  +  或  -中选择一个符号添加在前面。

返回可以使最终数组和为目标数 S 的所有添加符号的方法数。

示例：

- 输入：nums: [1, 1, 1, 1, 1], S: 3
- 输出：5

解释：

- -1+1+1+1+1 = 3
- +1-1+1+1+1 = 3
- +1+1-1+1+1 = 3
- +1+1+1-1+1 = 3
- +1+1+1+1-1 = 3

一共有 5 种方法让最终目标和为 3。

提示：

- 数组非空，且长度不会超过 20 。
- 初始的数组的和不会超过 1000 。
- 保证返回的最终结果能被 32 位整数存下。

### 解题思路

#### 回溯

#### 动规

假设数组是 [1, 1, 1, 1, 1]，目标值 target = 3

1. 计算总和

   数组总和 `sum = 1 + 1 + 1 + 1 + 1 = 5`。

2. 建立方程

   - 数组可分为：正数部分的和为 `left`，负数部分的和的绝对值为 `right`
   - 根据题意，正负号后的和为 target，即 `left - right = target = 3`
   - 数组总和为 `sum = left + right = 5`

3. 推导

   - 方程 1：`left - right = target`
   - 方程 2：`left + right = sum`

   ```js
   (left - right) + (left + right) = target + sum
   2 * left = target + sum
   left = (target + sum)/2
   ```

4. 验证结果：

   ```js
   // 正数部分和为 4
   left = (3 + 5) / 2 = 4
   // 负数部分绝对值和为 1
   right = sum - left = 5 - 4 = 1
   // 最终和为
   4 - 1 = 3
   ```

那么，此题可转换为：**找出数组中子集的和等于 `(target + sum) / 2` 的情况**，对应 01 背包就是：**即用 nums 装满容量为 `(target + sum) / 2` 的背包有多少种方法**

前提：

1. target 值不能超过 sum
2. target + sum 必须是偶数，如果 sum + target 是奇数，那么无法得到整数 left，向上或向下取整都是无解的

动规五部曲：

1. 确定 dp 数组及下标的含义

   `dp[i][j]` 表示下标[0, i]的元素中，和为 j 的情况下的方法数

2. 确定递推公式

   对于第 i 个元素 num，可以选择放入或不放入

   - 不选当前元素：组合数继承自前 i-1 个元素的结果 `dp[i-1][j]`
   - 选当前元素：组合数等于前 i-1 个元素凑出 j - nums[i] 的组合数 `dp[i-1][j - nums[i]]`
   - 总组合数是两种选择的组合数之和(与 01 背包问题不同，**01 背包求最大价值，而此处求组合数**)：

     ```js
     dp[i][j] = dp[i - 1][j] + dp[i - 1][j - nums[i]]
     ```

3. dp 数组如何初始化

   - `dp[i][0]`: 背包容量为 0，只有一种方法装满，即不放入任何物品
   - `dp[0][j]`：只放物品 0 时，只有背包容量为物品 0 重量的时候，放好填满

4. 确定遍历顺序

   先遍历物品，再遍历背包

5. 举例推导 dp 数组

   输入：nums: [1, 1, 1, 1, 1], target: 3，dp 数组状态变化如下：

   ```js
   dp = [
     [1, 0, 0, 0, 0],
     [1, 1, 0, 0, 0],
     [1, 2, 1, 0, 0],
     [1, 3, 3, 1, 0],
     [1, 4, 6, 4, 1],
     [1, 5, 10, 10, 5],
   ]
   ```

### 代码

```js
function findTargetSumWays(nums, target) {
  const sum = nums.reduce((a, b) => a + b, 0)

  // 目标和大于sum
  if (Math.abs(target) > sum) return 0
  // 目标与总数之和必须为偶数
  if (（sum + target) % 2 !== 0) return 0

  const target = (sum + target) / 2
  if (target < 0) return 0 // 确保target非负

  const len = nums.length
  // 初始化二维数组（len行 * target + 1列）
  const dp = new Array(len).fill().map(() => new Array(target + 1).fill(0))

  // 初始化第一行 处理第一个元素
  if (nums[0] <= target) {
    // 第一个元素恰好等于背包容量时 有一种方法
    dp[0][nums[0]] = 1
  }
  dp[0][0] = 1 // 初始状态：和为0有一种方式（不选任何元素）

  for (let i = 1; i < len; i++) {
    for (let j = 0; j <= target; j++) {
      if (nums[i] <= j) {
        // 放入背包： 不放入的组合数+放入的组合数
        dp[i][j] = dp[i - 1][j] + dp[i - 1][j - nums[i]]
      } else {
        // 不放入背包
        dp[i][j] = dp[i - 1][j]
      }
    }
  }
  console.log(dp)

  return dp[len - 1][target]
}
```

#### 一维数组代码

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[j] 表示容量为 j 的背包中，子集的和为 target 的情况

2. 确定递推公式

   ```js
   dp[j] = dp[j] + dp[j - nums[i]]
   ```

3. dp 数组初始化

   - dp[0] 初始为 1 ,即装满背包为 0 的方法有一种，放 0 件物品。

4. 确定遍历顺序

   先遍历物品，再逆序遍历背包

5. 举例推导 dp 数组

   nums = [1, 1, 1, 1, 1], target = 3 时

   ```js
   dp = [
     [1, 1, 0, 0, 0],
     [1, 2, 1, 0, 0],
     [1, 3, 3, 1, 0],
     [1, 4, 6, 4, 1],
     [1, 5, 10, 10, 5],
   ]
   ```

```js
var findTargetSumWays = function (nums, target) {
  const sum = nums.reduce((a, b) => a + b, 0)
  if (Math.abs(target) > sum || (target + sum) % 2 !== 0) return 0
  const bagSize = (target + sum) / 2
  if (bagSize < 0) return 0

  const dp = new Array(bagSize + 1).fill(0)
  dp[0] = 1 // 初始状态

  for (const num of nums) {
    for (let j = bagSize; j >= num; j--) {
      dp[j] += dp[j - num]
    }
    console.log(dp)
  }
  return dp[bagSize]
}
```

## 474.一和零 🌟🌟

[力扣链接](https://leetcode.cn/problems/ones-and-zeroes/description/) 🌟🌟

### 题目描述

给你一个二进制字符串数组 strs 和两个整数 m 和 n 。

请你找出并返回 strs 的最大子集的大小，该子集中 最多 有 m 个 0 和 n 个 1 。

如果 x 的所有元素也是 y 的元素，集合 x 是集合 y 的 子集 。

示例 1：

- 输入：strs = ["10", "0001", "111001", "1", "0"], m = 5, n = 3
- 输出：4
- 解释：最多有 5 个 0 和 3 个 1 的最大子集是 {"10","0001","1","0"} ，因此答案是 4 。 其他满足题意但较小的子集包括 {"0001","1"} 和 {"10","1","0"} 。{"111001"} 不满足题意，因为它含 4 个 1 ，大于 n 的值 3 。

示例 2：

- 输入：strs = ["10", "0", "1"], m = 1, n = 1
- 输出：2
- 解释：最大的子集是 {"0", "1"} ，所以答案是 2 。

提示：

- 1 <= strs.length <= 600
- 1 <= strs[i].length <= 100
- strs[i]  仅由  '0' 和  '1' 组成
- 1 <= m, n <= 100

### 解题思路

### 代码
