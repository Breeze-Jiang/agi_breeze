# 父组件一更新，子组件就必须跟着更新吗？从 memo 走到 useCallback

父组件有多个状态时，子组件是否会被无关状态牵连，是 React 性能优化里很容易混淆的问题。这个 Demo 的答案不是“所有地方都加 Hook”，而是先用 `memo` 判断 Props，再针对函数引用选择 `useCallback`，针对昂贵计算选择 `useMemo`。本文基于本地源码静态整理，运行未验证。

## 先看这份 Demo 的事实

```jsx
const RegularChild = memo(function RegularChild({ name }) {
  console.log('RegularChild 组件渲染')
  return <h1>当前名字：{name}</h1>
})

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('少林队')

  return (
    <>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setName('峨眉队')}>改变名字</button>
      <RegularChild name={name} />
    </>
  )
}
```

`App` 同时管理 `count` 和 `name`，而 `RegularChild` 只接收 `name`。因此，点击计数按钮时，父组件需要更新，但子组件的输入并没有改变。

另外，这份源码虽然位于 `useCallback` 目录，但当前实际使用的是 `useState` 和 `memo`，并没有真正写出 `useCallback` 或 `useMemo`。

## memo：先解决“Props 没变还执行”

`memo` 会根据子组件 Props 进行浅层比较：

```text
count 改变
  ↓
App 重新渲染
  ↓
name 仍然相同
  ↓
memo 尝试跳过 RegularChild
```

而点击改变名字按钮时：

```text
name 改变
  ↓
RegularChild 的 Props 改变
  ↓
子组件重新渲染
```

这就是 README 中“属性比对”的具体含义。它比较的是传入子组件的 Props，不是比较父组件所有 state。

## useCallback：保持函数 Props 稳定

现在假设子组件需要一个回调：

```jsx
const handleSelect = () => {
  console.log(name)
}

<RegularChild onSelect={handleSelect} />
```

每次 `App` 重新执行，普通函数也可能重新创建。对于 `memo` 来说，新的函数引用可能意味着新的 Props：

```text
业务逻辑相似，不代表函数引用相同
```

使用 `useCallback`：

```jsx
const handleSelect = useCallback(() => {
  console.log(name)
}, [name])
```

当 `name` 不变时，函数引用保持稳定；当 `name` 变化时，函数也会更新，保证闭包读取到正确值。

重点：`useCallback` 缓存的是函数本身的引用，不是函数调用后的结果。

## useMemo：保持计算结果稳定

如果要计算一个结果：

```jsx
const completedItems = useMemo(() => {
  return items.filter(item => item.done)
}, [items])
```

它的判断是：

```text
todos 不变 → 复用上次结果
todos 改变 → 重新计算
```

因此三者的分工是：

| 工具 | 解决的问题 |
|---|---|
| `memo` | 子组件 Props 不变时跳过渲染 |
| `useCallback` | 函数作为 Props 时保持引用稳定 |
| `useMemo` | 复杂计算结果重复生成 |

## 一条实际决策路径

```text
发现子组件重复执行
  ↓
先检查子组件 Props 是否真的变化
  ↓
没有变化？尝试 memo
  ↓
Props 中有函数且引用不稳定？考虑 useCallback
  ↓
存在昂贵计算？考虑 useMemo
  ↓
用 Profiler 或日志确认结果
```

不要因为看到了重新渲染就机械地添加三个 API。记忆化本身也需要维护依赖和缓存，过度使用会降低代码可读性。

## 关于当前日志的边界

`App.jsx` 和 `RegularChild` 都有渲染日志，适合帮助初学者观察父子组件执行过程。但当前源码只导入了 `StrictMode`，并没有用它包裹 `<App />`。因此，源码本身不足以解释所有可能的重复日志；本次没有执行项目，实际输出仍需在当前环境验证。

## 结尾：面试时怎么回答

可以这样说：

> React 中父组件状态变化会触发父组件重新渲染，普通子组件可能跟随执行。`memo` 可以对 Props 做浅层比较，在 Props 没变化时跳过子组件更新；如果传入函数 Props，使用 `useCallback` 稳定函数引用；如果存在昂贵计算，使用 `useMemo` 缓存结果。优化前应先定位真实的重复渲染或计算，避免过度记忆化。

最后记忆三个关键词：

```text
memo：子组件
useCallback：函数引用
useMemo：计算结果
```
