# shadcn/ui 按钮替换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 正式初始化 shadcn/ui，并使用官方 Button 组件替换项目内八个按钮式链接。

**Architecture:** 通过 shadcn CLI 初始化 Tailwind CSS 4 配置并添加 Button。各页面保持 Server Component，使用 `Button asChild` 将样式和 variant 传递给原有 `Link` 或 `a`，不改变导航目标及链接语义。

**Tech Stack:** Next.js 16.3.1、React 19.2.8、TypeScript、Tailwind CSS 4、shadcn/ui

## Global Constraints

- 使用正式 shadcn/ui 配置和官方 Button 组件。
- 八个按钮式链接使用 `Button asChild`；导航、正文和 Blog 卡片链接不替换。
- 主操作使用 `default`，次操作使用 `outline`。
- 页面继续作为 Server Component，不增加页面级客户端状态。
- 保留链接目的地、外部链接的 `target="_blank"` 和 `rel="noopener noreferrer"`。
- 保持现有圆角、尺寸、响应式宽度以及浅色/深色视觉。

---

### Task 1: 初始化 shadcn/ui 并添加 Button

**Files:**
- Create: `components.json`
- Create: `components/ui/button.tsx`
- Create: `lib/utils.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `Button`，支持 `variant="default" | "outline"`、`size`、`asChild` 与 `className`。
- Produces: `cn(...inputs)` 合并 Tailwind 类名。

- [ ] **Step 1: 运行非交互初始化**

Run: `npx shadcn@latest init -d -y`

Expected: 生成 `components.json`、`lib/utils.ts`，安装必要依赖并合并 shadcn 主题变量到 `app/globals.css`。

- [ ] **Step 2: 添加官方 Button**

Run: `npx shadcn@latest add button -y`

Expected: 生成 `components/ui/button.tsx`，导出 `Button` 和 `buttonVariants`。

- [ ] **Step 3: 检查生成文件**

确认 `components.json` 的 aliases 与现有 `@/*` 一致，Button 导入 `@/lib/utils`，且 globals.css 保留原项目字体变量。

### Task 2: 替换首页和 About 按钮

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`

**Interfaces:**
- Consumes: `import { Button } from "@/components/ui/button"`。
- Produces: 首页与 About 的四个 Button-as-link 操作。

- [ ] **Step 1: 替换首页操作**

为 `Deploy Now` 和 `Documentation` 的现有 `<a>` 分别外包 `Button asChild`。前者使用默认 variant，后者使用 `variant="outline"`；两者保留外链属性、图标、文本和 `md:w-[158px]` 响应式宽度。

- [ ] **Step 2: 替换 About 操作**

为 `返回首页` 的 `Link` 使用 `Button asChild variant="outline"`，为 `阅读官方文档` 的 `<a>` 使用 `Button asChild`。两者使用圆角和 44px 高度兼容当前视觉，保留链接属性。

### Task 3: 替换 404 和 Blog 详情按钮

**Files:**
- Modify: `app/not-found.tsx`
- Modify: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `import { Button } from "@/components/ui/button"`。
- Produces: 404 与文章详情的四个 Button-as-link 操作。

- [ ] **Step 1: 替换 404 操作**

为 `返回首页` 的 `Link` 使用默认 Button，为 `了解 Next.js` 使用 outline Button；保持移动端整组纵向、桌面端横向布局。

- [ ] **Step 2: 替换 Blog 详情操作**

为 `返回 Blog` 的 `Link` 使用 outline Button，为 `阅读 CSDN 原文` 的 `<a>` 使用默认 Button；保留动态 `post.sourceUrl` 和外链安全属性。

### Task 4: 验证范围与构建

**Files:**
- Verify: `components/ui/button.tsx`
- Verify: `app/page.tsx`
- Verify: `app/about/page.tsx`
- Verify: `app/not-found.tsx`
- Verify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: 核对替换数量**

搜索 `Button asChild`，Expected: 八处。确认顶部导航、正文链接和 Blog 卡片仍使用原有 Link/a。

- [ ] **Step 2: 执行生产构建**

Run: `npm run build`

Expected: 构建成功，首页、About、Blog、两篇详情与 404 均正常生成，无 TypeScript 或 Next.js 错误。

- [ ] **Step 3: 检查编辑器诊断**

对 Button 组件与四个修改页面运行 diagnostics。

Expected: 无错误或警告。
