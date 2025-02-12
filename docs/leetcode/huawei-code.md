---
date: 2024-8-29
title: 华为OD刷题
tags:
  - leetcode
describe: 华为OD刷题
---

## 斗地主之顺子（最长的顺子）

在斗地主扑克牌游戏中，扑克牌由小到大的顺序为: 3.4.5.6.7.8.9.10.J.Q.K A.2 玩家可以出的扑克牌阵型有: 单张、对子、顺子、飞机、炸弹等。

其中顺子的出牌规则为: 由至少 5 张由小到大连续递增的扑克牌组成，且不能包含 2. 例如: {3,4,5,6,7}、{13,4,5,6,7,8,9,10,J,Q,K,A}都是有效的顺子;而{J,Q,K,A,2}、{2,3,4,5,6}、{3,4,5,6}.{3,4,5,6,8}等都不是顺子。

给定一个包含 13 张牌的数组，如果有满足出牌规则的顺子，请输出顺子

如果存在多个顺子，请每行输出一个顺子，且需要按顺子的第一张牌的大小(必须从小到大)依次输出。

如果没有满足出牌规则的顺子，请输出 No。

```js
const a = '2 9 J 10 3 4 K A 7 Q A 5 6'
// return '3 4 5 6 7'
function getCard(a) {
  let cardNumObj = {
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    J: 0,
    Q: 0,
    K: 0,
    A: 0,
  }
  const card2Num = {
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  }

  a.split(' ').forEach((item) => {
    if (item === '2') return
    cardNumObj[item]++
  })

  const cardNumArr = []
  for (let key in cardNumObj) {
    if (cardNumObj[key] > 0) {
      cardNumArr.push(Number(card2Num[key] || key))
    }
  }

  let allResult = []
  let result = [cardNumArr[0]]
  for (let i = 1; i < cardNumArr.length; i++) {
    if (cardNumArr[i] === result[result.length - 1]) continue
    if (cardNumArr[i] - result[result.length - 1] === 1) {
      result.push(cardNumArr[i])
    } else {
      if (result.length >= 5) {
        allResult.push(result)
      }
      result = [cardNumArr[i]]
    }
  }
  if (result.length >= 5) {
    allResult.push(result)
  }

  return allResult.map((result) => {
    result.join(' ')
  })
}

console.log(getCard(a))
```

## 查找充电设备组合

某个充电站，可提供 n 个充电设备，每个充电设备均有对应的输出功率。任意个充电设备组合的输出功率总和，均构成功率集合 P 的 1 个元素。功率集合 P 的最优元素，表示最接近充电站最大输出功率 p_max 的元素
