import Link from "next/link";

export default function LifePage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-12 mb-20">
      <section className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">라이프 계산기</h1>
      </section>

      {/* 건강 섹션 (분리 완료!) */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">건강 관리</h2>
        <div className="flex flex-col gap-3">
          <Link href="/life/body-age" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group text-center">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">내 몸 나이 (생체 나이)</h3>
            <p className="text-gray-400 text-sm mt-1.5">생활 습관 기반 생물학적 나이 측정</p>
          </Link>

          <Link href="/life/kbm" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group text-center">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">키빼몸 · 미용 몸무게</h3>
            <p className="text-gray-400 text-sm mt-1.5">내 키에 딱 예쁜 체중 확인</p>
          </Link>

          <Link href="/life/bmi" className="block p-8 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group text-center">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">BMI 계산기</h3>
            <p className="text-gray-400 text-sm mt-1.5">체질량 지수로 보는 비만도 체크</p>
          </Link>
        </div>
      </section>
    </main>
  );
}