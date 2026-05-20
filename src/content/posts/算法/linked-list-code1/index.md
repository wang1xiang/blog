---
title: "跟着卡哥学算法Day 4：链表中等题目"
published: 2025-02-14
description: "链表中等题目"
tags: ["leetcode"]
category: "算法"
image: api
draft: false
---

## 24. 两两交换链表中的节点 🌟🌟

[力扣链接](https://leetcode.cn/problems/swap-nodes-in-pairs/description/)

### 题目描述

给定一个链表，两两交换其中相邻的节点，并返回交换后的链表。

你不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换。

### 思路

### 虚拟头节点

```js
const head = new ListNode(0, head)
```

- 什么时候遍历结束

  ```js
  // 奇数节点 cur.next.next = null
  // 偶数节点 cur.next = null
  cur.next !== null && cur.next.next !== null
  ```

- 两两交换节点即可

  每次 1 和 3 都会断掉，所以需要提前保存下来

  ```js
  // 节点1
  let temp = cur.next
  // 节点3
  let temp1 = cur.next.next.next

  cur.next = cur.next.next
  cur.next.next = temp
  temp.next = temp1
  // 移动
  cur = cur.next.next
  ```

### 代码

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function (head) {
  const data = new ListNode(0, head)
  let cur = data
  while (cur.next && cur.next.next) {
    // 节点1
    let temp = cur.next
    // 节点3
    let temp1 = cur.next.next.next

    cur.next = cur.next.next
    cur.next.next = temp
    temp.next = temp1
    cur = cur.next.next
  }
  return data.next
}
```

## 19.删除链表的倒数第 N 个节点 🌟🌟

[力扣链接](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

### 题目描述

给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。

进阶：你能尝试使用一趟扫描实现吗？

```text
输入：head = [1,2,3,4,5], n = 2 输出：[1,2,3,5]

输入：head = [1], n = 1 输出：[]

输入：head = [1,2], n = 1 输出：[1]
```

### 思路

**重点**

- **快慢指针：快指针移动 n+1 步，快慢指针同时移动**
- 快指针指向链表末尾，慢指针刚好指向删除节点的前一个节点插入，必须知道前一个节点，即第 n 个节点一定是 curNode.next

### 代码

```ts
var removeNthFromEnd = function (head, n) {
  let data = new ListNode(0, head)
  let fast = data
  let slow = data

  while (n) {
    fast = fast.next
    n--
  }
  while (fast.next !== null) {
    fast = fast.next
    slow = slow.next
  }
  slow.next = slow.next.next

  return data.next
}
```

## 面试题 02.07. 链表相交 🌟

[力扣链接](https://leetcode.cn/problems/intersection-of-two-linked-lists-lcci/description/)

### 题目描述

给你两个单链表的头节点 headA 和 headB ，请你找出并返回两个单链表相交的起始节点。如果两个链表没有交点，返回 null 。

### 思路

两个单链表从交点开始，后面的节点都指向同一个节点。

如：

```text
链表 A：4 → 1 → 8 → 4 → 5
链表 B：5 → 6 → 1 → 8 → 4 → 5
```

从节点 8 开始，后面的节点都指向同一个节点。

- 获取两个链表的长度（遍历），将长链表放在前面，短链表放在后面
- 求长度差，将长链表指针向后移动长度差位，直到两个链表指针相等
- 遍历两个链表，如果两个链表节点相等，则返回该节点

### 代码

```js
var getLength = function (head) {
  let size = 0,
    cur = head
  while (cur) {
    size++
    cur = cur.next
  }
  return size
}
var getIntersectionNode = function (headA, headB) {
  let curA = headA,
    curB = headB

  let lenA = getLength(headA)
  let lenB = getLength(headB)

  if (lenA < lenB) {
    ;[curA, curB] = [curB, curA]
    ;[lenA, lenB] = [lenB, lenA]
  }

  let i = lenA - lenB
  while (i-- > 0) {
    curA = curA.next
  }
  while (curA && curA !== curB) {
    curA = curA.next
    curB = curB.next
  }
  return curA
}
```

## 142.环形链表 II 🌟🌟

[力扣链接](https://leetcode.cn/problems/linked-list-cycle-ii/description/)

### 题目描述

题意： 给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。

为了表示给定链表中的环，使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。

说明：不允许修改给定的链表。

### 思路

#### 判断链表是否有环

快慢指针，快指针移动两个节点，慢指针移动一个节点，如果最终都指向 null，则说明没有环；如果快慢指针相遇，说明链表一定有环

```text
head = [3,2,0,-4], pos = 1
这里 pos = 1 代表索引 1 处的节点（值为 2）是环的入口节点，表示 -4 指向 2，形成环。
```

返回索引为 1 的节点

#### 如何找到环的入口

变量定义

- x：从链表头到环入口的距离（节点数）。
- y：从环入口到快慢指针相遇点的距离。
- z：从相遇点走到环入口的剩余距离（也就是环的长度减去 y）。

快慢指针相遇时的关系：

- slow 指针 走了 `x + y` 步。
- fast 指针 走了 `x + y + n(y + z)` 步，其中 `n` 为快指针在环中转过的圈数，（至少 n = 1）

因为 fast 指针移动速度是 slow 指针的两倍，所以

```js
2(x + y) = x + y + n(y + z)
```

两边消掉 `x + y`，得到

```js
x + y = n (y + z)
```

求环形入口，即头节点到环形入口节点的距离`x`，得到

```js
x = n(y + z) - y
x = (n - 1)(y + z) + z
```

此时，如果 `n = 1`，即快指针 fast 转一圈就遇到了慢指针 slow，简化为 `x = z`，即**从头节点和相遇节点同时出发一个指针，每次只走一个节点，那么相遇节点就是环形入口节点**。

当 n 大于 1 时，即**相遇节点的指针在圈内转了n圈后，在环形节点入口遇到了从头节点出发的指针**

时间复杂度: O(n)，快慢指针相遇前，指针走的次数小于链表长度，快慢指针相遇后，两个index指针走的次数也小于链表长度，总体为走的次数小于 2n


### 代码

```js
var detectCycle = function(head) {
    if(!head || !head.next) return null;
    let slow = head.next, fast = head.next.next;
    while(fast && fast.next && fast!== slow) {
        slow = slow.next;
        fast = fast.next.next;
    }
    if(!fast || !fast.next ) return null;
    slow = head;
    while (fast !== slow) {
        slow = slow.next;
        fast = fast.next;
    }
    return slow;
};
```