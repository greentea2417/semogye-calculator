"use client";

import { useState } from "react";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel from "../../components/ResultPanel";
import { calcTipSplit } from "../../utils/tipSplitCalc";

export default function TipSplitPage() {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("10");
  const [people, setPeople] = useState("2");

  const result = calcTipSplit(parseFloat(billAmount), parseFloat(tipPercent), parseInt(people || "0", 10));

  const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  return (
    <CalculatorLayout
      tone="business"
      title="팁 더치페이 계산기"
      subtitle="식사 금액과 팁 비율을 넣으면 1인당 부담액을 계산합니다."
      intro="총액과 팁 금액, 인원당 금액을 한 번에 확인할 수 있습니다."
      faqTitle="팁 더치페이 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 팁은 어떻게 계산하나요?", a: "A. 기본금액에 팁 비율을 곱해 팁 금액을 구하고, 이를 기본금액에 더해 총액을 계산합니다." },
        { q: "Q. 인원수가 1명이어도 되나요?", a: "A. 네. 1명일 때는 총액과 1인당 금액이 동일합니다." },
        { q: "Q. 팁 비율이 0%도 가능한가요?", a: "A. 가능합니다. 팁 없이 기본금액만 계산합니다." },
      ]}
      result={
        <ResultPanel
          lines={result ? [
            { label: "팁 금액", value: `${fmt(result.tipAmount)}원` },
            { label: "총액", value: `${fmt(result.totalAmount)}원` },
          ] : [{ label: "팁 금액", value: "-" }, { label: "총액", value: "-" }]}
          total={{ label: "1인당 금액", value: result ? `${fmt(result.perPerson)}원` : "-" }}
          note="기본 검증: 금액>0, 인원>0, 팁%≥0 일 때만 계산합니다."
        />
      }
    >
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">기본 금액 (원)</span>
          <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="48000" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">팁 비율 (%)</span>
            <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} placeholder="10" />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">인원</span>
            <input className="w-full rounded-2xl border border-gray-200 p-4 text-center text-lg font-bold" type="number" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="2" />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
