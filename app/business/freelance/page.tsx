"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import CalculatorLayout from "../../components/CalculatorLayout";

export default function BusinessFreelancePage() {
  const [amount, setAmount] = useState("");
  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const tax = Math.round(value * 0.033);
    const net = Math.round(value - tax);
    return { tax, net };
  }, [value, valid]);

  return (
    <CalculatorLayout
      tone="business"
      title="프리랜서 실수령액 계산기"
      subtitle="3.3% 원천징수 기준으로 간단히 예상해보세요."
      intro="프리랜서 정산은 세전 금액에서 사업소득 원천징수 3.3%를 먼저 반영해 예상 실수령액을 보는 방식이에요."
      faqTitle="프리랜서 실수령액 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 3.3%는 무엇인가요?", a: "A. 사업소득 원천징수 세율로, 소득세와 지방소득세를 합친 값입니다." },
        { q: "Q. 실제 신고 결과와 같은가요?", a: "A. 아니요. 필요경비와 신고 방식에 따라 달라질 수 있습니다." },
        { q: "Q. 부가세도 반영되나요?", a: "A. 이 계산은 원천징수 기준이며 부가세는 별도입니다." },
      ]}
      result={
        result ? (
          <>
            <h2 className="mb-4 text-lg font-bold text-gray-900">계산 결과</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500">예상 세금</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900 tabular-nums">{result.tax.toLocaleString()}원</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500">예상 실수령액</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900 tabular-nums">{result.net.toLocaleString()}원</p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">세전 금액을 입력하면 예상 실수령액이 표시됩니다.</div>
        )
      }
    >
      <InputBlock label="세전 금액 (원)" type="number" placeholder="1000000" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-center text-lg font-bold text-gray-900" />
    </CalculatorLayout>
  );
}
