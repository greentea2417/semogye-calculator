import Link from "next/link";
import Image from "next/image";
import { categoryLabel, formatBlogDate, type BlogArticle } from "./data";

export default function ArticleCard({ article, featured = false }: { article: BlogArticle; featured?: boolean }) {
  return (
    <Link href={`/blog/${article.slug}`} className={`group block overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${featured ? "md:grid md:grid-cols-[1.15fr_0.85fr]" : ""}`}>
      <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 ${featured ? "md:aspect-auto md:min-h-72" : ""}`}>
        {article.image ? <Image src={article.image} alt={article.imageAlt || article.title} fill sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-black tracking-tight text-blue-700/80">세모계</span></div>}
      </div>
      <div className={`flex flex-col p-5 sm:p-6 ${featured ? "md:justify-center md:p-8" : ""}`}>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{categoryLabel(article.category)}</span><time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time></div>
        <h2 className={`line-clamp-3 font-bold leading-snug text-slate-900 group-hover:text-blue-700 ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>{article.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{article.summary}</p>
        <span className="mt-5 text-sm font-semibold text-blue-700">기사 읽기 <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
