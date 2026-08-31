---
type: learning-summary
title: "Next.js App Router 父子组件 RSC 拆分实践：从 Redis Hash 到客户端交互"
aliases: ["components + lib·学习总结", "RSC 拆分实践学习总结"]
tags: [learning, nextjs, rsc, react-server-component, redis, hash, object-entries, json-parse, dayjs]
source_scope: "jzh_ai/fe/fullstack/nextjs/next-blog/components/ + lib/"
coverage:
  deep_read: ["lib/redis.js", "components/Sidebar.js", "components/SidebarNoteList.js", "components/SidebarNoteList2.js", "components/SidebarNoteItem.js", "components/SidebarNoteItemContent.js"]
  shallow_read: []
  supplement: []
  skipped: []
review_status: learning
next_review: null
---

# Next.js App Router 父子组件 RSC 拆分实践·学习总结

> 一篇笔记，讲清 next-blog 的 components + lib 如何落地 App Router 的「RSC 父子拆分」哲学，从 Redis Hash 数据到客户端交互的完整链路，每一步都标面试考点。

## 一页速览

- [!summary] 三句话讲完 components + lib
  1. **数据层（lib/redis.js）**：用 ioredis 连 Redis，懒加载初始化，`hgetall` 返回的是 JS 对象（不是 hash 表）。
  2. **组件拆分（components/）**：父 RSC 取数据+渲染 HTML 给搜索引擎看，子客户端组件处理交互——**最小化客户端边界**。
  3. **数据转换链路**：Redis Hash → JS 对象 → Object.entries 转数组 → JSON.parse 解析字符串 → dayjs 格式化时间 → 渲染。

**最小心智模型**：Redis 存 Hash → ioredis 转 JS 对象 → RSC 父组件取数据 → RSC 父组件渲染列表 → 客户端子组件处理交互。

**适用边界**：SidebarNoteItemContent.js 标了 `'use client'` 但 useState/useEffect 未实际使用，是骨架代码。代码用于学习拆分模式，**运行未验证**。

## 学习范围

| 范围 | 文件 | 原因 |
|---|---|---|
| 深读 | [lib/redis.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/lib/redis.js) | 数据层：ioredis + Hash + 懒加载 |
| 深读 | [components/Sidebar.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/Sidebar.js) | RSC 根：async 取数据 |
| 深读 | [components/SidebarNoteList.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/SidebarNoteList.js) | RSC 父：注释点明拆分思想 |
| 深读 | [components/SidebarNoteList2.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/SidebarNoteList2.js) | 另一版本：Object.entries + JSON.parse + dayjs |
| 深读 | [components/SidebarNoteItem.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/SidebarNoteItem.js) | 中间层：组合 children + expandChildren |
| 深读 | [components/SidebarNoteItemContent.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/SidebarNoteItemContent.js) | 客户端组件：'use client' |

## 知识地图

```mermaid
flowchart LR
  A[Redis 服务端] -->|HGETALL notes<br/>返回 RESP 文本| B[ioredis 客户端]
  B -->|反序列化| C[JS 对象<br/>id: jsonString]
  C --> D[Sidebar.js<br/>RSC async 取数据]
  D -->|notes 对象| E[SidebarNoteList.js<br/>RSC 父组件]
  E -->|Object.entries 转数组| F[二维数组<br/>[id, jsonString]]
  F -->|JSON.parse 解析| G[JS 对象<br/>title/content/updateTime]
  G --> H[SidebarNoteItem.js<br/>中间层组件]
  H -->|children + expandChildren| I[SidebarNoteItemContent.js<br/>客户端组件 use client]
  I -->|useState/useEffect<br/>处理交互| J[浏览器渲染]
```

**完整链路**：Redis Hash → RESP → JS 对象 → Object.entries → JSON.parse → 组件 props → 客户端交互。

## 核心知识

### 1. 数据层：lib/redis.js

#### 连接 Redis

```js
import Redis from 'ioredis';
const redis = new Redis();  // 默认 localhost:6379
```

`new Redis()` 不传参数走默认值，连本机 6379 端口。

#### 种子数据（懒加载初始化）

```js
const initialData = {
  "1702459181837": '{"title":"sunt aut","content":"quia et...","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459182837": '{"title":"qui est","content":"est rerum...","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459188837": '{"title":"ea molestias","content":"et iusto...","updateTime":"2023-12-13T09:19:48.837Z"}'
}
```

