"use client";

import Link from "next/link";

export default function BusinessPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-12">
      {/* --- 상단 헤더 --- */}
      <section className="space-y-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">금융 계산기</h1>
        <p className="text-sm text-gray-400">전문적인 비즈니스 정산 도구 모음</p>
      </section>

      <div className="space-y-10">
        {/* 🏢 직장인 세션 */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Salary & Bonus</h2>
          <div className="grid gap-4">
            <Link href="/salary" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">월급 실수령액 계산기</h3>
              <p className="text-sm text-gray-400 mt-1">4대보험·소득세 제외 실제 수령액 확인</p>
            </Link>
            <Link href="/bonus" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">상여금·성과급 실수령액 계산기</h3>
              <p className="text-sm text-gray-400 mt-1">기본급 합산 시 세금 공제 후 실제 입금액</p>
            </Link>
          </div>
        </section>

        {/* ⏰ 시급 & 알바 세션 */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hourly & Part-time</h2>
          <div className="grid gap-4">
            <Link href="/hourly" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">시급 계산기 (주휴 포함)</h3>
              <p className="text-sm text-gray-400 mt-1">주휴수당 포함 월 예상 환산 급여</p>
            </Link>
            <Link href="/hourly-multi" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">사장님용 시급 계산기 (여러 명)</h3>
              <p className="text-sm text-gray-400 mt-1">직원별 주휴수당 및 월 급여 일괄 계산</p>
            </Link>
          </div>
        </section>

        {/* 💻 프리랜서 세션 */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Freelance</h2>
          <div className="grid gap-4">
            <Link href="/freelance" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">프리랜서 3.3% 실수령액 계산기</h3>
              <p className="text-sm text-gray-400 mt-1">사업소득 공제 후 실제로 받는 돈</p>
            </Link>
            <Link href="/compare" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">프리랜서·알바 소득 처리 확인</h3>
              <p className="text-sm text-gray-400 mt-1">나에게 유리한 소득 신고 방식 비교</p>
            </Link>
          </div>
        </section>

        {/* 📈 사업자 & 금융 세션 */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Business & Finance</h2>
          <div className="grid gap-4">
            <Link href="/profit" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">개인사업자 순이익 계산기</h3>
              <p className="text-sm text-gray-400 mt-1">매출액 대비 실질 영업이익 리포트</p>
            </Link>
            <Link href="/burden" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-gray-900 transition-all">
              <h3 className="font-bold text-lg text-gray-900">상환부담률 계산기</h3>
              <p className="text-sm text-gray-400 mt-1">대출 원리금 상환액 및 가계 부담 체크</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}