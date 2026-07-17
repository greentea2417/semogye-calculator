// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://semogye.com").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/", // 홈
    "/salary",
    "/hourly",
    "/hourly-multi",
    "/compare",
    "/freelance",
    "/burden",
    "/rag",
    "/retirement",
    "/annual",
    "/unemployment",
    "/business/overtime-pay",
    "/business/jeonse-wolse",
    "/life/water-intake",
    "/privacy",
    "/terms",
    "/contact",
    "/about",
    "/faq",
  ];

  return staticRoutes.map((path) => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;

    return {
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.8,
    };
  });
}
