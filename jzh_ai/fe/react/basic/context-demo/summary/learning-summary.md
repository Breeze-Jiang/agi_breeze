---
type: learning-summary
title: "React Context 与自定义 Hook 学习总结"
aliases: ["React Context 与自定义 Hook·学习总结"]
tags: [learning, React, Context, Hooks]
source_scope: "react/basic/context-demo"
coverage:
  deep_read:
    - "readme.md"
    - "contextdemo/src/App.jsx"
    - "contextdemo/src/ThemeContext.jsx"
    - "contextdemo/src/hooks/useTheme.js"
    - "contextdemo/src/hooks/useMouse.js"
    - "contextdemo/src/components/Page.jsx"
    - "contextdemo/src/components/Child.jsx"
  shallow_read:
    - "contextdemo/package.json"
  supplement: []
  skipped:
    - "package-lock.json"
    - "静态资源、ESLint 与 Vite 配置"
review_status: learning
next_review: null
---

# React Context 与自定义 Hook 学习总结

## 一页速览

> [!summary]
> - Context 解决深层组件树中逐层传递 Props 的问题。
> - `createContext` 创建通道，`Provider` 提供值，`useContext` 读取最近的 Provider 值。
> - `useTheme` 将 `useContext(ThemeContext)` 封装为语义化自定义 Hook。
> - `useMouse` 将鼠标坐标状态、事件监听和清理逻辑封装后复用。
> - 本项目代码只做静态阅读，**运行未验证**。

本次学习围绕两条主线：主题数据跨层共享，以及鼠标坐标监听逻辑复用。最小心智模型是：**Context 管共享数据，自定义 Hook 管可复用逻辑。**

## 学习范围

- **深读**：项目笔记、`App.jsx`、主题 Context、两个自定义 Hook、`Page` 和 `Child` 组件。它们构成主题数据从创建到消费、鼠标逻辑从封装到使用的完整链路。
- **浅读**：`package.json`，确认项目使用 React、React DOM 和 Vite 脚本。
- **补读**：无。
- **跳过**：锁文件、图标和图片、ESLint/Vite 配置；这些内容与本次 Context 和 Hook 主线无直接关系。
- **未知**：当前入口 `App.jsx` 展示的是 `useMouse`；主题 Provider 的实际挂载位置不在本次已读代码中，主题链路依据 `ThemeContext`、`useTheme`、`Page`、`Child` 的静态实现整理。

## 知识地图

```text
主题共享链路
createContext('light')
  → ThemeContext
  → <ThemeContext.Provider value={主题值}>
  → useTheme()
  → useContext(ThemeContext)
  → Page / Child 使用主题

鼠标逻辑复用链路
App
  → useMouse()
  → useState(x, y)
  → document.addEventListener('mousemove', handleMouseMove)
  → setX / setY
  → App 显示坐标
  → 卸载时 removeEventListener
```

## 核心知识

### 1. Context：跨层共享数据

[材料中出现] `ThemeContext.jsx` 使用：

```jsx
export const ThemeContext = createContext('light')
```

`createContext('light')` 创建主题数据通道，`'light'` 是没有 Provider 时的默认值。后代组件使用 `useContext(ThemeContext)` 时，React 会向上寻找最近的 `ThemeContext.Provider`：找到则读取 Provider 的 `value`，找不到才读取默认值。

适合放入 Context 的数据通常是多个组件都要读取、且层级较深的数据，例如主题、当前用户或语言。它不是所有 state 的替代品；只在父子两层就能传清楚的数据，直接用 Props 往往更直观。

### 2. Provider：定义共享数据的作用范围

[材料中出现] Provider 的典型结构：

```jsx
<ThemeContext.Provider value="dark">
  <Page />
</ThemeContext.Provider>
```

`Page` 及其后代组件都能读取 `"dark"`。同一个 Context 可以嵌套多个 Provider，消费者永远读取组件树中**最近的 Provider**。Provider 的 `value` 会覆盖 `createContext` 的默认值。

### 3. useContext：消费 Context 值

[材料中出现] `useTheme.js` 的核心实现：

```jsx
export const useTheme = () => {
  return useContext(ThemeContext)
}
```

`useContext(ThemeContext)` 读取当前组件位置最近的主题 Provider 值。Provider 的 `value` 变化后，依赖该 Context 的消费者会重新渲染并读取新值。

### 4. 自定义 Hook：复用逻辑，而非复用 UI

[材料中出现] `useTheme` 和 `useMouse` 都是自定义 Hook。约定以 `use` 开头，内部可以组合其他 Hook。组件复用 UI 结构；自定义 Hook 复用 state、Effect、事件监听等逻辑。

`useMouse` 的返回值为：

```jsx
return { x, y }
```

所以调用处可以对象解构：

```jsx
const { x, y } = useMouse()
```

### 5. useMouse：封装状态、副作用与清理

[材料中出现] `useMouse.js`：

```jsx
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
```

鼠标移动触发 `mousemove`，事件对象的 `clientX`、`clientY` 表示鼠标相对浏览器可视区域的坐标。Effect 的清理函数在组件卸载时移除监听，避免已卸载组件继续接收事件。

> [!warning]
> `addEventListener` 与 `removeEventListener` 必须传入同一个函数引用。因此这里先声明 `handleMouseMove`，再用同一个函数分别添加和移除。

