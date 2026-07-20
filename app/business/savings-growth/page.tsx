"use client";

import { useState } from "react";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel from "../../components/ResultPanel";
import { calcSavingsGrowth } from "../../utils/savingsGrowthCalc";

export default function SavingsGrowthPage() {
  const [initialDeposit, setInitialDeposit] = useState("1000000");
  const [monthlyDeposit, setMonthlyDeposit] = useState("300000");
  const [annualRatePercent, setAnnualRatePercent] = useState("4.0");
  const [months, setMonths] = useState("12");

  const result = calcSavingsGrowth(
    parseFloat(initialDeposit),
    parseFloat(monthlyDeposit),
    parseFloat(annualRatePercent),
    parseInt(months || "0", 10)
  );
  const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  return (
    <CalculatorLayout
      tone="business"
      title="적금 성장 계산기"
      subtitle="초기금액, 월납입액, 금리, 기간으로 만기 금액을 예측합니다."
      intro="월복리를 기준으로 미래 가치와 이자 수익을 계산합니다."
      faqTitle="적금 성장 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떤 공식인가요?", a: "A. 월복리 미래가치 공식을 사용합니다. 초기금액은 복리로 불어나고, 월납입액은 매달 적립된다고 가정합니다." },
        { q: "Q. 금리가 0%면 어떻게 되나요?", a: "A. 이자가 없으므로 총 납입액과 미래 가치가 같습니다." },
        { q: "Q. 월 수는 정수만 되나요?", a: "A. 네. 개월 수는 정수로 입력하는 것을 기준으로 합니다." },
      ]}
      result={
        <ResultPanel
          lines={result ? [
            { label: "총 납입액", value: `${fmt(result.totalDeposit)}원` },
            { label: "이자 수익", value: `${fmt(result.interestEarned)}원` },
          ] : [{ label: "총 납입액", value: "-" }, { label: "이자 수익", value: "-" }]}
          total={{ label: "만기 예상 금액", value: result ? `${fmt(result.futureValue)}원` : "-" }}
          note="검증 조건: 초기금액·월납입액·금리는 0 이상, 기간은 1개월 이상입니다."
        />
      }
    >
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">초기 금액 (원)</span>
          <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={initialDeposit} onChange={(e) => setInitialDeposit(e.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">월 납입액 (원)</span>
          <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={monthlyDeposit} onChange={(e) => setMonthlyDeposit(e.target.value)} />
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
