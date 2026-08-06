import type { Metadata } from "next";

// 실험용 MVP 페이지 — 검색엔진·애드센스 심사에서 제외 (색인 금지)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OwnerCostMvpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
