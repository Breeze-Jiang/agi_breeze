---
title: 一个用户筛选 Demo，理解 React 状态快照与惰性初始化
description: 从输入框筛选列表出发，建立 useState、派生数据、key 和性能优化的完整心智模型。
tags:
  - React
  - Hooks
  - 性能优化
---

# 一个用户筛选 Demo，理解 React 状态快照与惰性初始化

刚学 React 时，最容易有两个疑问：

- 为什么 `setState` 后马上打印还是旧值？
- 为什么 `useState(heavyCalculation())` 会影响输入框筛选性能？

用一个用户筛选列表就能把这两个问题串起来。

本文基于 [state-demo](file:///C:/Users/38335/Desktop/workspace/jzh_ai/fe/react/basic/state-demo/src/App.jsx) 的学习代码整理，未运行验证。

## 页面背后的数据流

页面有两类数据：

```jsx
const [users] = useState(() => heavyCalculation())
const [filterText, setFilterText] = useState('')
```

- `users`：用户原始数据，只需要在首次创建。
- `filterText`：用户正在输入的筛选条件，会频繁变化。

筛选后的数据不存状态，而是每次渲染时计算：

```jsx
const filteredUsers = users.filter(user =>
  user.name.includes(filterText)
)
```

这就是一个重要原则：**能推导出来的数据，不要再复制一份 state。**

## 受控输入框：React 管理输入值

```jsx
<input
  value={filterText}
  onChange={event => setFilterText(event.target.value)}
/>
```

它不是让 DOM 自己保存输入内容，而是由状态控制：

```text
用户输入
  → onChange
  → setFilterText
  → App 函数重新执行
  → value 使用新 filterText
```

这种写法称为受控组件。优点是输入值始终在 React 状态中，可直接用于筛选、校验、提交和清空。

## React 状态是快照，不是立即修改变量

假设计数器这样写：

```jsx
setCount(count + 1)
console.log(count)
```

控制台拿到旧的 `count`，不是 React 失效，而是当前函数仍在使用“本次渲染的状态快照”。

```text
当前快照：count = 0
setCount(1)：请求下一次渲染更新为 1
console.log(count)：仍读取当前快照的 0
下一次渲染：count = 1
```

连续依赖旧值更新时，使用函数式更新更稳：

```jsx
setCount(previousCount => previousCount + 1)
```

## 列表渲染：map + key

```jsx
{filteredUsers.map(user => (
  <li key={user.id}>{user.name}</li>
))}
```

`map` 负责把数据转换为 JSX；`key` 负责告诉 React“这个列表项是谁”。

筛选前后列表项会变化，稳定的 `user.id` 能帮助 React 正确判断节点的新增、移除和复用。不要默认用数组下标，尤其是列表会增删、排序时。

## 性能陷阱：初始化函数到底执行几次

Demo 里的 `heavyCalculation` 会循环生成 10000 条用户数据。下面两种写法只差一个箭头函数：

```jsx
// 每次组件函数执行，JS 都会先执行 heavyCalculation
const [users] = useState(heavyCalculation())

// React 只在首次挂载时执行 heavyCalculation
const [users] = useState(() => heavyCalculation())
```

为什么？

```jsx
useState(heavyCalculation())
```

可以理解为：

```jsx
const result = heavyCalculation()
useState(result)
```

当你输入筛选词时，`filterText` 更新会让组件函数重新执行，于是 `heavyCalculation()` 又运行了。React 虽然不会用这个新初始值覆盖已有 `users`，但计算成本已经付出了。

而：

```jsx
useState(() => heavyCalculation())
```

传入的是一个函数。React 将它当作惰性初始化器，仅在首次挂载时调用。

## 怎么证明代码耗时

```jsx
const start = performance.now()
const result = heavyCalculation()
console.log(performance.now() - start)
```

`performance.now()` 适合测量 JavaScript 执行耗时。它让“感觉可能慢”变成可比较的毫秒数据。

## 最后记住这 4 句话

1. 状态更新触发下一次渲染，当前状态变量是旧快照。
2. `value + onChange` 是 React 受控表单的基础模式。
3. 可由已有状态算出的数据，优先作为派生数据。
4. 昂贵初始值用 `useState(() => heavyCalculation())`，避免无效重算。

这几个概念虽然基础，但在 React 面试和真实业务页面里都会反复出现。
