---
date: 2025-2-26
title: 前端COE-文档协同服务卡顿
tags:
  - work
describe:
---

## 一、现象

打开 One 文档一直处于加载中（现象 cpu 会飙升到 100%+）

## 二、原因

#### 排查方向 1：回溯近期变更

因为这个服务很久没动过了，所以怀疑是前端代码问题，回溯了近期的需求变更

**结论：与近期前后端代码无关**

#### 排查方向 2：子进程分配逻辑

观察服务器状态，发现有一个子进程的 cpu 占有率明显高于其它，内存区别不大

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/11a72aba10fb3bb81ac5780e4ecbf1e4.jpg)

之前的子进程分配是按照内存占有率来的，因为 cpu 的占有率无法计算。新连接分配给内存占有最小的子进程，子进程接管之后把自己的内存状态通知给主进程，主进程对进程池重新做排序。

且这种写法会导致服务重启后，所有重连上来的连接都被分配到了一个进程，因为这时子进程还没来得及更新自己的内存。

最后通过 process.cpuUsage() 来计算进程消耗的 cpu 时间、基于 setImmediate 算一次事件循环的耗时，来间接的估算 cpu 占有率。并优化了进程池的分配逻辑。

结果：

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/d49b05e3413d87161c1b52aa2d8cc9d8.png)

各子进程 cpu 占有率差不多，但卡顿并没有缓解。

#### 排查方向 3：在测试环境通过 clinic.js 拿一份性能报告，但在测试环境没能复现问题

#### 排查方向 4：关键节点耗时检查，怀疑是数据问题，因为某个文档导致 cpu 飙升

求助于后端同事，并了解了另一个查看服务状态的指令 top

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/133151020f873a6c64a0c8e55cb8b517.png)

```bash
ps auxw | sort -rn -k3 | head -5
- 用从进程启动开始到当前时间点所消耗的总CPU时间与系统运行时间的比例来计算的CPU使用率
top
- 最近的一个时间间隔（通常是几秒）内的瞬时CPU使用率
- ps命令提供的是一个静态快照，且基于ps的计算规则，如果进程已经运行了很长时间，其CPU使用率可能会被稀释
- top指令会自动更新，可以精确地捕捉到CPU使用的峰值和波动，所以排查这个问题应该使用top而不是ps
```

通过这个指令发现 node 的 cpu 占有率还是很高。怀疑是某个文档导致 cpu 飙升。

对握手、协议升级、redis 访问、数据下发的耗时加日志

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/5f90ef9cad0cb4db7a12bf19d3aacf87.png)

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/8557b2b2fc8691d79fae3211946defcb.png)

发现导致 cpu 飙升的文档并不固定，redis 中最大的文档 f861a1acaebb1618a4db3a6983ee2cd315998 也并不一定会导致 cpu 飙升，几乎是随机的。

#### 排查方向 5：redis 存储量过大，导致 node 在使用时 cpu 过载

怀疑是 redis 太大（1.7G）导致 node 在处理时 cpu 逐渐被吃满，为了验证问题，停止 node 服务后，清空了 redis。运行到现在没有再出现过 cpu 过载

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/ac8378aab3a4c58d9604a0d11eade283.png)

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/eefde58b05848a2c598466923b725d1f.png)

## 三、修正及优化

以最大的文档为例，redis 中的大小为 200M+，后端接口中的数据量为 405562 字节，0.4M

Node：根据子进程 cpu 内存情况优化进程池分配

```js
// cpu使用率计算
class CpuUsage {
  constructor() {
    this.startUsage = process.cpuUsage()
    this.startTime = Date.now()
  }
  reset() {
    this.startUsage = process.cpuUsage()
    this.startTime = Date.now()
  }
  computed() {
    const endUsage = process.cpuUsage(this.startUsage)
    let cpuUsage =
      (endUsage.user + endUsage.system) / (Date.now() - this.startTime)
    const cpuCount = require('os').cpus().length
    cpuUsage = Math.round((cpuUsage / cpuCount) * 100)
    return cpuUsage
  }
}
// 内存使用率计算
exports.getMemoryUsage = function getMemoryUsage() {
  const { heapTotal, heapUsed } = process.memoryUsage()
  let memoryUsage = heapUsed / heapTotal
  memoryUsage = Math.round(memoryUsage * 100)
  return memoryUsage
}
```

