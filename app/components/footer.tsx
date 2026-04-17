import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-gray-50 mt-20">
      <div className="max-w-2xl mx-auto px-5">
        <div className="flex flex-col items-center justify-center space-y-4">
          
          {/* 푸터 링크들 */}
          <nav className="flex items-center gap-6">
            <Link 
              href="/privacy" 
              className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors not-italic font-medium"
            >
              개인정보처리방침
            </Link>
            {/* 필요시 추가 링크 (예: 이용약관) */}
            {/* <Link href="/terms" className="text-[12px] text-gray-400 hover:text-gray-600 not-italic">이용약관</Link> */}
          </nav>

          {/* 카피라이트 */}
          <p className="text-[10px] text-gray-300 tracking-widest uppercase not-italic">
            © 2026 SEMOGYE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}