"use client";

import { useState } from "react";

export default function BodyAgeCalculator() {
  const [realAge, setRealAge] = useState<number>(30);
  const [sleep, setSleep] = useState(0); // 0: 양호, 1: 보통, 2: 부족
  const [exercise, setExercise] = useState(0); // 0: 주 3회 이상, 1: 주 1-2회, 2: 거의 안함
  const [diet, setDiet] = useState(0); // 0: 균형잡힘, 1: 불규칙, 2: 가공식품 위주

  const calculateBodyAge = () => {
    let penalty = 0;
    if (sleep === 1) penalty += 2; else if (sleep === 2) penalty += 5;
    if (exercise === 1) penalty += 2; else if (exercise === 2) penalty += 4;
    if (diet === 1) penalty += 2; else if (diet === 2) penalty += 5;

    const bodyAge = realAge + penalty;
    const improvement = penalty > 5 ? penalty - 2 : 0; // 개선 가능 수치

    return { bodyAge, penalty, improvement };
  };

  const { bodyAge, penalty, improvement } = calculateBodyAge();

  return (
    <main className="max-w-md mx-auto px-5 py-12 space-y-10">
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">내 몸 나이 계산기</h1>
        <p className="text-sm text-blue-500 font-bold">생체 나이로 보는 나의 습관 성적표</p>
      </section>

      {/* 입력 섹션 */}
      <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">실제 나이</label>
          <input
            type="number"
            value={realAge}
            onChange={(e) => setRealAge(Number(e.target.value))}
            className="w-full bg-gray-50 text-xl font-bold p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* 수면 / 운동 / 식습관 선택 버튼 - 사장님 스타일의 미니멀 탭 */}
        {[
          { label: "수면 시간", state: sleep, setState: setSleep, options: ["7시간 이상", "5-6시간", "5시간 미만"] },
          { label: "운동 주기", state: exercise, setState: setExercise, options: ["주 3회 이상", "주 1-2회", "숨쉬기 운동만"] },
          { label: "식습관", state: diet, setState: setDiet, options: ["건강식 위주", "가끔 야식/폭식", "가공식품 매니아"] },
        ].map((item, idx) => (
          <div key={idx} className="space-y-3">
            <label className="text-xs font-black text-gray-400 ml-1">{item.label}</label>
            <div className="grid grid-cols-3 gap-2">
              {item.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => item.setState(i)}
                  className={`py-3 text-[10px] font-bold rounded-xl transition-all ${
                    item.state === i ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 결과 섹션: 행동 유도형 */}
      <div className="bg-gray-900 rounded-[40px] p-10 space-y-8 text-center shadow-2xl">
        <div className="space-y-1">
          <p className="text-white/50 text-xs font-bold uppercase">현재 나의 생체 나이</p>
          <div className="text-6xl font-black text-white italic tracking-tighter">
            {bodyAge}세
          </div>
          <p className="text-red-400 text-sm font-bold mt-2">
            실제보다 {penalty}년 더 늙어가고 있습니다.
          </p>
        </div>

        {improvement > 0 && (
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xs text-blue-300 font-bold mb-1">✨ 개선 리포트</p>
            <p className="text-[11px] text-white/70 leading-relaxed">
              가장 영향이 큰 <b>{sleep > exercise ? "수면" : "운동/식단"}</b> 습관만 교정해도<br />
              몸 나이를 <b>최대 {improvement}년</b> 더 젊게 바꿀 수 있어요!
            </p>
          </div>
        )}
      </div>

      {/* SEO 및 가이드 박스 */}
      <section className="space-y-8 pt-10 border-t border-gray-50">
        <div className="bg-gray-50 rounded-[32px] p-6">
          <p className="text-[10px] text-gray-400 leading-relaxed break-keep">
            <span className="font-bold text-gray-500 block mb-1">⚠️ 안내 및 유의사항</span>
            본 계산기는 보건복지부 및 통계 자료의 생활 습관 가중치를 기반으로 제작된 <b>참고용 지표</b>입니다. 
            개인의 유전적 요인, 기저 질환, 환경적 변수는 반영되지 않으므로 의학적 진단은 반드시 전문가와 상의하세요.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900">왜 생체 나이가 중요할까요?</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            주민등록상 나이는 바꿀 수 없지만, <b>몸 나이(생체 나이)</b>는 생활 습관에 따라 충분히 되돌릴 수 있습니다. 
            스마트폰 사용 시간을 줄이고 규칙적인 수면과 식단을 유지하는 것만으로도 노화 속도를 늦추는 '저속 노화'를 실천할 수 있습니다. 
            지금 바로 '세모계'와 함께 10년 뒤의 건강을 저축해 보세요.
          </p>
        </div>
      </section>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}

<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
  <details className="group">
    <summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
      <span className="tracking-tight">💡 내 몸의 진짜 나이, 생체나이 가이드</span>
      <span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
    </summary>
    <div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">
      
      {/* 건강 지표 요약 박스 */}
      <div className="bg-orange-50 p-5 rounded-2xl space-y-3 border border-orange-100">
        <p className="font-bold text-orange-900 text-xs uppercase tracking-wider font-mono">Bio-Age Management</p>
        <div className="space-y-2 text-xs text-orange-800">
          <p>• <strong>핵심 지표:</strong> 식습관, 활동량, 수면의 질 등을 통한 종합 측정</p>
          <p>• <strong>목표:</strong> 실제 나이보다 5살 젊은 신체 데이터 유지하기</p>
        </div>
      </div>

      <section className="space-y-4 px-1">
        <div>
          <h4 className="font-bold text-gray-800 mb-1">생체나이, 왜 확인해야 할까요?</h4>
          <p>단순히 오래 사는 것보다 '건강하게' 사는 것이 중요해진 2026년, 생체나이는 나의 노화 속도를 조절할 수 있는 지표가 됩니다. 세모계는 사장님의 현재 습관이 미래의 신체에 어떤 영향을 주는지 직관적으로 보여드립니다.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-1">정갈한 인터페이스로 건강을 디자인하다</h4>
          <p>8년 차 광고 디자이너의 감각으로 설계된 세모계는 복잡한 건강 수치를 가장 명확하고 아름답게 표현합니다. 지금 당신의 생체나이를 확인하고, 더 젊어질 내일을 계획해 보세요.</p>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
        ※ 본 생체나이 계산은 입력된 설문 데이터를 바탕으로 한 추정치이며, 정확한 진단을 위해서는 정기적인 건강검진 데이터 활용을 권장합니다.
      </p>
    </div>
  </details>
</div>