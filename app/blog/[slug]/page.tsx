import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "../ArticleCard";
import AdSlot from "../AdSlot";
import CalculatorCallout from "../CalculatorCallout";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogArticles } from "../content";
import { categoryLabel, formatBlogDate } from "../data";

const SITE_URL = "https://semogye.com";

const markdownComponents: Components = {
  a: ({ href, children }) => href?.startsWith("/")
    ? <Link href={href}>{children}</Link>
    : href?.startsWith("#")
      ? <a href={href}>{children}</a>
      : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  img: ({ src, alt }) => typeof src === "string"
    ? <Image src={src} alt={alt ?? ""} width={1200} height={675} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full" />
    : null,
};

function splitAtMiddleSection(markdown: string): [string, string] {
  const lines = markdown.split("\n");
  const headingOffsets: number[] = [];
  let offset = 0;
  let fenceCharacter: string | undefined;

  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (fence) {
      if (!fenceCharacter) fenceCharacter = fence[0];
      else if (fenceCharacter === fence[0]) fenceCharacter = undefined;
    } else if (!fenceCharacter && /^##\s+\S/.test(line)) {
      headingOffsets.push(offset);
    }
    offset += line.length + 1;
  }

  const candidates = headingOffsets.slice(1);
  if (!candidates.length) return [markdown, ""];

  const splitAt = candidates.reduce((closest, candidate) =>
    Math.abs(candidate - markdown.length / 2) < Math.abs(closest - markdown.length / 2) ? candidate : closest,
  );
  return [markdown.slice(0, splitAt).trim(), markdown.slice(splitAt).trim()];
}

export function generateStaticParams() { return blogArticles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article) return { title: "기사를 찾을 수 없습니다 | 세모계 블로그", robots: { index: false, follow: true } };
  const url = `${SITE_URL}/blog/${article.slug}`;
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: "세모계",
      title: article.title,
      description: article.summary,
      url,
      publishedTime: `${article.publishedAt}T00:00:00+09:00`,
      modifiedTime: `${article.updatedAt}T00:00:00+09:00`,
      images: article.image ? [{ url: article.image, alt: article.imageAlt || article.title }] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article) notFound();

  const related = blogArticles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 3);
  const articleUrl = `${SITE_URL}/blog/${article.slug}`;
  const schemaType = article.contentType === "news" ? "NewsArticle" : "BlogPosting";
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: article.title,
    description: article.summary,
    datePublished: `${article.publishedAt}T00:00:00+09:00`,
    dateModified: `${article.updatedAt}T00:00:00+09:00`,
    mainEntityOfPage: articleUrl,
    articleSection: categoryLabel(article.category),
    author: { "@type": "Organization", name: "세모계 편집팀" },
    publisher: { "@type": "Organization", name: "세모계" },
    image: article.image ? [article.image] : undefined,
  };
  const [bodyBeforeInlineSlot, bodyAfterInlineSlot] = splitAtMiddleSection(article.body);

  return (
    <main id="blog-main" className="blog-shell__container blog-article-page">
      <article>
        <header className="blog-article-header">
          <Link href="/blog" className="blog-back-link">← 저널 인덱스</Link>
          <p className="blog-eyebrow blog-article-header__category">{categoryLabel(article.category)} <span aria-hidden="true">/</span> {article.contentType === "news" ? "NEWS" : "EXPLAINER"}</p>
          <h1 className="blog-article-header__title">{article.title}</h1>
          <p className="blog-article-header__dek">{article.summary}</p>
          <div className="blog-article-header__dates">
            <span>최초 발행 <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time></span>
            <span>최종 수정 <time dateTime={article.updatedAt}>{formatBlogDate(article.updatedAt)}</time></span>
          </div>
        </header>

        <div className="blog-grid blog-article-grid">
          <div className="col-span-12 lg:col-span-8">
            <figure className="blog-article-cover">
              <div className="blog-article-cover__image">
                {article.image ? (
                  <Image src={article.image} alt={article.imageAlt || article.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
                ) : (
                  <div className="blog-cover-placeholder" aria-hidden="true">
                    <span>SE—MO—GYE</span>
                    <span>{categoryLabel(article.category)} / {article.publishedAt.slice(0, 4)}</span>
                  </div>
                )}
              </div>
              <figcaption>{article.imageSource ? `이미지 출처: ${article.imageSource}` : "세모계 에디토리얼"}</figcaption>
            </figure>

            <div className="blog-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {bodyBeforeInlineSlot}
              </ReactMarkdown>
              {bodyAfterInlineSlot && (
                <>
                  <AdSlot placement="article-inline" />
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {bodyAfterInlineSlot}
                  </ReactMarkdown>
                </>
              )}
            </div>

            <AdSlot placement="article-bottom" />
            {article.calculator && <CalculatorCallout {...article.calculator} />}

            {!!article.sources.length && (
              <section className="blog-sources" aria-labelledby="sources-heading">
                <p className="blog-eyebrow">SOURCES <span aria-hidden="true">/</span> REFERENCES</p>
                <h2 id="sources-heading">참고자료·공식 출처</h2>
                <ul>
                  {article.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.label} <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="col-span-12 lg:col-span-3 lg:col-start-10 blog-article-rail" aria-label="기사 정보">
            <div className="blog-article-rail__details">
              <p className="blog-eyebrow">FIELD NOTES</p>
              <dl>
                <div><dt>주제</dt><dd>{categoryLabel(article.category)}</dd></div>
                <div><dt>발행</dt><dd>{article.publishedAt}</dd></div>
              </dl>
              <Link href={`/blog#category-${article.category}`} className="blog-article-rail__link">이 주제 더 보기 <span aria-hidden="true">↗</span></Link>
            </div>
            <AdSlot placement="article-sidebar" />
          </aside>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        {related.length > 0 && (
          <section className="blog-related" aria-labelledby="related-heading">
            <div className="blog-section-heading">
              <div>
                <p className="blog-eyebrow">MORE IN THIS TOPIC</p>
                <h2 id="related-heading">관련 기사</h2>
              </div>
            </div>
            <div className="blog-story-list">
              {related.map((item) => <ArticleCard key={item.slug} article={item} />)}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
