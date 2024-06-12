---
date: 2024-5-3
title: flutter路由管理
tags:
  - flutter
describe: flutter路由管理
---

Flutter 路由管理也称为导航管理，Android 和 IOS 相同，都是维护一个路由栈。

## MaterialPageRoute

MaterialPageRoute 是 Material 提供的组件，针对不同平台，实现不同的切换动画，表示占有整个屏幕空间的一个模态路由页面

```dart
MaterialPageRoute({
  WidgetBuilder builder, // 返回新路由的实例
  RouteSettings settings, // 路由的配置信息，如路由名称、是否初始路由（首页）
  bool maintainState = true, // 原路由是否要保存在内存中
  bool fullscreenDialog = false, // 是否全屏模态对话框
})
```

## Navigator

路由管理组件

```dart
// 压栈处理
Navigator.push(
  context,  // build 方法的参数
  MaterialPageRoute(builder: (_) => SecondPage()),
)
// 出栈
Navigator.pop(context);
```

## 路由传参

```dart
// 压栈处理
var result = await Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) {
      return TipRoute(
        // 路由参数
        text: "我是提示xxxx",
      );
    },
  ),
);
//输出`TipRoute`路由返回结果
print("路由返回值: $result");

// TipRoute
class TipRoute extends StatelessWidget {
  TipRoute({
    super.key,
    required this.text, // 接收一个text参数
  });
Navigator.pop(context, "我是返回值")
```

## 命名路由

```dart
MaterialApp(
  title: 'Flutter Demo',
  theme: ThemeData(primarySwatch: Colors.blue),
  //名为"/"的路由作为应用的home(首页)
  initialRoute:"/",
  //注册路由表
  routes:{
    "new_page":(context) => NewRoute(),
    "/":(context) => MyHomePage(title: '首页'), //注册首页路由
  },
);
// 跳转
Navigator.pushNamed(context, "new_page");
Navigator.pushReplacementNamed(context, "new_page");
// 参数传递
Navigator.pushNamed(context, "new_page", arguments: "hi");
@override
Widget build(BuildContext context) {
  var args = ModalRoute.of(context).settings.arguments; // "hi"
```

## 路由守卫

```dart
MaterialApp(
  ... //省略无关代码
  onGenerateRoute:(RouteSettings settings){
    return MaterialPageRoute(builder: (context){
      String routeName = settings.name;
      // 如果访问的路由页需要登录，但当前未登录，则直接返回登录页路由。
    }
  );
  }
);
```
