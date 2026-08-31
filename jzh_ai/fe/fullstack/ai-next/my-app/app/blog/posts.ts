export type BlogPost = {
  slug: string;
  index: string;
  category: string;
  title: string;
  description: string;
  publishedAt: string;
  sourceUrl: string;
  topics: string[];
  takeaways: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "react-todos-mock-api",
    index: "01",
    category: "React 工程化",
    title:
      "React Todos 前端独立开发全解：用 vite-plugin-mock + axios 封装，再也不等后端接口",
    description:
      "面向前后端分离项目，搭建一个可独立运行的 Todo 应用：从路由懒加载、API 目录工程化，到 Mock 数据与真实后端的一键切换。",
    publishedAt: "2026-08-12",
    sourceUrl:
      "https://blog.csdn.net/2501_93234401/article/details/163706863?spm=1001.2014.3001.5502",
    topics: [
      "使用 BrowserRouter、lazy 与 Suspense 拆分页面代码并实现路由懒加载。",
      "通过 axios.create 统一管理 baseURL、超时时间和请求入口。",
      "按模块组织 API 文件，让一个资源对应一组清晰的请求方法。",
      "使用 vite-plugin-mock 在前端构造接口，解除开发阶段对后端进度的依赖。",
      "通过少量配置在 Mock 接口与真实后端之间切换。",
    ],
    takeaways: [
      "掌握前后端分离项目中可复用的前端目录结构。",
      "理解路由、请求层与页面组件之间的职责边界。",
      "建立先用 Mock 完成交互、再平滑接入真实接口的开发流程。",
    ],
  },
  {
    slug: "react-webgpu-deepseek",
    index: "02",
    category: "浏览器 AI",
    title: "React + WebGPU 在浏览器运行 DeepSeek：从 Worker 通信到流式生成",
    description:
      "拆解浏览器端大模型应用的完整调用链：React 管理界面，Web Worker 承担模型加载与推理，Transformers.js 配合 WebGPU 完成流式文本生成。",
    publishedAt: "2026-08-10",
    sourceUrl:
      "https://blog.csdn.net/2501_93234401/article/details/163646452?spm=1001.2014.3001.5502",
    topics: [
      "由 React 主线程负责输入、聊天列表和模型加载进度展示。",
      "把下载模型、初始化 WebGPU 与执行推理放入 Web Worker，避免阻塞界面。",
      "使用 Transformers.js 管理 tokenizer、模型加载和文本生成过程。",
      "设计主线程与 Worker 之间的消息协议，区分进度、结果和错误状态。",
      "通过流式消息逐步回传生成内容，改善浏览器端对话体验。",
    ],
    takeaways: [
      "理解浏览器端大模型从加载到生成的完整生命周期。",
      "学会分离页面交互与高负载推理任务，保持主线程流畅。",
      "认识 WebGPU 兼容性、模型缓存和生成速度等落地时需要验证的因素。",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
