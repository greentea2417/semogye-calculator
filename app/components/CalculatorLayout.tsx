"use client";

import { useEffect, type ReactNode } from "react";
import PageTitle from "./PageTitle";
import AccordionFAQ from "./AccordionFAQ";
import CalculatorJsonLd from "./CalculatorJsonLd";

type FAQItem = { q: string; a: string };

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
  useEffect(() => {
    document.title = `${title} | 세모계`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", subtitle ?? "세모계 계산기");
  }, [title, subtitle]);

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

      <AccordionFAQ title={faqTitle} items={faqItems} />
    </main>
  );
}
