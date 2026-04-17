import type { Metadata } from "next";
import "./globals.css";
import ToastHost from "./components/ToastHost";
import HomeLink from "./components/HomeLink";

export const metadata: Metadata = {
  title: "세모계 | 세상의 모든 계산기",
  description: "광고 디자인 감각으로 설계한 가장 정갈하고 정확한 사장님 필수 계산 도구 모음.",
  icons: {
    icon: "/favicon.ico",
  },
  // 네이버 및 카톡 공유 시 나타나는 오픈 그래프 설정
  openGraph: {
    title: "세모계 | 세상의 모든 계산기",
    description: "사장님 계산기부터 대출부담률까지, 가장 정갈하고 정확한 계산기 서비스입니다.",
    url: "https://semogye.com",
    siteName: "세모계",
    locale: "ko_KR",
    type: "website",
  },
  // 네이버 검색 로봇을 위한 추가 설정
  robots: {
    index: true,
    follow: true,
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
      {/* tracking-tighter 추가로 전 페이지 자간을 쫀득하게 설정 */}
      <body className="bg-gray-50 text-gray-900 antialiased font-sans tracking-tighter">
        <HomeLink />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}