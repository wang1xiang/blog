---
date: 2024-4-29
title: SSE（Server-Sent Events 服务器推送事件）
tags:
  - work
describe: SSE（Server-Sent Events 服务器推送事件）
---

SSE（Server-Sent Events 服务器推送事件），是一种特殊的 HTTP 请求，在浏览器建立连接后，服务器可以**分批次、有间隔**的向浏览器下发数据，它常常拿来与 websocket 做比较

| SSE              | websocket    |
| ---------------- | ------------ |
| 单向连接         | 双向连接     |
| HTTP 协议        | TCP 协议     |
| 内置断线重连     | -            |
| UTF-8 文本数据流 | 消息类型广泛 |

### 概念

浏览器使用[EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)建立连接

```js
const evtSource = new EventSource('//xxx/xx', { withCredentials: true })
```

服务器使用 text/event-stream MIME 类型响应内容

```js
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  Connection: 'keep-alive',
  'Cache-Control': 'no-cache',
  'Access-Control-Allow-Origin': '*', // 允许跨域
})
```

响应内容是一个 UTF-8 的文本数据流，由:分隔字段名与值，由 `\n\n` 分隔消息。 以:开头的行为注释行，会被忽略。 合法字段名只有：event 事件名、data 数据、id、retry 毫秒。

```js
res.write(`event: testEvent\n`)
res.write(`id: 123\n`)
res.write(`retry: 30000\n`)
res.write(`data: {"a":4}\n\n`)
```

浏览器使用 onmessage 和 addEventListener 监听服务器消息，没有指定 event 会触发前者，否则触发后者

```js
evtSource.onmessage = function (event) {
  console.log('收到无 event 字段消息', event)
}
evtSource.addEventListener('testEvent', (event) => {
  console.log('收到指定 event 事件', event)
})
```

连接应由浏览器关闭，因为 EventSource 自带断线重连

```js
evtSource.onerror = (err) => {
  console.error('EventSource failed:', err)
}
evtSource.close()
```

```js
req.on('close', () => {
  res.end()
})
```

### demo

官方推荐使用[EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)类创建 sse 连接，但它只能建立 get 请求，且无法自定义 header

npm 上现在已经有不少相关包了，基于 Fetch、XMLHttpRequest 模拟了 EventSource 的 API，并支持了自定义 header 等功能，比如[sse.js](https://www.npmjs.com/package/sse.js)

```js
// NODE
const http = require('http')
http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*', // 允许跨域
    })
    // 连接由浏览器关闭
    req.on('close', () => {
      res.end()
    })
    setTimeout(() => sendTestEvent(res), 1000)
    setTimeout(() => sendSimpleEvent(res), 2000)
  })
  .listen(3000)
function sendTestEvent(res) {
  res.write(`event: testEvent\n`)
  res.write(`id: 123\n`)
  res.write(`retry: 30000\n`)
  res.write(`data: {"a":4}\n\n`)
}
function sendSimpleEvent(res) {
  res.write(`data: this is SimpleEvent\n\n`)
}
```

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/sse.js@2.4.1/lib/sse.js"
></script>
<script>
  var evtSource = new SSE('http://localhost:3000')
  evtSource.addEventListener('testEvent', (event) => {
    console.log('收到指定 event 事件', event.data)
    // => 收到指定 event 事件 {"a":4}
  })
  evtSource.onmessage = function (event) {
    console.log('收到无 event 字段消息', event.data)
    // => 收到无 event 字段消息 this is SimpleEvent
    evtSource.close()
  }
</script>
```

### 缺点/需要注意的点

- 因为 HTTP1.1 并发连接数是 6 个，打开多个标签页时会很麻烦
- 兼容性：ie 不支持，edge 20 年开始支持，其它都支持的不错
