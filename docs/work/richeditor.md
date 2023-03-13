---
date: 2023-3-10
title: 如何在富文本编辑器统计字数
tags:
  - work
describe: 
---

## 开始调研

首先收集一下其他文档的字数统计规则，

### [wangEditor](https://www.wangeditor.com/demo/)

- 数字 一个单位长度
- 中文 一个单位长度
- 中文符号 一个单位长度
- 英文单词 每个字母算一个单位长度
- 英文符号 一个单位长度
- 空格 一个单位长度

即只要键盘输入就算一个单位长度，不区分符号、单词、中英文是否连续等

### [tinyMCE](https://www.tiny.cloud/docs/demo/full-featured/)

- 数字 连续数字算一个单位长度，以空格隔开算
- 中文 一个单位长度
- 中文符号 不统计
- 英文单词 每个单词算一个单位长度，以空格隔开算
- 英文符号 不统计
- 空格 不统计

即只统计文字（连续的英文或数字），不统计符号、空格等

### [ckeditor](https://ckeditor.com/ckeditor-5/demo/feature-rich/)

- 统计字符数：同wangEditor的计算方式
- 统计字数：不计算符号，输入以空格区分计算字数

### 飞书文档

- 统计字符数：不算符号的所有输入
- 统计字数：中文（不包括符号）以个数计算，英文、数字等以空格计算

### 钉钉文档

统计字数：英文符号、空格不计算，中文和中文符号以个数计算，英文、数字等以空格计算

### 石墨文档

- 统计字符数：除空格所有输入
- 统计不计空格字符数：所有输入
- 统计字数：规则同钉钉文档

### 语雀文档

只统计字数：规则同钉钉文档

### 腾讯文档

- 统计字数：规则同钉钉文档
- 统计不计标点字数：除去标点之后的字数
- 统计字符数：规则同石墨文档
- 统计不计空格字符数：规则同石墨文档

### 企业微信文档

- 统计字数：规则同钉钉文档
- 统计不计标点字数：除去标点之后的字数
- 统计字符数：规则同石墨文档
- 统计不计空格字符数：规则同石墨文档

通过统计，可以看到基本都是按照钉钉文档的规则来，即英文符号、空格不计算，中文和中文符号以个数计算，英文、数字等以空格计算，那么我们也采用这种方式，接下来就是整理思路可是写代码了。

## 代码实现

```js
// 匹配中文 中文符号
const chineseSymbolPattern =
  /[\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF\u2000-\u206F]/

const countWords = (text) => {
  // 以空格分割
  const words = text.split(/\s+/)
  let count = 0
  for (let i = 0; i < words.length; i++) {
    // 如果单词包含中文字符，则进行分词处理
    if (chineseSymbolPattern.test(words[i])) {
      const segments = segmentChinese(words[i])
      segments.forEach((segment) => {
        [...segment].forEach(
          (seg) => chineseSymbolPattern.test(seg) && count++
        )
      })
    } else {
      // 如果不是 则按照空格++
      count++
    }
  }
  return count
}

// 对中文文本进行分词处理
const segmentChinese = (text) => text.split(/([\u4E00-\u9FA5]+)/).filter((seg) => seg !== '')

function count() {
  const text = ''
  const count = countWords(text)
  console.log(`文本中共有 ${count} 个单词`)
}
count()

```