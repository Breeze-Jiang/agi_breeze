---
title: React useState 列表筛选：从受控输入到惰性初始化
description: 用一个用户列表 Demo 讲清 useState、派生数据、map 和 key，以及为什么复杂初始值要使用惰性初始化。
tags:
  - React
  - useState
  - 前端性能
  - JavaScript
---

# React useState 列表筛选：从受控输入到惰性初始化

一个“输入姓名过滤用户列表”的小 Demo，能串起 React 中几项非常核心的能力：状态管理、受控组件、派生数据、列表渲染和初始化性能优化。

本文基于 [Demo 代码](file:///C:/Users/38335/Desktop/workspace/jzh_ai/fe/react/basic/state-demo/src/App.jsx) 与 [学习笔记](file:///C:/Users/38335/Desktop/workspace/jzh_ai/fe/react/basic/state-demo/README.md) 整理，代码未运行验证。

## 目标：输入关键字，实时过滤用户

核心数据流很简单：

```text
用户输入关键字
  → 更新 filterText
  → 组件重新渲染
  → 计算 filteredUsers
  → 渲染新列表
```

对应代码：

```jsx
const [filterText, setFilterText] = useState('')

const filteredUsers = users.filter(user =>
  user.name.includes(filterText)
)
```

## 输入框为什么要写 value 和 onChange

```jsx
<input
  value={filterText}
  onChange={event => setFilterText(event.target.value)}
/>
```

这叫受控组件：输入框显示什么，取决于 React 状态；用户输入后，再通过事件把最新内容更新回状态。

```text
filterText → value → 输入框
用户输入 → onChange → setFilterText → filterText
```

它和 Vue 的 `v-model` 很像，但在 React 中需要显式写出“值”和“更新事件”。

## 不要把 filteredUsers 也放进 state

一个常见错误是再定义一个状态保存筛选结果：

```jsx
// 不推荐：会产生重复状态
const [filteredUsers, setFilteredUsers] = useState([])
```

因为 `filteredUsers` 完全由 `users` 与 `filterText` 推导得到，直接计算即可：

```jsx
const filteredUsers = users.filter(user =>
  user.name.includes(filterText)
)
```

这类值叫**派生数据**。少存一份状态，就少一份数据不同步的风险。

## map：将数据变成列表 UI

```jsx
{filteredUsers.map(user => (
  <li key={user.id}>{user.name}</li>
))}
```

`map` 会把用户数组转换为 JSX 数组，React 再将其渲染为多个 `<li>`。

这里的 `key` 必不可少：

```jsx
key={user.id}
```

它相当于每个列表项的稳定身份证。用户筛选、增删、排序时，React 通过 key 知道哪一项对应旧节点，从而正确复用和更新 DOM。

优先用稳定唯一的业务 ID，不推荐使用数组下标。

## useState 更新为什么不是立刻生效

React 的状态是“某一次渲染的快照”。调用：

```jsx
setCount(count + 1)
console.log(count)
```

紧接着输出的通常还是旧值。因为 `setCount` 是安排下一次渲染，而不是立即改写当前函数作用域里的 `count`。

如果新值依赖旧值，推荐：

```jsx
setCount(previousCount => previousCount + 1)
```

React 会把最新状态传给 `previousCount`，更适合连续更新。

## 性能重点：为什么 useState 要惰性初始化

Demo 中模拟了一个生成 10000 名用户的耗时函数：

```jsx
function heavyCalculation() {
  const result = []

  for (let i = 0; i < 10000; i++) {
    result.push({ id: i, name: `用户${i}` })
  }

  return result
}
```

下面两种写法看似接近，性能差别很大：

```jsx
useState(heavyCalculation())
useState(() => heavyCalculation())
```

第一种会在每次组件函数执行时先执行 `heavyCalculation()`。即使 React 只使用首次的 state 值，后续输入筛选时产生的计算结果也会被丢弃。

第二种传入的是初始化函数：

```jsx
const [users] = useState(() => heavyCalculation())
```

React 只会在组件首次挂载时调用一次，后续更新 `filterText` 不会重复生成 10000 条数据。

记忆方式：

```text
heavyCalculation()       = 现在执行
() => heavyCalculation() = 把“首次初始化时再执行”的函数交给 React
```

## 用 performance.now() 测量耗时

```jsx
const startTime = performance.now()
const result = heavyCalculation()
const duration = performance.now() - startTime
```

`performance.now()` 返回高精度相对时间，适合测量代码执行耗时。对于复杂循环、数据转换、排序等场景，可以用它比较优化前后的差异。

## 总结

这个小 Demo 的关键原则是：

1. 用 `useState` 保存真正需要变化的状态。
2. 用 `value + onChange` 实现受控输入。
3. 筛选结果属于派生数据，直接计算而非重复存 state。
4. 用 `map` 渲染列表，用唯一稳定的 `key` 标识列表项。
5. 重计算成本高的初始值，使用 `useState(() => initialValue)` 做惰性初始化。

## 面试回答

> React 的 `useState` 用于管理组件状态，调用 setter 会触发后续渲染，当前渲染里的状态值仍是快照。列表场景中，应该用 `map` 把数据转为 JSX，并用稳定唯一的 key 帮助 React 正确更新。对于由已有状态推导出的筛选结果，应作为派生数据计算；如果初始状态计算昂贵，则用惰性初始化避免重渲染时重复执行。
