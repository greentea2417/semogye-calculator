"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">세모계 계산기</h1>
        <p className="text-gray-500 text-sm">
          월급·시급·대출까지,
          <br />
          복잡한 계산은 우리가 할게요
        </p>
      </section>

      <div className="space-y-4">
        <Link href="/salary" className="block card">
          월급 실수령액 계산기
        </Link>

        <Link href="/bonus" className="block card bg-blue-50/50 border-blue-100">
          상여금·성과급 실수령액 계산기
        </Link>

        <Link href="/hourly" className="block card">
          시급 계산기 (주휴 포함)
        </Link>

        {/* ✅ 추가: 프리랜서 계산기 */}
        <Link href="/freelance" className="block card">
          프리랜서 3.3% 실수령액 계산기
        </Link>

        <Link href="/compare" className="block card">
          프리랜서·알바 소득 처리 확인
        </Link>

        <Link href="/hourly-multi" className="block card">
          사장님용 시급 계산기 (여러 명)
        </Link>
        <Link href="/profit" className="block p-6 bg-white border rounded-xl shadow-sm hover:border-gray-900 transition-colors">
          <h3 className="font-bold text-lg text-gray-900">개인사업자 순이익 계산기</h3>
          <p className="text-sm text-gray-400 mt-1">매출액 대비 실질 영업이익 리포트</p>
        </Link>
        <Link href="/burden" className="block card">
          상환부담률 계산기
        </Link>
      </div>
    </main>
  );
}
