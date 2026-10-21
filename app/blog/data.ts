export const BLOG_CATEGORIES = [
  { slug: "economy", label: "경제·금융" },
  { slug: "policy", label: "정부 정책" },
  { slug: "life", label: "사회·생활" },
  { slug: "health", label: "건강·의학" },
  { slug: "entertainment", label: "연예 이슈" },
  { slug: "sports", label: "스포츠 이슈" },
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]["slug"];

export type BlogArticle = {
  slug: string;
  contentType: "news" | "explainer";
  category: BlogCategory;
  title: string;
  description: string;
  summary: string;
  body: string;
  publishedAt: string;
  updatedAt: string;
  image?: string;
  imageAlt?: string;
  imageSource?: string;
  sources: { label: string; url: string }[];
  calculator?: { href: string; title: string; description: string; cta: string };
};

export function categoryLabel(category: BlogCategory) {
  return BLOG_CATEGORIES.find((item) => item.slug === category)?.label ?? "블로그";
}

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
