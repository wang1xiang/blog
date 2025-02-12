---
date: 2024-8-29
title: 链表整体学习 & 常见题目
tags:
  - leetcode
describe: 链表整体学习 & 常见题目
---

链表是一种通过指针串联在一起的线性结构，在内存中不连续分布，每一个节点由两部分组成，一个是数据域一个是指针域（存放指向下一个节点的指针），最后一个节点的指针域指向 null（空指针的意思）。

链表的入口称为链表的头节点 head。

## 分类

### 单链表

### 双链表

每一个节点有两个指针域，一个指向下一个节点 next，一个指向上一个节点 prev。

### 循环链表

链表首尾相连，尾节点的指针域指向头节点。

## 链表定义

通过 js 定义链表：

```js
class LinkedList {
  constructor(value) {
    this.value = value
    this.next = null // 指向下一个节点的指针，初始为null
    this.prev = null // 指向上一个节点的指针，初始为 null
  }
}
```

## 特点

增删快、查找慢

接下来都通过 🌟 来代表题目难度：

- 简单：🌟
- 中等：🌟🌟
- 困难：🌟🌟🌟

## 经典题目

### 203.移除链表元素 🌟

[力扣链接](https://leetcode.cn/problems/remove-linked-list-elements/)

#### 思路

- 创建新的虚拟头节点
- 从原始头节点开始判断
  - 值相等则移动 next 指针到下一个节点的 next 指针
  - 不等则移动当前节点

#### 代码

```js
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function removeElements(head: ListNode | null, val: number): ListNode | null {
  const data = new ListNode(0, head)
  // 虚拟头节点
  let cur = data
  // 下个节点存在就判断值是否相等
  while (cur.next) {
    if (cur.next.val === val) {
      cur.next = cur.next.next
    } else {
      cur = cur.next
    }
  }
  // 返回头节点除外
  return data.next
}
```

### 707. 设计链表 🌟🌟

[力扣链接](https://leetcode.cn/problems/design-linked-list/description/)

#### 代码

```ts
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val
    this.next = next
  }
}
class MyLinkedList {
  size: number
  head: ListNode | null
  tail: ListNode | null
  constructor() {
    this.size = 0
    this.head = null // 头节点
    this.tail = null // 尾节点
  }
  getNode(index: number): ListNode {
    // 通过虚拟头节点
    let curNode: ListNode = new ListNode(0, this.head)
    for (let i = 0; i <= index; i++) {
      curNode = curNode.next
    }
    return curNode
  }

  get(index: number): number {
    // 索引无效 返回-1
    if (index < 0 || index > this.size) return -1
    let curNode = this.getNode(index)
    return curNode.val
  }

  // 插入头节点
  addAtHead(val: number): void {
    let node = new ListNode(val, this.head)
    this.head = node
    // 无尾节点 则原始链表为空 则将新节点作为尾节点
    if (!this.tail) {
      this.tail = node
    }
    this.size++
  }

  // 插入尾节点
  addAtTail(val: number): void {
    let node = new ListNode(val)
    // 有尾节点 直接修改next
    if (this.tail) {
      this.tail.next = node
      // 无尾节点 则原始链表为空
    } else {
      this.head = node
    }
    this.tail = node
    this.size++
  }

  // 中间插入节点
  addAtIndex(index: number, val: number): void {
    // 插入到最后一个节点
    if (index === this.size) {
      this.addAtTail(val)
      return
    }
    // 超出边界 无法插入
    if (index > this.size) return
    // 插入到头节点
    if (index < 0) {
      this.addAtHead(val)
      return
    }
    // 正常插入
    // 拿到前一个节点 新节点next指针指向前一个节点的next 前一个节点next再指向新节点
    const prevNode = this.getNode(index - 1)
    const newNode = new ListNode(val, prevNode.next)
    prevNode.next = newNode
    this.size++
  }

  deleteAtIndex(index: number): void {
    if (index < 0 || index >= this.size) return
    // 删除头节点
    if (index === 0) {
      this.head = this.head?.next
      this.size--
      return
    }
    const prevNode = this.getNode(index - 1)
    prevNode.next = prevNode.next?.next
    // 删除最后一个时 需要指定尾节点
    if (index === this.size - 1) {
      this.tail = prevNode
    }
    this.size--
  }
}

/**
 * Your MyLinkedList object will be instantiated and called as such:
 * var obj = new MyLinkedList()
 * var param_1 = obj.get(index)
 * obj.addAtHead(val)
 * obj.addAtTail(val)
 * obj.addAtIndex(index,val)
 * obj.deleteAtIndex(index)
 */
```

### 206.反转链表 🌟

[力扣链接](https://leetcode.cn/problems/reverse-linked-list/submissions/)

#### 思路

- 双指针
- 利用 temp 节点来暂存当前节点的 next 节点
- 当前节点的 next 指向前一个节点
- 前一个节点替换为当前节点
- 当前节点替换为暂存节点
- 循环结束后，preNode 就是反转后的头节点

#### 代码

```ts
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function reverseList(head: ListNode | null): ListNode | null {
  // 双指针法
  let curNode = head
  let preNode = null
  let tempNode = null
  while (curNode) {
    tempNode = curNode.next
    // 当前节点next指针指向前一个节点 head时next为null
    curNode.next = preNode
    // 前一个节点替换为当前节点
    preNode = curNode
    // 当前节点替换为下一个节点
    curNode = tempNode
  }
  return preNode
}
```
