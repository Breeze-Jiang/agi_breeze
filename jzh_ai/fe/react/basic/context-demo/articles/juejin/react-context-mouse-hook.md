# 不要把 Context 当万能状态库：主题共享和鼠标 Hook 应该这样拆

摘要：一个 React 学习 Demo 同时包含主题 Context 与 `useMouse`。它们解决的不是同一类问题：Context 用于跨层传递共享数据，自定义 Hook 用于封装可复用的状态和副作用。本文从源码调用链出发，给出 Provider、`useContext`、事件清理和职责划分的自检方法。代码运行未验证。

深层组件树需要主题时，很多人会把 `theme` 从 App 一路传到按钮。多个页面都需要鼠标位置时，又会复制 `useState + useEffect + addEventListener`。前者是跨层共享问题，后者是逻辑复用问题。关键不是“都用 Hook”，而是选对职责：**Context 管共享数据，自定义 Hook 管可复用逻辑。**

## 从主题消费链路看 Context

Demo 先创建主题通道：

```jsx
import { createContext } from 'react'

export const ThemeContext = createContext('light')
```

这里的 `light` 不是当前主题的强制值，而是兜底值。消费者没有被对应 Provider 包裹时，`useContext(ThemeContext)` 才会得到它。

Provider 负责限定共享数据生效的组件树：

```jsx
<ThemeContext.Provider value="dark">
  <Page />
</ThemeContext.Provider>
```

它包裹的 `Page` 和后代可以读取 `dark`。如果嵌套了同一种 Provider，消费者读取最近的 Provider 值，因此内部 Provider 可以覆盖外部 Provider。

Demo 没有让组件到处直接写 `useContext`，而是封装为 `useTheme`：

```jsx
import { useContext } from 'react'
import { ThemeContext } from '../ThemeContext'

export const useTheme = () => {
  return useContext(ThemeContext)
}
```

`Page` 和 `Child` 调用 `useTheme()`，其中 `Child` 将读取到的主题写入按钮的 `className` 和文本。这说明业务组件只关心“拿主题”，不必关心 Context 定义在哪个文件。

## useMouse 复用的是逻辑，不是同一份坐标

鼠标 Hook 的实现包含 state 和副作用：

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

调用端只需要：

```jsx
const { x, y } = useMouse()
```

这段封装把“坐标 state、监听注册、卸载清理”从页面组件移走。`clientX`、`clientY` 是鼠标相对浏览器可视区域的坐标。

但要注意：两个组件分别调用 `useMouse()` 时，它们拥有各自的 state 和 Effect。它们只是复用同一段代码，并不会天然共享一份 `x`、`y`。

## 事件监听的关键不是添加，而是成对清理

Effect 中的清理函数：

```jsx
return () => {
  document.removeEventListener('mousemove', handleMouseMove)
}
```

保证组件卸载后停止监听。更重要的是，添加和移除时传入的必须是同一个函数：

```jsx
document.addEventListener('mousemove', handleMouseMove)
document.removeEventListener('mousemove', handleMouseMove)
```

如果每次都传一个新的匿名函数，浏览器无法定位已经注册的监听器。

## 选择工具时只问一个问题

| 你的问题 | 选择 |
|---|---|
| 多个深层后代需要同一份主题、用户、语言数据 | Context |
| 多个组件需要复用请求、监听、定时器等逻辑 | 自定义 Hook |
| 只有直接父子组件使用的数据 | Props |

Context 不是全局变量，也不应替代所有局部 state。自定义 Hook 也不是共享状态容器，它主要用来抽离重复的响应式和副作用逻辑。

## 一次可执行的自检

- [ ] Provider 是否包裹了需要读取数据的组件树？
- [ ] Consumer 读取的数据结构是否与 Provider 的 `value` 一致？
- [ ] Hook 是否以 `use` 开头，并在组件或 Hook 顶层调用？
- [ ] `useEffect` 是否释放了事件监听、定时器、Worker 或连接？
- [ ] 添加和移除事件时是否复用了同一个函数引用？
- [ ] 复用需求是共享数据，还是共享逻辑？

## 本次源码的未验证项

静态阅读发现 `App.jsx` 已通过 `useMouse()` 获得坐标，但仍导入了未使用的 `useState` 与 `useEffect`。本次未执行 lint，因此不把它写成已确认错误。

已读的 `App.jsx` 也没有展示主题 Provider 的实际挂载位置，所以主题链路的运行状态未知。本文基于本地源码整理，代码运行未验证。

最终判断很简单：数据需要跨层抵达多个消费者时用 Context；逻辑需要被多个组件复用时写自定义 Hook。先按这个边界拆分，再决定是否需要更复杂的状态管理方案。
