"use client";

import { useState } from "react";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel from "../../components/ResultPanel";
import { calcLoanPayment } from "../../utils/loanPaymentCalc";

export default function LoanPaymentPage() {
  const [principal, setPrincipal] = useState("30000000");
  const [annualRatePercent, setAnnualRatePercent] = useState("5.5");
  const [months, setMonths] = useState("60");

  const result = calcLoanPayment(parseFloat(principal), parseFloat(annualRatePercent), parseInt(months || "0", 10));
  const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  return (
    <CalculatorLayout
      tone="business"
      title="원리금균등 대출 계산기"
      subtitle="대출 원금과 금리, 기간으로 매월 상환액을 계산합니다."
      intro="월 상환액, 총 상환액, 총 이자를 바로 확인할 수 있습니다."
      faqTitle="대출 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 원리금균등상환이란 무엇인가요?", a: "A. 매월 같은 금액을 상환하되, 초반에는 이자 비중이 크고 후반으로 갈수록 원금 비중이 커지는 방식입니다." },
        { q: "Q. 금리가 0%면 어떻게 되나요?", a: "A. 원금을 기간으로 균등 분할한 금액이 월 상환액이 됩니다." },
        { q: "Q. 기간은 월 단위인가요?", a: "A. 네. 개월 수 기준으로 입력합니다." },
      ]}
      result={
        <ResultPanel
          lines={result ? [
            { label: "총 상환액", value: `${fmt(result.totalPayment)}원` },
            { label: "총 이자", value: `${fmt(result.totalInterest)}원` },
          ] : [{ label: "총 상환액", value: "-" }, { label: "총 이자", value: "-" }]}
          total={{ label: "월 상환액", value: result ? `${fmt(result.monthlyPayment)}원` : "-" }}
          note="검증 조건: 원금>0, 금리≥0, 기간>0 일 때만 계산합니다."
        />
      }
    >
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">대출 원금 (원)</span>
          <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">연이율 (%)</span>
            <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" step="0.1" value={annualRatePercent} onChange={(e) => setAnnualRatePercent(e.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">기간 (개월)</span>
            <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={months} onChange={(e) => setMonths(e.target.value)} />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
