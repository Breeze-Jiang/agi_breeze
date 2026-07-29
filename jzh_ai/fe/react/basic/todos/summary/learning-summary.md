# React Todo List 项目学习总结

## 整体概览

这是一个基于 React 19 + Vite 8 的 Todo List 入门项目，适合作为 React 基础学习的第一个实战案例。项目实现了待办事项的增、删、改（切换完成状态）、清空已完成等核心功能。

**材料范围：**
- 深读：`src/App.jsx`、`src/components/TodoInput.jsx`、`src/components/TodoList.jsx`、`src/components/TodoStats.jsx`
- 浅读：`src/App.css`、`src/main.jsx`、`package.json`
- 补读：无
- 跳过：`index.html`、`vite.config.js`、eslint 配置等基础设施

**技术栈：**
- React 19.2.7
- Vite 8.1.1
- 函数组件 + Hooks（useState）

---

## 知识地图

```
React 入门 Todo 项目
  ├── 项目基础
  │     ├── Vite 项目结构
  │     └── 函数组件
  │
  ├── 核心概念
  │     ├── useState 状态管理
  │     ├── 组件化 & 父子通信
  │     ├── 受控组件
  │     ├── 不可变原则
  │     ├── 条件渲染
  │     ├── 列表渲染 & key
  │     └── 事件处理
  │
  ├── 功能实现
  │     ├── 添加 Todo
  │     ├── 切换完成状态
  │     ├── 删除 Todo
  │     ├── 统计数量
  │     └── 清空已完成
  │
  └── 常见 Bug（本项目中的）
        ├── 未引入 useState
        ├── 未从 props 解构参数
        ├── 导入路径大小写不一致
        └── console.log 调试代码残留
```

---

## 核心概念详解

### 1. useState 状态管理

**作用**：在函数组件中声明状态，返回 `[当前值, 修改函数]`。

```jsx
const [todos, setTodos] = useState([...])
```

**要点：**
- `todos` 是只读的，不能直接修改
- 要修改必须调用 `setTodos`
- 状态变化会触发组件重新渲染

**面试考点**：为什么不能直接改 state？
> React 通过比较新旧状态的引用地址判断是否需要重新渲染。直接修改原对象/数组，引用不变，React 认为状态没变，就不会更新 UI。

---

### 2. 组件化 & 父子通信

**组件拆分：**

| 组件 | 职责 | 接收 props |
|------|------|-----------|
| App（父） | 管理状态和业务逻辑 | - |
| TodoInput | 输入框，添加 todo | onAdd（函数） |
| TodoList | 列表展示 + 切换/删除 | todos（数组）、onToggle、onDelete |
| TodoStats | 统计信息 + 清空按钮 | total、active、completed、onClearCompleted |

**通信方式：**
- **父→子**：通过 props 传数据
- **子→父**：子组件调用父组件传过来的回调函数

**状态提升**：数据放在父组件统一管理，子组件只负责展示和触发事件。

---

### 3. 受控组件

**定义**：表单元素的值由 React state 控制。

**三要素：**
1. `value` 绑定 state
2. `onChange` 监听输入变化
3. `e.target.value` 获取输入内容更新 state

```jsx
<input 
  type="text" 
  value={inputValue} 
  onChange={e => setInputValue(e.target.value)} 
/>
```

---

### 4. 不可变原则

**核心**：永远不要直接修改 state，而是返回一个新的对象/数组。

| 操作 | 方法 | 说明 |
|------|------|------|
| 添加 | 展开运算符 `[...todos, newTodo]` | 返回新数组 |
| 修改 | `map` | 遍历返回新数组，匹配项返回新对象 |
| 删除 | `filter` | 过滤返回新数组 |

**修改对象的正确姿势：**
```jsx
{ ...todo, completed: !todo.completed }
// 展开旧对象，覆盖指定属性
```

---

### 5. 条件渲染

**方式一：三元运算符**
```jsx
todos.length === 0 
  ? (<li>暂无todo</li>) 
  : (todos.map(...))
```

