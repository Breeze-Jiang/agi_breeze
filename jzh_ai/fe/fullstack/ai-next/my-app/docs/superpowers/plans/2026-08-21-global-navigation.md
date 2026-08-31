# 全局顶部导航实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在根布局添加统一的首页、About 和 Blog 导航，并删除各页面重复的顶部导航。

**Architecture:** 根布局使用 `next/link` 渲染静态全局 header，所有路由通过布局自动获得导航。About、Blog、文章详情与 404 页面只保留自身主体内容，避免双层导航。

**Tech Stack:** Next.js 16.3.1、React 19.2.8、TypeScript、Tailwind CSS 4

## Global Constraints

- 不新增依赖或客户端状态。
- 延续黑白极简视觉、Zinc 色系和深色模式。
- 所有页面顶部仅保留一层导航。
- 移动端导航不得横向溢出。

---

### Task 1: 添加根布局全局导航

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `next/link` 的 `Link`。
- Produces: 全站共享的 `NEXT.JS`、`About`、`Blog` 导航。

- [ ] **Step 1: 引入 Link 并创建 header**

在 `body` 内的 `children` 之前添加语义化 `header` 和 `nav`。品牌链接到 `/`，右侧链接分别指向 `/about` 与 `/blog`。

- [ ] **Step 2: 添加响应式和交互样式**

使用 `max-w-6xl`、响应式内边距、Zinc 边框与深色模式，并为链接添加 hover 和 focus-visible 状态。

### Task 2: 删除页面级重复导航

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/not-found.tsx`

**Interfaces:**
- Consumes: Task 1 提供的根布局导航。
- Produces: 无重复 header 的页面主体；文章详情底部的返回 Blog 链接继续保留。

- [ ] **Step 1: 删除四个页面的顶部 header**

仅删除页面最上方的局部 `header` 块，不改动正文按钮、卡片链接和底部操作区。

- [ ] **Step 2: 清理无用导入**

如果页面仍在正文中使用 `Link` 则保留导入；没有其他用途时才移除。

### Task 3: 验证导航

**Files:**
- Verify: `app/layout.tsx`
- Verify: `app/about/page.tsx`
- Verify: `app/blog/page.tsx`
- Verify: `app/blog/[slug]/page.tsx`
- Verify: `app/not-found.tsx`

- [ ] **Step 1: 执行生产构建**

Run: `npm run build`

Expected: 构建成功，所有现有路由正常生成，无 TypeScript 或 Next.js 错误。

- [ ] **Step 2: 检查编辑器诊断**

检查五个修改文件的 VS Code diagnostics。

Expected: 无错误或警告。

- [ ] **Step 3: 核对链接与重复导航**

确认根布局包含 `/`、`/about`、`/blog` 三个链接，四个子页面均已删除局部 header。
