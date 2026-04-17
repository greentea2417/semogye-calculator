import Link from "next/link";

export default function LifePage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-12 mb-20">
      <section className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 not-italic">라이프 계산기</h1>
        <p className="text-gray-500 text-sm mt-2 not-italic">당신이 계산하고 싶은 모든 것</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">건강 · 저속노화</h2>
        <div className="flex flex-col gap-3">
          {/* href="/life"로 되어있던 것을 "/life/kbm"으로 확실히 고쳤습니다 */}
          <Link href="/life/kbm" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">키빼몸 · 미용 몸무게</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">가장 예쁘고 건강한 체중 확인</p>
            </div>
          </Link>
          <Link href="/life/bmi" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">BMI 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">비만도 체크</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}