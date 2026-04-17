import Link from "next/link";

export default function BusinessPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-12 mb-20">
      <section className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 not-italic">비즈니스 · 금융</h1>
        <p className="text-gray-500 text-sm mt-2 not-italic">당신이 계산하고 싶은 모든 것</p>
      </section>

      {/* 1. 사장님 필수 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">사장님 필수</h2>
        <div className="flex flex-col gap-3">
          <Link href="/business/margin" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">사장님 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">판매가 대비 수익과 마진율 확인</p>
            </div>
          </Link>
          <Link href="/business/hourly" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">사장님용 시급 계산</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">알바생 급여를 한 번에 정산</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 2. 급여 및 정산 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">급여 및 정산</h2>
        <div className="flex flex-col gap-3">
          <Link href="/business/salary" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">월급 실수령액</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">세후 실지급액 확인</p>
            </div>
          </Link>
          <Link href="/business/bonus" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">상여금 보너스</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">보너스 세후 수령액</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. 알바 · 프리랜서 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">알바 · 프리랜서</h2>
        <div className="flex flex-col gap-3">
          {/* 폴더명이 freelancer 인 것을 확인했습니다 */}
          <Link href="/business/freelancer" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">프리랜서 3.3%</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">소득세 3.3% 제외 실지급액</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}