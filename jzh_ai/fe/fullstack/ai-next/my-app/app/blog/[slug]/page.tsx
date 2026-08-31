import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { blogPosts, getBlogPost } from "../posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "文章未找到" };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 sm:px-10 lg:px-12">
        <article>
          <header className="border-b border-zinc-200 py-16 sm:py-24 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-700">
                {post.category}
              </span>
              <span aria-hidden="true">/</span>
              <time>{post.publishedAt}</time>
            </div>
            <h1 className="mt-8 max-w-4xl break-words text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-8 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg dark:text-zinc-400">
              {post.description}
            </p>
          </header>

          <div className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                Article overview
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                文章要点
              </h2>
            </div>
            <ol className="border-t border-zinc-200 dark:border-zinc-800">
              {post.topics.map((topic, index) => (
                <li
                  key={topic}
                  className="grid grid-cols-[2rem_1fr] gap-4 border-b border-zinc-200 py-6 text-sm leading-7 dark:border-zinc-800"
                >
                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{topic}</span>
                </li>
              ))}
            </ol>
          </div>

          <section className="grid gap-10 border-y border-zinc-200 py-16 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 dark:border-zinc-800">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                What you will learn
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                学习收获
              </h2>
            </div>
            <ul className="space-y-4">
              {post.takeaways.map((takeaway) => (
                <li
                  key={takeaway}
                  className="flex gap-4 rounded-xl bg-zinc-50 p-5 text-sm leading-7 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <span className="shrink-0 text-zinc-400" aria-hidden="true">
                    —
                  </span>
                  {takeaway}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center sm:py-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                继续阅读完整内容
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                前往 CSDN 查看原文中的完整讲解与代码。
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full px-6"
                render={<Link href="/blog" />}
              >
                返回 Blog
              </Button>
              <Button
                size="lg"
                className="h-11 rounded-full px-6"
                render={
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                阅读 CSDN 原文 ↗
              </Button>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
