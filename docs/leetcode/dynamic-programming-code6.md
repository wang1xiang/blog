---
date: 2025-3-21
title: 跟着卡哥学算法Day 38：动态规划part6
tags:
  - leetcode
describe: 动态规划part6
---

## 322. 零钱兑换 🌟🌟

[力扣链接](https://leetcode.cn/problems/coin-change/description/) 🌟🌟

### 题目描述

给定不同面额的硬币 coins 和一个总金额 amount。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回  -1。

你可以认为每种硬币的数量是无限的。

示例  1：

- 输入：coins = [1, 2, 5], amount = 11
- 输出：3
- 解释：11 = 5 + 5 + 1

示例 2：

- 输入：coins = [2], amount = 3
- 输出：-1

示例 3：

- 输入：coins = [1], amount = 0
- 输出：0

示例 4：

- 输入：coins = [1], amount = 1
- 输出：1

示例 5：

- 输入：coins = [1], amount = 2
- 输出：2

提示：

- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4

### 解题思路

**装满这个背包，最少物品是多少？**

题意可得：每种硬币数量是无限的，典型的完全背包问题

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[j]凑足总额为 j 所使用的最少钱币个数

2. 确定递推公式

   - 凑足总额为 j - coins[i]的钱币最少个数为 dp[j - coins[i]]
   - 所以凑足 dp[j] 通过 dp[j - coins[i]] + 1（只需要一个钱币 coins[i]）
   - dp[j]要取所有的 dp[j - coins[i]] + 1 中最小的

   ```js
   // 递推公式为
   dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1)
   ```

3. dp 数组初始化

   - `dp[0] = 0`，凑足总额为 0 的钱币最少个数为 0
   - `dp[j] = Infinity`, 其余位置必须初始化为最大值，否则在 Math.min(dp[j], dp[j - coins[i]] + 1)时会被覆盖

4. 确定遍历顺序

   - 本题求组合数，所以外层遍历物品，内层遍历背包
   - 完全背包问题：内层 for 循环正序遍历

5. 举例推导 dp 数组

   以 coins = [1, 2, 5]，amount = 5 为例：

   ```js
   dp = [0, 1, 1, 2, 2, 1]
   ```

### 代码

```js
var coinChange = function (coins, amount) {
  if (!amount) return 0
  const dp = new Array(amount + 1).fill(Infinity)

  dp[0] = 0

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i]
    for (let j = coin; j <= amount; j++) {
      dp[j] = Math.min(dp[j], dp[j - coin] + 1)
    }
    console.log(dp)
  }

  return dp[amount] === Infinity ? -1 : dp[amount]
}
```

### 注意

- **如果求组合数就是外层 for 循环遍历物品，内层 for 遍历背包。**
- **如果求排列数就是外层 for 遍历背包，内层 for 循环遍历物品。**

如零钱兑换：coins = [1, 2], amount = 3

- 求**组合数**：1+1+1 和 1+2（共 2 种，顺序无关）
- 求**排列数**：1+1+1、1+2、2+1（共 3 种，顺序不同视为不同方案）

1. 求组合数（外层遍历物品，内层遍历背包）

   ```js
   for (let i = 0; i < coins.length; i++) {
     const coin = coins[i]
     for (let j = coin; j <= amount; j++) {
       dp[j] = dp[j] + dp[j - coin]
     }
   }
   ```

   - 外层遍历硬币：确保每个硬币的处理是独立的
   - 内层遍历金额：更新金额时只基于当前及之前处理过的硬币

   例如，计算 dp[3] 时：

   - 处理硬币 2 时，dp[3] 通过 1+2 更新
   - 硬币的顺序固定（始终先处理 1 后处理 2），不会出现 2+1 的情况
   - 结果为组合数 2

2. 求排列数（外层遍历背包，内层遍历物品）

   ```js
   for (let j = 1; j <= amount; j++) {
     for (let i = 0; i < coins.length; i++) {
       const coin = coins[i]
       if (j >= coin) {
         dp[j] = dp[j] + dp[j - coin]
       }
     }
   }
   ```

   - 外层遍历金额：对每个金额 j，考虑所有可能的硬币
   - 内层遍历硬币：允许不同顺序的组合

   例如，计算 dp[3] 时：

   - 使用 1：继承 dp[2]（包含 1+1 和 2）
   - 使用 2：继承 dp[1]（包含 1）
   - 此时，1+2 和 2+1 被视为不同方案，结果为排列数 3

## 279.完全平方数 🌟🌟

[力扣链接](https://leetcode.cn/problems/perfect-squares/description/) 🌟🌟

### 题目描述

给定正整数  n，找到若干个完全平方数（比如  1, 4, 9, 16, ...）使得它们的和等于 n。你需要让组成和的完全平方数的个数最少。

给你一个整数 n ，返回和为 n 的完全平方数的 最少数量 。

完全平方数 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。

示例  1：

- 输入：n = 12
- 输出：3
- 解释：12 = 4 + 4 + 4

示例 2：

- 输入：n = 13
- 输出：2
- 解释：13 = 4 + 9

提示：

- 1 <= n <= 10^4

### 解题思路

题意：**完全平方数就是物品（可无限使用），凑成正整数 n 就是背包，问凑满这个背包最少有多少物品**

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[j]表示和为 j 的完全平方数的最少数量为 dp[j]

2. 确定递推公式

   - dp[j]由 `dp[j - i * i]` 推出，`dp[j - i * i] + 1` 就可以凑出 dp[j]
   - 需要选择最小的 dp[j]

   ```js
   dp[j] = Math.min(dp[j], dp[j - i * i] + 1)
   ```

3. dp 数组初始化

   - 根据递推公式，需要初始化 `dp[0] = 0`（和为 0 的完全平方数的最小数量），这样才能推导出其他
   - 其他位置初始化为 `Infinity`

4. 确定遍历顺序

   先遍历物品，再遍历背包

5. 举例推导 dp 数组

   假设 n = 5：

   ```js
   dp = [0, 1, 2, 3, 1, 2]
   ```

#### 代码

```js
var numSquares = function (n) {
  const dp = new Array(n + 1).fill(Infinity)
  dp[0] = 0

  for (let i = 1; i * i <= n; i++) {
    for (let j = i * i; j <= n; j++) {
      dp[j] = Math.min(dp[j], dp[j - i * i] + 1)
    }
    console.log(dp)
  }
  return dp[n]
}
```

## 139.单词拆分 🌟🌟

[力扣链接](https://leetcode.cn/problems/word-break/description/) 🌟🌟

### 题目描述

给定一个非空字符串 s 和一个包含非空单词的列表 wordDict，判定  s 是否可以被空格拆分为一个或多个在字典中出现的单词。

说明：

拆分时可以重复使用字典中的单词。

你可以假设字典中没有重复的单词。

示例 1：

- 输入: s = "leetcode", wordDict = ["leet", "code"]
- 输出: true
- 解释: 返回 true 因为 "leetcode" 可以被拆分成 "leet code"。

示例 2：

- 输入: s = "applepenapple", wordDict = ["apple", "pen"]
- 输出: true
- 解释: 返回 true 因为 "applepenapple" 可以被拆分成 "apple pen apple"。
- 注意你可以重复使用字典中的单词。

示例 3：

- 输入: s = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]
- 输出: false

### 解题思路

**单词类比为物品，字符串 s 就是背包，单词能否组成字符串，即物品能不能把背包装满。**

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[i]：字符串长度为 i 时，dp[i]为 true，表示可以拆分为一个或多个在字典中出现的单词

2. 确定递推公式
3. 初始化 dp 数组

4. 确定遍历顺序

5. 举例推导 dp 数组

### 代码

```js

```

## 01 背包对比完全背包

### 01 背包问题

#### 定义

- 特点：每个物品只能选择 0 次或 1 次
- 问题模型：在背包容量限制下，求最大价值或组合数
- 状态定义：`dp[j]` 表示容量为 `j` 的背包能装的最大价值（或组合数）

#### 状态转移方程

```js
dp[j] = max(dp[j], dp[j - weight[i]] + value[i]) // 求最大价值
// 或
dp[j] += dp[j - nums[i]] // 求组合数（如目标和问题）
```

#### 初始化

- 求最大价值：`dp` 数组初始化为 0
- 求组合数：`dp[0] = 1`（表示空背包有一种方式），其余初始化为 0

#### 遍历顺序

```js
for (物品 i = 0; i < n; i++) {
  for (容量 j = maxWeight; j >= weight[i]; j--) { // 倒序遍历
    dp[j] = Math.max(dp[j], dp[j - weight[i]] + value[i]);
  }
}
```

#### 典型例题

- [分割等和子集](https://leetcode.com/problems/partition-equal-subset-sum/)
- [目标和](https://leetcode.com/problems/target-sum/)

### 完全背包问题

#### 定义

- 特点：每个物品可以选无限次
- 问题模型：在背包容量限制下，求装满背包的组合数或最小物品数
- 状态定义：`dp[j]` 表示容量为 `j` 的背包的组合数或最小物品数

#### 状态转移方程

```js
dp[j] = Math.max(dp[j], dp[j - nums[i]] + value[i]) // 求最大价值
dp[j] += dp[j - nums[i]] // 求组合数（如零钱兑换 II）
dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1) // 求最小物品数（如零钱兑换）
```

#### 初始化

- 求组合数：`dp[0] = 1`，其余初始化为 0
- 求最小物品数：`dp[0] = 0`，其余初始化为 `Infinity`

#### 遍历顺序

```js
for (物品 i) {
  for (容量 j = nums[i]; j <= maxWeight; j++) { // 正序遍历
    dp[j] = Math.max(dp[j], dp[j - nums[i]] + value[i]);
    dp[j] += dp[j - nums[i]]; // 组合数
    dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1);// 最小物品数
  }
}
```

#### 典型例题

- [零钱兑换 II](https://leetcode.com/problems/coin-change-ii/)
- [完全平方数](https://leetcode.com/problems/perfect-squares/)

### 总结

- 01 背包：物品唯一，倒序遍历容量，解决“是否选择”的问题
- 完全背包：物品无限，正序遍历容量，解决“多次选择”的问题
- 核心技巧：根据问题特点选择遍历顺序，区分组合数或最值问题的初始化方式
