import { Suspense } from "react";
import FreelanceClient from "./FreelanceClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FreelanceClient />
    </Suspense>
  );
}

<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
  <details className="group">
    <summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
      <span className="tracking-tight">💡 3.3% 세금 계산과 프리랜서 정산 가이드</span>
      <span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
    </summary>
    <div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">
      
      {/* 핵심 요약 박스 */}
      <div className="bg-amber-50 p-5 rounded-2xl space-y-3">
        <p className="font-bold text-amber-900 text-xs uppercase tracking-wider">Freelancer Quick Guide</p>
        <div className="space-y-2 text-xs text-amber-800">
          <p>• <strong>원천징수:</strong> 소득세 3% + 지방소득세 0.3% = 총 3.3%</p>
          <p>• <strong>환급 기회:</strong> 매년 5월 종합소득세 신고를 통해 세금 환급 가능</p>
        </div>
      </div>

      <section className="space-y-4 px-1">
        <div>
          <h4 className="font-bold text-gray-800 mb-1">실수령액 계산, 그 이상이 필요한 이유</h4>
          <p>프리랜서 소득은 단순히 세금을 떼는 것으로 끝나지 않습니다. 2026년 기준 바뀐 세법과 건강보험료 지역가입자 전환 기준을 염두에 두어야 진짜 내 수입을 파악할 수 있습니다.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-1">세모계와 함께하는 현명한 정산</h4>
          <p>복잡한 계산은 세모계에 맡기고 당신의 창의적인 업무에 집중하세요. 광고 디자이너의 감각으로 설계된 인터페이스가 정산 과정을 가장 아름답게 만들어 드립니다.</p>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
        ※ 본 계산기는 일반적인 3.3% 사업소득 원천징수 공식을 따르며, 실제 종소세 신고 시 공제 항목에 따라 최종 세액은 달라질 수 있습니다.
      </p>
    </div>
  </details>
</div>