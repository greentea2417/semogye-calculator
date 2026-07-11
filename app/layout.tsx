import Script from 'next/script';
import "./globals.css";

export const metadata = {
  title: "세모계 - 세상의 모든 계산기",
  description: "생활, 급여, 세금, 자영업까지. 세상의 모든 계산을 더 정확하게.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 네이버 사이트 소유 확인 */}
        <meta
          name="naver-site-verification"
          content="1a5acd7bca43d938b1312e19c2fb3677332e3a02"
        />

        {/* 구글 애널리틱스 (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RK8M44P79P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RK8M44P79P');
          `}
        </Script>

        {/* 구글 애드센스 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1553908888516512"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.45)_0%,rgba(59,130,246,0.5)_28%,rgba(147,197,253,0.45)_55%,rgba(219,234,254,0.35)_75%,rgba(255,255,255,1)_92%)] text-gray-900 antialiased font-sans tracking-tighter">

        {/* 메인 콘텐츠 */}
        {children}

      </body>
    </html>
  );
}
