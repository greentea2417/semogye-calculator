import type { Metadata } from "next";
import "./globals.css";
import ToastHost from "./components/ToastHost";
import HomeLink from "./components/HomeLink";

export const metadata: Metadata = {
  title: "세모계 | 계산하고 싶은 모든 것",
  description: "8년 차 광고 디자인 감각으로 설계한 가장 정갈하고 정확한 계산기.",
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
      {/* tracking-tighter 추가로 전 페이지 자간을 쫀득하게 설정 */}
      <body className="bg-gray-50 text-gray-900 antialiased font-sans tracking-tighter">
        <HomeLink />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}