- key 是时间戳字符串（笔记 ID）
- value 是 JSON 字符串（笔记对象序列化）
- Redis 只能存字符串，对象要 `JSON.stringify()` 序列化

#### getAllNotes 懒加载

```js
export async function getAllNotes() {
  const data = await redis.hgetall('notes');                    // ① 查
  if (Object.keys(data).length === 0) {                         // ② 判空
    await redis.hset('notes', initialData);                     // ③ 写种子
  }
  return await redis.hgetall('notes');                          // ④ 再查返回
}
```

**懒加载模式**：第一次访问发现空才写种子数据，避免每次启动都写。

#### 为什么 hgetall 返回 JS 对象

```
Redis 服务端            网络              Node.js
────────────         ◄TCP►            ────────
Hash 数据结构         RESP 文本         JS 对象
(数组+链表)            *6\r\n$13...      {id: json, ...}
                       ↓
                  ioredis 自动解析
```

**两道转换**：① Redis 序列化成 RESP 文本 ② ioredis 反序列化成 JS 对象。进程间不能共享内存，必须序列化传输。

### 2. RSC 父子组件拆分

#### 拆分思想（注释点明）

[SidebarNoteList.js#L3-6](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/SidebarNoteList.js#L3-L6)：

```js
// SidebarNoteList(RSC SEO ) -> SidebarNoteItem (交互 CSR)
// 核心思想 ：父组件 RSC 取数据 + 渲染 HTML 给搜索引擎看；子组件客户端组件处理用户交互。 最小化客户端组件范围 。
```

**关键判断**：
- **父组件 RSC**：取数据 + 渲染 HTML → SEO + 首屏快
- **子组件客户端组件**：处理交互（点击/展开/state）
- **最小化客户端边界**：只有真正需要交互的叶子组件才加 `'use client'`

#### 组件调用链（4 层）

```
Sidebar.js (RSC)
  ↓ await getAllNotes()
  ↓ 传 notes 给子
SidebarNoteList.js (RSC)
  ↓ notes.map 遍历
  ↓ 传 noteId + note 给子
SidebarNoteItem.js (中间层，未标 'use client')
  ↓ 解构 note 对象
  ↓ 组合 children + expandChildren
SidebarNoteItemContent.js (客户端组件 'use client')
  ↓ useState/useEffect 处理交互
  ↓ 渲染到浏览器
```

#### RSC vs 客户端组件对比

| | RSC（默认） | 客户端组件 |
|---|---|---|
| 标记 | 不写 | 文件顶部 `'use client'` |
| 在哪跑 | 服务器 | 浏览器 |
| async/await | ✅ | ❌ |
| useState/useEffect | ❌ | ✅ |
| onClick | ❌ | ✅ |
| SEO | ✅ | ❌ |
| JS 打包 | 不发浏览器 | 发浏览器 |

### 3. 数据转换工具函数

#### Object.entries（SidebarNoteList2.js）

```js
const arr = Object.entries(notes);
// { "id1": "json1", "id2": "json2" }
// → [["id1", "json1"], ["id2", "json2"]]
```

**作用**：JS 对象不能直接 `.map()`，转成 `[key, value]` 二维数组才能遍历。

#### JSON.parse（SidebarNoteList2.js）

```js
const { title, updateTime } = JSON.parse(note);
// '{"title":"sunt aut",...}' → { title: "sunt aut", ... }
```

**作用**：把 JSON 字符串解析成 JS 对象，再解构取字段。

#### dayjs（SidebarNoteList2.js）

```js
dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss')
// '2023-12-13T09:19:48.837Z' → '2023-12-13 09:19:48'
```

**作用**：轻量日期库，格式化时间。比 moment 小很多。

### 4. children 与自定义 prop

[SidebarNoteItem.js](file:///c:/Users/38335/Desktop/workspace/jzh_ai/fe/fullstack/nextjs/next-blog/components/SidebarNoteItem.js)：

```js
<SidebarNoteItemContent
  id={noteId}
  title={note.title}
  expandChildren={<p>{content.substring(0, 20)}</p>}   // 自定义 prop
>
  <header>                                              // children
    <strong>{title}</strong>
    <small>{dayjs(updateTime).format('YYYY-MM-DD')}</small>
  </header>
</SidebarNoteItemContent>
```

**区别**：
- **children**：组件标签之间的内容，React 内置 prop
- **expandChildren**：自定义 prop，传 JSX 元素

**为什么用两个**：把笔记拆成「头部」（children）和「展开内容」（expandChildren），客户端组件可以分别控制显隐。

## 重点语法与 API

| 语法/API | 最小写法 | 作用 | 出处 |
|---|---|---|---|
| `new Redis()` `[材料中出现]` | 不传参默认连本机 | 连 Redis 服务端 | lib/redis.js L2 |
| `redis.hgetall(key)` `[材料中出现]` | 返回 JS 对象 | 取 Hash 所有字段 | lib/redis.js L14/L18 |
| `redis.hset(key, obj)` `[材料中出现]` | 传对象一次写多字段 | 写 Hash | lib/redis.js L16 |
| `async function` `[材料中出现]` | RSC 标志 | 服务端取数据 | Sidebar.js L6 |
| `'use client'` `[材料中出现]` | 文件顶部 | 标记客户端组件 | SidebarNoteItemContent.js L1 |
| `Object.entries(obj)` `[材料中出现]` | 对象转二维数组 | 遍历对象 | SidebarNoteList2.js L4 |
| `JSON.parse(str)` `[材料中出现]` | JSON 字符串转对象 | 解析序列化数据 | SidebarNoteList2.js L15 |
| `dayjs(t).format()` `[材料中出现]` | 格式化时间 | 日期处理 | SidebarNoteList2.js L20 |
| `children` `[材料中出现]` | 标签间内容 | React 内置 prop | SidebarNoteItem.js L16 |
| `expandChildren` `[材料中出现]` | 自定义 prop | 传 JSX 元素 | SidebarNoteItem.js L11 |

## 注释重点解读

### `SidebarNoteList.js` L3-6：拆分核心思想

```js
// SidebarNoteList(RSC SEO ) -> SidebarNoteItem (交互 CSR)
// 核心思想 ：父组件 RSC 取数据 + 渲染 HTML 给搜索引擎看；子组件客户端组件处理用户交互。 最小化客户端组件范围 。
```

**解读**：注释点明 App Router 工程化的核心判断——**能用 RSC 就用 RSC，只有需要交互才改客户端组件**。SEO 和首屏速度优先，交互只在最小范围引入。`[材料事实]`

### `SidebarNoteList2.js` L4：Object.entries 用途

```js
const arr = Object.entries(notes); // hash 转成二维数组 方便map 遍历
```

**解读**：注释点明转换目的——JS 对象不能直接 `.map()`，转成二维数组才能遍历。这是数据形态适配组件渲染的典型操作。`[材料事实]`

## 面试高频知识

### Q1：RSC 和客户端组件怎么选？`[材料中出现]`+`[外部补充]`
> 能用 RSC 就用 RSC（取数据+SEO+首屏快），只有需要 useState/useEffect/onClick 才加 `'use client'`。判断口诀：纯展示用 RSC，要交互才用客户端组件。

### Q2：为什么父组件 RSC 子组件客户端组件？`[材料中出现]`
> 父 RSC 在服务端取数据+渲染 HTML 给搜索引擎看（SEO+首屏），子客户端组件处理用户交互（点击展开）。最小化客户端边界，JS 包小，SEO 不受影响。

### Q3：redis.hgetall 返回什么？`[材料中出现]`+`[外部补充]`
> 返回 JS 对象（不是 Redis hash 表）。Redis 服务端把 Hash 数据序列化成 RESP 文本，ioredis 客户端反序列化成 JS 对象。进程间不能共享内存，必须序列化传输。

### Q4：Object.entries 干嘛用的？`[材料中出现]`+`[外部补充]`
> 把 JS 对象转成 `[key, value]` 二维数组，让对象能 `.map()` 遍历。如 `{a:1, b:2}` → `[['a',1],['b',2]]`。

### Q5：JSON.parse 干嘛用的？`[材料中出现]`+`[外部补充]`
> 把 JSON 字符串解析成 JS 对象。Redis 只能存字符串，对象要 `JSON.stringify()` 存，取出后 `JSON.parse()` 解析。

### Q6：children 和自定义 prop 区别？`[材料中出现]`+`[外部补充]`
> children 是 React 内置 prop，表示组件标签之间的内容；自定义 prop（如 expandChildren）是开发者自己命名的。两者都能传 JSX，但 children 是隐式的，自定义 prop 是显式的。

### Q7：懒加载初始化模式是什么？`[材料中出现]`
> 第一次访问发现数据空才写种子数据，避免每次启动都写。如 getAllNotes 先 hgetall 查，空就 hset 写种子，再 hgetall 返回。

### Q8：dayjs 比 moment 好在哪？`[外部补充]`
> API 几乎兼容，但 dayjs 体积小很多（2KB vs 70KB+），tree-shaking 友好。大厂项目优先 dayjs。

### Q9：客户端组件能 import RSC 吗？`[外部补充]`
> ❌ 不能。客户端组件已跑浏览器，没法跑服务端逻辑。但 RSC 能 import 客户端组件——客户端组件就是边界，边界内自动都是客户端组件。

### Q10：你的项目组件调用链？`[材料推导]`
> 4 层：Sidebar(RSC 取数据) → SidebarNoteList(RSC 渲染列表) → SidebarNoteItem(中间层组合) → SidebarNoteItemContent(客户端组件交互)。前三层都是 RSC，只有叶子是客户端组件。

## 复习卡片

### [!tip] 术语对比卡
- **RSC vs 客户端组件**：服务端 async 取数据 vs 客户端 hooks 交互
- **Redis Hash vs JS 对象**：服务端数据结构 vs 客户端数据副本
- **children vs expandChildren**：React 内置 prop vs 自定义 prop
- **JSON.stringify vs JSON.parse**：对象转字符串 vs 字符串转对象
- **Object.entries vs Object.keys**：返回 [k,v] 二维数组 vs 只返回 key 数组

### [!warning] 错误→原因→排查
- **错误**：`notes.map is not a function`
  - **原因**：notes 是对象不是数组
  - **排查**：用 `Object.entries(notes)` 转数组再 map
- **错误**：`Cannot read property 'title' of string`
  - **原因**：note 还是 JSON 字符串没解析
  - **排查**：先 `JSON.parse(note)` 再解构
- **错误**：`useState is not defined`
  - **原因**：在 RSC 里用了 hooks
  - **排查**：文件顶部加 `'use client'`
- **错误**：`connect ECONNREFUSED 127.0.0.1:6379`
  - **原因**：Redis 服务端没启动
  - **排查**：先 `redis-server` 启动服务

### 数据转换链路速记

```text
Redis 服务端:  Hash 数据类型 (field → value)
       ↓ redis.hgetall() + ioredis 反序列化
Node.js:       JS 对象 { id: jsonString }
       ↓ Object.entries()
二维数组:       [[id, jsonString], ...]
       ↓ JSON.parse(note)
JS 对象:        { title, content, updateTime }
       ↓ 解构 + dayjs 格式化
组件 props:    title, content, formattedTime
       ↓ 渲染
浏览器:         HTML
```

### 5 条快问快答
1. hgetall 返回什么？→ JS 对象（不是 hash 表）
2. 对象怎么 map？→ Object.entries 转二维数组
3. JSON 字符串怎么取字段？→ JSON.parse 后解构
4. 客户端组件怎么标？→ 文件顶部 `'use client'`
5. 父 RSC 子客户端组件的好处？→ SEO + 首屏快 + 最小化客户端边界

## 实践与复习计划

> 运行未验证：以下任务基于代码静态分析，未实际 `npm run dev`。

- [ ] **当天**：
  - 背下 RSC vs 客户端组件对比表
  - 在项目里找到 4 层组件调用链
  - 找到 Object.entries 和 JSON.parse 的用法

- [ ] **1 天后**：
  - 默写数据转换链路（Hash → JS 对象 → 数组 → 解析 → 渲染）
  - 解释为什么 hgetall 返回 JS 对象
  - 解释 children 和 expandChildren 的区别

- [ ] **3 天后**：
  - 给 SidebarNoteItemContent.js 加真实交互（点击展开 expandChildren）
  - 修复 SidebarNoteList.js 和 SidebarNoteList2.js 的不一致（一个直接 map 一个用 Object.entries）
  - 加一个新组件练习 RSC 拆分

- [ ] **7 天后**：
  - 模拟面试：不看笔记答 Q1-Q10
  - 研究客户端组件边界效应（'use client' 后子组件自动是客户端组件）
  - 用 use client 边界优化一个真实项目

[!question] 未解决问题
- SidebarNoteList.js 直接 `notes.map`，但 SidebarNoteList2.js 用 `Object.entries` 转换——说明两个版本接收的数据形态不同？
- SidebarNoteItem.js 解构 `note` 对象（`const { title, content, updateTime } = note`），但 SidebarNoteList.js 传的 `note` 是 JSON 字符串还是已解析对象？
- SidebarNoteItemContent.js 标了 `'use client'` 但 useState/useEffect 未用，是计划实现点击展开功能吗？
