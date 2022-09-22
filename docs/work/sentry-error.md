---
date: 2022-9-20
title: Sentry系列二——Sentry报错类型
tags:
  - work
  - tool
  - sentry
describe: Sentry中的Issue分类
---
  

## 错误不上报原因

代码中已经使用catch，则不会再上报了

## 错误类型

### SyntaxError 语法错误

- SyntaxError: Unexpected token '<'

  Syntax/ˈsɪntæks/语法， 编译阶段的异常，可以通过配置编辑器校验工具，避免这类报错

### ReferenceError 引用错误

- ReferenceError: $ is not defined

### TypeError 类型错误

- TypeError: Cannot read property 'length' of undefined

  对值进行不合理操作时会发生，引用null、undefined等

### RangeError 范围错误

- RangeError: Invalid array length
- RangeError: Maximum call stack size exceeded

第一种发生在调用数组长度不足，第二中共常发生在递归

### Error 与自定义异常

Error是所有错误的积累，其他错误继承该类型，所有错误类型都包含

- Error.prototype.message: 错误消息
- Error.prototype.name: 错误名称
- Error.prototype.stack: 堆栈信息

通过继承Error实现自定义的错误类型，像React、Vue、Axios等框架都会封装一些自定义异常

```js
class MyError extends Error {
  constructor(message) {
    super();
    this.name = 'MyError';
    this.message = message;
  }
}
```

### 其他Error

- Unable to find node on an unmounted component

  [react issue](https://github.com/facebook/react/issues/20131)

  react和react-dom版本不统一，可能时某个插件的依赖导致

- ResizeObserver loop limit exceeded

  [antd-design issue](https://github.com/ant-design/ant-design/issues/23246)

  该报错[Ant Design官方处理方式](https://github.com/ant-design/ant-design/blob/a51439cbbabef454e35218864fddf0da96e4801e/site/theme/template/Layout/index.jsx#L46)是忽略，重新渲染反应期间可能会触发ResizeObserver loop limit exceeded（多发于组件第一次注册和动态元素)

- 开启忽略

  ```js
  Sentry.init({
    ignoreErrors: [
      "ResizeObserver loop limit exceeded"
    ],
  });
  ```

- [React Intl] Could not find required `intl` object. `<IntlProvider>` needs to exist in the component ancestry.[issue](https://github.com/formatjs/formatjs/issues/1372)
  
  antd Modal组件`<IntlProvider>`未包裹， `<FormattedMessage>`是在Modal render的时候才求值的，而`formatMessage()` API是在组件执行就开始求值
- ChunkLoadError：Loading Chunk Fail
  
  1. 异步加载组件，资源不会一下子全加载，而是你点到哪个界面就加载那个界面的资源。
  2. 重新打包发布后hash值不一样，找不到旧的资源。<br />
  解决：

  ```js
  useEffect(() => {
    const handleLoadingChunkError = (error) => {
      // Loading chunk报错重新加载
      const loadFailed = new RegExp(/Loading chunk (\d)+ failed/g)
      if (error && error.message && error.message.match(loadFailed)) {
        let loadingChunkNum = ss.getItem('loadingChunkNum');
        loadingChunkNum = isNumber(loadingChunkNum) ? loadingChunkNum + 1 : 0;
        // 刷新一次后不再刷新
        if (loadingChunkNum > 1) {
          // 重置次数
          ss.setItem('loadingChunkNum', 0);
        } else {
          ss.setItem('loadingChunkNum', loadingChunkNum);
          window.location.reload()
        }
      }
    }
    window.addEventListener('error', handleLoadingChunkError);
    return () => {
      window.removeEventListener('error', handleLoadingChunkError);
    }
  }, [])
  ```

  **注意** window.onError不能捕获到资源加载失败，必须使用window.addEventListener('error')捕获资源加载失败情况

- UnKnown

  Non-Error promise rejection captured with keys: errorFields, outOfDate, values <br />
  Sentry自定义错误，使用Promise发生错误没有catch的时候，Sentry中通过unhandledrejection进行捕获

- InternalError
  
  网络错误
- URIError
  
  decodeURI, decodeURIComponent, encodeURI, encodeURIComponent四种方法传参错误时会产生这种异常，参考[这篇文章](https://wang1xiang.github.io/blog/docs/work/malformed.html)

## ISSUE

- `config is not defined` index.html config报错
- `Cannot read properties of null (reading 'editor')` quick-email-editor项目报错
- `p.current is null` quick-email-editor项目报错
- `afterLogin window.recordInfoCase.reset is not function` 
- `Cannot read properties of null (reading 'staffInfo')`
- `Cannot read properties of null (reading 'type')` GuideModal.tsx  currentGuide?.type
- `Cannot read properties of undefined (reading 'timeUnit')` 对应bug[2806](http://zentao.quickcep.com/bug-view-2806.html?tid=cnfds63a)
- ` Unexpected end of JSON input`  JSON.parse(localStorage.getItem('user_code_auth') ?? '') UserInfo
- ` SecurityError Failed to execute 'replaceState' on 'History'` [stack overflow](https://stackoverflow.com/questions/32453806/uncaught-securityerror-failed-to-execute-replacestate-on-history-cannot-be)
- `Failed to execute 'getRangeAt' on 'Selection': 0 is not a valid index.` [stack overflow](https://stackoverflow.com/questions/22935320/uncaught-indexsizeerror-failed-to-execute-getrangeat-on-selection-0-is-not)
