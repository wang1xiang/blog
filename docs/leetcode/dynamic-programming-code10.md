---
date: 2025-3-26
title: 跟着卡哥学算法Day 43：动态规划part10
tags:
  - leetcode
describe: 动态规划part10
---

## 300.最长递增子序列 🌟🌟

[力扣链接](https://leetcode.cn/problems/longest-increasing-subsequence/) 🌟🌟

### 题目描述

给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。

子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，[3,6,2,7] 是数组 [0,3,1,6,2,2,7] 的子序列。

示例 1：

- 输入：nums = [10,9,2,5,3,7,101,18]
- 输出：4
- 解释：最长递增子序列是 [2,3,7,101]，因此长度为 4 。

示例 2：

- 输入：nums = [0,1,0,3,2,3]
- 输出：4

示例 3：

- 输入：nums = [7,7,7,7,7,7,7]
- 输出：1

提示：

- 1 <= nums.length <= 2500
- -10^4 <= nums[i] <= 104

### 解题思路

- 子序列：**由数组派生而来的序列（子数组），删除（或不删除）数组中的元素而不改变其余元素的顺序**
- 自增子序列：**子序列中的元素是递增的**

子序列问题是动态规划解决的经典问题，当前下标 i 的递增子序列长度，和 i 之前的下标为 0...i-1 的子序列长度有关系。

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[i] 表示 i 之前（包括 i），以 nums[i]为结尾的最长递增子序列长度

   - ❌ 误解：`dp[i]` 表示从 `nums[0]` 到 `nums[i]` 的数组中的最长递增子序列长度
   - ✅ 正解：`dp[i]` 表示 **以 `nums[i]` 为结尾** 的所有递增子序列中，最长子序列的长度

   **核心思想**：

   - 每个位置 `i` 的 `dp[i]` 仅关注以 `nums[i]` 结尾的子序列
   - 必须满足 `nums[i] > nums[j]`，才能将 `nums[i]` 追加到以 `nums[j]` 结尾的子序列后，形成更长的子序列

2. 确定递推公式

   **位置 i 的最长递增子序列等于 j 从 0 到 i-1 各个位置的最长递增子序列+1 的最大值**

   ```js
   if (nums[i] > nums[j]) dp[i] = Math.max(dp[i], dp[j] + 1)
   ```

   - 若 nums[i] > nums[j]，说明可将 nums[i] 接在以 nums[j] 结尾的子序列后，形成更长的子序列
   - 取 max 是为了找到 j 从 0 到 i-1 所有可能的最大值

3. dp 数组初始化

   `dp[i] = 1`：每个位置的初始长度为 1（单独一个元素本身就是一个长度为 1 的子序列）

4. 确定遍历顺序

   dp[i]由 dp[i-1]推导出，遍历 i 一定从前往后

   j 遍历 0 到 i-1，从前往后或从后往前都可以，只要全遍历就行

   ```js
   for (let i = 1; i < nums.length; i++) {
     for (let j = 0; j < i; j++) {
       if (nums[i] > nums[j]) dp[i] = Math.max(dp[i], dp[j] + 1)
     }
   }
   ```

   **为什么需要两层循环？**

   - 外层循环：遍历每个元素 nums[i]，作为当前子序列的结尾
   - 内层循环：遍历所有 j < i，检查是否可以将 nums[i] 追加到以 nums[j] 结尾的子序列中
   - 关键：子序列的最后一个元素 nums[j] 是该子序列的最大值，因此只需比较 nums[j] 和 nums[i]

5. 举例推导 dp 数组

   以示例 `nums = [10,9,2,5,3,7,101,18]` 逐步分析：

   1. 初始化：`dp = [1,1,1,1,1,1,1,1]`
   2. 计算过程：

      - `i=0`：无 `j`，保持 `dp[0]=1`
      - `i=1`：`nums[1]=9`，所有 `j < 1` 的数都比 9 大，无法追加 → `dp[1]=1`
      - `i=2`：`nums[2]=2`，前面没有更小的数 → `dp[2]=1`
      - `i=3`：`nums[3]=5`

        - `j=2`：`nums[2]=2 <5` → `dp[3] = dp[2]+1 = 2`

      - `i=4`：`nums[4]=3`

        - `j=2`：`nums[2]=2 <3` → `dp[4] = dp[2]+1 = 2`

      - `i=5`：`nums[5]=7`

        - `j=2`：`nums[2]=2 <7` → `dp[5]=dp[2]+1=2`
        - `j=3`：`nums[3]=5 <7` → `dp[5]=dp[3]+1=3`
        - `j=4`：`nums[4]=3 <7` → `dp[5]=dp[4]+1=3`  
          → 最终 `dp[5]=3`

      - `i=6`：`nums[6]=101`

        - 遍历所有 `j <6`，最长子序列来自 `j=5` → `dp[6]=dp[5]+1=4`

      - `i=7`：`nums[7]=18`

        - 最长子序列来自 `j=5`（`7 <18`）→ `dp[7]=dp[5]+1=4`

   3. 最终 `dp` 数组：`[1,1,1,2,2,3,4,4]` → 最大值为 4。

### 代码

```js
var lengthOfLIS = function (nums) {
  const n = nums.length
  // 初始各个位置最长递增子序列都是1
  const dp = new Array(n).fill(1)

  let result = 1
  for (let i = 1; i < n; i++) {
    // j是从0到i-1各个位置
    for (let j = 0; j < i; j++) {
      // 如果nums[i] > nums[j] 则可以追加nums[i] 形成更长的递增子序列
      // 找出从0到i-1中最长的一个
      if (nums[i] > nums[j]) dp[i] = Math.max(dp[i], dp[j] + 1)
    }
    console.log(dp)
    result = Math.max(result, dp[i])
  }
  return result
}
```

## 674. 最长连续递增序列 🌟

[力扣链接](https://leetcode.cn/problems/longest-continuous-increasing-subsequence/description/) 🌟

### 题目描述

给定一个未经排序的整数数组，找到最长且 连续递增的子序列，并返回该序列的长度。

连续递增的子序列 可以由两个下标 l 和 r（l < r）确定，如果对于每个 l <= i < r，都有 nums[i] < nums[i + 1] ，那么子序列 [nums[l], nums[l + 1], ..., nums[r - 1], nums[r]] 就是连续递增子序列。

示例 1：

- 输入：nums = [1,3,5,4,7]
- 输出：3
- 解释：最长连续递增序列是 [1,3,5], 长度为 3。尽管 [1,3,5,7] 也是升序的子序列, 但它不是连续的，因为 5 和 7 在原数组里被 4 隔开。

示例 2：

- 输入：nums = [2,2,2,2,2]
- 输出：1
- 解释：最长连续递增序列是 [2], 长度为 1。

提示：

- 0 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9

### 解题思路

在[300.最长递增子序列](#300最长递增子序列-)的基础上，增加了**连续**的限制

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[i]表示以下标 i 为结尾的连续最长递增子序列长度

2. 确定递推公式

   与[300.最长递增子序列](#300最长递增子序列-)的递推公式不同，此处**只需与前一个元素比较**：

   ```js
   if (nums[i] > nums[i - 1]) {
     dp[i] = dp[i - 1] + 1
   } else {
     //  断开连续，重新开始计数
     dp[i] = 1
   }
   ```

   - 连续递增要求子序列在原数组中连续，因此只需检查 nums[i] 是否比 nums[i-1] 大
   - 若满足条件，则当前长度继承前一个位置的长度加 1
   - 否则重置为 1

3. dp 数组初始化

   `dp[i] = 1` ：每个位置的初始长度为 1（单独一个元素本身就是一个长度为 1 的子序列）

4. 确定遍历顺序

   从前往后遍历，只需要一层 for 循环，比较当前和前一个值的大小

   **每次只需检查当前元素与前一个元素的关系，无需遍历更早的历史状态**

5. 举例推导 dp 数组

   以 nums = [1,3,5,4,1] 为例，得到的 dp 数组为：

   ```js
   dp = [1, 2, 3, 1, 2]
   ```

   最后取 dp[i]中的最大值，即为最长连续递增子序列长度

#### 代码

```js
var findLengthOfLCIS = function (nums) {
  const n = nums.length
  const dp = new Array(n).fill(1)

  let result = 1

  for (let i = 1; i < n; i++) {
    // 只需要与前一个数比较
    if (nums[i] > nums[i - 1]) {
      // 大于就追加
      dp[i] = dp[i - 1] + 1
    }
  }
  return Math.max(...dp)
}
```

### 与最长递增子序列（LIS）的区别

| 特性           | LIS（非连续）                              | LCIS（连续）                                   |
| -------------- | ------------------------------------------ | ---------------------------------------------- |
| 子序列要求     | 元素递增，可不连续                         | 元素递增且必须连续                             |
| 状态定义       | dp[i]：以 nums[i] 结尾的最长递增子序列长度 | dp[i]：以 nums[i] 结尾的最长连续递增子序列长度 |
| 状态转移复杂度 | O(n²)（需要两层循环）                      | O(n)（只需比较前一个元素）                     |

## 718. 最长重复子数组 🌟🌟

[力扣链接](https://leetcode.cn/problems/maximum-length-of-repeated-subarray/description/) 🌟🌟

### 题目描述

给两个整数数组  A  和  B ，返回两个数组中公共的、长度最长的子数组的长度。

示例：

输入：

- A: [1,2,3,2,1]
- B: [3,2,1,4,7]
- 输出：3
- 解释：长度最长的公共子数组是 [3, 2, 1] 。

提示：

- 1 <= len(A), len(B) <= 1000
- 0 <= A[i], B[i] < 100

### 解题思路

二维 dp 数组

第一个数组到 i - 1 位置，第二个数组到 j - 1 位置，最长的重复子数组长度为 dp[i][j]

动规五部曲：

1. 确定 dp 数组及下标的含义

   dp[i][j]表示以 nums1[i-1] 和 nums2[j-1] 为结尾的最长公共连续子数组的长度 **（注：索引从 1 开始，便于处理边界条件）**

2. 确定递归公式

   根据 dp[i][j]的定义，dp[i][j]的状态只能由 dp[i - 1][j - 1]推导而来

   即当 nums1[i - 1]等于 nums2[j - 1]时：

   ```js
   dp[i][j] = dp[i - 1][j - 1] + 1
   ```

3. dp 数组初始化

   创建一个二维数组 dp，大小为 **(nums1.length+1) × (nums2.length+1)**，初始值为 0

   dp[i][j] 表示以 nums1[i-1] 和 nums2[j-1] 结尾的最长公共子数组长度，则：

   - i 和 j 的取值范围为 [1, nums1.length] 和 [1, nums2.length]，对应原数组 nums1 和 nums2 的索引 [0, length-1]，所以需要额外加一行一列
   - **通过增加一行一列，统一处理边界条件，避免索引越界**

   dp[i][0] 和 dp[0][j] 都初始化为 0，因为当一个数组长度为 0 时，最长公共子数组长度也为 0

4. 确定遍历顺序

   外层 for 循环遍历 nums1，内层 for 循环遍历 nums2

   ```js
   for (let i = 1; i < nums1.length; i++) {
     for (let j = 1; j < nums2.length; j++) {
       if (nums1[i - 1] === nums2[j - 1]) {
         dp[i][j] = dp[i - 1][j - 1] + 1
       }

       result = Math.max(result, dp[i][j])
     }
   }
   ```

5. 举例推导 dp 数组

   拿示例 1 中，nums1: [1,2,3,2,1]，nums2: [3,2,1,4,7]为例，得到 dp 数组：

   ```js
   dp = [
     [0, 0, 0, 0, 0, 0],
     [0, 0, 0, 1, 0, 0],
     [0, 0, 1, 0, 0, 0],
     [0, 1, 0, 0, 0, 0],
     [0, 0, 2, 0, 0, 0],
     [0, 0, 0, 3, 0, 0],
   ]
   ```

### 代码

```js
var findLength = function (nums1, nums2) {
  const n1 = nums1.length
  const n2 = nums2.length
  const dp = new Array(n1 + 1).fill().map(() => new Array(n2 + 1).fill(0))
  let result = 0

  for (let i = 1; i <= n1; i++) {
    for (let j = 1; j <= n2; j++) {
      // 遇到A[i - 1] === B[j - 1]，则更新dp数组
      if (nums1[i - 1] === nums2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      }
      result = Math.max(result, dp[i][j])
    }
  }
  console.log(dp)
  return result
}
```

### 为什么是 nums1[i-1] 和 nums2[j-1]，而不是 num1[i] 和 nums2[j]？

#### 简化初始化逻辑

- 定义为 nums1[i-1]时，初始化时全为 0，额外加一行一列，**无需额外代码处理 i=0 或 j=0 的边界情况**
- 定义为 nums1[i] 时，第一行第一列需要初始化，即当 nums1[i]和 nums2[0]相同时，对应的 dp[i][0]需要初始化为 1

  ```js
  // 要对第一行，第一列经行初始化
  for (int i = 0; i < nums1.length; i++) if (nums1[i] == nums2[0]) dp[i][0] = 1;
  for (int j = 0; j < nums2.length; j++) if (nums1[0] == nums2[j]) dp[0][j] = 1;
  ```

#### 避免索引越界

当 nums1[i-1] == nums2[j-1] 时，状态转移方程为：

```js
dp[i][j] = dp[i - 1][j - 1] + 1
```

- 定义为 nums1[i-1] 和 nums2[j-1]，无需判断 i-1 是否越界
- 如果定义为 nums1[i] 和 nums2[j]，则需要判断 i-1 和 j-1 是否越界

  ```js
  if i > 0 and j > 0:
  ```

### 滚动数组

dp[i][j]只和 dp[i-1][j-1]有关，可以使用滚动数组优化空间

dp[j]只能由 dp[j-1]推出，也就是可以把上一层 dp[i-1][j]拷贝到下一层 dp[i][j]来继续用

```js
const findLength = (nums1, nums2) => {
  let n1 = nums1.length,
    n2 = nums2.length
  let dp = new Array(n2 + 1).fill(0)
  let res = 0
  for (let i = 1; i <= n1; i++) {
    for (let j = n2; j > 0; j--) {
      if (nums1[i - 1] === nums2[j - 1]) {
        dp[j] = dp[j - 1] + 1
      } else {
        dp[j] = 0
      }
      res = Math.max(res, dp[j])
    }
  }
  return res
}
```
