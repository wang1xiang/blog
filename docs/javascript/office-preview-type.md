---
date: 2023-3-28
title: office在线预览功能调研
tags:
  - javascript
describe: office在线预览功能调研
---

## 先说几款免费的

1. 首推微软在线 Office Web Viewer

   **优点**

   - 免费，预览效果比较好，[官网地址](https://www.microsoft.com/en-us/microsoft-365/blog/2013/04/10/office-web-viewer-view-office-documents-in-a-browser/)
   - 接入简单，文件地址 url 需要通过`encodeURIComponent`转一下，url，否则会打不开

     ```html
     <iframe
       style="width: 100%; min-height: 600px"
       :src="`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`"
       width="100%"
       height="100%"
       frameborder="1"
     />
     ```

   - 支持多种格式
   - Word: .DOCX, .DOCM, .DOTM, .DOTX, .DOC
   - Excel: .XLSX, .XLSB, .XLS, .XLSM
   - PowerPoint: .PPTX, .PPSX, .PPT, .PPS, .PPTM, .POTM, .PPAM, .POTX, .PPSM

   **缺点**

   - Word、PPT 文件不能大于 10M，Excel 文件不能大于 5M-
   - 加载文件较多，各种图片、文字、样式等，页面臃肿，加载速度慢
   - 内网无法使用

2. Google Drive 查看器

   - 免费，预览效果不如 Office Web Viewer
   - 接入简单，同 Office Web Viewer，只需要把 src 改为`https://drive.google.com/viewer?embedded=true&hl=en-US&url=${encodeURIComponent(url)}`即可
   - 缺点：不能预览 word 文件、excel 和 ppt 都行

## 提供私有化部署

1. 微软 Office Online Server

   - [私有化部署](https://learn.microsoft.com/zh-cn/officeonlineserver/office-online-server)，预览效果同 Office Web Viewer

2. kkfileview

   - [官网地址](https://kkfileview.keking.cn/zh-cn/index.html)
   - 支持 office 文档的在线预览，如 doc,docx,xls,xlsx,ppt,pptx,pdf 等，同时支持 txt,zip,rar,图片,视频,音频等格式预览

## 付费

1. office365

   [官网](https://www.officeweb365.com/)，[付费使用](https://www.officeweb365.com/Default/price)

2. 阿里云 IMM
   预览效果好，飞书、钉钉文档都是用的它，需要与阿里云 OSS 一起[使用](https://help.aliyun.com/document_detail/63273.html)，[付费使用](https://help.aliyun.com/document_detail/88317.html)

3. XDOC 文档预览

   - [官网地址](https://view.xdocin.com/)，[付费使用](https://view.xdocin.com/view-xdocin-com_6x5f4x.htm)
   - 预览效果不如 Office Web Viewer，但打开速度更快
   - 接入简单，同 Office Web Viewer，只需要把 src 改为`https://view.xdocin.com/view?src=${encodeURIComponent(url)}`即可
   - 缺点：内网无法使用

4. 其他
