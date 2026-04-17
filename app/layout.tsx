import Script from 'next/script';
import "./globals.css"; 

// 만약 아래 Footer 임포트에서 빨간 줄이 나면, 
// 파일 탐색기에서 components 폴더 안에 Footer.tsx가 있는지 확인해주세요!
import Footer from "../components/Footer";

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
        
        {/* 구글 애드센스 (ca-pub 번호는 사장님 계정 번호로 나중에 꼭 바꾸세요!) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-553908888516512"
          strategy="afterInteractive"
        />
      </head>
      
      {/* 사장님의 쫀득한 자간 스타일 유지 */}
      <body className="bg-gray-50 text-gray-900 antialiased font-sans tracking-tighter min-h-screen flex flex-col">
        
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 하단 푸터 (개인정보처리방침 링크 포함) */}
        <Footer />
        
      </body>
    </html>
  );
}