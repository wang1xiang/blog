---
date: '2020-9-15'
title: keep-alive路由踩坑
tags:
  - vue
describe: 记录使用keep-alive遇到的问题
---

### keep-alive 存在问题

```js
<keep-alive :include="keepAlive" :exclude="exclude">
  <router-view />
</keep-alive>
data () {
  return {
    exclude: ['home']
  }
},
computed: {
  ...mapGetters({
    keepAlive: 'getKeepAlive'
  })
}
```

> 这里的 keepAlive 为状态管理中存的一份数据(路由名称)，如果某个路由被删除，单单从状态管理中删除是无用的，在 vue-devtool 中还可以看到路由的缓存，如果一直点下去，最终会导致崩溃

### 解决

> 那么，在判断数据中不存在这个路由时，就可以销毁它，销毁组件使用 this.$destory('componentName')，代码为：

```js
const mixin = {
 data() {
  return {
   routePath: ''
  }
 },
 mounted() {
  this.routePath = this.$route.name
 },
 computed: {
  visitedViews() {
   return this.$store.state.keepAlive
  }
 },
 watch: {
  visitedViews(value) {
   if(!value.includes(routePath))
    this.$destroy(this.$options.name)
   }
  }
 }
}
export default mixin
```

> 最后使用 mixins 混入到每个 keepAlive 缓存的页面上，查看 vue-devtool 可以看到删除路由时销毁组件，并没有被缓存了

### 多级路由嵌套keepAlive失败

> 如果项目根组件下有

```js
<keep-alive>
  <route-view :include="include"></route-view>
</keep-alive>
```

> 当A组件中又包含`<route-view>`时，就会生成多级路由，假设A组件下包含B、C组件，当A不缓存，只缓存B、C时，如果仅仅是B、C之间跳转，那么缓存是没有问题的，但是如果跳转到A组件外的路由时，B、C组件的缓存会失效；而如果缓存A组件时，B、C组件的销毁只F会在B、C组件之间有效，如果从A组件外的路由跳转到B、C组件时，keepAlive状态依然存在。
> 导致这种问题的原因只要因为多级路由嵌套，那么只存在一个`<router-view></router-view>`时，就不会有这个问题。
> 所以可以将菜单和路由分开，菜单只是提供使用者方便点击想要的功能，菜单保留多级，但是显示的路由只保留一级，这样就能解决。

### 替代 keepAlive

> keepAlive 本质上会将组件中的数据和 dom 树都缓存下来，但是这样在页面打开很多时，仍然会占用较大的内存，所以可以考虑使用 vuex 将单个组件中用到的数据都缓存下来，打开某个页面时，再重新渲染页面。
