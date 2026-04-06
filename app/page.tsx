"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-5 py-10 space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">세모계 계산기</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          월급·시급·대출까지,
          <br />
          복잡한 계산은 우리가 할게요
        </p>
      </section>

      <div className="space-y-4">
        {/* 1. 월급 실수령액 */}
        <Link href="/salary" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">월급 실수령액 계산기</h3>
          <p className="text-sm text-gray-400 mt-1">4대보험·소득세 제외 실제 수령액 확인</p>
        </Link>

        {/* 2. 상여금/성과급 */}
        <Link href="/bonus" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">상여금·성과급 실수령액 계산기</h3>
          <p className="text-sm text-gray-400 mt-1">기본급 합산 시 세금 공제 후 실제 입금액</p>
        </Link>

        {/* 3. 시급 계산기 */}
        <Link href="/hourly" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">시급 계산기 (주휴 포함)</h3>
          <p className="text-sm text-gray-400 mt-1">주휴수당 포함 월 예상 환산 급여</p>
        </Link>

        {/* 4. 프리랜서 3.3% */}
        <Link href="/freelance" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">프리랜서 3.3% 실수령액 계산기</h3>
          <p className="text-sm text-gray-400 mt-1">사업소득 공제 후 실제로 받는 돈</p>
        </Link>

        {/* 5. 소득 처리 확인 */}
        <Link href="/compare" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">프리랜서·알바 소득 처리 확인</h3>
          <p className="text-sm text-gray-400 mt-1">나에게 유리한 소득 신고 방식 비교</p>
        </Link>

        {/* 6. 사장님용 시급 계산기 */}
        <Link href="/hourly-multi" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">사장님용 시급 계산기 (여러 명)</h3>
          <p className="text-sm text-gray-400 mt-1">직원별 주휴수당 및 월 급여 일괄 계산</p>
        </Link>

        {/* 7. 개인사업자 순이익 (SEO 최적화 버전) */}
        <Link href="/profit" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all border-gray-200">
          <h3 className="font-bold text-lg text-gray-900">개인사업자 순이익 계산기</h3>
          <p className="text-sm text-gray-400 mt-1">매출액 대비 실질 영업이익 리포트</p>
        </Link>

        {/* 8. 상환부담률 */}
        <Link href="/burden" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-all">
          <h3 className="font-bold text-lg text-gray-900">상환부담률 계산기</h3>
          <p className="text-sm text-gray-400 mt-1">대출 원리금 상환액 및 가계 부담 체크</p>
        </Link>
      </div>
    </main>
  );
}