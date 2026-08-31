# Blog 列表与详情页实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建展示两篇文章卡片的 Blog 列表页、两个静态生成的站内详情页，以及准确的 CSDN 原文链接。

**Architecture:** 使用 `app/blog/posts.ts` 集中保存类型化文章数据，`app/blog/page.tsx` 渲染列表，`app/blog/[slug]/page.tsx` 根据异步 `params` 查找并渲染详情。详情路由通过 `generateStaticParams` 预生成，未知 slug 使用 `notFound()`。

**Tech Stack:** Next.js 16.3.1、React 19.2.8、TypeScript、Tailwind CSS 4

## Global Constraints

- 页面内容使用中文。
- 不新增第三方依赖，不请求外部接口。
- 页面保持 Server Component。
- 延续现有黑白极简视觉、Zinc 色系和深色模式。
- 站内介绍不复制 CSDN 原文全文。

---

### Task 1: 建立共享文章数据

**Files:**
- Create: `app/blog/posts.ts`

**Interfaces:**
- Produces: `BlogPost` 类型、`blogPosts: BlogPost[]`、`getBlogPost(slug: string): BlogPost | undefined`。

- [ ] **Step 1: 定义文章类型和两篇文章数据**

创建 `BlogPost`，字段包含 `slug`、`index`、`category`、`title`、`description`、`publishedAt`、`sourceUrl`、`topics`、`takeaways`。写入 `react-todos-mock-api` 与 `react-webgpu-deepseek` 两篇文章，并导出按 slug 查找的函数。

- [ ] **Step 2: 检查数据准确性**

确认两个 `sourceUrl` 与用户提供链接完全一致，slug 分别为 `react-todos-mock-api` 和 `react-webgpu-deepseek`，每篇均有独立主题要点和学习收获。

### Task 2: 创建 Blog 列表页

**Files:**
- Create: `app/blog/page.tsx`

**Interfaces:**
- Consumes: `blogPosts`。
- Produces: `/blog` 页面及静态 `metadata`。

- [ ] **Step 1: 创建页面结构与元数据**

导出标题为“前端工程与 AI Blog”的 Metadata。页面包含品牌导航、标题“探索前端工程与 AI”、说明文字和文章卡片区域。

- [ ] **Step 2: 渲染两张可点击卡片**

遍历 `blogPosts`，整张卡片通过 `Link` 指向 `/blog/${post.slug}`，展示序号、分类、标题、摘要、日期和“阅读全文”。

- [ ] **Step 3: 添加响应式视觉**

使用现有 Zinc 色系和边框风格；桌面双列、移动端单列，支持深色模式、hover 与 focus-visible 状态，长标题不得横向溢出。

### Task 3: 创建动态文章详情页

**Files:**
- Create: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `blogPosts`、`getBlogPost(slug)`、`params: Promise<{ slug: string }>`。
- Produces: 两个静态详情页、动态 Metadata 和未知 slug 的 404 行为。

- [ ] **Step 1: 实现静态参数与 Metadata**

`generateStaticParams()` 返回两篇文章的 slug；`generateMetadata()` 等待 `params` 后查找文章，为已知文章返回标题与摘要，未知文章返回“文章未找到”。

- [ ] **Step 2: 实现详情内容和 404**

默认异步页面等待 `params`，使用 `getBlogPost` 查找；找不到时调用 `notFound()`。已知文章展示分类、日期、标题、摘要、主题要点与学习收获。

- [ ] **Step 3: 添加导航与原文链接**

顶部和底部提供返回 `/blog` 的 `Link`；“阅读 CSDN 原文”使用新标签页打开，并设置 `rel="noopener noreferrer"`。

- [ ] **Step 4: 添加响应式详情样式**

复用黑白极简视觉、细边框和深色模式；正文控制阅读宽度，移动端按钮纵向排列且页面无横向溢出。

### Task 4: 验证 Blog 页面

**Files:**
- Verify: `app/blog/posts.ts`
- Verify: `app/blog/page.tsx`
- Verify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: 执行生产构建**

Run: `npm run build`

Expected: 构建成功，路由输出包含 `/blog` 以及两个由 `[slug]` 静态生成的详情路径，无 TypeScript 或 Next.js 错误。

- [ ] **Step 2: 检查编辑器诊断**

检查三个新增文件的 VS Code diagnostics。

Expected: 无错误或警告。

- [ ] **Step 3: 核对验收项**

确认卡片链接、返回链接、两个 CSDN 原文 URL、未知 slug 的 `notFound()` 分支、响应式类和深色模式类均已实现。
