import Script from 'next/script';
import "./globals.css"; 

export const metadata = {
  title: "세모계 - 세상의 모든 계산기",
  description: "당신이 계산하고 싶은 모든 것",
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
        
        {/* 구글 애드센스 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1553908888516512"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      
      <body className="bg-gray-50 text-gray-900 antialiased font-sans tracking-tighter min-h-screen">
        
        {/* 메인 콘텐츠 */}
        {children}
        
      </body>
    </html>
  );
}