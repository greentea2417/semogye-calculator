import Link from "next/link";

export default function BusinessPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-12 mb-20">
      <section className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 not-italic">비즈니스 · 금융</h1>
        <p className="text-gray-500 text-sm mt-2 not-italic">당신이 계산하고 싶은 모든 것</p>
      </section>

      {/* 사장님 필수 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">사장님 필수</h2>
        <div className="flex flex-col gap-3">
          <Link href="/profit" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">사장님 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">판매가 대비 수익과 마진율 확인</p>
            </div>
          </Link>
          <Link href="/hourly" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">사장님용 시급 계산</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">알바생 급여를 한 번에 정산</p>
            </div>
          </Link>
          <Link href="/burden" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">대출부담률 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">소득 대비 무리하지 않은 비용 체크</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 급여 및 정산 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">급여 및 정산</h2>
        <div className="flex flex-col gap-3">
          <Link href="/salary" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">월급 실수령액</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">세후 실지급액 확인</p>
            </div>
          </Link>
          <Link href="/bonus" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">상여금 보너스</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">보너스 세후 수령액</p>
            </div>
          </Link>
          <Link href="/compare" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">월급 vs 프리랜서</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">정규직과 3.3% 계약 비교</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 알바 · 프리랜서 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">알바 · 프리랜서</h2>
        <div className="flex flex-col gap-3">
          <Link href="/freelance" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">프리랜서 3.3%</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">소득세 3.3% 제외 실지급액</p>
            </div>
          </Link>
          <Link href="/hourly-multi" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">시급알바비</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">주휴수당 포함 예상 수령액</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}