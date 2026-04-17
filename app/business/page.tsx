import Link from "next/link";

export default function BusinessPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-12 mb-20">
      <section className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight not-italic">비즈니스 · 금융</h1>
        <p className="text-gray-500 text-sm mt-2 not-italic">사장님을 위한 정갈한 계산 도구</p>
      </section>

      {/* 정산·세금 섹션 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">정산 · 세금</h2>
        
        <div className="flex flex-col gap-3">
          {/* 부가세 계산기 (폴더: vat) */}
          <Link href="/business/vat" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">부가세 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">매출액 기반 간편 부가세 및 공급가액 산출</p>
            </div>
          </Link>

          {/* 종합소득세 (폴더: income) */}
          <Link href="/business/income" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">종합소득세 예측</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">과세표준에 따른 예상 소득세 및 지방소득세 확인</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 이익·마진 섹션 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">이익 · 마진</h2>
        
        <div className="flex flex-col gap-3">
          {/* 마진율 계산기 (폴더: margin) */}
          <Link href="/business/margin" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">마진율 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">원가와 판매가 대비 순이익 및 마진율 분석</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}