---
type: learning-summary
title: "React useRef 与 Web Worker 学习总结"
aliases: ["React useRef 与 Web Worker·学习总结"]
tags: [learning, React, useRef, Web-Worker]
source_scope: "react/basic/ref-demo/ref-worker-demo"
coverage:
  deep_read: ["ref-demo/readme.md", "ref-worker-demo/src/App.jsx", "ref-worker-demo/worker.js", "ref-worker-demo/src/main.jsx"]
  shallow_read: ["ref-worker-demo/package.json", "ref-worker-demo/vite.config.js"]
  supplement: []
  skipped: ["package-lock.json", "静态资源", "ESLint 配置"]
review_status: learning
next_review: null
---

# React useRef 与 Web Worker 学习总结

## 一页速览

> [!summary]
> - `useRef` 保存 Worker 实例，修改 `current` 不触发重新渲染。
> - `useEffect` 负责在组件挂载后创建 Worker，并在卸载时关闭它。
> - 主线程与 Worker 用 `postMessage` / `onmessage` 双向通信。
> - Worker 适合纯 CPU 密集计算，不能直接操作 DOM。
> - 本项目仅做静态源码阅读，**运行未验证**。

最小心智模型：**主线程负责 React 页面和交互；Worker 负责耗时计算；消息机制负责两边传递数据。**

## 学习范围

- **深读**：`readme.md`、Worker Demo 的入口、`App.jsx` 和 `worker.js`，覆盖创建、通信、渲染和销毁的完整链路。
- **浅读**：`package.json` 与 Vite 配置，用于确认项目是 React + Vite 的 ESM 工程。
- **补读**：无。
- **跳过**：锁文件、图片和 ESLint 配置；与本次主题无直接关系。
- **未知**：未启动开发服务器、未构建、未在浏览器验证 Worker 加载与计算表现。

## 知识地图

```text
React App
  ├─ useRef(null) → 保存 Worker 实例
  ├─ useEffect([]) → 创建 Worker、注册 onmessage
  ├─ 点击按钮 → worker.postMessage({ num: 88 })
  ├─ Worker 返回 → setResult / setLoading
  └─ 卸载 → worker.terminate()、ref 置空

worker.js
  ├─ self.onmessage → 接收 { num }
  ├─ 循环计算 sum
  └─ self.postMessage({ result: sum }) → 返回主线程
```

## 核心知识

### 1. 为什么耗时计算不能直接放在主线程？

[材料中出现] 笔记指出 JavaScript 主线程承担脚本、DOM、用户交互等工作；复杂 CPU 计算会阻塞页面。Event Loop 能安排异步回调，但不能把正在执行的大循环自动变成并行计算。

Web Worker 是浏览器提供的辅助线程。它适合游戏计算、加密、LLM 推理前后处理等 CPU 密集任务。Worker 完成任务后通过消息把结果交给主线程。

### 2. `useRef`：持久保存 Worker 实例

[材料中出现] `App.jsx` 创建：

```jsx
const workerRef = useRef(null)
```

初始化后：

```jsx
workerRef.current = new Worker(
  new URL('../worker.js', import.meta.url)
)
```

`Worker` 实例不是页面展示数据，因此不需要放到 `useState`。`useRef` 可以跨多次渲染保存同一实例，修改 `current` 不会重渲染；按钮事件和清理函数都可通过 `workerRef.current` 访问它。

### 3. `useEffect`：创建和销毁资源

[材料中出现] Worker 创建放在 `useEffect(..., [])` 中，避免组件每次渲染都创建新线程：

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

真实代码通过 ref 访问并在 cleanup 中 `terminate()`。Worker 是需要释放的资源；若组件销毁后仍让 Worker 运行，会继续占用计算资源。

### 4. 主线程与 Worker 的双向消息

[材料中出现] 主线程发送任务：

```jsx
workerRef.current.postMessage({ num: 88 })
```

Worker 接收：

```js
self.onmessage = (e) => {
  const { num } = e.data
}
```

Worker 完成后返回：

```js
self.postMessage({ result: sum })
```

主线程接收：

```jsx
workerRef.current.onmessage = (e) => {
  setResult(e.data.result)
  setLoading(false)
}
```

`postMessage` 的方向由调用者决定：`worker.postMessage` 是主线程发给 Worker，`self.postMessage` 是 Worker 发回主线程。

### 5. Worker 的边界

[材料中出现] `worker.js` 注释与笔记均强调 Worker 不能操作 DOM。它没有 `document` 页面对象，职责是计算和通信；DOM 更新仍应由 React 主线程通过 state 更新完成。

## 重点语法与 API

