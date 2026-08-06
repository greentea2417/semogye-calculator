type FAQItem = { q: string; a: string };

// FAQ 문구에 붙은 "Q. " / "A. " 접두어를 제거해 구조화 데이터에 넣는다.
function stripPrefix(s: string) {
  return String(s ?? "").replace(/^\s*[QA][.．:]\s*/, "").trim();
}

/**
 * 계산기 페이지용 구조화 데이터(JSON-LD).
 * - SoftwareApplication: 무료 웹 계산기 도구임을 검색엔진/생성형 AI에 알림
 * - FAQPage: 아코디언 FAQ를 리치 스니펫 대상으로 노출
 * CalculatorLayout에서 자동 주입되므로 개별 페이지는 손댈 필요가 없다.
 */
export default function CalculatorJsonLd({
  name,
  description,
  faqItems,
}: {
  name: string;
  description?: string;
  faqItems: FAQItem[];
}) {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    ...(description ? { description } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    provider: { "@type": "Organization", name: "세모계", url: "https://semogye.com" },
  };

  const faq =
    faqItems && faqItems.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((it) => ({
            "@type": "Question",
            name: stripPrefix(it.q),
            acceptedAnswer: { "@type": "Answer", text: stripPrefix(it.a) },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      {faq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      ) : null}
    </>
  );
}
