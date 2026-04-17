import Link from "next/link";

export default function LifePage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-12 mb-20">
      <section className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 not-italic">라이프 계산기</h1>
        <p className="text-gray-500 text-sm mt-2 not-italic">당신이 계산하고 싶은 모든 것</p>
      </section>

      {/* 건강·저속노화 섹션 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">건강 · 저속노화</h2>
        
        <div className="flex flex-col gap-3">
          {/* 생체 나이 */}
          <Link href="/life/body-age" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">내 몸 나이 (생체 나이)</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">생활 습관 기반 나의 생물학적 나이 측정</p>
            </div>
          </Link>

          {/* BMI 계산기 */}
          <Link href="/life/bmi" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">BMI 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">신체 지표를 통한 비만도 및 건강 상태 체크</p>
            </div>
          </Link>

          {/* 🔥 키빼몸: 경로를 /life/kbm 으로 확실하게 수정했습니다! */}
          <Link href="/life/kbm" className="block p-7 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">키빼몸 · 미용 몸무게</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">나의 키에 맞는 가장 예쁘고 건강한 체중 확인</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 학업·자기관리 섹션 */}
      <section className="space-y-4">
        <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase not-italic">학업 · 자기관리</h2>
        
        <div className="flex flex-col gap-3">
          {/* 학점 계산기 */}
          <Link href="/life/grade" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">학점 계산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">4.5 / 4.3 만점 기준 과목별 성적 산출</p>
            </div>
          </Link>

          {/* 인생 낭비 환산기 */}
          <Link href="/life/wast-time" className="block p-7 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-900 text-lg not-italic">인생 낭비 환산기</h3>
              <p className="text-gray-400 text-sm mt-1.5 not-italic">무심코 버려지는 시간의 기회비용 확인</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}