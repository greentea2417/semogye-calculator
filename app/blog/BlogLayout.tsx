import Link from "next/link";
import type { ReactNode } from "react";
import { BLOG_CATEGORIES } from "./data";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="세모계 홈" className="text-xl font-black tracking-tight text-blue-700">세모계</Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-3 sm:gap-6"><Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-700">계산기</Link><Link href="/blog" aria-current="page" className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">블로그</Link></nav>
      </div>
    </header>
    <nav aria-label="블로그 카테고리" className="border-b border-slate-100 bg-slate-50"><div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">{BLOG_CATEGORIES.map((category) => <a key={category.slug} href={`/blog#${category.slug}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700">{category.label}</a>)}</div></nav>
    {children}
    <footer className="mt-16 border-t border-slate-200 bg-slate-50"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>세모계 블로그 · 숫자와 정보가 더 쉬워지는 곳</p><div className="flex gap-4"><Link href="/about" className="hover:text-blue-700">세모계 소개</Link><Link href="/privacy" className="hover:text-blue-700">개인정보처리방침</Link><Link href="/contact" className="hover:text-blue-700">문의</Link></div></div></footer>
  </div>;
}
