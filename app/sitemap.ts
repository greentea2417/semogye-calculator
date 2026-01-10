// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://semogye.com";

/**
 * 세모계 사이트맵
 * - 정적 페이지: 여기 배열에 추가
 * - 동적 페이지: 아래 TODO 부분에 데이터 소스 연결해서 확장
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ✅ 여기에 "실제로 존재하는" 대표 경로들만 넣어줘
  // (지금 당장 대충 넣지 말고, 네 사이트에 있는 것만!)
  const staticRoutes = [
    "/", // 홈
    // "/salary",
    // "/vat",
    // "/withholding",
    // "/dutchpay",
    // "/severance",
    // "/loan",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  /**
   * ✅ TODO (나중에 필요하면)
   * 동적 라우트가 있다면 여기에서 생성:
   * 예) const slugs = await fetch(...) or DB ...
   * const dynamicEntries = slugs.map((slug)=>({...}))
   */

  return [
    ...staticEntries,
    // ...dynamicEntries,
  ];
}
