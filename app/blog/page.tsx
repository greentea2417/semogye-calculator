import type { Metadata } from "next";
import ArticleCard from "./ArticleCard";
import { BLOG_CATEGORIES } from "./data";
import { blogArticles } from "./content";

export const metadata: Metadata = {
  title: "세모계 블로그",
  description: "경제와 생활에 필요한 정보를 공식 자료와 함께 알기 쉽게 전합니다.",
  alternates: { canonical: "https://semogye.com/blog" },
  robots: process.env.VERCEL_ENV === "preview"
    ? { index: false, follow: false }
    : blogArticles.length ? { index: true, follow: true } : { index: false, follow: true },
};

export default function BlogHomePage() {
  const sorted = [...blogArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return <main id="top" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
    <section className="py-12 sm:py-16"><p className="text-sm font-bold text-blue-700">SEMOGYE EDITORIAL</p><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">생활과 경제, <span className="text-blue-700">쉽고 정확하게.</span></h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">복잡한 숫자와 정책을 공식 자료에 기반해 이해하기 쉽게 풀어드립니다.</p></section>
    {sorted.length ? <section aria-labelledby="latest-heading" className="scroll-mt-28"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-semibold text-blue-700">새로운 이야기</p><h2 id="latest-heading" className="mt-1 text-2xl font-bold">최신 기사</h2></div></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{sorted.map((article, index) => <ArticleCard key={article.slug} article={article} featured={index === 0} />)}</div></section> : <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl font-black text-blue-700" aria-hidden="true">세</div><h2 className="mt-4 text-lg font-bold">첫 기사를 준비하고 있어요</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">공식 자료와 출처를 확인한 콘텐츠부터 순차적으로 공개할 예정입니다. 아직 게시된 기사는 없습니다.</p></section>}
    {sorted.length > 0 && BLOG_CATEGORIES.map((category) => { const items = sorted.filter((article) => article.category === category.slug); if (!items.length) return null; return <section key={category.slug} id={category.slug} aria-labelledby={`${category.slug}-heading`} className="mt-14 scroll-mt-28"><div className="mb-5 flex items-end justify-between"><h2 id={`${category.slug}-heading`} className="text-xl font-bold">{category.label}</h2><a href="#top" className="text-sm font-semibold text-blue-700">맨 위로 ↑</a></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.slice(0, 3).map((article) => <ArticleCard key={article.slug} article={article} />)}</div></section>; })}
  </main>;
}
