// app/sitemap.ts
// 앱 라우트를 빌드 시점에 스캔해 정식 URL만 사이트맵에 담는다.
// - 옛 최상위 중복 경로(/salary 등)는 /business/* 정식 경로가 있으면 제외
// - 유틸/관리/도구 경로는 제외
// 크론이 새 계산기를 추가해도 자동으로 사이트맵에 반영된다.
import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://semogye.com").replace(/\/+$/, "");
const APP_DIR = path.join(process.cwd(), "app");

// 사이트맵에서 제외할 최상위 세그먼트 (색인 불필요한 유틸/관리/도구 페이지)
const EXCLUDE_TOP = new Set(["api", "admin", "icon", "rag", "owner-cost-mvp"]);

function collectRoutes(): string[] {
  const routes: string[] = [];

  function walk(dir: string, segments: string[]) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
      routes.push(segments.length ? "/" + segments.join("/") : "/");
    }

    for (const e of entries) {
      if (!e.isDirectory()) continue;
      // 라우트 그룹 (group), 동적 [param], 병렬 @slot, 숨김/프라이빗 _dir 제외
      if (/^[([@_.]/.test(e.name)) continue;
      if (segments.length === 0 && EXCLUDE_TOP.has(e.name)) continue;
      walk(path.join(dir, e.name), [...segments, e.name]);
    }
  }

  walk(APP_DIR, []);
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const all = collectRoutes();
  const set = new Set(all);

  // 최상위 /X 가 /business/X 로도 존재하면, 최상위(중복/리다이렉트 대상)는 색인에서 제외
  const canonical = all.filter((r) => {
    const seg = r.split("/").filter(Boolean);
    if (seg.length === 1 && set.has(`/business/${seg[0]}`)) return false;
    return true;
  });

  return canonical.sort().map((p) => ({
    url: `${SITE_URL}${p === "/" ? "" : p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
}
