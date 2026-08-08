# React useRef + Web Worker：避免大计算阻塞页面的通信方案

标签：React, useRef, Web Worker, 前端性能

React 页面里直接执行超大循环时，计算会占用页面主线程，按钮、滚动和渲染都可能无法及时响应。一个学习 Demo 使用 `useRef + useEffect + Web Worker` 把计算交给后台线程：`useRef` 保存实例，主线程和 Worker 通过消息传递任务与结果。本文基于本地源码静态整理，**运行未验证**。

## 先看完整数据流

```text
点击按钮
  → 主线程设置 loading
  → worker.postMessage({ num: 88 })
  → Worker 接收消息并计算
  → self.postMessage({ result: sum })
  → 主线程读取 e.data.result
  → setResult 和 setLoading(false)
```

主线程仍负责 React 渲染和用户交互；Worker 只计算并返回数据，不能直接操作 DOM。

## 用 useRef 保存 Worker，而不是 useState

Demo 先创建一个 ref：

```jsx
const workerRef = useRef(null)
```

Worker 创建后存入 `current`：

```jsx
workerRef.current = new Worker(
  new URL('../worker.js', import.meta.url)
)
```

`new Worker()` 才是创建线程的 API，`useRef` 的职责是让同一个 Worker 实例跨组件渲染持续存在。

为什么不用 `useState`？Worker 实例不需要展示在页面上，更新它也不应该触发重新渲染。后续按钮事件发送任务、组件卸载时关闭线程，都能通过 `workerRef.current` 访问实例。

## 用 useEffect 管理 Worker 生命周期

Worker 是副作用资源，应在组件挂载后创建、卸载时释放：

```jsx
useEffect(() => {
  const worker = new Worker(
    new URL('../worker.js', import.meta.url)
  )

  return () => {
    worker.terminate()
  }
}, [])
```

空依赖数组表示这个 Effect 的目标是初始化一次。真实 Demo 在清理阶段调用 `terminate()` 并将 ref 清空，避免组件已经卸载但后台计算仍持续占用资源。

## 主线程如何把任务交给 Worker？

点击事件中发送数据：

```jsx
setLoading(true)

workerRef.current.postMessage({
  num: 88,
})
```

这里的方向是：

```text
主线程 → Worker
```

Worker 文件中通过 `self.onmessage` 接收：

```js
self.onmessage = (e) => {
  const { num } = e.data

  let sum = 0
  for (let i = 0; i < 5000000000; i++) {
    sum += num * i
  }

  self.postMessage({ result: sum })
}
```

`e.data` 就是主线程传入的 `{ num: 88 }`。Worker 算完以后调用 `self.postMessage`，方向变成：

```text
Worker → 主线程
```

## 主线程接收结果并更新 React 页面

```jsx
workerRef.current.onmessage = (e) => {
  const { result } = e.data

  setResult(result)
  setLoading(false)
}
```

Worker 返回的数据在 `e.data` 中。`result` 需要显示到页面，所以要放入 `useState`；`loading` 用于禁用按钮、提示当前任务仍在后台执行。

## useRef、useState 与 Worker 的职责表

| 对象 | 放在哪里 | 原因 |
|---|---|---|
| Worker 实例 | `useRef` | 需跨渲染保存，但变化不需要更新 UI |
| 计算结果 | `useState` | 需要显示在页面上 |
| 加载状态 | `useState` | 需要控制按钮和提示文字 |
| 创建和关闭行为 | `useEffect` | 属于资源生命周期管理 |

## 静态阅读发现的边界

| 现象 | 静态发现 | 影响 |
|---|---|---|
| 计算次数不一致 | 页面文案写五亿次，循环上限是 `5000000000` | 文案与真实任务不一致 |
| 结果精度 | 当前累计结果可能超过 `Number.MAX_SAFE_INTEGER` | 普通 Number 的整数精度不能保证 |
| 缺少错误处理 | 未看到 `onerror` 或 `onmessageerror` | Worker 失败时 loading 恢复行为未验证 |
| 结果渲染条件 | 若使用 `result &&` | 合法结果为 `0` 时可能不显示 |

这些结论来自静态源码，不等于运行时已复现。

## 最终自检清单

- [ ] CPU 密集计算是否确实需要移出主线程？
- [ ] Worker 实例是否放在 `useRef`，而不是组件函数体直接创建？
- [ ] 是否在 `useEffect` cleanup 中调用 `terminate()`？
- [ ] 主线程与 Worker 的消息数据结构是否一致？
- [ ] 返回结果是否使用 `useState` 更新页面？
- [ ] 是否处理 Worker 的错误消息并恢复 loading？
- [ ] 是否检查超大数计算的精度和页面文案一致性？

## 总结

Web Worker 不会替代 React 主线程，也不能操作 DOM。它的价值是把纯计算任务交给浏览器提供的后台线程；React 主线程通过消息接收结果，再用 state 更新 UI。这个 Demo 的核心分工可以记成：`new Worker` 创建线程，`useRef` 保存线程，`useEffect` 管生命周期，`postMessage` 负责通信，`useState` 负责页面状态。
