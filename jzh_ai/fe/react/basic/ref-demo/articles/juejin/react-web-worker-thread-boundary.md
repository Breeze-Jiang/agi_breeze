# Web Worker 不负责渲染：React 中的线程分工与消息闭环

摘要：这个 React Demo 的关键不是“开启了多线程”这么简单，而是把职责拆开：主线程负责页面，Worker 负责计算，`postMessage` 负责传输，`useRef` 负责保存实例，`useEffect` 负责生命周期。文章基于本地源码整理，运行未验证。

当一个 React 组件执行很大的循环时，真正被占用的是页面主线程。Event Loop 能安排异步任务，却不会让当前的大循环自动并行。此时更合适的思路是使用 Web Worker，并把 Worker 当作一个需要管理的外部资源。

## 这个 Demo 的核心判断

不要把 Worker 写在组件函数体里，否则每次重新渲染都有重复创建的风险。应当：

```text
useEffect 创建
useRef 保存
postMessage 发送任务
onmessage 接收结果
cleanup terminate
```

## 创建线程和保存实例是两件事

```jsx
const workerRef = useRef(null)

useEffect(() => {
  workerRef.current = new Worker(
    new URL('../worker.js', import.meta.url)
  )
}, [])
```

这里最容易混淆：`useRef` 并没有创建线程，真正创建线程的是 `new Worker()`。ref 只是提供了一个稳定的 `{ current }` 容器。

Worker 实例不需要参与页面渲染，所以不适合用 state 保存。按钮点击时可以拿出同一个实例：

```jsx
workerRef.current.postMessage({ num: 88 })
```

## 消息协议：两次 postMessage，方向相反

主线程发送：

```jsx
workerRef.current.postMessage({
  num: 88,
})
```

Worker 接收并计算：

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

Worker 返回的数据由主线程接收：

```jsx
workerRef.current.onmessage = (e) => {
  setResult(e.data.result)
  setLoading(false)
}
```

因此要记住：

| 代码 | 方向 |
|---|---|
| `worker.postMessage(data)` | 主线程到 Worker |
| `self.onmessage` | Worker 接收主线程消息 |
| `self.postMessage(data)` | Worker 到主线程 |
| `worker.onmessage` | 主线程接收 Worker 消息 |

## 为什么 Worker 不能直接改页面？

Worker 与页面主线程相互独立，不能直接访问 React 组件或 DOM。它只返回普通消息：

```js
self.postMessage({ result: sum })
```

主线程收到后再执行：

```jsx
setResult(e.data.result)
```

页面更新仍属于 React 主线程的职责。也就是说，Worker 的价值是“分担计算”，不是“替代渲染”。

## 生命周期清理是必要步骤

Worker 创建后必须考虑关闭：

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

组件卸载时调用 `terminate()`，可以停止后台线程。真实代码还会把 `workerRef.current` 置为 `null`，表示当前没有可用实例。

## 这个示例还应该检查什么？

静态代码中存在几个需要继续验证的边界：

1. 页面提示“五亿次”，实际循环上限是 `5000000000`，即 50 亿次。
2. 计算结果可能超出 JavaScript 安全整数范围，普通 `Number` 不能保证精确整数。
3. 当前未见 `onerror` 或 `onmessageerror`，Worker 失败后 loading 的状态需要运行验证。
4. 如果结果用 `result &&` 条件渲染，结果为 `0` 时不会显示。

这些是源码检查结论，不代表已经在浏览器中复现；本文代码运行未验证。

## 复用这套设计时的检查顺序

```text
是否是 CPU 密集任务？
  ↓ 是
是否能拆成纯计算、无需 DOM 的函数？
  ↓ 是
useEffect 创建 Worker
  ↓
useRef 保存 Worker
  ↓
约定输入和输出消息结构
  ↓
onmessage 更新 state
  ↓
cleanup terminate
```

## 结尾

React 中使用 Web Worker 的重点不是把所有异步工作都放到新线程，而是识别真正会阻塞主线程的 CPU 计算，并建立清晰的消息协议。`useRef` 解决实例保存，`useEffect` 解决资源生命周期，`useState` 解决界面状态，Worker 解决计算隔离。下一步可以给 Demo 补充错误消息和取消任务能力，再验证不同输入规模下的行为。
