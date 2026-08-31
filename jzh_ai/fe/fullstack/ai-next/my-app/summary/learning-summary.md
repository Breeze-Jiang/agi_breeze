---
type: learning-summary
title: "Next.js App Router 小型内容站"
aliases: ["Next.js App Router 小型内容站·学习总结"]
tags: [learning, nextjs, react, app-router, shadcn-ui]
source_scope: "当前项目 README、app、components 与必要配置"
coverage:
  deep_read: [README.md, app/layout.tsx, app/about/page.tsx, app/blog/page.tsx, app/blog/posts.ts, "app/blog/[slug]/page.tsx", app/not-found.tsx, app/page.tsx, components/ui/button.tsx, app/globals.css]
  shallow_read: [package.json, tsconfig.json]
  supplement: []
  skipped: [node_modules, .next, package-lock.json, public二进制与SVG资源, docs/superpowers]
review_status: learning
next_review: null
---

# Next.js App Router 小型内容站学习总结

## 目录

- [[#一页速览]]
- [[#学习范围]]
- [[#知识地图]]
- [[#核心知识]]
- [[#重点语法与 API]]
- [[#注释重点解读]]
- [[#面试高频知识]]
- [[#复习卡片]]
- [[#实践与复习计划]]

## 一页速览

> [!summary]
> - 这个项目用 Next.js 16.3.1 的 App Router 组织首页、About、Blog、动态文章详情和全局 404。
> - `layout.tsx` 管共享外壳，`page.tsx` 管具体路由页面，目录名称进入 URL，`[slug]` 表示动态路由段。
> - Blog 以 `blogPosts` 为单一数据源：列表生成卡片，详情按 slug 查询，构建参数与页面元数据也从同一份数据产生。
> - `generateStaticParams`、`generateMetadata`、`notFound()` 和根级 `not-found.tsx` 组成“可生成、可描述、可兜底”的详情页链路。
> - shadcn/ui 的 Button 基于 Base UI 与 CVA，链接式按钮通过 `render` 保留 `<a>` 或 Next.js `Link` 的导航语义。

**最小心智模型：** URL 先匹配 `app` 目录结构，匹配后的页面由最近的布局包裹；动态段从 `params` 取得业务键，再从共享数据源查数据；不存在时进入 404。

**适用边界：** 当前 Blog 是源码中的静态数据，不是 CMS 或数据库；文章详情适合少量、构建期已知的内容。运行未验证。

## 学习范围

### 深读

- `README.md`：学习笔记中的特殊文件、Link、RSC payload 和预加载概念。
- `app/layout.tsx`：根布局、字体、元数据与全局导航。
- `app/about/page.tsx`：静态元数据、数组驱动 UI、Button 链接。
- `app/blog/page.tsx`：文章列表和动态详情链接。
- `app/blog/posts.ts`：文章类型、两篇数据、slug 查询。
- `app/blog/[slug]/page.tsx`：动态参数、静态参数、动态元数据与 404。
- `app/not-found.tsx`：全局未找到页面。
- `app/page.tsx`：首页及 shadcn/ui 按钮用法。
- `components/ui/button.tsx`：Base UI、CVA variant 和类名合并。
- `app/globals.css`：Tailwind CSS 4、shadcn 主题与暗色变量。

### 浅读

- `package.json`：只提取脚本和直接依赖版本。
- `tsconfig.json`：只提取严格模式、模块解析和路径别名。

### 补读

无。首轮材料已经足以解释路由、数据和组件链路。

### 跳过

- `node_modules/`、`.next/`：依赖和构建产物。
- `package-lock.json`：本主题不分析精确依赖解析。
- `public/` 下图片、`favicon.ico`：不影响路由主线。
- `docs/superpowers/`：属于设计和实施过程文档，不作为当前源码机制的核心证据。
- 未读取任何 `.env` 内容。

> [!question]
> 未知项：没有后端、数据库、测试文件或运行截图，无法确认部署环境、真实运行行为和性能结果。

## 知识地图

```mermaid
flowchart TD
  U[用户访问 URL] --> R[App Router 匹配 app 目录]
  R --> L[RootLayout 共享字体与导航]
  L --> A[/about/page.tsx]
  L --> B[/blog/page.tsx]
  B --> D[Link: /blog/slug]
  D --> P[await params 取得 slug]
  P --> G[getBlogPost 查询 blogPosts]
  G -->|命中| M[generateMetadata + 详情 UI]
  G -->|未命中| N[notFound]
  N --> NF[app/not-found.tsx]
  S[generateStaticParams] --> D
  C[Button + CVA + Base UI] --> A
  C --> D
```

**关键数据流：** `blogPosts` → Blog 列表卡片 → URL 中的 slug → `getBlogPost(slug)` → 文章详情；同一数据还进入 `generateStaticParams` 和 `generateMetadata`。

## 核心知识

### 1. 文件系统路由不是“文件名背诵”，而是 UI 层级

[材料中出现] `app/about/page.tsx` 对应 `/about`，`app/blog/page.tsx` 对应 `/blog`，`app/blog/[slug]/page.tsx` 对应动态详情。根 `layout.tsx` 接收 `children`，把字体、背景和导航共享给后代页面（E02、E03、E04、E06）。

为什么重要：布局和 URL 结构保持一致后，新增页面不需要手写路由表。容易混淆的是：目录本身不一定产生页面，能被直接访问的路由通常需要对应的 `page.tsx`。

### 2. 共享数据源让列表、详情和构建参数保持一致

[材料中出现] `BlogPost` 类型描述文章字段，`blogPosts` 保存两篇文章，`getBlogPost` 按 slug 查询（E05）。列表页遍历它生成卡片，详情页用它查文章，`generateStaticParams` 也遍历它生成参数（E04、E06）。

这样做的价值不是“少写一个文件”，而是避免三份事实漂移：卡片有文章但详情查不到、详情存在但没有静态参数、标题与摘要不一致。

### 3. 动态详情页是一条完整链路

[材料中出现] 当前版本中 `params` 被声明为 `Promise<{ slug: string }>`，因此页面与 `generateMetadata` 都先 `await params`（E06）。取得 slug 后：

1. 调用 `getBlogPost(slug)`。
2. 命中则渲染标题、主题和学习收获。
3. `generateMetadata` 返回文章标题和摘要。
4. 未命中调用 `notFound()`，转入根级 404。

> [!warning]
> Next.js API 会随版本变化。这个项目明确使用 Next.js 16.3.1，应以本项目安装版本的文档和类型为准，而不是套用旧版本示例。

### 4. Metadata 分为静态与动态

[材料中出现] About 和 Blog 列表直接导出 `metadata` 常量；动态详情页使用 `generateMetadata`，根据 slug 查询后的文章返回标题和描述（E03、E04、E06）。

取舍原则：页面信息不依赖参数时用静态 metadata；依赖路由参数或数据时用 `generateMetadata`。未知文章返回“文章未找到”，正文再调用 `notFound()`。

### 5. 404 是路由设计的一部分

[材料中出现] 根级 `app/not-found.tsx` 提供统一 404 UI，动态详情在查不到 slug 时主动调用 `notFound()`（E06、E08）。这比在详情组件里返回一段临时文本更完整，因为它把失败分支交回框架约定。

### 6. 组件库不应破坏链接语义

[材料中出现] `Button` 基于 `@base-ui/react/button`，CVA 负责 variant 与 size，`cn` 合并类名（E09）。页面通过 `render={<Link ... />}` 或 `render={<a ... />}` 让视觉使用 Button，实际元素仍承担正确导航语义（E03、E07、E08）。

这避免了把链接放进按钮导致交互元素嵌套。站内导航用 `Link`，外部链接保留 `target="_blank"` 和 `rel="noopener noreferrer"`。

### 7. 主题由 CSS 变量而不是页面散落颜色驱动

[材料中出现] `globals.css` 导入 Tailwind CSS、动画和 shadcn 样式，定义语义色变量；`.dark` 覆盖暗色值，颜色采用 OKLCH（E10）。字体由根布局注入 Geist CSS 变量，再映射到 Tailwind 主题（E02、E10）。

## 重点语法与 API

| 语法/API | 来源 | 最小作用 | 常见坑 |
|---|---|---|---|
| `layout.tsx` | [材料中出现] | 共享路由树外壳 | 把页面专属内容放进根布局会污染所有页面 |
| `page.tsx` | [材料中出现] | 定义可访问页面 | 只有目录没有 page，不等于有同名页面 |
| `[slug]` | [材料中出现] | 声明动态路由段 | slug 与数据键不一致会进入 404 |
| `Link href` | [材料中出现] | Next.js 站内导航 | README 示例写成了 `ref="prefetch"`，属性应重点复核 |
| `Metadata` | [材料中出现] | 为静态页面声明标题和描述 | 动态数据不应硬编码成统一标题 |
| `generateStaticParams()` | [材料中出现] | 返回构建期已知动态参数 | 返回对象键必须与动态段名称一致 |
| `generateMetadata()` | [材料中出现] | 根据 params 生成元数据 | 当前项目的 params 需要 await |
| `notFound()` | [材料中出现] | 中止当前渲染并显示未找到 UI | 不能只返回 `null` 代替完整 404 语义 |
| `cva()` | [材料中出现] | 集中管理组件变体 | 页面继续复制大量按钮类会削弱组件价值 |
| `Button render` | [材料中出现] | 让 Button 渲染为链接元素 | 不要嵌套 `<button><a>` |
| RSC payload | [材料推导] | README 用它解释客户端导航时服务端组件结果的传递 | 不应简单等同于传统页面 HTML 请求 |
| 预取 | [材料推导] | README 说明 Link 可提前获取目标资源 | 是否预取及触发条件应按当前版本文档确认 |

## 注释重点解读

源码中未发现可解释性注释。项目主要通过清晰命名、类型和框架约定表达意图。

README 中有说明性学习笔记，但存在一个需要复核的片段：`<Link ref="prefetch" href="/blog" />`。从上下文看，它想表达 Link 的预加载能力；`ref` 与 `prefetch` 的关系需要根据当前 Next.js 16.3.1 文档核对，不能直接把笔记示例当作可运行代码。

## 面试高频知识

### Q1：App Router 中 layout 和 page 的区别？

[材料中出现] `layout` 提供共享 UI 并通过 `children` 包裹页面；`page` 定义具体可访问页面。当前根布局共享字体和导航。

### Q2：动态路由如何做静态生成？

[材料中出现] 使用 `[slug]` 声明动态段，再让 `generateStaticParams` 返回 `{ slug }` 数组。当前数据源有两篇文章，因此可从同一数组导出两个参数。

### Q3：为什么要同时使用 generateMetadata 和 notFound？

[材料推导] 前者解决页面可描述性，后者解决不存在资源的路由语义。它们关注点不同，不能互相替代。

### Q4：Server Component 和 Client Component 如何判断？

[外部补充] 当前页面没有写 `"use client"`，按 App Router 约定默认属于 Server Component。只有需要浏览器状态、事件或客户端 API 时才引入客户端边界。该结论需以当前版本官方文档为准。

### Q5：为什么文章数据要集中管理？

[材料推导] 因为列表、详情、静态参数和元数据都依赖同一事实。集中数据能降低 slug、标题和摘要不一致的风险。

### Q6：为什么链接式按钮不能简单写成 button 包 a？

[材料推导] 两个交互元素嵌套会产生语义和可访问性问题。当前 Base UI Button 的 `render` 允许最终元素保持为 Link 或 a。

## 复习卡片

> [!tip] 卡片 1
> **问：** `/blog/react-webgpu-deepseek` 如何找到文章？  
> **答：** `[slug]` 捕获路径段 → `await params` → `getBlogPost(slug)` → 命中后渲染。

> [!tip] 卡片 2
> **问：** 哪四处共享 `blogPosts`？  
> **答：** Blog 卡片列表、详情查询、`generateStaticParams`、`generateMetadata` 间接查询。

> [!tip] 卡片 3
> **问：** 查不到文章时发生什么？  
> **答：** 详情页调用 `notFound()`，框架显示根级 `app/not-found.tsx`。

> [!tip] 卡片 4
> **问：** 静态 metadata 与 generateMetadata 怎么选？  
> **答：** 不依赖参数用静态对象；依赖 slug 或数据用动态函数。

> [!tip] 卡片 5
> **问：** Button 如何保持链接语义？  
> **答：** 使用 `render` 传入 Link 或 a，由 Button 合并样式与行为。

> [!warning] 错误排查卡
> **错误：** 新文章出现在列表，但详情 404。  
> **检查：** 卡片 href 的 slug、数据中的 slug、动态段参数名和 `getBlogPost` 查询值是否完全一致。

### 代码填空

```tsx
export function generateStaticParams() {
  return blogPosts.map((post) => ({ ____: post.slug }));
}
```

答案：`slug`。

## 实践与复习计划

- [ ] 当天：手画“URL → layout → page → params → 数据查询 → notFound”的链路。
- [ ] 当天：给 `blogPosts` 增加第三篇测试数据，确认列表、静态参数和详情均来自同一数据源；运行未验证。
- [ ] 1 天后：不看源码写出 `generateStaticParams`、`generateMetadata` 和 `notFound` 的职责对比。
- [ ] 3 天后：把文章数据替换为异步函数接口，保持页面调用边界不变；运行未验证。
- [ ] 7 天后：为动态详情增加测试，覆盖合法 slug 和未知 slug；当前项目未提供测试框架。

> [!question]
> 后续可验证：README 中 Link 预取示例的准确写法、Next.js 16.3.1 对动态参数和缓存的完整约定，以及该项目在浏览器中的真实暗色模式切换方式。
