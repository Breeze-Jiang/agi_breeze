# React memo、useCallback 与 useMemo：父组件多状态时如何减少无效渲染

标签：React, memo, useCallback, useMemo

父组件同时维护 `count` 和 `name` 时，点击计数按钮会让父组件重新渲染。子组件只依赖 `name`，是否也必须重新执行？答案是：可以用 `memo` 根据 Props 做跳过判断；如果传递的是函数，还要考虑 `useCallback` 的引用稳定；如果问题是昂贵计算，则使用 `useMemo` 缓存结果。本文基于本地 React + Vite Demo 静态整理，**运行未验证**。

## 当前 Demo 实际演示了什么

当前源码的关键结构：

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

这里要先澄清：目录叫 `useCallback`，但当前 `App.jsx` 实际导入和使用的是 `useState`、`memo`，没有真正调用 `useCallback` 或 `useMemo`。

## 父组件状态变化为什么会牵连子组件

```text
点击增加
  ↓
count 改变
  ↓
App 重新执行
  ↓
RegularChild 收到 name
  ↓
memo 比较 Props
```

没有 `memo` 时，父组件重新渲染，子组件通常也会跟随执行。这里 `RegularChild` 只接收 `name`，不依赖 `count`，因此计数变化并不需要它重新计算名字标题。

## memo 如何减少子组件渲染

```jsx
const RegularChild = memo(function RegularChild({ name }) {
  return <h1>当前名字：{name}</h1>
})
```

`memo` 默认对 Props 做浅层比较：

```text
name 没变化 → 尝试跳过子组件重新执行
name 变化   → 子组件重新执行
```

当前 `name` 是字符串，比较比较直接。点击“增加”时，`count` 变化但 `name` 不变，`RegularChild` 理论上可以跳过；点击“改变名字”时，`name` 从“少林队”变为“峨眉队”，子组件需要更新。

需要注意，`memo` 只影响被包装的子组件，不会阻止 `App` 自己重新渲染，也不是业务正确性的保证。

## useCallback 解决的是函数引用

如果子组件接收函数：

```jsx
const handleSelect = () => {
  console.log(name)
}

<RegularChild onSelect={handleSelect} />
```

即使函数逻辑看起来没有变化，父组件每次重新渲染也可能创建一个新的函数对象：

```text
第一次渲染：handleSelect 引用 A
第二次渲染：handleSelect 引用 B
```

配合 `memo` 时，子组件可能认为 `onSelect` 这个 Prop 发生了变化。此时可以使用：

```jsx
const handleSelect = useCallback(() => {
  console.log(name)
}, [name])
```

依赖的 `name` 不变时，React 可以复用函数引用；`name` 变化时，重新创建函数，以便函数读取最新的 `name`。

一句话：

```text
memo：比较子组件 Props，决定是否跳过
useCallback：缓存传给子组件的函数引用
```

## useMemo 缓存计算结果

`useMemo` 解决的是计算结果重复生成的问题：

```jsx
const completedItems = useMemo(() => {
  return items.filter(item => item.done)
}, [items])
```

含义是：

- `todos` 没变化：复用上一次计算结果
- `todos` 变化：重新执行过滤逻辑

对比：

| API | 缓存对象 | 典型场景 |
|---|---|---|
| `memo` | 子组件渲染结果的跳过判断 | 子组件 Props 未变化 |
| `useCallback` | 函数引用 | 函数作为 Props 传递 |
| `useMemo` | 计算结果 | 昂贵计算或需要稳定对象引用 |

## 不要把优化 Hook 当成默认写法

记忆化也有成本：需要维护依赖数组和比较缓存。小组件、简单计算、没有性能瓶颈时，直接写普通代码通常更清晰。

建议顺序：

```text
先确认组件或计算确实重复且昂贵
  ↓
用日志或 Profiler 定位
  ↓
再选择 memo、useCallback 或 useMemo
  ↓
验证优化前后的渲染行为
```

## 源码排查提醒

当前 `main.jsx` 导入了 `StrictMode`，但没有使用它包裹 `App`：

```jsx
createRoot(document.getElementById('root')).render(
  <App />
)
```

因此，如果控制台出现重复日志，不能仅凭这份源码直接归因于 StrictMode；本次项目也没有运行验证，具体原因需要结合实际入口、开发工具和运行环境检查。

## 性能优化自检清单

- [ ] 子组件是否真的因为父组件无关状态变化而重复执行？
- [ ] 子组件 Props 是否包含每次都会新建的对象、数组或函数？
- [ ] 如果传函数，是否需要 `useCallback` 稳定引用？
- [ ] 如果有复杂计算，是否需要 `useMemo` 缓存结果？
- [ ] 是否确认依赖数组包含了计算或函数使用的外部值？
- [ ] 是否用 Profiler 或日志验证优化确实生效？
- [ ] 是否因为过度优化增加了代码复杂度？

## 总结

React 性能优化不是看到重新渲染就全部阻止，而是先判断更新是否有必要。当前 Demo 中，`memo` 让 `RegularChild` 可以关注 `name` 而忽略 `count`；函数 Props 场景再考虑 `useCallback`，昂贵计算场景再考虑 `useMemo`。最终可以记住：`memo` 管子组件跳过，`useCallback` 管函数引用，`useMemo` 管计算结果。本文代码运行未验证。
