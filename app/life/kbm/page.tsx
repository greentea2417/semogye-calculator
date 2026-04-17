"use client";

import Link from "next/link";

const LIFE_TOOLS = [
  {
    category: "학업·자기계발",
    tools: [
      { title: "학점 계산기", description: "과목별 성적 입력 후 평균 평점 확인", href: "/life/grade" },
      { title: "인생 낭비 환산기", description: "스마트폰 사용 시간으로 본 인생의 기회비용", href: "/life/wast-time" },
    ],
  },
  {
    category: "건강·저속노화",
    tools: [
      { title: "내 몸 나이 (생체 나이)", description: "생활 습관 기반 나의 생물학적 나이 측정", href: "/life/body-age" },
      { title: "키빼몸·BMI", description: "신체 지표를 통한 권장 체질량 및 체중 체크", href: "/life/bmi" },
    ],
  },
];

export default function LifePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">라이프·건강</h1>
        <p className="text-sm text-gray-400 font-medium">일상의 가치를 숫자로 환산하는 도구</p>
      </section>

      <div className="space-y-16">
        {LIFE_TOOLS.map((group, idx) => (
          <section key={idx} className="space-y-8">
            <div className="flex items-center space-x-5">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{group.category}</span>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-1 gap-4 text-left">
              {group.tools.map((tool, tIdx) => (
                <Link key={tIdx} href={tool.href} className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-blue-600 transition-all duration-300 shadow-sm shadow-gray-200/20">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                      <p className="text-xs text-gray-400 font-medium">{tool.description}</p>
                    </div>
                    <span className="text-xl text-gray-200 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1 duration-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer className="pt-20 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}

<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
  <details className="group">
    <summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
      <span className="tracking-tight">💡 키빼몸 지수와 체형 관리 가이드</span>
      <span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
    </summary>
    <div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">
      
      {/* 체형 가이드 요약 박스 */}
      <div className="bg-teal-50 p-5 rounded-2xl space-y-3 border border-teal-100">
        <p className="font-bold text-teal-900 text-xs uppercase tracking-wider font-mono">Body Fit Guide</p>
        <div className="space-y-2 text-xs text-teal-800">
          <p>• <strong>키빼몸 110:</strong> 흔히 말하는 슬림한 '미용 체중' 지표</p>
          <p>• <strong>주의:</strong> 숫자보다는 근육과 지방의 밸런스(눈바디)가 핵심입니다.</p>
        </div>
      </div>

      <section className="space-y-4 px-1">
        <div>
          <h4 className="font-bold text-gray-800 mb-1">키빼몸, 어떻게 활용할까요?</h4>
          <p>2026년의 체중 관리는 단순한 감량을 넘어 '건강한 라인'을 만드는 데 집중합니다. 키빼몸 수치를 통해 현재 나의 위치를 파악하고, 무리한 다이어트 대신 혈당을 안정시키는 식단으로 탄탄한 몸매를 가꿔보세요.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-1">정갈한 디자인으로 만나는 나의 실루엣</h4>
          <p>8년 차 광고 디자이너의 감각으로 설계된 세모계는 당신의 신체 데이터를 가장 명확하고 정갈하게 표현합니다. 복잡한 수치 계산은 세모계에 맡기고, 당신의 변화하는 모습에만 집중하세요.</p>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
        ※ 키빼몸은 의학적 비만도 지표는 아니며, 개인의 골격과 근육량에 따라 같은 수치라도 체형이 다르게 보일 수 있습니다.
      </p>
    </div>
  </details>
</div>