# React Context 与自定义 Hook：解决跨层传值和鼠标监听复用

标签：React, Context, 自定义Hook, useContext

在 React 中，主题这类数据如果需要传到很深的子组件，逐层传 Props 会让中间组件只剩“搬运数据”的工作。另一个常见问题是：多个组件都要监听鼠标位置时，事件监听和清理逻辑会重复。本篇基于一个 React Context 学习 Demo 的静态源码，整理出一条可复用的路线：**Context 管共享数据，自定义 Hook 管可复用逻辑**。文中代码运行未验证。

## 先区分两类问题

| 问题 | 更合适的工具 | 项目对应实现 |
|---|---|---|
| 深层组件都要读取主题 | Context | `ThemeContext` 与 `useTheme` |
| 多处都要获取鼠标坐标 | 自定义 Hook | `useMouse` |
| 只在直接父子组件间传数据 | Props | 不必为了传一层数据引入 Context |

Context 不等于所有状态都放进去。局部、简单的父子数据用 Props 往往更清晰。

## Context 的最短链路

Context 的使用分为三步：创建、提供、消费。

```jsx
import { createContext } from 'react'

export const ThemeContext = createContext('light')
```

`createContext('light')` 创建主题数据通道。`'light'` 是默认值：只有消费者向上找不到对应 Provider 时才会使用它。

接着在组件树外层提供数据：

```jsx
<ThemeContext.Provider value="dark">
  <Page />
</ThemeContext.Provider>
```

`Page` 和它的后代组件读取主题时会拿到 `"dark"`。Provider 的 `value` 会覆盖默认值；如果存在嵌套 Provider，组件会读取离自己最近的一个。

## 用 useTheme 隐藏 Context 细节

Demo 将读取主题的逻辑放进 `hooks/useTheme.js`：

```jsx
import { useContext } from 'react'
import { ThemeContext } from '../ThemeContext'

export const useTheme = () => {
  return useContext(ThemeContext)
}
```

这样业务组件只需表达“我要主题”：

```jsx
const theme = useTheme()
```

而不用在每个组件中重复导入 `ThemeContext` 和 `useContext`。源码中 `Page` 与 `Child` 都通过 `useTheme()` 消费主题；`Child` 还将主题用于按钮的 `className` 和文本。

这类封装的收益是：Context 文件位置和读取细节集中在一个 Hook 中，调用方的语义更明确。

## 自定义 useMouse：复用副作用逻辑

主题属于共享数据；鼠标监听则属于可复用逻辑。Demo 中的 `useMouse` 负责三件事：保存坐标、注册事件、卸载时清理事件。

```jsx
export const useMouse = () => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useEffect(() => {
    function handleMouseMove(e) {
      setX(e.clientX)
      setY(e.clientY)
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return { x, y }
}
```

调用组件中直接解构结果：

```jsx
const { x, y } = useMouse()
```

`clientX` 和 `clientY` 表示鼠标相对浏览器可视区域的坐标。状态变化后，React 会重新渲染，页面显示新的位置。

## 为什么清理函数不能省？

`useEffect` 返回的函数会在组件卸载时执行：

```jsx
return () => {
  document.removeEventListener('mousemove', handleMouseMove)
}
```

它的作用是移除不再需要的监听器，避免组件消失后还持续执行回调。

注意添加和移除必须使用同一个函数引用：

```jsx
document.addEventListener('mousemove', handleMouseMove)
document.removeEventListener('mousemove', handleMouseMove)
```

如果两处分别写匿名函数，移除时找不到之前注册的那个函数。

## Context 与自定义 Hook 的边界

| 对比项 | Context | 自定义 Hook |
|---|---|---|
| 解决的问题 | 跨层共享数据 | 复用状态和副作用逻辑 |
| 当前案例 | 主题 | 鼠标坐标 |
| 是否让不同组件共享同一份 state | 可以由 Provider 提供同一份值 | 不会，每次调用通常都有自己的 Hook state |
| 常见 API | `createContext`、Provider、`useContext` | `useState`、`useEffect` 组合封装 |

最容易误解的是：多个组件分别调用 `useMouse()`，它们复用的是同一套逻辑，不是同一个 `x`、`y` state。

## 实战自检清单

- [ ] 跨层共享的数据是否真的被多个后代组件使用？
- [ ] Provider 的 `value` 是否与消费者期待的数据结构一致？
- [ ] 自定义 Hook 是否以 `use` 开头，并只在组件或其他 Hook 顶层调用？
- [ ] Effect 是否在卸载时清理事件、定时器或连接？
- [ ] 添加和移除监听时是否使用同一个函数引用？
- [ ] 需要共享的是数据，还是只需要复用逻辑？

## 静态阅读中发现的边界

当前 `App.jsx` 静态代码使用了 `useMouse()`，但仍导入了 `useState` 和 `useEffect`，它们在该组件内未使用。是否会被现有 lint 流程报告，本次没有执行验证。

另外，已读到的 `App.jsx` 没有展示主题 Provider 的实际挂载位置，因此主题 Provider 是否在运行入口中正确包裹组件树，属于未验证项。

## 总结

当问题是“主题如何跨过多层组件到达按钮”时，使用 Context；当问题是“鼠标坐标监听如何避免重复编写”时，使用自定义 Hook。把二者分开，组件既不需要层层转发 Props，也不会复制事件监听和清理逻辑。

下一步可以把主题从字符串扩展为 `{ theme, setTheme }`，通过 Provider 提供切换函数，再观察所有消费者如何跟随主题更新。
