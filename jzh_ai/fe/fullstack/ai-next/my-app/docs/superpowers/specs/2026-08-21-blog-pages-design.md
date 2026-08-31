# Blog 列表与详情页设计

## 目标

创建 `/blog` 列表页，以两张卡片展示用户提供的 CSDN 文章，并为每篇文章提供站内介绍详情页及 CSDN 原文链接。

## 内容来源

第一篇文章：

- 标题：React Todos 前端独立开发全解：用 vite-plugin-mock + axios 封装，再也不等后端接口
- 站内路径：`/blog/react-todos-mock-api`
- 原文：https://blog.csdn.net/2501_93234401/article/details/163706863?spm=1001.2014.3001.5502
- 内容方向：React 19、Vite 8、axios、vite-plugin-mock、路由懒加载、API 目录工程化与 Mock/真实后端切换。

第二篇文章：

- 标题：React + WebGPU 在浏览器运行 DeepSeek：从 Worker 通信到流式生成
- 站内路径：`/blog/react-webgpu-deepseek`
- 原文：https://blog.csdn.net/2501_93234401/article/details/163646452?spm=1001.2014.3001.5502
- 内容方向：React 主线程、Web Worker、WebGPU、Transformers.js、模型生命周期与流式消息。

站内详情页只根据用户截图整理介绍、主题要点和学习收获，不复制原文全文。

## 技术结构

- `app/blog/posts.ts`：保存两篇文章的共享数据与 TypeScript 类型。
- `app/blog/page.tsx`：Blog 列表页，读取共享数据并渲染卡片。
- `app/blog/[slug]/page.tsx`：动态详情页，根据 slug 查找文章并渲染内容。
- 动态详情页通过 `generateStaticParams` 在构建时生成两个已知路径。
- 未知 slug 调用 `notFound()`，使用现有根级 404 页面。
- 列表页和详情页提供页面级 SEO 元数据；详情页使用 `generateMetadata` 输出对应标题和摘要。

## Blog 列表页

- 延续 About 页的黑白极简视觉、Zinc 色系、细边框与深色模式。
- 顶部展示 `NEXT.JS` 品牌文字，以及返回首页入口。
- 首屏标题为“探索前端工程与 AI”，辅以简短中文说明。
- 两张卡片展示文章序号、分类、标题、摘要、发布日期和“阅读全文”提示。
- 整张卡片使用 `Link` 链接到对应站内详情页。
- 桌面端双列展示，移动端单列展示；标题和摘要不得横向溢出。

## 文章详情页

- 顶部提供返回 Blog 列表页入口。
- 展示文章分类、发布日期、标题与摘要。
- 主体展示根据截图整理的主题要点和学习收获，每篇文章使用自身的数据内容。
- 页面底部提供“返回 Blog”站内链接和“阅读 CSDN 原文”外部链接。
- 外部链接在新标签页打开，并设置 `rel="noopener noreferrer"`。

## 数据与错误处理

- 页面不请求外部接口，所有展示数据在构建时可用。
- 文章 slug 是详情页的唯一查找键。
- 未匹配文章时立即调用 `notFound()`，不渲染空状态或客户端错误提示。
- 页面保持 Server Component，不加入客户端状态和额外 JavaScript。

## 验收标准

- `/blog` 显示两张文章卡片，内容与用户截图一致。
- 两张卡片分别进入正确的站内详情页。
- 两个详情页显示各自标题、摘要、主题要点和学习收获。
- 两个详情页的 CSDN 原文链接准确且在新标签页打开。
- 未知 `/blog/[slug]` 显示现有 404 页面。
- 页面支持移动端、桌面端和深色模式，无横向溢出。
- Next.js 生产构建、TypeScript 与编辑器诊断通过。
