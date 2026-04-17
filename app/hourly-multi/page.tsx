import type { Metadata } from "next";
import { Suspense } from "react";
import HourlyMultiClient from "./HourlyMultiClient";

export const metadata: Metadata = {
  title: "시급 여러명 계산기 | 세모계",
  description: "여러 명의 시급/근무시간을 입력해 월급을 한 번에 계산해보세요.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HourlyMultiClient />
    </Suspense>
  );
}

<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
  <details className="group">
    <summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
      <span className="tracking-tight">💡 다인원 알바 정산, 스마트하게 관리하는 법</span>
      <span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
    </summary>
    <div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">
      
      <section>
        <h4 className="font-bold text-gray-800 mb-2">1. 사장님의 귀중한 시간을 아껴드립니다</h4>
        <p>직원이 3명만 넘어가도 시급, 근무 시간, 주휴수당 여부가 제각각이라 정산이 복잡해집니다. 세모계의 '사장님용 시급 계산기'는 여러 명의 알바생 데이터를 한 번에 입력하고 총 지급액을 바로 확인할 수 있도록 설계되었습니다. 이제 복잡한 엑셀 수식 대신 직관적인 리스트로 관리하세요.</p>
      </section>
      
      <section>
        <h4 className="font-bold text-gray-800 mb-2">2. 2026년 정산 시 필수 체크리스트</h4>
        <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100 text-xs text-slate-700">
          <p>• <strong>주휴수당 자동 합산:</strong> 주 15시간 이상 근무자에게 지급해야 하는 주휴수당을 인원별로 정확하게 계산했는지 확인하세요.</p>
          <p>• <strong>휴게시간 공제:</strong> 근로기준법상 4시간당 30분의 무급 휴게시간이 정확히 제외되었는지 체크가 필요합니다.</p>
          <p>• <strong>총 인건비 파악:</strong> 개별 급여뿐만 아니라 이번 달 지출될 전체 인건비를 한눈에 파악하여 매장 운영 예산을 세워보세요.</p>
        </div>
      </section>

      <section>
        <h4 className="font-bold text-gray-800 mb-2">3. 투명한 급여 지급이 신뢰의 시작입니다</h4>
        <p>명확한 계산 근거를 알바생에게 보여주면 급여 관련 오해를 미연에 방지할 수 있습니다. 세모계는 사장님과 근로자 모두가 납득할 수 있는 정교한 계산 결과를 제공합니다.</p>
      </section>

      <section>
        <h4 className="font-bold text-gray-800 mb-2">4. 디자인으로 완성한 업무 효율</h4>
        <p>8년 차 광고 디자이너가 설계한 세모계는 복잡한 숫자 나열이 아닙니다. 사장님이 가장 편안하게 정보를 읽고 판단할 수 있도록 최적화된 인터페이스를 제공합니다.</p>
      </section>

      <p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
        ※ 본 도구는 다수 인원의 급여 시뮬레이션을 돕기 위한 용도이며, 법적 증빙 자료로의 활용은 노무 전문가와 상의하시기 바랍니다.
      </p>
    </div>
  </details>
</div>

