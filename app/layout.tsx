import Script from 'next/script';
import "./globals.css"; 

// 1. 경로 수정: app 폴더 안에 있으니 ./ 로 시작
// 2. 파일명 수정: 사진 속 소문자 파일명 footer 반영
import Footer from "./components/footer";

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
          strategy="afterInteractive"
        />
      </head>
      
      <body className="bg-gray-50 text-gray-900 antialiased font-sans tracking-tighter min-h-screen flex flex-col">
        
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 하단 푸터 */}
        <Footer />
        
      </body>
    </html>
  );
}