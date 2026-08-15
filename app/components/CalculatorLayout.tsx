"use client";

import { type ReactNode } from "react";
import PageTitle from "./PageTitle";
import AccordionFAQ from "./AccordionFAQ";
import CalculatorJsonLd from "./CalculatorJsonLd";

type FAQItem = { q: string; a: string };

const RELATED: Record<string, { href: string; label: string }[]> = {
  "월급 계산기": [
    { href: "/business/hourly-multi", label: "사장님용 시급 계산기" },
    { href: "/business/net-salary", label: "월급 실수령액 계산기" },
    { href: "/business/prorated-salary", label: "월급 일할계산기" },
  ],
  "시급 계산기": [
    { href: "/business/hourly-multi", label: "사장님용 시급 계산기" },
    { href: "/business/weekly-holiday", label: "주휴수당 계산기" },
    { href: "/business/overtime-pay", label: "연장근로수당 계산기" },
  ],
  "사장님용 시급 계산기": [
    { href: "/business/hourly", label: "시급 계산기" },
    { href: "/business/net-salary", label: "월급 실수령액 계산기" },
    { href: "/business/weekly-holiday", label: "주휴수당 계산기" },
    { href: "/business/overtime-pay", label: "연장근로수당 계산기" },
  ],
  "월급 실수령액 계산기": [
    { href: "/business/hourly", label: "시급 계산기" },
    { href: "/business/freelance", label: "프리랜서 3.3% 계산기" },
    { href: "/business/prorated-salary", label: "월급 일할계산기" },
  ],
  "프리랜서 3.3% 계산기": [
    { href: "/business/freelance-backcalc", label: "프리랜서 3.3% 세전금액 역산 계산기" },
    { href: "/business/withholding-33", label: "원천세 3.3% 계산기" },
    { href: "/business/net-salary", label: "월급 실수령액 계산기" },
  ],
  "프리랜서 3.3% 세전금액 역산 계산기": [
    { href: "/business/freelance", label: "프리랜서 3.3% 계산기" },
    { href: "/business/withholding-33", label: "원천세 3.3% 계산기" },
    { href: "/business/compound", label: "복리 계산기" },
  ],
  "부가세 계산기": [
    { href: "/business/vat-reverse", label: "부가세 역산 계산기" },
    { href: "/business/simplified-vat", label: "간이과세자 부가세 계산기" },
    { href: "/business/vat-pre-notice", label: "부가세 예정고지 계산기" },
    { href: "/business/vat-included", label: "부가세 포함/제외 계산기" },
  ],
  "부가세 역산 계산기": [
    { href: "/business/vat", label: "부가세 계산기" },
    { href: "/business/supply-price", label: "공급가액 역산 계산기" },
    { href: "/business/vat-included", label: "부가세 포함/제외 계산기" },
  ],
  "예금 이자 계산기": [
    { href: "/business/savings", label: "적금 이자 계산기" },
    { href: "/business/compound", label: "복리 계산기" },
    { href: "/business/loan", label: "대출 이자 계산기" },
  ],
  "적금 이자 계산기": [
    { href: "/business/deposit", label: "예금 이자 계산기" },
    { href: "/business/compound", label: "복리 계산기" },
    { href: "/business/loan", label: "대출 이자 계산기" },
  ],
  "복리 계산기": [
    { href: "/business/deposit", label: "예금 이자 계산기" },
    { href: "/business/savings", label: "적금 이자 계산기" },
    { href: "/business/loan", label: "대출 이자 계산기" },
  ],
  "주휴수당 계산기": [
    { href: "/business/hourly", label: "시급 계산기" },
    { href: "/business/overtime-pay", label: "연장근로수당 계산기" },
    { href: "/business/night-pay", label: "야간수당 계산기" },
  ],
  "연장근로수당 계산기": [
    { href: "/business/hourly", label: "시급 계산기" },
    { href: "/business/night-pay", label: "야간수당 계산기" },
    { href: "/business/rest-day-pay", label: "휴일근로수당 계산기" },
  ],
  "휴일근로수당 계산기": [
    { href: "/business/overtime-pay", label: "연장근로수당 계산기" },
    { href: "/business/night-pay", label: "야간수당 계산기" },
    { href: "/business/hourly", label: "시급 계산기" },
  ],
  "야간수당 계산기": [
    { href: "/business/overtime-pay", label: "연장근로수당 계산기" },
    { href: "/business/rest-day-pay", label: "휴일근로수당 계산기" },
    { href: "/business/hourly", label: "시급 계산기" },
  ],
  "퇴직금 계산기": [
    { href: "/business/retirement-tax", label: "퇴직소득세 계산기" },
    { href: "/business/average-wage", label: "평균임금 계산기" },
    { href: "/business/unemployment", label: "실업급여 계산기" },
  ],
  "실업급여 계산기": [
    { href: "/business/retirement", label: "퇴직금 계산기" },
    { href: "/business/average-wage", label: "평균임금 계산기" },
    { href: "/business/annual", label: "연차수당 계산기" },
  ],
  "연차수당 계산기": [
    { href: "/business/annual-days", label: "연차 개수 계산기" },
    { href: "/business/average-wage", label: "평균임금 계산기" },
    { href: "/business/unemployment", label: "실업급여 계산기" },
  ],
  "BMI 계산기": [
    { href: "/life/body-fat", label: "체지방률 계산기" },
    { href: "/life/body-age", label: "신체 나이 계산기" },
    { href: "/life/percentage", label: "퍼센트 계산기" },
  ],
};

type Props = {
  tone?: "business" | "life";
  title: string;
  subtitle?: string;
  intro?: ReactNode;
  children: ReactNode;
  result: ReactNode;
  guide?: ReactNode;
  article?: ReactNode;
  faqTitle: string;
  faqItems: FAQItem[];
};

export default function CalculatorLayout({
  tone = "business",
  title,
  subtitle,
  intro,
  children,
  result,
  guide,
  article,
  faqTitle,
  faqItems,
}: Props) {
  const related = RELATED[title] ?? [];

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <CalculatorJsonLd name={title} description={subtitle} faqItems={faqItems} />
      <section className="mb-8">
        <PageTitle tone={tone} title={title} subtitle={subtitle} />
        {intro ? <div className="text-center text-sm leading-relaxed text-gray-500">{intro}</div> : null}
      </section>

      <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 sm:p-8">
        {children}
      </section>

      <section className="mt-6 rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30">
        {result}
      </section>

      {guide ? <section className="mt-6">{guide}</section> : null}

      {article ? article : null}

      {related.length ? (
        <section className="mt-6 rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30">
          <h2 className="text-sm font-semibold text-gray-900">관련 계산기</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <a key={item.href} href={item.href} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                {item.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <AccordionFAQ title={faqTitle} items={faqItems} />
    </main>
  );
}
