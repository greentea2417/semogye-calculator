import Link from "next/link";
import type { ReactNode } from "react";
import { BLOG_CATEGORIES } from "./data";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-shell min-h-screen">
      <a className="blog-skip-link" href="#blog-main">본문으로 건너뛰기</a>
      <header className="blog-header">
        <div className="blog-header__inner blog-shell__container">
          <Link href="/blog" aria-label="세모계 저널 홈" className="blog-brand">
            <span className="blog-brand__wordmark" aria-hidden="true">SE—MO—GYE</span>
            <span className="blog-brand__name">세모계</span>
          </Link>
          <nav aria-label="주요 메뉴" className="blog-main-nav">
            <Link href="/business" className="blog-main-nav__link">계산기</Link>
            <Link href="/blog" aria-current="page" className="blog-main-nav__link blog-main-nav__link--current">저널</Link>
          </nav>
        </div>
        <nav aria-label="블로그 카테고리" className="blog-category-nav">
          <div className="blog-shell__container blog-category-nav__inner">
            {BLOG_CATEGORIES.map((category, index) => (
              <Link
                key={category.slug}
                href={`/blog#category-${category.slug}`}
                className="blog-category-nav__link"
              >
                <span className="blog-category-nav__index">{String(index + 1).padStart(2, "0")}</span>
                {category.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {children}
      <footer className="blog-footer">
        <div className="blog-shell__container blog-footer__inner">
          <div>
            <p className="blog-footer__wordmark">SE—MO—GYE / JOURNAL</p>
            <p className="blog-footer__tagline">숫자와 정보가 더 쉬워지는 곳</p>
          </div>
          <nav aria-label="세모계 정보" className="blog-footer__links">
            <Link href="/about">세모계 소개</Link>
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/contact">문의</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
