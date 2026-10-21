import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BLOG_CATEGORIES, type BlogArticle, type BlogCategory } from "./data";
import { CALCULATOR_LINKS } from "./calculatorRoutes";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const CATEGORY_SLUGS = new Set<string>(BLOG_CATEGORIES.map((category) => category.slug));
const CONTENT_TYPES = new Set(["news", "explainer"]);
const STATUSES = new Set(["published", "draft"]);

function fail(file: string, message: string): never {
  throw new Error(`[blog content] ${path.relative(process.cwd(), file)}: ${message}`);
}

function requireString(value: unknown, name: string, file: string): string {
  if (typeof value !== "string" || !value.trim()) fail(file, `필수값 '${name}'이 없거나 문자열이 아닙니다.`);
  return value.trim();
}

function validDate(value: unknown, name: string, file: string): string {
  const text = requireString(value, name, file);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) fail(file, `'${name}'은 YYYY-MM-DD 형식이어야 합니다.`);
  const date = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) fail(file, `'${name}' 날짜가 유효하지 않습니다: ${text}`);
  return text;
}

function validateLocalImage(value: unknown, name: string, file: string): string | undefined {
  if (value == null || value === "") return undefined;
  const image = requireString(value, name, file);
  if (!image.startsWith("/blog/") || image.includes("..") || image.includes("\\")) fail(file, `'${name}'은 /blog/ 아래의 로컬 이미지 경로여야 합니다.`);
  const fullPath = path.resolve(PUBLIC_DIR, `.${image}`);
  if (!fullPath.startsWith(`${path.resolve(PUBLIC_DIR)}${path.sep}`) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) fail(file, `'${name}' 이미지 파일을 public${image}에서 찾을 수 없습니다.`);
  return image;
}

function validateSources(value: unknown, file: string): BlogArticle["sources"] {
  if (!Array.isArray(value)) fail(file, "'sources'는 label과 http(s) URL을 가진 목록이어야 합니다. 출처가 없으면 []로 명시하세요.");
  return value.map((source, index) => {
    if (!source || typeof source !== "object") fail(file, `sources[${index}] 형식이 잘못되었습니다.`);
    const item = source as Record<string, unknown>;
    const label = requireString(item.label, `sources[${index}].label`, file);
    const url = requireString(item.url, `sources[${index}].url`, file);
    let parsed: URL;
    try { parsed = new URL(url); } catch { return fail(file, `sources[${index}].url이 올바른 URL이 아닙니다.`); }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") fail(file, `sources[${index}].url은 http 또는 https만 허용합니다.`);
    return { label, url };
  });
}

function validateRelatedCalculator(value: unknown, file: string): BlogArticle["calculator"] {
  if (value == null || value === false) return undefined;
  if (!value || typeof value !== "object") fail(file, "'relatedCalculator'는 계산기 정보 객체 또는 null이어야 합니다.");
  const item = value as Record<string, unknown>;
  const href = requireString(item.href, "relatedCalculator.href", file);
  if (!(href in CALCULATOR_LINKS)) fail(file, `존재하지 않거나 허용되지 않은 계산기 URL입니다: ${href}`);
  const pagePath = path.join(process.cwd(), "app", ...href.slice(1).split("/"), "page.tsx");
  if (!fs.existsSync(pagePath)) fail(file, `계산기 URL ${href}에 대응하는 app route page.tsx가 없습니다.`);
  return {
    href,
    title: requireString(item.title, "relatedCalculator.title", file),
    description: requireString(item.description, "relatedCalculator.description", file),
    cta: requireString(item.cta, "relatedCalculator.cta", file),
  };
}

function validateMarkdownImages(markdown: string, file: string) {
  const pattern = /!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g;
  for (const match of markdown.matchAll(pattern)) {
    validateLocalImage(match[1], "본문 이미지", file);
  }
}

function parseArticle(file: string): BlogArticle & { status: "published" | "draft" } {
  let parsed: matter.GrayMatterFile<string>;
  try { parsed = matter(fs.readFileSync(file, "utf8")); } catch (error) { fail(file, `frontmatter/Markdown 파싱 실패: ${error instanceof Error ? error.message : String(error)}`); }
  const data = parsed.data as Record<string, unknown>;
  const title = requireString(data.title, "title", file);
  const slug = requireString(data.slug, "slug", file);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(file, "'slug'은 영문 소문자, 숫자, 하이픈만 사용하세요.");
  const description = requireString(data.description, "description", file);
  const category = requireString(data.category, "category", file);
  if (!CATEGORY_SLUGS.has(category)) fail(file, `허용되지 않은 category입니다: ${category}`);
  const contentType = requireString(data.contentType, "contentType", file);
  if (!CONTENT_TYPES.has(contentType)) fail(file, "contentType은 news 또는 explainer여야 합니다.");
  const publishedAt = validDate(data.publishedAt, "publishedAt", file);
  const updatedAt = validDate(data.updatedAt, "updatedAt", file);
  if (updatedAt < publishedAt) fail(file, "updatedAt은 publishedAt보다 빠를 수 없습니다.");
  const status = requireString(data.status, "status", file);
  if (!STATUSES.has(status)) fail(file, "status는 published 또는 draft여야 합니다.");
  const image = validateLocalImage(data.image, "image", file);
  const imageAlt = data.imageAlt == null || data.imageAlt === "" ? undefined : requireString(data.imageAlt, "imageAlt", file);
  const imageCredit = data.imageCredit == null || data.imageCredit === "" ? undefined : requireString(data.imageCredit, "imageCredit", file);
  if (image && !imageAlt) fail(file, "image가 있으면 imageAlt를 입력해야 합니다.");
  if (image && !imageCredit) fail(file, "image가 있으면 권리/출처 확인을 위해 imageCredit을 입력해야 합니다.");
  if (imageCredit && !image) fail(file, "imageCredit을 입력했다면 image도 지정하세요.");
  validateMarkdownImages(parsed.content, file);
  if (!parsed.content.trim()) fail(file, "Markdown 본문이 비어 있습니다.");
  return {
    slug, title, description, summary: description, category: category as BlogCategory,
    contentType: contentType as "news" | "explainer", status: status as "published" | "draft",
    publishedAt, updatedAt, image, imageAlt, imageSource: imageCredit,
    sources: validateSources(data.sources, file), calculator: validateRelatedCalculator(data.relatedCalculator, file),
    body: parsed.content.trim(),
  };
}

const markdownFiles = fs.existsSync(CONTENT_DIR)
  ? fs.readdirSync(CONTENT_DIR).filter((name) => name.endsWith(".md")).sort().map((name) => path.join(CONTENT_DIR, name))
  : [];
const allArticles = markdownFiles.map((file) => parseArticle(file));
const seenSlugs = new Map<string, string>();
for (const article of allArticles) {
  const previous = seenSlugs.get(article.slug);
  if (previous) fail(path.join(CONTENT_DIR, `${article.slug}.md`), `slug '${article.slug}'이 중복되었습니다. 기존 파일: ${path.relative(process.cwd(), previous)}`);
  seenSlugs.set(article.slug, path.join(CONTENT_DIR, `${article.slug}.md`));
}

export const blogArticles: BlogArticle[] = allArticles
  .filter((article) => article.status === "published")
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const draftSlugs = allArticles.filter((article) => article.status === "draft").map((article) => article.slug);
