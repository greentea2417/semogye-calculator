import Link from "next/link";
import { CALCULATOR_LINKS } from "./calculatorRoutes";

export default function CalculatorCallout({ href, title, description, cta }: { href: string; title: string; description: string; cta: string }) {
  if (!href.startsWith("/") || href.startsWith("//") || !CALCULATOR_LINKS[href]) return null;

  return (
    <aside className="blog-calculator-callout" aria-label="관련 계산기">
      <div>
        <p className="blog-eyebrow">SE—MO—GYE / TOOL</p>
        <h2>{title}</h2>
        <p className="blog-calculator-callout__description">{description}</p>
      </div>
      <Link href={href} data-calculator-click={href} className="blog-calculator-callout__link">
        {cta} <span aria-hidden="true">↗</span>
      </Link>
    </aside>
  );
}
