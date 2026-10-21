import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "../ArticleCard";
import CalculatorCallout from "../CalculatorCallout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogArticles } from "../content";
import { categoryLabel, formatBlogDate } from "../data";

const SITE_URL = "https://semogye.com";

export function generateStaticParams() { return blogArticles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article) return { title: "기사를 찾을 수 없습니다 | 세모계 블로그", robots: { index: false, follow: true } };
  const url = `${SITE_URL}/blog/${article.slug}`;
  return { title: article.title, description: article.summary, alternates: { canonical: url }, openGraph: { type: "article", locale: "ko_KR", siteName: "세모계", title: article.title, description: article.summary, url, publishedTime: `${article.publishedAt}T00:00:00+09:00`, modifiedTime: `${article.updatedAt}T00:00:00+09:00`, images: article.image ? [{ url: article.image, alt: article.imageAlt || article.title }] : undefined } };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article) notFound();
  const related = blogArticles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 3);
  const articleUrl = `${SITE_URL}/blog/${article.slug}`;
  const schemaType = article.contentType === "news" ? "NewsArticle" : "BlogPosting";
  const schema = { "@context": "https://schema.org", "@type": schemaType, headline: article.title, description: article.summary, datePublished: `${article.publishedAt}T00:00:00+09:00`, dateModified: `${article.updatedAt}T00:00:00+09:00`, mainEntityOfPage: articleUrl, articleSection: categoryLabel(article.category), author: { "@type": "Organization", name: "세모계 편집팀" }, publisher: { "@type": "Organization", name: "세모계" }, image: article.image ? [article.image] : undefined };
  return <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8"><article className="mx-auto max-w-3xl">
    <Link href="/blog" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700">← 블로그로 돌아가기</Link>
    <header className="pb-7 pt-5"><p className="text-sm font-bold text-blue-700">{categoryLabel(article.category)}</p><h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{article.title}</h1><p className="mt-5 text-lg leading-8 text-slate-600">{article.summary}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span>최초 발행 <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time></span><span>최종 수정 <time dateTime={article.updatedAt}>{formatBlogDate(article.updatedAt)}</time></span></div></header>
    <figure className="mb-8"><div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100">{article.image ? <Image src={article.image} alt={article.imageAlt || article.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-black text-blue-700/70">세모계</span></div>}</div><figcaption className="mt-2 text-xs text-slate-500">{article.imageSource ? `이미지 출처: ${article.imageSource}` : "세모계 기본 썸네일"}</figcaption></figure>
    <div className="blog-prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      a: ({ href, children }) => href?.startsWith("/") ? <Link href={href}>{children}</Link> : href?.startsWith("#") ? <a href={href}>{children}</a> : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
      img: ({ src, alt }) => typeof src === "string" ? <Image src={src} alt={alt ?? ""} width={1200} height={675} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full rounded-2xl" /> : null,
    }}>{article.body}</ReactMarkdown></div>
    {article.calculator && <CalculatorCallout {...article.calculator} />}
    {!!article.sources.length && <section className="mt-10 rounded-2xl bg-slate-50 p-5" aria-labelledby="sources-heading"><h2 id="sources-heading" className="text-base font-bold">참고자료·공식 출처</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-blue-800">{article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-blue-300 underline-offset-2">{source.label} <span aria-hidden="true">↗</span></a></li>)}</ul></section>}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    {related.length > 0 && <section className="mt-12 border-t border-slate-200 pt-8" aria-labelledby="related-heading"><h2 id="related-heading" className="mb-5 text-xl font-bold">관련 기사</h2><div className="grid gap-4 sm:grid-cols-2">{related.map((item) => <ArticleCard key={item.slug} article={item} />)}</div></section>}
  </article></main>;
}
