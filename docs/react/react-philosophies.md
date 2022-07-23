---
date: 2022-06-10
title: react-philosophies
tags:
  - react
describe: react-philosophies即react哲学，按照英文文档翻译
---

> Chinese translation of the [react-philosophies](https://github.com/mithi/react-philosophies)
### react-philosophies react哲学

#### 1.The Bare Minimum 最低要求

##### 1.1 Recognize when the computer is smarter than you 计算机比你更聪明

1. 使用Eslint静态分析代码，启用[钩子规则](https://www.npmjs.com/package/eslint-plugin-react-hooks)捕获特定react错误
2. 开启严格模式
3. 诚实对待你的依赖。修改useMemo、useCallback和useEffect的警告/错误。
4. 使用map时，必须加key
5. 只在顶级使用钩子，不要在循环、条件或嵌套函数中调用Hook
6. 理解警告“无法对未安装的组件执行状态更新”, [react/pull](https://github.com/facebook/react/pull/22114)
7. 在应用程序不同级别添加多个错误边界来防止“白屏死机”，使用Sentry监控
8. 不要忽略了控制台中打印的错误和警告。
9. 记得要 [`tree-shaking`](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fguides%2Ftree-shaking%2F)!
10. 使用prettier格式化代码

##### 1.2 Code is just a necessary evil 代码只是一种必要的邪恶

1. 在添加另一个依赖项之前先考虑一下
   - 真的需要Redux吗？这是可能的。但请记住，React已经是一个状态管理库
   - [`Lodash`](https://lodash.com/)/[`underscoreJS`](https://underscorejs.org/)? [you-dont-need/You-Dont-Need-Lodash-Underscore](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore)
   - [`MomentJS`](https://momentjs.com/)? [you-dont-need/You-Dont-Need-Momentjs](https://github.com/you-dont-need/You-Dont-Need-Momentjs)
   - 你甚至可能不需要 Javascript。 CSS 很强大。[you-dont-need/You-Dont-Need-JavaScript](https://github.com/you-dont-need/You-Dont-Need-JavaScript)

##### 1.3 Leave it better than you fount it 让它比你发现发更好

1. 检测代码异味并在需要时对其进行处理（代码异味并不一定意味需要更改代码，只是有更好的方法可以实现相同的功能）
   - 使用大量参数定义的方法或函数
   - 难以理解的Boolean逻辑
   - 单个文件中的代码行过多
   - 语法相同的重复代码（但格式可能不同）
   - 可能难以理解的功能或方法
   - 用大量函数或方法定义的类/组件
   - 单个函数或方法中的代码行数过多
   - 具有大量返回语句的函数或方法
2. 无情的重构。简单胜于复杂
   - 如果可以的话，简化复杂的条件并尽早退出

   -

##### 1.4 You can do better 你可以做得更好

1. 请记住，你可能不需要将状态作为依赖项，因为您可以传递回调函数

   ```js
   ❌ Not-so-good
   const decrement = useCallback(() => setCount(count - 1), [setCount, count])
   const decrement = useCallback(() => setCount(count - 1), [count])
   
   ✅ BETTER
   const decrement = useCallback(() => setCount(count => (count - 1)), [])
   ```

2. 用钩子包装你的自定义上下文会创建一个更好看的API

   ```js
   // you need to import two things every time 
   import { useContext } from "react"
   import { SomethingContext } from "some-context-package"
   
   function App() {
     const something = useContext(SomethingContext) // looks okay, but could look better
     // blah
   }
   
     
   // on one file you declare this hook
   function useSomething() {
     const context = useContext(SomethingContext)
     if (context === undefined) {
       throw new Error('useSomething must be used within a SomethingProvider')
     }
     return context
   }
     
   // you only need to import one thing each time
   import { useSomething } from "some-context-package"
   
   function App() {
     const something = useSomething() // looks better
     // blah
   }  
   ```

3. 在编码之前考虑如何使用您的组件，写README文档，写清楚组件API

#### 2. Design for happiness 面向幸福设计

​ 我们不断阅读旧代码作为编写新代码的一部分，所以如果你想快点，如果你想快速完成，如果你想让你的代码已于编写，请让它先易于阅读。

1. 通过删除冗余状态来避免状态管理复杂性

2. 传递香蕉，而不是拿着香蕉的大猩猩和整个丛林（组件需要什么传递什么，而不是传递大对象）

   为了避免落入这个陷阱，最好将主要的原始类型（boolean、string、number等）作为道具传递（如果想使用React.memo进行优化，传递原语是一个好主意）

   当这样做时，组件解耦，两个组件间的依赖程度会更低

   ```tsx
   const Summary = ({ member } : { member: Member }) => {
   }
   
   const SeeMore = ({ member }: { member: Member }) => {
   }
   
   const MemberCard = ({ id }: { id: string })) => {
     const member = useMember(id)
     return <><Summary member={member} /><SeeMore member={member} /></>
   }
   
   // better
   const Summary = ({ imgUrl, webUrl, header }: { imgUrl: string, webUrl: string, header: string }) => {
   }
   
   const SeeMore = ({ componentToShow }: { componentToShow: ReactNode }) => {
   }
   
   
   const MemberCard = ({ id }: { id: string }) => {
     const { title, firstName, lastName, webUrl, imgUrl, age, bio } = useMember(id)
     return (
       <>
         <Summary {...{ imgUrl, webUrl, header }} />
         <SeeMore componentToShow={<>AGE: {age} | BIO: {bio}</>} />
       </>
     )
   }
   ```

3. 保持组件小而简单——单一责任原则

   具备各种职责的组件难以重用，可能与其他代码纠缠在一起

4. 重复比错误的抽象要便宜得多（避免过早/不恰当的泛化）

5. 必满Prop层层传递（prop钻取，prop drilling）

6. 将巨大的useEffect拆分为更小的独立的

7. 将逻辑提取到钩子和辅助函数中

8. useCallback、useMemo 和 useEffect 依赖数组中的依赖项组好是基本类型

9. 不要再useCallback、useMemo和useEffect中放置过多的依赖项

10. 为简单起见，如果你的状态的某些值依赖于你的状态和先前状态的其他值，请考虑使用useReducer，而不是使用多个useState ?? useMemo为什么不适用呢

11. Context放在组件树中尽可能低的位置，尽可能靠近它们相关/正在使用的位置

### Performance Tips 性能优化

1. 使用useMemo用于昂贵的计算
2. 如果打算使用memo、useMemo或useCallback来减少重新渲染，不应该有过多的依赖关系，并且依赖关系应该主要是原始类型
3. 确保memo、useMemo或useCallback正在做你认为它正在做的事情（它真的阻止重新渲染了吗？）您能否凭经验证明在您的案例中使用它们可以显着提高性能？
4. [在修复重新渲染之前修复慢速渲染](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
5. 状态托管：使你的状态尽可能的靠近使用它的位置不仅会使代码更易于阅读，而且会使应用程序更快
6. Context应该在逻辑上分开，不要再一个Context Provider中添加多个值，如果Context中的任何值发生更改，则使用该Context的所有组件都会重新渲染，即使这些组件未使用实际更改的值
7. 你可以通过拆分state和disppatch来优化Context
8. 了解术语 lazy loading和bundle/code splitting
9. 长列表使用react-virtual类似
10. 使用source-map-explorer工具可视化生成的代码包，包体积越小，app越快

**查看有关性能的选定 KCD 文章**

- [KCD: State Colocation will make your React app faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [KCD: When to `useMemo` and `useCallback`](https://kentcdodds.com/blog/usememo-and-usecallback)
- [KCD: Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
- [KCD: Profile a React App for Performance](https://kentcdodds.com/blog/profile-a-react-app-for-performance)
- [KCD: How to optimize your context value](https://kentcdodds.com/blog/how-to-optimize-your-context-value)
- [KCD: How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [KCD: One React Mistake that is slowing you down](https://epicreact.dev/one-react-mistake-thats-slowing-you-down)
- [KCD: One simple trick to optimize React re-renders](https://kentcdodds.com/blog/optimize-react-re-renders)

### Testing principles测试原则

1. 测试应该始终与软件的使用方式相似
2. 确保不是在测试一些边界细节（用户不会使用，看不到甚至感知不到的内容）
3. 如果果你的测试不能让你对自己的代码产生信任，那测试就是无意义的
4. 如果你正在重构某个代码，且最后实现的功能都是完全一致的，其实几乎不需要修改测试，而且可以通过测试结果来判定你正确的重构了
5. 测试应该让开发更有效率，而不是减慢开发速度
6. 使用 [Jest](https://jestjs.io/), [React testing library](https://testing-library.com/docs/react-testing-library/intro/), [Cypress](https://www.cypress.io/), and [Mock service worker](https://github.com/mswjs/msw)

### Insights shared by others 与他人分享见解
