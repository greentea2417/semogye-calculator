import type { ReactNode } from "react";

export type ArticleSection = { heading: string; body: ReactNode };

/**
 * 계산기 하단에 붙는 설명 본문(SEO/애드센스용 콘텐츠).
 * 계산 방법·법적 근거·예시·주의사항 등 고유 텍스트를 시맨틱 HTML로 렌더링합니다.
 */
export default function CalculatorArticle({ sections }: { sections: ArticleSection[] }) {
  if (!sections.length) return null;
  return (
    <section className="mt-6 rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 sm:p-8">
      <div className="space-y-7 text-sm leading-relaxed text-gray-600">
        {sections.map((s, i) => (
          <article key={i} className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">{s.heading}</h2>
            <div className="space-y-2">{s.body}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
