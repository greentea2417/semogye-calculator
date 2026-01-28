import "./globals.css";
import ToastHost from "./components/ToastHost";
import HomeLink from "./components/HomeLink";

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

      <body className="bg-gray-50 text-gray-900">
        {/* 홈으로 가기 링크 */}
        <HomeLink />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
