import { Suspense } from "react";
import SalaryClient from "./SalaryClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SalaryClient />
    </Suspense>
  );
}
function SalaryWhySection() {
  return (
    <div className="mt-4 space-y-3 text-sm text-gray-700">
      <p>
        <b>세모계 월급 실수령액 계산기</b>는 <b>세전 월급</b>을 입력하면{" "}
        <b>2025년 기준</b> <b>4대보험</b>과 <b>세금</b>을 반영해 실제로 받는
        월급(<b>실수령액</b>)을 계산합니다.
      </p>

      <p>
        이 계산 결과는 <b>국민연금</b>, <b>건강보험(장기요양보험 포함)</b>,{" "}
        <b>고용보험</b>, <b>근로소득세 및 지방소득세</b>를 기준으로 산출됩니다.
      </p>

      <ul className="list-disc pl-5 space-y-1">
        <li>국민연금</li>
        <li>건강보험 (장기요양보험 포함)</li>
        <li>고용보험</li>
        <li>근로소득세 및 지방소득세</li>
      </ul>

      <p className="text-gray-600">
        회사별 공제 기준이나 개인의 소득 조건(부양가족 수 등)에 따라 실제 급여와 계산
        결과에는 차이가 있을 수 있습니다.
      </p>

      <hr className="my-2" />

      <div className="space-y-2">
        <p className="font-semibold text-gray-800">자주 묻는 질문</p>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium">
            Q. 월급 실수령액은 어떻게 계산되나요?
          </summary>
          <div className="mt-2 text-gray-700">
            A. 기본적으로 <b>세전 월급</b>에서 <b>4대보험</b>과 <b>세금</b>을 차감해{" "}
            <b>실제 수령액(실수령액)</b>을 계산합니다.
          </div>
        </details>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium">
            Q. 2025년 기준 계산이 맞나요?
          </summary>
          <div className="mt-2 text-gray-700">
            A. 네. 현재 공개된 기준 자료를 바탕으로 계산하며, 제도/기준이 개정되면 계산
            방식이 변경될 수 있습니다.
          </div>
        </details>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium">
            Q. 실제 급여와 계산 결과가 다른 이유는 무엇인가요?
          </summary>
          <div className="mt-2 text-gray-700">
            A. 회사별 공제 항목/기준, 개인의 공제 조건(부양가족 수 등), 기타 급여
            구성(수당/비과세 등)에 따라 차이가 발생할 수 있습니다.
          </div>
          <details className="rounded-lg border bg-white px-4 py-3">
            <summary className="cursor-pointer font-medium">
              Q. 4대보험 미가입이면 실수령액이 왜 달라지나요?
            </summary>
            <div className="mt-2 text-gray-700">
              A. 4대보험에 가입하지 않으면 국민연금·건강보험·고용보험 등의 공제액이 달라져
              실수령액이 더 높게 나오거나(공제 감소) 계산 구조 자체가 달라질 수 있습니다.
              다만 실제 적용 여부는 고용 형태와 회사 기준에 따라 달라질 수 있습니다.
            </div>
            <details className="rounded-lg border bg-white px-4 py-3">
              <summary className="cursor-pointer font-medium">
                Q. 비과세 식대(예: 20만원)는 왜 따로 입력하나요?
              </summary>
              <div className="mt-2 text-gray-700">
                A. 비과세로 처리되는 식대는 과세 대상 급여에서 제외될 수 있어
                소득세 계산에 영향을 줄 수 있습니다. 회사의 급여 항목 구성에 따라
                실제 적용 방식은 달라질 수 있습니다.
              </div>
            </details>

          </details>

        </details>
      </div>
    </div>
  );
}
