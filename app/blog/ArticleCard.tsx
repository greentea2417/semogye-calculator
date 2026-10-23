import Link from "next/link";
import Image from "next/image";
import { categoryLabel, formatBlogDate, type BlogArticle } from "./data";

export default function ArticleCard({ article, featured = false }: { article: BlogArticle; featured?: boolean }) {
  if (featured) {
    return (
      <article className="blog-featured-story">
        <Link href={`/blog/${article.slug}`} className="blog-featured-story__link">
          <div className="blog-featured-story__image">
            {article.image ? (
              <Image
                src={article.image}
                alt={article.imageAlt || article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-cover"
              />
            ) : (
              <div className="blog-cover-placeholder" aria-hidden="true">
                <span>SE—MO—GYE</span>
                <span>FEATURE / {article.publishedAt.slice(0, 4)}</span>
              </div>
            )}
          </div>
          <div className="blog-featured-story__copy">
            <div className="blog-story-meta">
              <span className="blog-story-meta__category">{categoryLabel(article.category)}</span>
              <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time>
            </div>
            <h2 className="blog-featured-story__title">{article.title}</h2>
            <p className="blog-featured-story__summary">{article.summary}</p>
            <span className="blog-read-link">기사 읽기 <span aria-hidden="true">↗</span></span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="blog-story-row">
      <Link href={`/blog/${article.slug}`} className="blog-story-row__link">
        <div className="blog-story-row__meta blog-story-meta">
          <span className="blog-story-meta__category">{categoryLabel(article.category)}</span>
          <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time>
        </div>
        <div className="blog-story-row__copy">
          <h2 className="blog-story-row__title">{article.title}</h2>
          <p className="blog-story-row__summary">{article.summary}</p>
        </div>
        <span className="blog-story-row__arrow" aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
