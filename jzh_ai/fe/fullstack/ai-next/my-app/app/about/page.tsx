import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "关于 Next.js",
  description: "了解 Next.js 的核心能力、优势和适用场景。",
};

const features = [
  {
    index: "01",
    title: "文件系统路由",
    description:
      "目录和文件就是路由。清晰的项目结构，让页面、布局与接口易于组织和维护。",
  },
  {
    index: "02",
    title: "服务端渲染",
    description:
      "在服务器生成页面内容，为用户提供更快的首屏体验，同时兼顾搜索引擎优化。",
  },
  {
    index: "03",
    title: "静态生成",
    description:
      "在构建阶段预生成页面，结合缓存机制，为内容型网站带来稳定且快速的访问体验。",
  },
  {
    index: "04",
    title: "Server Components",
    description:
      "默认在服务器运行组件，减少发送到浏览器的 JavaScript，让应用保持轻量高效。",
  },
];

const useCases = ["企业官网", "内容博客", "电商平台", "全栈应用"];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 sm:px-10 lg:px-12">
        <section className="grid gap-10 border-b border-zinc-200 py-20 sm:py-28 lg:grid-cols-[1.35fr_0.65fr] lg:items-end dark:border-zinc-800">
          <div>
            <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              关于框架
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-7xl">
              为现代 Web 而生的 React 框架。
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-zinc-600 lg:pb-1 dark:text-zinc-400">
            Next.js 帮助开发者构建快速、可靠且可扩展的 Web
            应用。它将前端体验与服务端能力结合，让你能够专注于产品，而不是繁琐的工程配置。
          </p>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                核心能力
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                从开发到上线，一体完成
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              灵活的渲染策略与清晰的开发约定，让不同规模的应用都拥有良好的性能与开发体验。
            </p>
          </div>

          <div className="grid border-l border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group min-h-64 border-b border-r border-zinc-200 p-7 transition-colors hover:bg-zinc-50 sm:p-9 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {feature.index}
                </span>
                <h3 className="mt-12 text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-12 border-y border-zinc-200 py-16 sm:py-20 lg:grid-cols-2 dark:border-zinc-800">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              适用场景
            </p>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              一个框架，覆盖多种产品形态
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
            {useCases.map((useCase) => (
              <li
                key={useCase}
                className="flex min-h-24 items-center bg-white px-6 text-sm font-medium dark:bg-zinc-950"
              >
                <span className="mr-3 text-zinc-400">—</span>
                {useCase}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center sm:py-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              准备开始构建？
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              查看官方文档，探索 Next.js 的完整能力。
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6"
              render={<Link href="/" />}
            >
              返回首页
            </Button>
            <Button
              size="lg"
              className="h-11 rounded-full px-6"
              render={
                <a
                  href="https://nextjs.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              阅读官方文档 ↗
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