| API | 最小用法 | 作用与注意点 |
|---|---|---|
| `useRef` | `const ref = useRef(null)` | 保存 Worker、DOM、定时器等可变对象，不触发渲染。|
| `new Worker` | `new Worker(new URL(...))` | 创建 Worker 线程。|
| `new URL(path, import.meta.url)` | `new URL('../worker.js', import.meta.url)` | 以当前模块位置解析 Worker 文件路径，便于 Vite 处理资源。|
| `postMessage` | `worker.postMessage(data)` | 发送可传递的数据。|
| `onmessage` | `worker.onmessage = e => {}` | 接收对方发送的数据，数据在 `e.data`。|
| `terminate` | `worker.terminate()` | 立即关闭 Worker。|
| `useState` | `const [result, setResult] = useState(null)` | 保存要显示在页面的结果、加载状态。|

## 注释重点解读

[材料中出现] `App.jsx` 注释将 `workerRef` 描述为“可持久化的可变对象”，与实际用法一致：Worker 被保存到 `current`，不会因为写入实例而触发 UI 更新。

[材料中出现] `worker.js` 注释说明 Worker 不能用 DOM API。这对应职责分离：Worker 计算，主线程渲染。

[材料中出现] 笔记中 `new URL('./worker.js', import.meta.url)` 是通用示例；而当前项目 `App.jsx` 在 `src` 内、Worker 在项目根目录，实际写法为 `../worker.js`。两者路径不能直接照抄。

## 易混淆点与下一步

| 易混淆点 | 正确理解 |
|---|---|
| Event Loop 等于多线程吗？ | 不等于。它负责调度任务；CPU 密集循环仍会占用执行它的线程。|
| `useRef` 创建 Worker 吗？ | 不创建。`new Worker()` 才创建；`useRef` 只保存实例。|
| Worker 能直接改 React 页面吗？ | 不能。Worker 返回消息，主线程调用 `setState` 更新页面。|
| 每次调用 `postMessage` 都会新建 Worker 吗？ | 不会。发送消息给已有实例；新建发生在 `new Worker()`。|

> [!warning]
> 静态发现 UI 文案写“执行五亿次计算”，但 Worker 循环上限为 `5000000000`，即 50 亿次，二者不一致。

> [!warning]
> 当前累计结果可能远超 `Number.MAX_SAFE_INTEGER`，使用普通 `Number` 时整数精度无法保证。

> [!question]
> 当前代码未注册 `onerror`。若 Worker 加载或执行失败，`loading` 是否能恢复为 `false`，运行未验证。

## 面试高频知识

### Web Worker 解决什么问题？[材料中出现]

它把 CPU 密集计算放到浏览器提供的 Worker 线程，避免阻塞页面主线程的渲染和交互。它不适合直接操作 DOM。

### 为什么 Worker 实例放 `useRef`？[材料中出现]

实例需要跨渲染长期存在，并供事件处理函数发送消息、Effect 清理函数关闭；它本身不需要显示在 UI，所以使用不触发渲染的 `useRef`。

### 为什么创建和销毁放 `useEffect`？[材料中出现]

创建属于副作用，应该在挂载后执行；`terminate()` 放 cleanup 中，保证组件卸载时释放线程资源。

### `postMessage` 如何通信？[材料中出现]

主线程用 `worker.postMessage` 发送，Worker 用 `self.onmessage` 接收；Worker 用 `self.postMessage` 返回，主线程用 `worker.onmessage` 接收，真实数据都在 `event.data`。

### JavaScript 是单线程还是多线程？[材料推导]

更准确地说，页面 JavaScript 的主执行线程通常是单线程；浏览器可提供 Worker 线程执行额外计算。Worker 不改变主线程处理 DOM 和 React 更新的事实。

## 复习卡片

> [!tip] **问：真正创建 Worker 的 API 是什么？**
> 答：`new Worker(...)`；`useRef` 只是保存实例。

> [!tip] **问：Worker 与主线程如何传值？**
> 答：双方通过 `postMessage` 发送，通过 `onmessage` 接收，读取 `event.data`。

> [!tip] **问：为什么调用 `terminate()`？**
> 答：组件卸载时关闭后台线程，释放资源。

> [!tip] **问：Worker 为什么不能操作 DOM？**
> 答：Worker 没有页面 DOM 环境，应把结果通过消息交回主线程。

> [!tip] **问：`result` 应放 ref 还是 state？**
> 答：放 state，因为结果需要显示并触发页面更新。

> [!tip] **问：Event Loop 能解决大循环卡顿吗？**
> 答：不能直接解决；大循环仍会占用它所在的执行线程。

## 实践与复习计划

- [ ] 当天：画出主线程与 Worker 的四步消息方向。
- [ ] 1 天后：不看代码写出 `useRef + useEffect + terminate` 的 Worker 生命周期。
- [ ] 3 天后：为 Worker 增加错误消息协议，并在主线程恢复 loading 状态。
- [ ] 7 天后：把任务输入改为可配置参数，并处理 `0` 结果与超大整数精度边界。

运行状态：本笔记根据静态源码与项目笔记整理，运行未验证。
