---
date: 2023-12-18
title: Electron获取对方URL中的OG标签
tags:
  - electron
describe: Electron获取对方URL中的OG标签
---

要使用 JavaScript 获取对方 URL 中的 OG 标签，你可以使用 fetch 函数来获取对方网页的 HTML 内容，然后使用 DOM 解析器（如 DOMParser）来解析 HTML 并提取 OG 标签的值。

以下是一个示例代码，演示如何获取对方 URL 中的 OG 标签：

```js
async function getOGTags(url) {
  // 使用fetch函数获取对方网页的HTML内容
  const response = await fetch(url)
  const html = await response.text()
  // 创建DOM解析器
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  // 获取OG标签的值
  const ogTitle = doc.querySelector('meta[property="og:title"]')
  const ogDescription = doc.querySelector('meta[property="og:description"]')
  const ogImage = doc.querySelector('meta[property="og:image"]')
  // 输出OG标签的值
  console.log('Title:', ogTitle.getAttribute('content'))
  console.log('Description:', ogDescription.getAttribute('content'))
  console.log('Image:', ogImage.getAttribute('content'))
}
// 调用函数，传入对方URL
getOGTags('https://example.com')
```

在上面的代码中，我们定义了一个 getOGTags 函数，该函数接受一个 URL 作为参数。函数内部使用 fetch 函数获取对方网页的 HTML 内容，并使用 DOMParser 解析 HTML。然后，我们使用 querySelector 方法来选择具有特定属性的 meta 标签，并使用 getAttribute 方法获取标签的属性值。最后，我们将 OG 标签的值输出到控制台。

请注意，由于跨域限制，你可能无法直接从其他域名获取 OG 标签的值。如果需要从其他域名获取 OG 标签，你可能需要使用服务器端代码或 CORS（跨源资源共享）策略来处理跨域请求。

### Electron 接入方案：

1. 获取网站信息在主进程，然后 IPC 通信传递到子进程

2. 获取到网站信息后增加缓存策略（例如以 url 为 key,缓存 100 个链接，超过 100 个删除最久的 50 个）

主进程获取方法 getWebInfo

```js
export const getWebInfo = async (url: string) => {
  const urlObj = new URL(url)
  // 只解析https地址，非下载地址如（.png\.zip）
  if (
    urlObj.protocol !== 'https:' ||
    (urlObj.pathname.includes('.') &amp;&amp;
      !(
        urlObj.pathname.endsWith('.html') ||
        urlObj.pathname.endsWith('.htm') ||
        urlObj.pathname.endsWith('.aspx') ||
        urlObj.pathname.endsWith('.jsp') ||
        urlObj.pathname.endsWith('.php')
      ))
  )
    return { title: '', description: '', image: '', icon: '', site_name: '' }
  // 有些以www开头的网址获取不到内容，需要去掉
  const urlStrip = normalizeUrl(url, { stripWWW: true })
  let res = await axios
    .get(urlStrip, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      timeout: 5000
    })
    .catch(() => {
      return { data: '' }
    })
  const $ = cheerio.load(res?.data || '')
  const title =
    $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('#js_content')?.text().slice(0, 100)
  const site_name = $('meta[property="og:site_name"]').attr('content')
  let image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content') || ''
  image = image.startsWith('http') ? image : ''
  let icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || ''
  icon = icon.startsWith('http') ? icon : ''
  return { title, description, image, icon, site_name }
}
```

IPC 通信

```js
IPC_R2M2R.handle('getWebInfo', async (e, url) => {
  return getWebInfo(url)
})
```

渲染进程缓存策略

```js
const webInfoMap = new Map()
let num = 0
// 删除50个
const _deleteInfo = () => {
  webInfoMap.keys()
  webInfoMap.keys().some((item, index) => {
    if (index <= 49) {
      webInfoMap.delete(item)
      return false
    }
    return true
  })
  num = 50
}
export const getUrlInfo = async (url) => {
  if (webInfoMap.has(url)) {
    return webInfoMap.get(url)
  } else {
    let info = await window.electronIPC.getWebInfo(url)
    if (!webInfoMap.get(url)) {
      webInfoMap.set(url, info)
      num++
    }
    if (num === 100) {
      _deleteInfo()
    }
    return info
  }
}
```
