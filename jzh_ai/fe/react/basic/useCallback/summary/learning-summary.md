---
type: learning-summary
title: "React memo、useCallback 与 useMemo 性能优化学习总结"
aliases: ["React memo、useCallback 与 useMemo·学习总结"]
tags: [learning, React, memo, useCallback, useMemo]
source_scope: "react/basic/useCallback"
coverage:
  deep_read: ["readme.md", "callback-demo/src/App.jsx", "callback-demo/src/main.jsx"]
  shallow_read: ["callback-demo/package.json", "callback-demo/index.html", "callback-demo/src/index.css"]
  supplement: []
  skipped: ["package-lock.json", "App.css", "静态资源", "ESLint 配置"]
review_status: learning
next_review: null
---

# React memo、useCallback 与 useMemo 性能优化学习总结

## 一页速览

> [!summary]
> - 父组件状态变化会让父组件重新渲染，普通情况下子组件也可能重新渲染。
> - `memo` 通过比较 Props，尝试跳过子组件不必要的重新渲染。
> - 当前 Demo 实际使用了 `useState` 和 `memo`，没有真正调用 `useCallback` 或 `useMemo`。
> - `useCallback` 缓存函数引用，`useMemo` 缓存计算结果；二者主要在配合子组件或昂贵计算时有意义。
> - 本项目仅做静态源码阅读，**运行未验证**。

最小心智模型：**状态决定何时更新，memo 决定子组件是否跳过，useCallback 稳定函数引用，useMemo 缓存计算结果。**

## 学习范围

- **深读**：`readme.md`、Demo 的 `App.jsx` 和 `main.jsx`，覆盖状态、父子组件、`memo` 与入口渲染。
- **浅读**：`package.json`、`index.html`、`index.css`，用于确认 React/Vite 入口和基础样式。
- **补读**：无。
- **跳过**：锁文件、`App.css`、图片、ESLint 配置，与本次性能优化主线无直接关系。
- **未知**：未执行开发服务器、构建或 lint，实际控制台日志和渲染次数未运行验证。

## 知识地图

```text
main.jsx
  ↓ createRoot(...).render(<App />)
App
  ├─ count state → 增加按钮
  ├─ name state → 改变名字按钮
  └─ memo(RegularChild)
       └─ name prop → 当前名字
```

## 核心知识

### 1. 为什么需要渲染优化？[材料中出现]

`readme.md` 提出的问题是：父组件拥有多个状态，子组件只依赖其中一部分；当父组件因为无关状态重新渲染时，子组件可能也跟着执行，带来性能浪费。

这里要区分：

- **组件函数重新执行**：React 重新运行组件函数。
- **真实 DOM 一定变化**：不一定，React 会继续比较并尽量复用 DOM。
- **子组件一定重新执行**：未使用优化时通常会跟随父组件；使用 `memo` 后，Props 未变化时可以跳过。

### 2. 当前 Demo 的状态关系[材料中出现]

```jsx
const [count, setCount] = useState(0)
const [name, setName] = useState('少林队')
```

父组件有两个独立 state：

- `count` 只用于显示计数。
- `name` 传给 `RegularChild`。

两个按钮分别更新两个 state：

```jsx
<button onClick={() => setCount(count + 1)}>增加</button>
<button onClick={() => setName('峨眉队')}>改变名字</button>
```

### 3. `memo` 做什么？[材料中出现]

子组件写成：

```jsx
const RegularChild = memo(function RegularChild({ name }) {
  console.log('RegularChild 组件渲染')
  return <h1>当前名字：{name}</h1>
})
```

`memo` 会对父组件传入的 Props 做浅层比较：

```text
name 没变化 → 尝试跳过子组件重新执行
name 变化   → 子组件重新执行
```

当前 `name` 是字符串，比较较直接。如果以后传入对象或函数，引用变化会影响比较结果。

### 4. `useCallback` 的作用[材料推导]

当前源码没有真正调用 `useCallback`，下面是理解当前主题所需的补充示例：

```jsx
const handleSelect = useCallback(() => {
  console.log(name)
}, [name])

<RegularChild onSelect={handleSelect} />
```

`useCallback` 缓存的是函数引用，不是函数执行结果。依赖项不变时，下一次渲染可以继续使用同一个函数引用；依赖项变化时，React 创建新的函数引用。

它通常与 `memo` 配合：如果父组件传给子组件的回调每次都是新函数，即使业务逻辑相同，`memo` 也可能认为 Props 变了。

### 5. `useMemo` 的作用[材料推导]

`useMemo` 缓存计算结果：

```jsx
const filteredTodos = useMemo(() => {
  return todos.filter(todo => todo.completed)
}, [todos])
```

- `useCallback(fn, deps)`：缓存函数引用。
- `useMemo(() => value, deps)`：缓存计算结果。

二者都不是默认必用的优化，应先确认确实存在昂贵计算或不稳定引用造成的重复渲染。

## 代码、模块与数据流

### 页面入口

`index.html` 提供 `root` 挂载节点，`main.jsx` 执行：

