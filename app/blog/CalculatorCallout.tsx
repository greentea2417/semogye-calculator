import Link from "next/link";
import { CALCULATOR_LINKS } from "./calculatorRoutes";

export default function CalculatorCallout({ href, title, description, cta }: { href: string; title: string; description: string; cta: string }) {
  if (!href.startsWith("/") || href.startsWith("//") || !CALCULATOR_LINKS[href]) return null;
  return (
    <aside className="my-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6" aria-label="관련 계산기">
      <p className="text-xs font-bold tracking-wide text-blue-700">세모계 계산기</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <Link href={href} data-calculator-click={href} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">{cta} <span className="ml-1" aria-hidden="true">→</span></Link>
    </aside>
  );
}
