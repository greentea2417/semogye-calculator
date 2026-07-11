import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(96,165,250,0.22) 0%, rgba(96,165,250,0) 70%)",
          }}
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <span className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600 not-italic">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            사장님을 위한 계산기
          </span>

          <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 leading-[1.08] not-italic sm:text-5xl md:text-6xl font-['Pretendard_Variable',sans-serif]">
            복잡한 계산은
            <br />
            <span className="text-blue-600">세모계</span>가 합니다
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-500 not-italic sm:mt-6 sm:text-lg">
            급여, 주휴수당, 세금부터 생활 계산까지. 사장님이 직접 계산할 필요 없이
            <br className="hidden md:block" />
            필요한 계산만 빠르게 찾고 바로 확인할 수 있게 만들었어요.
          </p>

          <p className="mt-4 text-xs text-gray-400 not-italic">
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

      {/* 하단 설명 */}
      <section className="bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white not-italic">
            세모계는 계산을 쉽게 만드는 도구입니다
          </h2>
          <p className="mt-5 text-gray-400 not-italic leading-relaxed max-w-2xl mx-auto">
            급여, 세금, 생활, 건강까지. 필요한 계산만 빠르게 모아 정확하게 안내합니다.
            복잡한 계산을 줄이고, 사용자는 결과만 편하게 확인할 수 있도록 만들었습니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white">소개</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/contact" className="hover:text-white">문의사항</Link>
            <Link href="/privacy" className="hover:text-white">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-white">이용약관</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
