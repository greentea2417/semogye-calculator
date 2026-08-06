import type { Metadata } from "next";

// 관리자 도구 페이지는 검색엔진·애드센스 심사에서 제외 (색인 금지)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
