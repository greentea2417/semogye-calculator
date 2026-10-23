import { Children, type ReactNode } from "react";

type AdPlacement = "listing-sidebar" | "article-inline" | "article-sidebar" | "article-bottom";

/**
 * Empty editorial ad slots stay out of the rendered page. Add a configured ad unit
 * as children only when monetization is intentionally enabled for this placement.
 */
export default function AdSlot({
  placement,
  children,
}: {
  placement: AdPlacement;
  children?: ReactNode;
}) {
  if (Children.count(children) === 0) return null;

  return (
    <aside className="blog-ad-slot" aria-label="광고" data-ad-placement={placement}>
      <p className="blog-ad-slot__label">ADVERTISEMENT · 광고</p>
      <div className="blog-ad-slot__creative">{children}</div>
    </aside>
  );
}
