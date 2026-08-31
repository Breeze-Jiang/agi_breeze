# 全局顶部导航设计

## 目标

在根布局中添加全站统一导航，使用户能够从任意页面进入首页、About 和 Blog，并移除页面中重复的顶部导航。

## 技术方案

- 修改 `app/layout.tsx`，引入 `next/link` 并在 `body` 内、页面内容之前渲染全局 `header`。
- 导航品牌 `NEXT.JS` 链接到 `/`，右侧包含 `About` 和 `Blog` 链接。
- 全局导航复用现有黑白极简视觉、Zinc 色系、细边框和深色模式。
- 导航是静态 Server Component，不加入客户端状态或额外依赖。

## 页面调整

- 移除 `app/about/page.tsx` 的页面级顶部导航。
- 移除 `app/blog/page.tsx` 的页面级顶部导航。
- 移除 `app/blog/[slug]/page.tsx` 的页面级顶部导航；页面底部的“返回 Blog”按钮保留。
- 移除 `app/not-found.tsx` 的页面级顶部导航。
- 首页内容不做其他调整。

## 响应式与可访问性

- 导航内容宽度与现有页面一致，使用 `max-w-6xl`、响应式水平内边距和 5rem 高度。
- 移动端品牌和两个链接保持单行显示，间距收紧且不得横向溢出。
- 所有链接提供 hover 和 `focus-visible` 状态。
- 导航使用语义化 `header` 与 `nav`，并为导航添加中文 `aria-label`。

## 验收标准

- 所有页面顶部仅显示一层统一导航。
- `NEXT.JS`、`About` 和 `Blog` 分别跳转到 `/`、`/about` 和 `/blog`。
- About、Blog、文章详情和 404 页面不再显示原来的局部顶部导航。
- 页面在移动端和桌面端无横向溢出，深色模式样式正确。
- Next.js 生产构建、TypeScript 与编辑器诊断通过。