```jsx
createRoot(document.getElementById('root')).render(
  <App />
)
```

`main.jsx` 虽然导入了 `StrictMode`，但当前源码没有使用 `<StrictMode>` 包裹 `App`。因此本次不能把控制台重复日志归因于 StrictMode。

### 点击增加按钮

```text
用户点击
  ↓
setCount(count + 1)
  ↓
App 重新执行
  ↓
name 仍为原值
  ↓
memo 比较 RegularChild 的 name
  ↓
子组件理论上可跳过
```

### 点击改变名字按钮

```text
用户点击
  ↓
setName('峨眉队')
  ↓
App 重新执行
  ↓
name Props 发生变化
  ↓
RegularChild 重新执行并显示新名字
```

以上“理论上”结论来自源码语义，实际日志未验证。

## 重点语法与 API

| API | 最小用法 | 作用 |
|---|---|---|
| `useState` | `useState(0)` | 保存状态，setter 调用后触发更新。|
| `memo` | `memo(Component)` | 根据 Props 比较结果跳过部分子组件渲染。|
| `useCallback` | `useCallback(fn, deps)` | 缓存函数引用，依赖变化时更新。|
| `useMemo` | `useMemo(factory, deps)` | 缓存计算结果，依赖变化时重新计算。|
| `createRoot` | `createRoot(node)` | 创建 React 根并挂载应用。|

## 注释重点解读

[材料中出现] `readme.md` 的“属性比对”是对 `memo` 的简化描述。更准确地说，`memo` 默认对 Props 做浅层比较，并据此决定是否跳过子组件重新渲染；它不是比较所有业务数据，也不是保证绝对不渲染。

[材料中出现] 当前 `App.jsx` 没有解释性注释，主要通过组件结构和日志表达学习目的。

## 易混淆点、未知信息和下一步

> [!warning]
> 当前目录名是 `useCallback`，但实际 `App.jsx` 没有导入或调用 `useCallback`，也没有传递函数 Props。当前示例实际演示的是 `useState + memo`。

> [!question]
> 当前源码未运行，因此“点击增加后子组件是否跳过、控制台实际打印几次”仍是未知运行结果。

| 易混淆点 | 正确理解 |
|---|---|
| `memo` 能阻止父组件渲染吗？ | 不能，它只影响被包裹的子组件是否跳过。|
| `useCallback` 缓存什么？ | 缓存函数引用，不缓存函数执行结果。|
| `useMemo` 缓存什么？ | 缓存计算结果，不是函数本身。|
| Props 没变就绝对不渲染吗？ | `memo` 是性能优化提示，不能当作业务正确性的基础。|
| 字符串和对象比较一样吗？ | 字符串按值比较；对象、数组、函数通常关注引用是否相同。|

## 面试高频知识

### `memo` 解决什么问题？[材料中出现]

当父组件更新但子组件 Props 没变化时，`memo` 可以通过 Props 比较跳过子组件的无效重新渲染，减少不必要的计算。

### `useCallback` 为什么要配合 `memo`？[材料推导]

`memo` 比较函数 Props 时比较的是引用。如果父组件每次渲染都创建新函数，子组件仍可能被判定为 Props 变化；`useCallback` 可以在依赖不变时保持函数引用稳定。

### 什么时候不该使用这些优化？[外部补充]

组件很小、计算很轻、Props 不存在不稳定引用时，强行使用记忆化可能增加代码复杂度和依赖维护成本。应先通过分析或性能工具确认瓶颈。

### 如何验证是否发生重复渲染？[材料推导]

在组件函数中记录日志只能辅助观察；更可靠的方式是结合 React DevTools Profiler，并注意开发环境与生产环境行为可能不同。本项目本次未执行验证。

## 复习卡片

> [!tip] **问：当前 Demo 真正使用了 useCallback 吗？**
> 答：没有。当前代码使用的是 `useState` 和 `memo`。

> [!tip] **问：`memo` 比较什么？**
> 答：默认比较 Props 的浅层结果，当前 `name` 是字符串。

> [!tip] **问：`useCallback` 和 `useMemo` 的差异？**
> 答：前者缓存函数引用，后者缓存计算结果。

> [!tip] **问：为什么父组件 count 改变会影响子组件？**
> 答：父组件重新渲染时，普通子组件通常会跟随执行；`memo` 可在 Props 未变化时跳过。

> [!tip] **问：普通函数作为 Props 有什么问题？**
> 答：父组件每次渲染可能创建新函数引用，使 `memo` 判断 Props 发生变化。

## 实践与复习计划

- [ ] 当天：在 Demo 中观察 `count` 与 `name` 更新时的组件日志。
- [ ] 1 天后：给子组件增加函数 Props，比较普通函数与 `useCallback` 的引用变化。
- [ ] 3 天后：用 `useMemo` 缓存一个过滤数组，比较有无缓存时的计算过程。
- [ ] 7 天后：使用 React DevTools Profiler 验证 `memo` 的实际收益。

运行状态：本总结基于静态源码与笔记整理，运行未验证。
