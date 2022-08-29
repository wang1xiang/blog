---
date: '2020-8-16'
title: axios添加token
tags:
  - vue
describe: vue按需引入antd组件过程记录
---

## axios获取请求token并添加在请求header中

```js
axios.interceptors.request.use(
  config => {
      config.headers.token = localStorage.getItem('ACCESS_TOKEN')
      return config;
  },
  error => {
      return Promise.reject(error);
  }
)
```

## 判断返回结果并跳转到登录页

```js
axios.interceptors.response.use(
  response => {
    if (response.data.message === '请登录') {
      notification.error({
        key,
        message: '错误',
        description: '登陆已过期，请重新登陆'
      })
      setTimeout(() => {
        store.dispatch('Logout')
        route.replace({ // 跳转到登录页面
          path: '/login'
          // query: {redirect: router.currentRoute.fullPath, gameId: store.state.gameId} // 将跳转的路由path作为参数，登录成功后跳转到该路由
        })
      }, 1000);
    } else {
      return response
    }
  },
  error => {
    return Promise.reject(error);
  }
)
```
