---
date: 2020-6-11
title: JavaScript内存泄漏调研
tags:
  - javascript
describe: 内存泄露原因及v8垃圾回收机制
---

### 内存泄漏的产生

 程序运行需要内存，内存生命周期：分配内存、使用内存、释放内存，如果不再使用的内存，没有及时释放，就会导致内存泄漏

### js 的四种常见内存泄漏

- 全局变量(Global Variables)
  > js 处理未声明的变量：在全局对象内创建一个新变量

  ```js
  function foo() {
    bar = 'str'
  }
  // 等价于
  function foo() {
    window.bar = 'str'
  }
  ```

  > 这里 bar 只是一个字符串，如果是一个大的对象，就会造成代码内存隐患
  > 为了防止这种错误发生，可以使用严格模式(开头添加’use strict')
  > 虽然可以预防全局变量的产生，但是仍然会有很多代码用显式的方式使用全局变量，这些变量无法进行垃圾回收，所以使用完对其赋值为 null 或重新分配
- 被遗忘的 Timer 或 callback
  js 中经常使用 setInterval()来实现一些动画效果

  ```js
  let someResource = getData()
  setInterval(function() {
      let node = document.getElementById('Node')
      if(node) {
        node.innerHTML = JSON.stringify(someResource))
      }
  }, 1000)
  ```

  > 如果不需要 setInterval()时，没有通过 clearInterval()清除，就不不断调用函数，直到网页关闭或者遇到 clearInterval()
  > EventListener 在组件中进行事件绑定，在销毁组件时未进行事件解绑

  ```js
  window.addEventListener('click', onClick)
  window.removeEventListener('click', onClick)
  ```

- 闭包

  当一个函数 A 返回另一个内联函数 B，即使函数 A 执行完，函数 B 也能访问函数 A 作用域内的变量，这就是闭包(函数内部和外部连接起来的一座桥梁)

  ```js
  function foo(message) {
    function bar() {
      console.log(message)
    }
    return bar
  }

  let str = foo('closure')
  str // closure
  ```

  > 函数 foo 中创建的 bar 是不能被回收的，因为它被 str 引用，想要释放掉将 str=null 即可
  > 闭包会携带包含它的函数的作用域，因此会比其他函数占用更多内存，过度使用可能会导致内存占用过多

- DOM 引用
  假如想更新表中的几行数据，将每行 DOM 的引用存储在数组或对象中，当这种情况发生时，就会保留同一 DOM 元素的两份引用：一个 DOM 树中，一个数组或对象中，如果将来要删除这些行，需要将这里两个引用都设为不可达。并且如果想删除 table 时，因为单元格是 table 的子节点，保持着对 table 的引用，也就是说，js 中对单元格的引用会导致整个 table 都保存在内存中。

  ```js
  let elements = {
    td: document.getElementById('td')
  }
  function removeTable() {
    document.body.removeChild(document.getElementById('table'))
  }
  ```

### 内存泄漏

- 多页面程序不是问题 因为页面切换浏览器都会刷新，即使页面有内存泄漏，页面刷新后泄漏会解除
- 单页面应用 切换不会刷新，如果发生内存泄漏，轻则影响页面性能，重则导致页面崩溃

### 垃圾回收机制

- 内存引用(垃圾回收机制依靠的主要概念就是引用)
- 内存管理中，如果前者对后者有访问权限(隐式或显示访问)，则说明一个对象引用另一个对象(js 对象有对其原型(隐式引用)和对其属性(显示引用)的引用)
- 两个策略：引用计数，标记清除(Mark-and-sweep)
- 引用对象算法简单理解为'该对象有没有其他对象引用到它'，即没有任何对象指向它，如果没有，该对象就会被垃圾回收机制回收

  ```js
  let o1 = {
    o2: {
      x: 1
    }
  }
  let o3 = o1
  o1 = 1 // o1被o3引用
  let o4 = o3.o2
  o3 = '123' // 引用数为0，可以被垃圾回收处理，o2还被o4引用
  o4 = null //
  ```

  > - 缺陷：循环引用，指的是对象 A 中包含了一个指向对象 B 的引用，而对象 B 也包含一个指向对象 A 的引用，创建一个循环，由此发生内存泄漏

  ```js
  function foo() {
    let o1 = {}
    let o2 = {}
    o1.p = o2
    o2.p = o1
  }
  foo()
  // 函数被调用之后，o1、o2离开作用域，已经无用可以被回收，但是o2引用o1，o1引用o2，由此形成循环，引用计数法认为每个对象被引用了一次，所以不能被回收
  ```

  > ![avatar](https://raw.githubusercontent.com/tangxiaolang101/ImageHub/master/refrenceCycle.png)

- 标记清除：该算法把'对象是否不在需要'简化定义为'对象是否可以可达'

  > 1 该算法创建了一个‘roots’列表，roots 通常是代码中全局变量的引用，设置一个根 Root 的对象，javascript 中‘windows’是一个全局变量，被当作 root，垃圾回收检查它和它的子对象是否存在(即不是垃圾)<br/>
  > 2 定期的，垃圾回收会从根开始，递归的检查所有子对象，如果从 root 开始的对象时可达的，就不会被当作垃圾<br/>
  > 3 所有未被标记的内存会被当作垃圾，垃圾回收会释放内存
  > ![avatar](https://raw.githubusercontent.com/tangxiaolang101/ImageHub/master/markSweep.gif)

- 比较
  > 1 优于前一个，’一个对象零引用‘，所以这个对象必定不可达，反过来就不对，因为存在循环引用<br/>
  > 2 循环引用不再是问题，因为循环引用的对象没有被全局 window 对象可访问的对象引用

#### 内存泄漏检测

- Shallow Size & Retained Size
  对象通过两种方式占用内存
  
  - 直接通过对象自身占用
  - 通过持有对其他对象的引用隐式占用<br/>
  > 在 devTool 中堆内存快照分析面板 shallow size 和 retained size 分别表示这两种内存占用方式
  > Shallow Size 对象自身占用的内存，通常只有字符串和数组有明显的 Shallow size
  > Retained Size 对象自身及依赖它的对象(从 GC root 无法再访问到的对象)被删除后释放的内存大小
  > 堆快照中有一个 distance 字段，表示从 window 出发的最短保留路径上的属性引用数量
