---
type: learning-summary
title: "Todos 全栈项目：React 前端先行 + Mock 解耦开发"
aliases: ["Todos 全栈项目·学习总结"]
tags: [learning, React, react-router, axios, vite-plugin-mock, 前后端分离, API工程化]
source_scope: "todos-fullstack 项目目录（前端 React + Koa 后端骨架）"
coverage: {deep_read: ["readme.md", "fronted/todos/src/App.jsx", "fronted/todos/src/pages/Todos.jsx", "fronted/todos/src/api/config.js", "fronted/todos/src/api/todos.js", "fronted/todos/vite.config.js", "fronted/todos/mock/todos.js"], shallow_read: ["fronted/todos/src/pages/Home.jsx", "fronted/todos/src/components/Nav.jsx", "fronted/todos/src/main.jsx", "fronted/todos/package.json", "backend/package.json"], supplement: [], skipped: ["node_modules/**", "锁文件 pnpm-lock.yaml / package-lock.json", "src/assets 图片", "public/**", "eslint.config.js", "样式文件", "后端业务代码（未写入）"]}
review_status: learning
next_review: null
---

## 一页速览

[!summary]
- **主题**：一个"前端先行、后端后续跟上"的全栈 Todos 教学项目。前端负责完整 SPA（React + 路由 + API 层 + Mock 假数据），后端目前只有 Koa 依赖的 package.json 骨架，业务代码待补。来源：[[#学习范围]]。
- **解决的问题**：前后端开发节奏不一致时前端如何做到"独立开发 + 独立验证 + 联调时一键切换"，不靠等后端接口。来源：readme.md 设计理念。
- **核心方案**：四件套——① `src/api/` 目录做 API 工程化（axios 实例 + 按模块拆分接口）；② `baseURL=/api` 统一前缀；③ `vite-plugin-mock` 拦截 `/api/*` 返回假数据（`mock/` 目录）；④ 后端完成后只改 axios 的 baseURL 或通过 vite proxy 转发，不改动页面业务代码。
- **技术栈**：React 19、react-router-dom 7、Vite 8、axios 1、vite-plugin-mock 3、zustand 5（已安装但当前页面未实际使用，[[#冲突与未解决]]）；后端依赖 koa 3，尚未写业务。来源：package.json 依赖清单。
- **最小心智模型**：页面组件 → API 模块（按模块 getTodos） → axios 实例（统一 baseURL/timeout） → 开发期被 vite-plugin-mock 拦截，返回假数据；上线时把请求通过 baseURL 或代理切到真实后端，页面层与 API 层代码不动。

## 学习范围

### 深读（7 文件）

| 文件 | 原因 |
|---|---|
| readme.md | 项目顶层设计文档，阐述"前后端分离耦合点只有 API，前端通过 Mock 独立开发"的工程思路 |
| src/App.jsx | 前端路由+代码分割主骨架，展示 BrowserRouter/Routes/lazy/Suspense 的组合用法 |
| src/pages/Todos.jsx | 业务页面，展示 useEffect + IIFE 异步函数调用 API 的最小闭环 |
| src/api/config.js | axios 实例化，统一 baseURL 和超时，解释 API 工程化的"全局配置"层 |
| src/api/todos.js | 按模块封装的接口函数，解释"按模块拆分 + 命名导出" |
| vite.config.js | vite-plugin-mock 注册入口，确认 mock 路径和开发期启用开关 |
| mock/todos.js | Mock 接口具体规则：URL、method、模拟延迟、返回结构，证明"开发期前端自给自足" |

### 浅读（5 文件）

| 文件 | 提取字段 |
|---|---|
| src/pages/Home.jsx | 页面结构存在性，确认 / 路由 |
| src/components/Nav.jsx | `<Link to>` 的用法样例 |
| src/main.jsx | React 19 标准挂载（createRoot + StrictMode） |
| fronted/todos/package.json | scripts + 依赖名及主版本号 |
| backend/package.json | 只提取：koa@3.2.1 依赖，确认后端骨架状态 |

### 跳过

- 依赖目录、锁文件、二进制静态资源、样式、ESLint 配置、后端业务代码（未编写）。

### 未知与冲突

[!question]
- **未知**：后端目录只有 package.json 无代码，无法确认 koa 路由与 MySQL 方案（readme 提到 mysql 但 backend/package.json 未安装 mysql 相关依赖）。
- **冲突**：readme 与 package.json 都声明 zustand 为技术选型，但 src/ 内没有任何 `create()` 或 `useStore` 代码。判断为"已安装未落地"。后文不宣称项目实际使用了 zustand，只记录为已安装依赖。

## 知识地图

```mermaid
flowchart TD
  A[用户浏览器访问 /todos] --> B[Vite 开发服务器 :5173]
  B --> C[src/App.jsx BrowserRouter<br/>懒加载匹配 /todos 页面]
  C --> D[src/pages/Todos.jsx<br/>useEffect + IIFE 异步]
  D --> E[src/api/todos.js getTodos()]
  E --> F[src/api/config.js axios.create<br/>baseURL=/api timeout=5s]
  F --> G{请求 /api/todos}
  G -->|开发期 vite-plugin-mock 拦截| H[mock/todos.js response()<br/>timeout 2s 返回 {code:0,todos:[...]}]
  G -->|未来后端写完 /vite proxy| I[Koa :3000 /todos 接口]
  H --> J[返回 res.data 给 Todos.jsx setTodos(data.todos)]
  I --> J
```

页面路由与 API 路由是**两套路由体系**：
- `/` 与 `/todos` 属于 react-router-dom 管的页面路由（组件切换，不刷新）
- `/api/todos` 属于 HTTP 请求路由，不走 react-router，走 Mock 插件或后端服务

## 核心知识

### 1. 前后端分离的唯一耦合：API 契约 [[readme.md#L10-L17]]

前后端分离不是"完全无关"，两者唯一的耦合是**接口契约**：URL、method、请求参数、返回字段。
- 以前的问题：前端写界面 → 等后端写完接口 → 联调 → 修 bug。前端进度被后端卡死。[readme#L13-L16]
- 项目的解法：把"契约"定好后，前端用 Mock 自己返回符合契约的假 JSON，页面和逻辑全部写完；后端写完接口后再把 HTTP 流量从 Mock 切到真实 Koa。

### 2. 前端三驾马车：组件 + 路由 + 状态管理（readme#L3-L6）

[!tip]
组件负责界面渲染与交互；路由负责"URL → 页面组件"映射（SPA 不刷新切换）；状态管理（zustand）负责跨组件共享数据（银行比喻：任何组件都能存取，不用 props 层层传）。本项目 zustand 已安装未落地，Todos 页面暂时用的是本地 useState。

### 3. `src/api/` 目录是"前端 API 工程"，不是后端 [[readme.md#L26-L33]]

职责：
- **统一 axios 配置**：[src/api/config.js#L7-L10] `axios.create({ baseURL:'/api', timeout:5000 })`
  - `baseURL:'/api'`：每个请求自动拼 /api 前缀，不用重复写；未来切后端时只改这一行（改成 `http://localhost:3000` 或配合 Vite proxy）
  - `timeout:5000`：5 秒没响应自动失败，避免页面永远转圈
- **按模块拆分接口**：[src/api/todos.js#L7-L9] 命名导出 `getTodos`，调用 `instance.get('/todos')`（实际就是 /api/todos），返回 `res.data`。一个模块一个文件，随着项目变大可加 users.js、orders.js 等。

为什么要有 API 工程层？页面里直接写 `axios.get('/api/todos')` 不是也能跑？[合理推断]
- 接口有变动（URL 变了），只改一处；不用去所有页面里搜 `/api/todos` 全改
- 统一错误处理、token 注入等，将来在 config.js 里加 axios 拦截器就行
- 按模块拆分后协作清晰，多人开发不会冲突

### 4. React Router + lazy 懒加载 + Suspense 兜底 [src/App.jsx#L1-L27]

```jsx
const Home = lazy(() => import('./pages/Home'))  // 动态导入
const Todos = lazy(() => import('./pages/Todos'))

<Router>
  <Nav/>
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/todos" element={<Todos/>}/>
    </Routes>
  </Suspense>
</Router>
```
- 不用 `import Home from './pages/Home'` 的静态导入，否则首屏加载把两个页面的 JS 全下载了，首屏慢
- `lazy(() => import(...))` 只有路由匹配到该页面才下载
- `Suspense fallback=...` 下载完成前显示"Loading..."，**没有 Suspense 直接用 lazy 会报错，页面白屏**（本项目已正确包裹）

### 5. `<Link>` vs `<a>` [src/components/Nav.jsx#L6-L8]

[!warning]
`<Link>` 是 react-router 封装的 `<a>`，内部拦截 `preventDefault`，用 history API 切换路由，**不刷新整页**；直接用 `<a href="/todos">` 会重新加载 HTML、JS、CSS，白屏闪烁、慢。
```jsx
<Link to="/">Home</Link>      // SPA 体验，不刷新
<a href="/">Home</a>          // 整页刷新，丢 SPA 优势
```

### 6. useEffect + 立即执行异步函数（IIFE）获取数据 [src/pages/Todos.jsx#L8-L13]

```jsx
useEffect(() => {
  (async () => {
    const data = await getTodos()
    setTodos(data.todos)
  })()
}, [])
```
为什么不直接写 `useEffect(async () => ...)`？
- `useEffect` 期望回调返回"清理函数"，而 `async` 函数天然返回 Promise，React 会误解为清理函数（正确时应为 undefined 或 () => {...} 函数）。
- 所以用 `(async () => {...})()` 立即执行函数把 `await` 包在里面，外层回调返回值仍然是 undefined（不是 Promise），符合 React 期望。
- 依赖数组 `[]` 空：组件首次渲染完成后只执行一次。

### 7. vite-plugin-mock：开发期拦截 HTTP 请求自给自足 [vite.config.js#L5-L9] + [mock/todos.js#L1-L26]

```js
// vite.config.js
plugins: [
  react(),
  viteMockServe({ mockPath: 'mock', localEnabled: true })
]
```
- `mockPath: 'mock'`：Mock 文件放哪个目录
- `localEnabled: true`：本地开发启用（生产打包时不会带 Mock 代码，安全）

```js
// mock/todos.js
export default [{
  url: '/api/todos',
  method: 'get',
  timeout: 2000,                          // 模拟 2 秒网络延迟
  response: () => ({
    code: 0,
    todos: [
      { id:1, title:'学习react', completed:false },
      { id:2, title:'学习vue',   completed:false },
    ]
  })
}]
```
- 只要前端发 `GET /api/todos`，Vite 拦截不走网络，2 秒后返回假 JSON
- 前端 axios + 页面完全按真实 API 写，后端完成后只需要：
  - 方案 A：改 vite.config.js 加 server.proxy 把 `/api` 代理到 `localhost:3000`，并把 Mock 关掉
  - 方案 B：改 api/config.js 的 baseURL 为 `http://localhost:3000`（注意跨域）
  - 两种方案下，Todos.jsx / api/todos.js 的代码都**不动**，这就是 API 工程层带来的好处。

## 重点语法与 API

### React

| 语法/API | 最小写法 | 作用 | 常见坑 | 材料位置 |
|---|---|---|---|---|
| `lazy(() => import(...))` | `const C = lazy(()=>import('./C'))` | 路由级代码分割 | 必须配合 `<Suspense>` 使用，否则报错白屏 | [材料中出现] App.jsx#L10-L24 |
| `Suspense fallback=...` | `<Suspense fallback={<p>Loading</p>}><.../></Suspense>` | lazy 组件加载中的 UI 兜底 | 要包裹 lazy 组件的外层（或祖先层） | [材料中出现] App.jsx#L19 |
| `useEffect(() => {}, [])` | `useEffect(() => {...}, [])` | 组件挂载后执行一次 | 空数组只执行一次；回调不能是 async | [材料中出现] Todos.jsx#L8 |
| 立即执行异步函数 | `(async () => await foo())()` | 在不能 async 的地方用 await | 注意错误捕获，建议加 try/catch（当前页面未加） | [材料中出现] Todos.jsx#L9-L12 |
| `useState(init)` | `const [x, setX] = useState([])` | 组件级响应式状态 | 初始值类型要匹配，否则会把对象/数组当 undefined 取属性报错 | [材料中出现] Todos.jsx#L7 |

### react-router-dom

| 语法/API | 最小写法 | 作用 | 常见坑 | 材料位置 |
|---|---|---|---|---|
| `<BrowserRouter>` | `<Router>` 包全部 | 启用 HTML5 History 路由 | 整个应用只能有一个 Router 祖先 | [材料中出现] App.jsx#L17 |
| `<Routes>` + `<Route path element>` | `<Routes><Route path="/a" element={<A/>}/></Routes>` | 声明式路由配置 | Routes 内只能放 Route | [材料中出现] App.jsx#L20-L23 |
| `<Link to="...">` | `<Link to="/todos">Todos</Link>` | SPA 式路由跳转 | 不能写 `href`，写 `to` | [材料中出现] Nav.jsx#L7-L8 |

### axios

| 语法/API | 最小写法 | 作用 | 常见坑 | 材料位置 |
|---|---|---|---|---|
| `axios.create({ baseURL, timeout })` | `axios.create({ baseURL:'/api', timeout:5000 })` | 创建独立实例、统一配置 | 默认 axios 是全局实例，改了会污染；建议项目都用 create 实例 | [材料中出现] api/config.js#L7-L10 |
| `instance.get(url)` | `await instance.get('/todos')` | GET 请求，返回 `res` 对象，数据在 `res.data` | 注意返回值是包了一层 { data, status, headers }，别把整个 res 当数组用 | [材料中出现] api/todos.js#L8-L9 |

### vite-plugin-mock

| 语法/API | 最小写法 | 作用 | 常见坑 | 材料位置 |
|---|---|---|---|---|
| `viteMockServe({ mockPath, localEnabled })` | `viteMockServe({mockPath:'mock', localEnabled:true})` | 注册插件 | 生产环境默认关闭；mock 目录路径相对于项目根 | [材料中出现] vite.config.js#L6-L9 |
| Mock 规则 `{ url, method, timeout, response }` | `{url:'/api/todos', method:'get', timeout:2000, response:()=>({code:0,...})}` | 拦截并返回假数据 | `url` 要和 axios 实际请求的 URL 一致（含 baseURL 拼后结果），否则 404 | [材料中出现] mock/todos.js#L2-L25 |

## 注释重点解读

本项目有大量中文教学型注释，挑 3 条分析，每条核对实现：

1. **[src/api/config.js#L4-L5] 注释：`fetch 的缺点是功能小 / app : /api/todos -> :3000/todos`**
   - 含义：fetch 是浏览器内置但 API 弱（没有超时、没有自动 JSON 类型错误、没有拦截器、4xx/5xx 不抛错），axios 补全这些能力
   - 第二句 `-> :3000/todos` 描述了未来联调时的接口真实地址：前端 `/api/todos` 要代理/转发到后端端口 3000 的 `/todos`（去掉 /api 前缀）
   - 实现核对：当前 config.js 只写了 `baseURL:'/api'`，尚未配置 Vite proxy；注释是未来方向，与"Mock 先行"的现实不冲突，不矛盾。

2. **[src/api/todos.js#L5-L6] 注释：`api 目录职责 提供数据接口 / 不是直接去后端 后端没有开发好`**
   - 含义：API 目录的本质是"契约层 + 调用层"，不是硬绑定到真实后端；后端没好时，Mock 响应它，后端好了后端响应它。
   - 实现核对：Todos.jsx 调用 `getTodos()`，完全不知道返回值来自 Mock 还是 Koa；URL 契约一致（`/api/todos` GET → 返回 `{code, todos:[{id,title,completed}]}`），所以替换无感。正确。

3. **[App.jsx#L19] 外层包裹：`Suspense fallback={Loading...}`**
   - 注释：代码上没有显式注释，但这是 React 的硬性规则；lazy 组件必须有 Suspense，否则报错。
   - 实现核对：App.jsx 用 `<Suspense>` 包住 `<Routes>`，所有 lazy 页面都在里面，正确。如果忘记包裹，会白屏且控制台报错"组件在同步输入时挂起未提供 Suspense 边界"（外部补充）。

其余模块未发现可解释性注释或注释为"文件内自解释"，不做额外解读。

## 面试高频知识

### 1. 什么是前后端分离？和传统 SSR 的区别？ [材料推导 + 外部补充]

- 前后端分离：前端是独立 SPA（React/Vue），浏览器下载 JS 后渲染页面，数据通过 HTTP API 向后端要；后端只提供 JSON，不管页面长什么样。
- 传统 SSR（JSP/PHP）：服务器把页面渲染成 HTML 直接返回浏览器，页面逻辑和后端绑在一起。
- 面试答点：解耦、前后端并行开发、API 可复用（Web + App + 小程序共用后端）、前端可独立发版。

### 2. 为什么要用 axios 而不是 fetch？ [材料中出现 + 外部补充]

材料提到"fetch 功能小"，面试展开四点：
- 错误处理：fetch 只有**网络层错误**才抛异常；HTTP 4xx/5xx 返回的是 resolved Promise（不会进 catch），需要手动判断 `res.ok`；axios 对 4xx/5xx 自动 reject。
- 拦截器：axios 支持 request/response 拦截器，统一加 token、统一处理错误、统一 loading；fetch 没有，要自己封装函数。
- 超时：axios 原生 `timeout`；fetch 要用 `AbortController` + `setTimeout` 自己实现。
- 实例化：`axios.create({baseURL, timeout})` 创建独立实例，适合多域名、多套配置；fetch 没有这个概念，每次手动传 URL 和配置。

### 3. React Router v6/v7 的 `<Routes>` vs 老 v5 的 `<Switch>`？ [材料中出现 v7]

- `<Routes>`（v6+）：使用声明式 `element` 属性，不再用 render/component；支持相对路径；匹配更严格（默认 exact 行为）。
- `<Switch>`（v5）：老 API，用 `component={Comp}` 或 `render={() => <Comp/>}`；默认非 exact 会按前缀匹配多个，需要显式 `exact` 属性。
- 本项目是 react-router-dom 7，用新写法。

### 4. React 中 `useEffect(async () => ...)` 为什么不对？ [材料中出现的代码结构]

- useEffect 的回调要么返回 undefined，要么返回一个清理函数 `() => {...}`。
- 把回调写成 async，返回的是 Promise 对象，React 期望的是清理函数 → 控制台报警告或清理行为异常（例如无法清理订阅）。
- 正确写法：IIFE `(async () => { await foo() })()` 包裹，或者 `.then()`。

### 5. SPA 路由 `<Link>` vs `<a>` 的区别？为什么 SPA 不刷新？ [材料中出现]

- `<Link>` 渲染成 `<a>`，但阻止了默认跳转行为 `e.preventDefault()`，改用 `history.pushState`（HTML5 History API）改 URL，**不触发浏览器整页请求**；然后 React Router 匹配新路径 → 切组件 → UI 局部更新。
- `<a href>` 触发浏览器的导航 → 重新发起 HTML/CSS/JS 全量请求 → 白屏 → 全部重渲染。
- 面试延伸：这就是 SPA（单页应用）名字的来源——整个应用只有第一个 HTML，后续都是 JS 在客户端里"模拟页面切换"。

### 6. Mock 的常见方案有哪些？为什么选 vite-plugin-mock？ [材料中出现 + 外部补充]

- 方案对比：
  1. Mock.js（老方案）：拦截 XHR，不在 Vite 层；对 fetch 支持有时不完美
  2. vite-plugin-mock：Vite 开发服务器层拦截，对 axios/fetch 均生效；和 Vite 整合好；生产自动剔除
  3. MirageJS / MSW：Service Worker 级拦截，更贴近真实网络，适合 e2e，复杂度高
  4. 自建 node mock server：另开一个端口 3001，需要 Vite 代理
- 本项目选 vite-plugin-mock 最简单，"Vite 插件 + mock/ 目录 + 开发期启用"三件套即可。

### 7. API 工程化为什么要单独建 src/api 目录？而不是页面里写 fetch？ [材料推导]

- 统一配置（baseURL/timeout/拦截器）只写一处
- 接口改动只改一处，不搜全项目
- 按模块拆分 + 命名导出，代码职责清晰，方便测试（mock 一个 getTodos 来测试页面）
- 未来要换请求库（axios → ky）只改 config.js，所有页面不动
- 面试延伸：和后端 API 版本管理、TS 类型定义可以统一放到 API 层。

## 复习卡片

[!tip] 术语对比
| 项目 | 是什么 | 作用 | 本项目对应 |
|---|---|---|---|
| 页面路由 | URL → 组件 | SPA 不刷新切页面 | react-router / Route |
| API 路由 | URL → 后端接口/Mock 规则 | 拿 JSON 数据 | /api/todos |
| 代码分割 lazy | 按需下载 JS | 首屏更快 | lazy + Suspense |
| axios 实例 | 封装全局 HTTP 配置 | 统一前缀+超时+拦截 | axios.create |
| vite-plugin-mock | 开发期拦截请求 | 前端开发不用等后端 | mock/todos.js |
| 状态管理（银行比喻） | 跨组件共享数据 | 避免 props 层层传 | zustand（已装未用） |

[!warning] 易错点 → 原因 → 排查
1. **lazy 组件白屏**：没加 `<Suspense fallback>` → 控制台搜 "suspended" → 在 Routes 外包裹 Suspense
2. **Todos 页面数据 undefined**：Mock 返回 `{code:0, todos:[]}`，但页面直接 `setTodos(data)` 而不是 `setTodos(data.todos)` → F12 Network 看响应结构 → 对齐字段名（本项目已对齐 data.todos）
3. **Mock 404**：mock 的 url 与 axios 实际请求不同 → axios baseURL 是 /api，mock 规则 url 要写成 /api/todos，不是 /todos（本项目已对齐）
4. **useEffect 死循环**：依赖数组忘了传（每次渲染都执行）→ 传 `[]` 空数组只跑一次，或只写真正依赖的变量
5. **async useEffect 报错**：回调直接 async，返回 Promise → 用 IIFE 包裹（本项目已对齐）

[!tip] 5-10 条问答式复习
1. 本项目前端要拿到 Todos 数据，请求的完整 URL 是什么？答：开发服务器下 `http://localhost:5173/api/todos`，被 vite-plugin-mock 拦截。
2. 如果后端 Koa 写完了跑在 :3000/todos，前端最小改动切换到真实数据怎么做？答：方案一 在 vite.config.js 加 server.proxy 把 `/api` 代理到 `http://localhost:3000` 并 rewrite 去掉 /api 前缀；方案二 改 axios baseURL 为 `http://localhost:3000` 并处理跨域。
3. `<Link>` 比 `<a>` 的本质优势？答：JS 拦截跳转，使用 history.pushState 局部切换组件，不整页刷新。
4. 为什么 `useEffect(async () => await getTodos())` 是错的？答：async 函数返回 Promise，React 期望 useEffect 返回"清理函数"或 undefined，语义不匹配。
5. `setTodos(data)` vs `setTodos(data.todos)` 哪个对？答：看响应结构，Mock 返回 {code,todos}，所以后者对。
6. vite-plugin-mock 会把假数据打包进生产 dist 吗？答：不会，localEnabled 只在开发期启用，生产构建剔除。
7. API 目录按模块拆分（todos.js/users.js）的好处？答：多人协作不冲突，接口变更只改对应模块文件，方便维护。

## 实践与复习计划

> 说明：代码运行状态**未验证**，以下为基于代码阅读的可执行步骤。

### 当天任务（掌握概念，跑通链路）
- [ ] 安装依赖：cd fronted/todos → pnpm i
- [ ] 启动：pnpm dev → 打开 http://localhost:5173/ → 看 Home 页面
- [ ] 点 Todos 导航 → 看 Loading → 2 秒延迟后 Network 检查 /api/todos 响应体是否 {code:0, todos:[...]}
- [ ] 故意把 mock/todos.js 的 url 改成 `/todos`（去掉 /api），刷新看是否 404，理解 URL 契约一致性
- [ ] 故意把 Todos.jsx 改成 `setTodos(data)`（不取 .todos），观察是否空数据/控制台报错
- [ ] 把 Nav.jsx 里的 `<Link>` 改成 `<a href>`，对比整页刷新（看网络面板会重新请求 index.html）

### 1 天后任务（巩固知识点）
- [ ] 不看总结，默写：axios.create 配置项 / useEffect 正确异步写法 / lazy + Suspense 配合骨架 / Mock 规则四字段（url/method/timeout/response）
- [ ] 独立添加"新增 Todo"功能：前端加输入框+按钮 → 写 api/todos.js 的 `addTodo(body)` → mock/todos.js 加 `POST /api/todos` 规则
- [ ] 思考并记录：如果新增接口失败时要统一 Toast 提示，应该加在 axios 拦截器、api 模块还是页面？（面试点）

### 3 天后任务（面试向梳理）
- [ ] 背诵面试高频 7 条的要点（不要背全文，要点能复述）
- [ ] 拿一张纸画本项目的数据流图：浏览器 → 路由 → 页面 → API 目录 → axios 实例 → Mock/后端 → 返回 → setState
- [ ] 独立回答：什么是前后端分离的唯一耦合？怎么通过 Mock 解除开发节奏耦合？为什么要做 API 工程层？

### 7 天后任务（扩展与收尾）
- [ ] 在 backend 目录尝试写最小 Koa API：`GET /todos` 返回相同的 JSON，端口 3000
- [ ] 在 vite.config.js 加 `server.proxy: {'/api': { target:'http://localhost:3000', rewrite: path => path.replace(/^\/api/, '')}}`，把 mock 关掉验证真后端
- [ ] 给 Todos 页面加 try/catch（接口 404 时显示错误提示），理解"容错边界"
- [ ] 真正把 zustand 用起来：把 todos 数组从页面 useState 搬到 zustand store，跨页面共享

### 冲突与未解决 [材料事实]
[!question]
- zustand 已安装但未使用：是否下一个迭代要引入，或移除依赖？未决定。
- 后端 mysql 依赖缺失（readme 提及，但 backend/package.json 未安装 mysql2/sequelize 等）：是 README 超前规划，还是忘记安装？未确认。
- 后端 index.js 尚未编写：koajs@3 的写法与常见 koa@2 略有差异（koa-router 是否已内置？），[外部补充] koa 3 仍需单独装 koa-router，使用时注意版本兼容。
