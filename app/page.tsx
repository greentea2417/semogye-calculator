import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-20">
      
      {/* 헤더 영역: items-center와 text-center로 완벽 중앙 정렬 */}
      <section className="flex flex-col items-center text-center mb-16">
        {/* italic 클래스를 삭제하고 font-bold만 남겼습니다 */}
        <h1 className="text-5xl font-bold text-gray-900 tracking-tighter not-italic">
          세모계
        </h1>
        <p className="text-gray-400 text-xs mt-3 tracking-[0.2em] uppercase not-italic">
          EVERYTHING IS CALCULABLE
        </p>
      </section>

      {/* 카테고리 선택 영역 */}
      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-gray-300 tracking-[0.3em] uppercase">
            카테고리 선택
          </span>
        </div>

        {/* 비즈니스·금융 카드 */}
        <Link href="/business" className="group block p-10 bg-gray-50 rounded-[40px] hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-gray-900 not-italic">
              비즈니스·금융
            </h2>
            <p className="text-gray-400 text-sm mt-2 not-italic">
              사장님부터 직장인까지 꼭 필요한 정산 도구
            </p>
          </div>
        </Link>

        {/* 라이프·건강 카드 */}
        <Link href="/life" className="group block p-10 bg-gray-50 rounded-[40px] hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-gray-900 not-italic">
              라이프·건강
            </h2>
            <p className="text-gray-400 text-sm mt-2 not-italic">
              일상의 가치를 숫자로 환산하는 도구
            </p>
          </div>
        </Link>
      </div>

      {/* 하단 카피라이트 */}
      <footer className="mt-20">
        <p className="text-[10px] text-gray-300 tracking-[0.2em] uppercase not-italic">
          DESIGNED BY GREENTEA • 2026
        </p>
      </footer>
    </main>
  );
}