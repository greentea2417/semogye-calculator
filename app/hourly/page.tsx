import { Suspense } from "react";
import HourlyClient from "./HourlyClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HourlyClient />
    </Suspense>
  );
}
<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
  <details className="group">
    <summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
      <span className="tracking-tight">💡 최저임금과 주휴수당, 알바비 정산 가이드</span>
      <span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
    </summary>
    <div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">
      
      {/* 핵심 요약 박스 */}
      <div className="bg-emerald-50 p-5 rounded-2xl space-y-3">
        <p className="font-bold text-emerald-900 text-xs uppercase tracking-wider">Hourly Pay Check</p>
        <div className="space-y-2 text-xs text-emerald-800">
          <p>• <strong>2026년 최저시급:</strong> 10,030원</p>
          <p>• <strong>주휴수당 대상:</strong> 주 15시간 이상 근무 및 개근 시 필수 지급</p>
        </div>
      </div>

      <section className="space-y-4 px-1">
        <div>
          <h4 className="font-bold text-gray-800 mb-1">정확한 알바비 계산이 필요한 이유</h4>
          <p>단순히 '시급 × 시간'만으로는 부족합니다. 주휴수당 포함 여부와 휴게시간 공제 등에 따라 실제 통장에 찍히는 금액은 달라질 수 있습니다. 세모계는 2026년 최신 기준을 반영하여 가장 오차 없는 결과를 보여줍니다.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-1">사장님과 알바생 모두를 위한 도구</h4>
          <p>서로 얼굴 붉히는 일 없도록, 명확한 기준에 근거한 정산이 필요합니다. 광고 디자이너의 감각으로 설계된 정갈한 인터페이스를 통해 복잡한 시급 계산을 투명하게 완료하세요.</p>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
        ※ 본 계산기는 일반적인 근로기준법을 따르며, 실제 급여는 수습기간 적용 여부나 사업장 규모(5인 이상)에 따라 차이가 있을 수 있습니다.
      </p>
    </div>
  </details>
</div>