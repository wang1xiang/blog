---
date: 2023-3-10
title: 如何在富文本编辑器中统计字数
tags:
  - work
  - prosemirror
describe: 为tiptap富文本编辑器统计文档字数
---

## 调研对象

首先收集一下其他文档的字数统计规则：

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

- 统计字符数：同 wangEditor 的计算方式
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

通过统计，可以看到基本都是按照钉钉文档的规则来，即英文符号、空格不计算，中文和中文符号以个数计算，英文、数字等以空格计算，那么我们也采用这种方式，接下来就是整理思路开始写代码了。

## 思路

中文计算方式：中文的计算方式通常是按照字符数进行统计，每个中文字符都计为一个字。
英文计算方式：英文的计算方式通常是按照单词数进行统计，一般会将单词中间的空格作为分隔符，以此来确定单词的数量。

1. 获取富文本编辑器的文本，按照空格对文本进行分割；
2. 分割完成后对于英文和其他，可以按照空格分隔单词进行计数，直接让数量加 1；
3. 但对于中文，由于中文没有空格，因此需要对中文进行分词处理，例如使用中文分词工具将中文文本分成词语；
4. 通过正则获取分词后中文的个数，对数量进行累加操作。

## 实现

tiptap 的插件中有[character-count](https://tiptap.dev/api/extensions/character-count)用于统计字符数和单词数，并允许设置文档最大长度。

将插件添加到项目中后，通过下面这行代码就可以拿到文档的单词数：

```js
editor.storage.characterCount.words()
```

but, 通过这个插件拿到的单词数是根据空格分割的单词数量，即一串中文也显示的是一个单词数，这明显不符合我们的调研结果。修改源码中计算单词的方法`words`为下面这个写法：

```js
// 匹配中文 中文符号
const chineseSymbolPattern =
  /[\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF\u2000-\u206F]/g
const delZeroWidth = (text: string) =>
  text.replace(/[\u200b-\u200f\uFEFF\u202a-\u202e]/g, '')

const countWords = (text: string) => {
  // 以空格分割
  const words = text.split(/\s+/)
  let count = 0
  for (let i = 0; i < words.length; i++) {
    if (delZeroWidth(words[i]) === '') continue
    // 如果单词包含中文字符，则进行分词处理
    if (chineseSymbolPattern.test(words[i])) {
      const segments = segmentChinese(words[i])
      segments.forEach((segment: string) => {
        if (delZeroWidth(segment) !== '') {
          // 中文个数
          count += segment.match(chineseSymbolPattern)?.length || 0
          // 分割中文 拿到其余的个数 如hello你you好
          count += segment
            .split(chineseSymbolPattern)
            .filter((seg) => seg !== '')?.length
        }
      })
    } else {
      // 如果不是 则按照空格++
      count++
    }
  }
  return count
}

// 对中文文本进行分词处理
const segmentChinese = (text: string) =>
  text.split(/([\u4E00-\u9FA5]+)/).filter((seg) => seg !== '')

/** 计算文档字数 */
const calcDocumentTextSize = (text: string) => {
  const number = countWords(text)
  return number
}
export default calcDocumentTextSize
```

最后测试了一下，与钉钉文档的字数统计大部分情况下相同，有时候会有几个到几十个字的差异，目前还没有发现原因，不过不影响，因为钉钉可能做了某些特殊的处理。
