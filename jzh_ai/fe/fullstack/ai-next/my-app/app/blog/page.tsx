import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "./posts";

export const metadata: Metadata = {
  title: "前端工程与 AI Blog",
  description: "探索 React 工程化、浏览器 AI 与现代前端实践。",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 sm:px-10 lg:px-12">
        <section className="grid gap-10 border-b border-zinc-200 py-20 sm:py-28 lg:grid-cols-[1.25fr_0.75fr] lg:items-end dark:border-zinc-800">
          <div>
            <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Blog / 文章精选
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-7xl">
              探索前端工程与 AI。
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-zinc-600 lg:pb-1 dark:text-zinc-400">
            从工程化开发到浏览器端模型推理，以真实项目为线索，拆解技术选择、实现路径与可复用的实践经验。
          </p>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mb-9 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                Latest writing
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                最新文章
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
              {blogPosts.length.toString().padStart(2, "0")} POSTS
            </span>
          </div>

          <div className="grid border-l border-t border-zinc-200 lg:grid-cols-2 dark:border-zinc-800">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex min-h-[28rem] min-w-0 flex-col border-b border-r border-zinc-200 p-7 transition-colors hover:bg-zinc-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-950 sm:p-9 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus-visible:outline-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                    {post.index}
                  </span>
                  <span className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    {post.category}
                  </span>
                </div>

                <div className="mt-16 flex flex-1 flex-col">
                  <h3 className="break-words text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl">
                    {post.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {post.description}
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-5 text-xs dark:border-zinc-800">
                  <time className="font-mono text-zinc-400 dark:text-zinc-500">
                    {post.publishedAt}
                  </time>
                  <span className="font-medium transition-transform group-hover:translate-x-1">
                    阅读全文 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-auto flex min-h-20 items-center border-t border-zinc-200 py-5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>关于前端、工程化与浏览器 AI 的实践记录。</span>
        </footer>
      </div>
    </main>
  );
}
