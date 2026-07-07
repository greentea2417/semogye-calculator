import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-16 md:py-24 space-y-20">
      {/* 히어로 섹션: 핵심 가치 제안 */}
      <section className="flex flex-col items-center text-center space-y-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide not-italic">
          사장님을 위한 계산기
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-snug not-italic">
          급여도, 주휴수당도, 세금도
          <br />
          <span className="text-blue-600">세모계</span> 하나로 끝
        </h1>

        <p className="text-gray-500 text-base max-w-md not-italic">
          복잡한 인건비 계산, 이제 사장님 대신 세모계가 해드릴게요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/business"
            className="px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            비즈니스 계산기 시작하기
          </Link>
          <Link
            href="/life"
            className="px-6 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            라이프 계산기 보기
          </Link>
        </div>
      </section>

      {/* 제품 미리보기 카드 */}
      <section className="fade-slide-up">
        <div className="card rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900 not-italic">월급 계산기</h2>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full not-italic">
              예시 화면
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">기본급</span>
              <span className="text-gray-900 font-medium">3,000,000원</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">주휴수당</span>
              <span className="text-gray-900 font-medium">240,000원</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-900 font-bold">실수령액</span>
              <span className="text-blue-600 font-bold">3,240,000원</span>
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 선택 영역 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">
          카테고리 선택
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/business"
            className="block p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group"
          >
            <h3 className="font-bold text-gray-900 text-base not-italic group-hover:text-blue-600 transition-colors">
              비즈니스 · 금융
            </h3>
            <p className="text-gray-400 text-xs mt-1 not-italic">
              사장님부터 직장인까지 꼭 필요한 정산 도구
            </p>
          </Link>

          <Link
            href="/life"
            className="block p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group"
          >
            <h3 className="font-bold text-gray-900 text-base not-italic group-hover:text-green-600 transition-colors">
              라이프 · 건강
            </h3>
            <p className="text-gray-400 text-xs mt-1 not-italic">
              일상의 가치를 숫자로 환산하는 도구
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
