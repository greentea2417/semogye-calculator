import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-extrabold text-lg tracking-tight text-gray-900 not-italic">
            세모계
          </span>
          <Link
            href="/business"
            className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            계산 시작하기
          </Link>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0) 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide not-italic mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            사장님을 위한 계산기
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-900 leading-[1.1] not-italic">
            복잡한 계산은
            <br />
            <span className="text-blue-600">세모계</span>가 합니다
          </h1>

          <p className="mt-6 text-lg text-gray-500 max-w-lg not-italic leading-relaxed">
            급여, 주휴수당, 세금까지. 사장님이 직접 계산할 필요 없이
            <br className="hidden md:block" />
            자동으로 정확하게 계산해드려요.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/business"
              className="px-7 py-3.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              비즈니스 계산기 시작하기 →
            </Link>
            <Link
              href="/life"
              className="px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              라이프 계산기 보기
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-400 not-italic">
            회원가입 없이 무료로 바로 이용 가능
          </p>
        </div>
      </section>

      {/* 제품 미리보기: 브라우저 목업 */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/10 overflow-hidden bg-white">
          <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
            <span className="ml-3 text-[11px] text-gray-400 not-italic">semogye.com/business/salary</span>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900 not-italic">월급 계산기</h2>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full not-italic">
                실시간 계산
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-500">기본급</span>
                <span className="text-gray-900 font-semibold">3,000,000원</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-500">주휴수당</span>
                <span className="text-gray-900 font-semibold">240,000원</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-900 font-bold">실수령액</span>
                <span className="text-blue-600 font-extrabold text-xl">3,240,000원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 그리드 */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5 not-italic">자동 계산</h3>
            <p className="text-sm text-gray-500 not-italic leading-relaxed">
              숫자만 입력하면 급여·세금까지 자동으로 계산돼요.
            </p>
          </div>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5 not-italic">최신 기준 반영</h3>
            <p className="text-sm text-gray-500 not-italic leading-relaxed">
              최저임금, 주휴수당 등 최신 노동법 기준을 따라가요.
            </p>
          </div>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5 not-italic">사장님 맞춤</h3>
            <p className="text-sm text-gray-500 not-italic leading-relaxed">
              소상공인 현실에 맞춘 도구만 모았어요.
            </p>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic mb-6">
          카테고리 선택
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/business"
            className="group block p-7 bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg not-italic group-hover:text-blue-600 transition-colors">
                비즈니스 · 금융
              </h3>
              <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all not-italic">
                →
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2 not-italic">
              사장님부터 직장인까지 꼭 필요한 정산 도구
            </p>
          </Link>

          <Link
            href="/life"
            className="group block p-7 bg-white rounded-2xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg not-italic group-hover:text-green-600 transition-colors">
                라이프 · 건강
              </h3>
              <span className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all not-italic">
                →
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2 not-italic">
              일상의 가치를 숫자로 환산하는 도구
            </p>
          </Link>
        </div>
      </section>

      {/* 클로징 CTA */}
      <section className="bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white not-italic">
            지금 바로 계산해보세요
          </h2>
          <p className="mt-4 text-gray-400 not-italic">
            가입도, 결제도 필요 없어요. 숫자만 입력하면 끝.
          </p>
          <Link
            href="/business"
            className="inline-block mt-8 px-8 py-3.5 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            비즈니스 계산기 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
