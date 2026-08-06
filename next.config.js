/** @type {import('next').NextConfig} */

// 옛 최상위 계산기 경로 → 정식 /business/* 경로 (중복 콘텐츠 제거용 영구 리다이렉트)
const DUP_SLUGS = [
  "salary",
  "hourly",
  "hourly-multi",
  "compare",
  "freelance",
  "burden",
  "retirement",
  "annual",
  "unemployment",
  "vat",
  "profit",
  "bonus",
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return DUP_SLUGS.map((slug) => ({
      source: `/${slug}`,
      destination: `/business/${slug}`,
      permanent: true,
    }));
  },
};

module.exports = nextConfig;
