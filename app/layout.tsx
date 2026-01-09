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
      <body className="bg-gray-50 text-gray-900">
        {/* ⭐ 홈으로 가기 링크 */}
        <HomeLink />
        {children}
        <ToastHost />
        
      </body>
    </html>
  );
}