## 重点语法与 API

| API / 语法 | 最小用法 | 作用与注意点 |
|---|---|---|
| `createContext` | `createContext('light')` | 创建 Context 与默认值；默认值只在无 Provider 时生效。|
| `Provider` | `<Context.Provider value={value}>` | 向包裹的后代共享数据。|
| `useContext` | `useContext(ThemeContext)` | 读取最近 Provider 的值。|
| 自定义 Hook | `function useMouse() {}` | 以 `use` 开头；只能在函数组件或其他 Hook 顶层调用。|
| `useState` | `const [x, setX] = useState(0)` | 保存会显示在页面中的坐标。|
| `useEffect` | `useEffect(() => {}, [])` | 管理事件监听等副作用；返回函数负责清理。|
| `clientX / clientY` | `e.clientX` | 鼠标相对可视区域的坐标。|
| 对象解构 | `const { x, y } = useMouse()` | 从 Hook 返回对象中按属性名取值。|

## 注释重点解读

[材料中出现] `ThemeContext.jsx` 注释说明“为深层次组件树提供共享主题数据”，对应 Context 的核心价值：减少中间组件只负责转交 Props 的工作。

[材料中出现] `useTheme.js` 注释写明“约定以 use 开头”。这不是普通命名习惯：React 的 Hook 规则和 ESLint 工具通常依据 `use` 前缀识别自定义 Hook，帮助发现 Hook 调用位置错误。

[材料中出现] `useMouse.js` 没有额外的解释性注释；但其清理函数与添加监听器配对，体现了副作用资源的生命周期管理。

## 易混淆点与下一步

| 易混淆点 | 正确理解 |
|---|---|
| Context 是全局变量吗？ | 不是。它的值受 Provider 包裹范围和最近 Provider 影响。|
| Provider 一定要存在吗？ | 不一定；没有 Provider 时读取 `createContext` 默认值。|
| 自定义 Hook 会共享 state 吗？ | 不会。每个组件调用 `useMouse()` 都会拥有自己的 state 和 Effect。共享数据要用 Context 或上层 state。|
| `document` 与 `window` 都能监听 `mousemove` 吗？ | 大多数页面场景都能监听；`document` 强调文档事件，`window` 强调窗口级事件。|
| `useMouse` 是否需要运行验证？ | 当前仅静态阅读，运行未验证。|

> [!question]
> 当前 `App.jsx` 中导入了 `useState`、`useEffect`，但组件直接调用的是 `useMouse`，静态看这两个导入未被使用。是否触发 lint 错误取决于现有 lint 配置与实际执行结果，本次未运行验证。

## 面试高频知识

### Context 为什么能避免 Props drilling？[材料中出现]

Context 通过 Provider 在一段组件树中提供共享值，任意后代组件可通过 `useContext` 直接读取，而不需要让中间组件逐层接收再转发 Props。

### `createContext` 默认值和 Provider 的 `value` 谁优先？[材料中出现]

Provider 的 `value` 优先。只有向上找不到对应 Provider 时，`useContext` 才返回 `createContext` 的默认值。

### 自定义 Hook 和普通函数有什么区别？[材料推导]

自定义 Hook 仍然是函数，但它以 `use` 开头，并在函数组件或其他 Hook 的顶层调用 React Hook。它封装可复用逻辑，而不是返回固定 UI。

### 为什么 `useEffect` 要清理事件监听？[材料中出现]

组件卸载后不再需要监听鼠标；移除监听能避免无效回调和资源残留。添加与移除必须使用同一个处理函数引用。

### Context 适合替代所有状态管理吗？[外部补充]

不适合。局部、简单的父子数据优先用 Props；Context 更适合跨层、多个消费者共享的数据。复杂的高频更新数据还需关注不必要重渲染。

## 复习卡片

> [!tip] 卡片 1
> **问：Context 三步是什么？**
> 答：`createContext` 创建通道，Provider 提供 `value`，`useContext` 消费值。

> [!tip] 卡片 2
> **问：`useContext` 读取哪个 Provider？**
> 答：当前组件向上最近的同一个 Context Provider。

> [!tip] 卡片 3
> **问：没有 Provider 时返回什么？**
> 答：`createContext(defaultValue)` 的默认值。

> [!tip] 卡片 4
> **问：`useMouse` 返回 `{ x, y }` 后如何接收？**
> 答：`const { x, y } = useMouse()`。

> [!tip] 卡片 5
> **问：为什么在 Effect 中移除事件监听？**
> 答：让副作用在卸载时释放资源，且函数引用必须一致。

> [!tip] 卡片 6
> **问：自定义 Hook 复用什么？**
> 答：复用 state、Effect、事件等逻辑，不直接复用 UI。

## 实践与复习计划

- [ ] 当天：手写一个 `LanguageContext`，在深层组件读取语言值。
- [ ] 1 天后：不看代码实现 `useMouse`，确保写出 `addEventListener` 与清理函数。
- [ ] 3 天后：解释 Props drilling、Context 和自定义 Hook 的职责差异。
- [ ] 7 天后：将主题 Context 改为 `theme + setTheme`，并验证 Provider 值变化是否更新消费者。

运行状态：本笔记基于静态源码整理，运行未验证。