**方式二：短路与 `&&`**
```jsx
{ completed > 0 && (<button>Clear Completed</button>) }
// 前面为真才渲染后面的
```

---

### 6. 列表渲染 & key

```jsx
todos.map(todo => (
  <li key={todo.id}>...</li>
))
```

**key 的作用**：帮助 React 识别哪些元素改变了，高效更新 DOM。

**面试考点**：key 为什么不能用 index？
> 如果列表顺序会变化（如新增在开头、排序、删除），用 index 作为 key 会导致状态错乱，性能下降。要用唯一且稳定的 id。

---

### 7. 事件处理

```jsx
// 阻止默认行为（表单提交刷新页面）
e.preventDefault()

// 传参的事件处理
onClick={() => onDelete(todo.id)}
// 注意：要用箭头函数包一层，不能直接写 onDelete(todo.id)
// 否则会在渲染时就执行，而不是点击时执行
```

---

## 项目中的 Bug 汇总

### Bug 1：TodoInput 未引入 useState
- **位置**：`src/components/TodoInput.jsx` 第 5 行
- **现象**：`useState is not defined`
- **修复**：顶部加 `import { useState } from 'react'`

### Bug 2：TodoInput 未从 props 解构 onAdd
- **位置**：`src/components/TodoInput.jsx` 第 3 行
- **现象**：`onAdd is not defined`
- **修复**：`const TodoInput = ({ onAdd }) => {`

### Bug 3：导入路径大小写不一致
- **位置**：`src/App.jsx` 第 4 行
- **代码**：`import TodoInput from "./components/Todoinput"`
- **现象**：在大小写敏感的系统（Linux）上会报错
- **修复**：`import TodoInput from "./components/TodoInput"`

### Bug 4：console.log 调试代码残留
- **位置**：`src/components/TodoInput.jsx` 第 4 行
- **现象**：控制台会打印 undefined
- **修复**：删除即可

---

## 功能实现清单

| 功能 | 实现方式 | 涉及概念 |
|------|----------|---------|
| 添加 Todo | 父组件 addTodo 方法，unshift 式添加 | useState、展开运算符 |
| 切换完成 | map 遍历，匹配项返回新对象 | map、不可变原则 |
| 删除 Todo | filter 过滤掉匹配项 | filter、不可变原则 |
| 统计数量 | filter 后取 length | 派生状态 |
| 清空已完成 | filter 留下未完成的 | filter |
| 空状态展示 | 三元运算符 | 条件渲染 |
| 清空按钮显示 | && 短路与 | 条件渲染 |

---

## 易混淆点

### 1. 什么时候用 map，什么时候用 filter？
- **map**：要改每一项，或把每一项变成别的东西（长度不变）
- **filter**：要删掉某些项，留下符合条件的（长度变少）

### 2. `...todos` 放在前面还是后面？
- 放前面 `[...todos, newTodo]`：新的在最后
- 放后面 `[newTodo, ...todos]`：新的在最前面

### 3. 事件处理加不加括号？
- `onClick={handleClick}`：点击时执行（正确）
- `onClick={handleClick()}`：渲染时就执行（错误）
- 要传参：`onClick={() => handleClick(id)}`（用箭头函数包一层）

---

## 大厂面试高频考点

1. **useState 的原理**：闭包 + 数组下标，每次渲染按顺序调用
2. **为什么不能在 if/for 里用 Hook**：破坏调用顺序，导致状态错乱
3. **不可变原则**：为什么不能直接改 state
4. **key 的作用和为什么不用 index**：Diff 算法优化
5. **受控 vs 非受控组件**：值由 state 控制 vs 由 DOM 自己管理
6. **状态提升**：什么时候需要把状态提到父组件
7. **父子组件通信方式**：props 向下，回调向上

---

## 下一步学习建议

1. 用 `useEffect` 实现本地存储（刷新不丢失数据）
2. 增加筛选功能（全部/未完成/已完成）
3. 用 `useReducer` 重构复杂状态
4. 学习 Context 解决深层组件传参问题
5. 尝试 TypeScript 版本
