import Link from "next/link";

export default function HomePage() {
  return (
    // 전반적인 간격과 정렬 수정
    <main className="max-w-2xl mx-auto px-5 py-12 space-y-16 mb-24 min-h-screen flex flex-col justify-center">
      
      {/* 헤더 섹션: 중앙 정렬 및 이탤릭 완벽 제거 */}
      <section className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 not-italic">
          세모계
        </h1>
        {/* 영어 슬로건을 한글로 변경 */}
        <p className="text-gray-500 text-sm mt-3 tracking-wide not-italic">
          당신이 계산하고 싶은 모든 것
        </p>
      </section>

      {/* 카테고리 선택 영역: 호버 효과 복구 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">
          카테고리 선택
        </h2>
        
        <div className="flex flex-col gap-4">
          {/* 비즈니스·금융 카드 (호버 시 배경색 변경 및 쉐도우 추가) */}
          <Link href="/business" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-xl not-italic group-hover:text-blue-600 transition-colors">
                비즈니스 · 금융
              </h3>
              <p className="text-gray-400 text-sm mt-2 not-italic">
                사장님부터 직장인까지 꼭 필요한 정산 도구
              </p>
            </div>
          </Link>

          {/* 라이프·건강 카드 */}
          <Link href="/life" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-xl not-italic group-hover:text-green-600 transition-colors">
                라이프 · 건강
              </h3>
              <p className="text-gray-400 text-sm mt-2 not-italic">
                일상의 가치를 숫자로 환산하는 도구
              </p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}