"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function round0(n: number) {
  return Math.round(n);
}

function calcCost(sellingPriceRaw: number, marginRateRaw: number) {
  const sellingPrice = Math.max(0, sellingPriceRaw);
  const marginRate = Math.max(0, marginRateRaw);
  const cost = marginRate < 100 ? sellingPrice * (1 - marginRate / 100) : 0;
  const grossProfit = sellingPrice - cost;
  return { sellingPrice, marginRate, cost, grossProfit };
}

export default function CostBackcalcPage() {
  const [sellingPriceRaw, setSellingPriceRaw] = useState("");
  const [marginRateRaw, setMarginRateRaw] = useState("");

  const result = useMemo(() => calcCost(parseNumber(sellingPriceRaw), parseNumber(marginRateRaw)), [sellingPriceRaw, marginRateRaw]);
  const lines: ResultLine[] = [
    { label: "판매가", hint: "입력값", value: `${result.sellingPrice.toLocaleString()}원` },
    { label: "목표 마진율", hint: "입력값", value: `${result.marginRate.toLocaleString()}%` },
    { label: "예상 매출총이익", hint: "판매가 − 원가", value: `${round0(result.grossProfit).toLocaleString()}원` },
  ];
  const total = { label: "추정 원가", value: `${round0(result.cost).toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "원가 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const onCsvDownload = () => downloadResultCsv({
    slug: "cost-backcalc",
    title: "원가 계산기",
    inputs: [
      { label: "판매가(입력)", value: `${result.sellingPrice.toLocaleString()}원` },
      { label: "목표 마진율(입력)", value: `${result.marginRate.toLocaleString()}%` },
    ],
    lines,
    total,
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout
      tone="business"
      title="원가 계산기"
      subtitle="판매가와 목표 마진율로 추정 원가를 계산합니다."
      intro="판매가가 정해진 상품의 원가를 거꾸로 추정할 때 유용해요."
      faqTitle="원가 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 원가는 어떻게 계산하나요?", a: "A. 원가 = 판매가 × (1 − 마진율) 입니다. 예를 들어 판매가 2만원, 마진율 25%라면 원가는 1만5천원입니다." },
        { q: "Q. 마진율 50%면 원가는 판매가의 절반인가요?", a: "A. 맞습니다. 마진율 50%면 원가는 판매가의 50%가 됩니다." },
        { q: "Q. 마진율이 100%면 어떻게 되나요?", a: "A. 마진율 100%는 원가가 0원이 되어야 하므로 일반적인 판매 구조에서는 의미가 없습니다. 이 경우 0원으로 표시합니다." },
        { q: "Q. 부가세는 반영되나요?", a: "A. 아닙니다. 부가세 포함 판매가라면 공급가액 기준으로 다시 넣어 계산하는 것이 더 정확합니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 판매가·마진율과 추정 원가, 예상 매출총이익이 함께 저장됩니다." },
      ]}
      result={<ResultPanel title="원가 계산 결과" lines={lines} total={total} note="* 원가 추정치는 판매가와 마진율이 매출총이익 기준일 때 성립합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="판매가 (원)" type="text" inputMode="numeric" value={sellingPriceRaw} onChange={(e) => setSellingPriceRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 20,000" />
        <InputBlock label="목표 마진율 (%)" type="text" inputMode="decimal" value={marginRateRaw} onChange={(e) => setMarginRateRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 25" />
      </div>
    </CalculatorLayout>
  );
}
