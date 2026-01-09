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
          월급 계산기
        </Link>

        <Link href="/hourly" className="block card">
          시급 계산기 (주휴 포함)
        </Link>

        {/* ✅ 추가: 프리랜서 계산기 */}
        <Link href="/freelance" className="block card">
          프리랜서 3.3% 실수령액 계산기
        </Link>

        <Link href="/compare" className="block card">
          근로자 vs 프리랜서 비교
        </Link>

        <Link href="/hourly-multi" className="block card">
          사장님용 시급 계산기 (여러 명)
        </Link>

        <Link href="/burden" className="block card">
          상환부담률 계산기
        </Link>
      </div>
    </main>
  );
}
