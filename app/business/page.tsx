import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 space-y-16 mb-20">
      {/* 헤더 섹션 */}
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight text-gray-900 not-italic">
          세모계
        </h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase not-italic">
          당신이 계산하고 싶은 모든 것
        </p>
      </section>

      {/* 카테고리 선택 섹션 */}
      <section className="space-y-6">
        <h2 className="text-center text-[11px] font-bold text-gray-300 tracking-[0.3em] uppercase not-italic">
          카테고리 선택
        </h2>
        
        <div className="flex flex-col gap-4">
          {/* 비즈니스 · 금융 버튼 */}
          <Link 
            href="/business" 
            className="block p-10 bg-white rounded-[40px] border border-gray-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-2xl not-italic">비즈니스 · 금융</h3>
              <p className="text-gray-400 text-base mt-2 not-italic">사장님부터 직장인까지 꼭 필요한 정산 도구</p>
            </div>
          </Link>

          {/* 라이프 · 건강 버튼 */}
          <Link 
            href="/life" 
            className="block p-10 bg-white rounded-[40px] border border-gray-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-2xl not-italic">라이프 · 건강</h3>
              <p className="text-gray-400 text-base mt-2 not-italic">일상의 가치를 숫자로 환산하는 도구</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 푸터 로고 (선택 사항) */}
      <footer className="text-center pt-10">
        <p className="text-[10px] text-gray-300 tracking-widest uppercase not-italic">
          Designed by Greentea • 2026
        </p>
      </footer>
    </main>
  );
}