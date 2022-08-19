---
date: 2022-8-18
title: HTML格式发送的邮件展示字体限制
tags:
  - work
describe: HTML 电子邮件中的字体——限制、解决方案和行业标准
---

最近在弄邮件编辑器业务，测试提了关于字体样式的bug，编辑好的字体发送出去后经常不显示。于是我翻google找了一下原因。
  
字体可分为两类：

1. System Fonts系统字体
2. Web Fonts 网络字体

### System Fonts 系统字体

系统字体就是那些已经安装在您的计算机上，像网页或者所有电子邮件客户端都可以访问和使用这些字体，以下10种字体都可以使用

- Arial
- Comic Sans
- Courier New
- Geoigia
- Impact
- Palatino
- Tahoma
- Times New Roman
- Trebucher MS
- Verdana

#### Web Fonts 网络字体

桌面字体被加载到个人计算机上，以便在文字处理器和其他应用程序中使用，而网络字体则在线存储并由浏览器下载。

##### 支持网络字体的电子邮件客户端

- Apple Mail
- iOS Mail
- Android Mail (not Gmail)
- Thunderbird
- Outlook for macOS
  
可以在这个网站查看：<https://www.caniemail.com/search/?s=web+font>

##### Gmail支持字体列表

- Roboto 和 Google Sans：Gmail 自己使用这些网络字体
- web safe fonts 网络安全字体： 以下字体是W3Schools 列为 HTML 和 CSS 的最佳网络安全字体
  - Arial (sans-serif)
  - Verdana (sans-serif)
  - Helvetica (sans-serif)
  - Tahoma (sans-serif)
  - Trebuchet MS (sans-serif)
  - Times New Roman (serif)
  - Georgia (serif)
  - Garamond (serif)
  - Courier New (monospace)
  - Brush Script MT (cursive)
- Email safe fonts电子邮件安全字体：system fonts 每台计算机上都安装的字体

#### 通过image来展示文字：解决文字不能展示的问题

虽然能解决，但会有三个问题

1. 大多数邮件编辑器会默认阻止图像加载，导致转为图片的文字也不能正常显示
2. 图像会减慢电子邮件的加载时间
3. 文字效果肯定看起来比图像更好

参考文章

- <https://litmus.com/blog/the-ultimate-guide-to-web-fonts>
- <https://www.emailonacid.com/blog/article/email-development/best-font-for-email-everything-you-need-to-know-about-email-safe-fonts/>
- <https://www.litmus.com/blog/the-ultimate-guide-to-web-fonts/>
- <https://mailbakery.com/blog/fonts-html-emails-limitations-solutions-industry-standards/>
