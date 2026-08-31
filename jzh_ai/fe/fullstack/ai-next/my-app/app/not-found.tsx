import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 sm:px-10 lg:px-12">
        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.3fr_0.7fr] lg:py-20">
          <div className="overflow-hidden">
            <p
              aria-hidden="true"
              className="font-mono text-[clamp(8rem,28vw,22rem)] font-semibold leading-[0.75] tracking-[-0.1em] text-zinc-950 dark:text-white"
            >
              404
            </p>
          </div>

          <div className="max-w-md lg:justify-self-end">
            <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              页面未找到
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              页面走丢了。
            </h1>
            <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">
              你访问的页面不存在、已被移动，或者输入的地址有误。可以返回首页，或继续了解
              Next.js。
            </p>

            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                size="lg"
                className="h-11 rounded-full px-6"
                render={<Link href="/" />}
              >
                返回首页
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full px-6"
                render={<Link href="/about" />}
              >
                了解 Next.js
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex min-h-20 items-center border-t border-zinc-200 py-5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>没有找到你要的内容，但探索可以从这里重新开始。</span>
        </footer>
      </div>
    </main>
  );
}
