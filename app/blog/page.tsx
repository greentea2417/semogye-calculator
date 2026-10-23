import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "./ArticleCard";
import AdSlot from "./AdSlot";
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
  const categories = BLOG_CATEGORIES.map((category) => ({
    ...category,
    articles: sorted.filter((article) => article.category === category.slug),
  }));
  const years = Array.from(new Set(sorted.map((article) => article.publishedAt.slice(0, 4))));

  return (
    <main id="blog-main" className="blog-shell__container blog-home">
      <section className="blog-grid blog-home__intro" aria-labelledby="blog-title">
        <div className="col-span-12 lg:col-span-8">
          <p className="blog-eyebrow">SE—MO—GYE <span aria-hidden="true">/</span> INDEPENDENT JOURNAL</p>
          <h1 id="blog-title" className="blog-home__title">
            생활과 경제,<br />더 <em>명확하게.</em>
          </h1>
          <p className="blog-home__dek">복잡한 숫자와 제도를 정확하고 편안하게 읽을 수 있도록 정리합니다.</p>
        </div>
        <div className="blog-home__issue col-span-12 lg:col-span-3 lg:col-start-10" aria-label="저널 정보">
          <p className="blog-eyebrow">THE JOURNAL</p>
          <dl>
            <div><dt>TOPICS</dt><dd>{String(BLOG_CATEGORIES.length).padStart(2, "0")}</dd></div>
            <div><dt>STORIES</dt><dd>{String(sorted.length).padStart(2, "0")}</dd></div>
          </dl>
          <p className="blog-home__issue-note">정확한 정보, 출처가 보이는 설명.</p>
        </div>
      </section>

      <section className="blog-grid blog-home__latest" aria-labelledby="latest-heading">
        <div className="col-span-12 lg:col-span-9">
          <div className="blog-section-heading">
            <div>
              <p className="blog-eyebrow">01 <span aria-hidden="true">/</span> NEW & NOTEWORTHY</p>
              <h2 id="latest-heading">최신 글</h2>
            </div>
            <span className="blog-section-heading__count">{String(sorted.length).padStart(2, "0")} STORIES</span>
          </div>
          {sorted.length ? (
            <>
              <ArticleCard article={sorted[0]} featured />
              {sorted.length > 1 && (
                <div className="blog-story-list" aria-label="최근 게시글">
                  {sorted.slice(1, 5).map((article) => <ArticleCard key={article.slug} article={article} />)}
                </div>
              )}
            </>
          ) : (
            <div className="blog-empty-state">
              <p className="blog-eyebrow">FIRST EDITION <span aria-hidden="true">/</span> IN PREPARATION</p>
              <h3>첫 편집 기사를 준비하고 있어요.</h3>
              <p>검수와 출처 확인을 마친 글부터 차례로 소개합니다.</p>
            </div>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-3 lg:col-start-10 blog-home__rail" aria-label="주제 및 아카이브 탐색">
          <AdSlot placement="listing-sidebar" />
          <section aria-labelledby="topic-index-heading" className="blog-index-block">
            <p className="blog-eyebrow">BROWSE BY TOPIC</p>
            <h2 id="topic-index-heading">주제별 인덱스</h2>
            <ol>
              {categories.map((category, index) => (
                <li key={category.slug}>
                  <Link href={`#category-${category.slug}`}>
                    <span className="blog-index-block__number">{String(index + 1).padStart(2, "0")}</span>
                    <span>{category.label}</span>
                    <span className="blog-index-block__count">{String(category.articles.length).padStart(2, "0")}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="archive-index-heading" className="blog-index-block blog-index-block--archive">
            <p className="blog-eyebrow">BACK ISSUES</p>
            <h2 id="archive-index-heading">연도별 아카이브</h2>
            {years.length ? (
              <ol>
                {years.map((year) => (
                  <li key={year}>
                    <Link href={`#archive-${year}`}>
                      <span>{year}</span>
                      <span className="blog-index-block__count">{String(sorted.filter((article) => article.publishedAt.startsWith(year)).length).padStart(2, "0")}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : <p className="blog-index-block__empty">공개된 글이 생기면 연도별로 모아 보여드립니다.</p>}
          </section>
        </aside>
      </section>

      <section className="blog-index-section" aria-labelledby="category-index-title">
        <div className="blog-grid">
          <header className="col-span-12 lg:col-span-3">
            <p className="blog-eyebrow">02 <span aria-hidden="true">/</span> SUBJECT INDEX</p>
            <h2 id="category-index-title" className="blog-index-section__title">주제별로<br />읽기</h2>
            <p className="blog-index-section__intro">관심 있는 주제를 골라 관련 글을 찾아보세요.</p>
          </header>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            {categories.map((category, index) => (
              <section key={category.slug} id={`category-${category.slug}`} className="blog-category-section" aria-labelledby={`category-heading-${category.slug}`}>
                <div className="blog-category-section__heading">
                  <span className="blog-category-section__number">{String(index + 1).padStart(2, "0")}</span>
                  <h3 id={`category-heading-${category.slug}`}>{category.label}</h3>
                  <span className="blog-category-section__count">{String(category.articles.length).padStart(2, "0")} ARTICLES</span>
                </div>
                {category.articles.length ? (
                  <ol className="blog-archive-list">
                    {category.articles.map((article) => (
                      <li key={article.slug}>
                        <Link href={`/blog/${article.slug}`}>
                          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                          <span>{article.title}</span>
                          <span className="blog-archive-list__arrow" aria-hidden="true">↗</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="blog-category-section__empty">아직 공개된 글이 없습니다.</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-archive-section" aria-labelledby="archive-title">
        <div className="blog-grid">
          <header className="col-span-12 lg:col-span-3">
            <p className="blog-eyebrow">03 <span aria-hidden="true">/</span> BACK ISSUES</p>
            <h2 id="archive-title" className="blog-index-section__title">연도별<br />아카이브</h2>
          </header>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            {years.length ? years.map((year) => {
              const yearArticles = sorted.filter((article) => article.publishedAt.startsWith(year));
              return (
                <section key={year} id={`archive-${year}`} className="blog-year-section" aria-labelledby={`archive-heading-${year}`}>
                  <div className="blog-year-section__heading">
                    <h3 id={`archive-heading-${year}`}>{year}</h3>
                    <span>{String(yearArticles.length).padStart(2, "0")} STORIES</span>
                  </div>
                  <ol className="blog-archive-list">
                    {yearArticles.map((article) => (
                      <li key={article.slug}>
                        <Link href={`/blog/${article.slug}`}>
                          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                          <span>{article.title}</span>
                          <span className="blog-archive-list__arrow" aria-hidden="true">↗</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            }) : (
              <p className="blog-archive-empty">아직 아카이브에 등록된 글이 없습니다. 첫 글이 발행되면 이곳에서 연도별로 찾아볼 수 있습니다.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
