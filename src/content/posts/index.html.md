---
title: index.html
published: 2026-05-20T08:10:36.230Z
description: ''
tags: []
category: javascript
author: 翔子
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .scroll-container {
        height: 300px;
        width: 300px;
        overflow: auto;
        background-color: wheat;
        border: 1px splid paleturquoise;
        position: relative;
      }
      .container {
        padding: 5px;
        font-size: 16px;
        height: 200px;
        text-align: center;
        color: rgba(0, 0, 0, 0.65);
      }
      .end {
        opacity: 0;
        transition: all ease-in-out 0.5s;
        color: yellowgreen;
        position: sticky;
        bottom: 0px;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="scroll-container">
      <div class="container">内容</div>
      <div class="container">内容</div>
      <div class="container">内容</div>
      <div class="container">内容</div>
      <div class="end">滚动事件结束</div>
    </div>
    <script>
      // let scrollEndTimer = null
      // let opacityTimer = null
      // const callback = () => {
      //   console.log('滚动事件结束')
      //   clearTimeout(opacityTimer)
      //   document.querySelector('.end').style.opacity = 1
      //   opacityTimer = setTimeout(
      //     () => (document.querySelector('.end').style.opacity = 0),
      //     1000
      //   )
      // }
      // document.querySelector('.scroll-container').onscroll = () => {
      //   clearTimeout(scrollEndTimer)
      //   scrollEndTimer = setTimeout(callback, 100)
      // }

      let opacityTimer = null
      const callback = () => {
        console.log('滚动事件结束')
        clearTimeout(opacityTimer)
        document.querySelector('.end').style.opacity = 1
        opacityTimer = setTimeout(
          () => (document.querySelector('.end').style.opacity = 0),
          1000
        )
      }
      document.querySelector('.scroll-container').onscrollend = callback
    </script>
  </body>
</html>
