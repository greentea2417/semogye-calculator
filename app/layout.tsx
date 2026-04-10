import type { Metadata } from "next";
import "../globals.css";
import ToastHost from "./components/ToastHost";
import HomeLink from "./components/HomeLink";

// [SEO] 어제 정한 멋진 슬로건을 여기에 녹였습니다!
export const metadata: Metadata = {
  title: "세모계 | 계산하고 싶은 모든 것",
  description: "8년 차 광고 디자인 감각으로 설계한 가장 정갈하고 정확한 계산기. 직장인, 프리랜서, 대학생을 위한 모든 계산을 담았습니다.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta
          name="naver-site-verification"
          content="1a5acd7bca43d938b1312e19c2fb3677332e3a02"
        />
      </head>

      <body className="bg-gray-50 text-gray-900 antialiased">
        {/* 홈으로 가기 링크 */}
        <HomeLink />
        
        {/* 실제 페이지 내용 */}
        {children}
        
        {/* 알림 토스트 호스트 */}
        <ToastHost />
      </body>
    </html>
  );
}