Node：在房间销毁时清空 redis 数据，且**在清空 redis 数据时，禁止新连接握手**

```js unbindState: (docName, minSize, bigSize) => {
    rdb?.closeDoc(docName)?.catch(() => {})
    if (!minSize) return
    if (bigSize / minSize < 2) return
    logger.info('清除rdb缓存:', docName, ', bigSize:', bigSize, ', minSize:', minSize)
    setCleaningDoc(docName)
    return rdb
      ?.clearDocument(docName)
      ?.catch(() => {})
      ?.finally(() => {
        logger.info('清除完成:', docName)
        delCleaningDoc(docName)
      })
  },
/**
 * 连接的是否为清库中的文档
 */
exports.checkIsConnectCleaningDoc = function (request) {
  const { roomid } = request.query
  if (cleaningDoc.has(roomid)) {
    request.socket.end()
    return true
  }
  return false
}
// 在清空redis数据时，禁止新连接握手
      const { request, head } = message
      if (!request.headers) request.headers = message.headers
      // const timeDiff = new TimeDiff('升级协议|' + request.query.roomid + '|' + request.query.uuid)
      request.socket = socket
      if (checkIsConnectResumingDoc(request)) return
      if (checkIsConnectCleaningDoc(request)) return
      wss.handleUpgrade(request, socket, head, async function done(ws) {
        if (checkIsHistoryResuming(request, ws)) return
        if (await checkLocalVersion(request, ws)) return
        // logger.info(timeDiff.tips, timeDiff.diff(), timeDiff.hrtime)
        wss.emit('connection', ws, request)
      })
      syncProcessUsage()
```

前端：在 Socket 房间关闭且没有等提交的变更时，尽量清空 indexdb

```js
export function recordLastEditPosition() {
  const eleScrollWarp = document.querySelector('.editor-container')
  if (!editor.value || !eleScrollWarp) return
  const val = { doc_id: doc.value.doc_id, scrollTop: eleScrollWarp.scrollTop }
  storageLocal.set(storageLocal.KEY.LastEditorPosition, val)
  editor.value?.extensionStorage?.realtimeExtension?.ySocket?.provider?.destroy()
}
window.addEventListener('beforeunload', recordLastEditPosition)
class YWebsocket {
  ...
  destroy() {
    const synced = this.provider.synced
    this.provider.destroy()
    this.provider.awareness.destroy()
    this.provider = null
    clearNativeEvents()
    if (synced &amp;&amp; !this.isSyncing) this.indexeddb.clearData()
  }
}
```

前端：失活的页面不要反复握手，以减少连接数（有风险）

```js
provider.on('connection-close', ({ code, reason }) => {
  if (!defineErrCodes.includes(code)) {
    // 其它异常掉线
    provider.off('synced', otherOfflineCb)
    provider.on('synced', otherOfflineCb)
    console.warn(
      '其它异常掉线',
      document.visibilityState,
      new Date().toLocaleTimeString()
    )
    if (document.visibilityState === 'hidden') {
      provider.shouldConnect = false
      document.addEventListener('visibilitychange', () => provider.connect(), {
        once: true,
      })
    }
  }
})
```

## 四、改进

梳理代码发现在 2 年前写过未处理的类似代码，但可能由于后期的业务需求调整未能继续完善

![](https://qtable.oss-cn-beijing.aliyuncs.com/docs/2025/2/28/default_user/4db6d9d82f8a244880a224054e50ec13.png)

1、做好 log 日志各重要环节节点输出，以便排查问题

2、对可疑的逻辑和未完成的优化做好记录
