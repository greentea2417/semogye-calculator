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

function calcSellingPrice(costRaw: number, marginRateRaw: number) {
  const cost = Math.max(0, costRaw);
  const marginRate = Math.max(0, marginRateRaw);
  const sellingPrice = marginRate < 100 ? cost / (1 - marginRate / 100) : 0;
  const grossProfit = sellingPrice - cost;
  return { cost, marginRate, sellingPrice, grossProfit };
}

export default function SellingPricePage() {
  const [costRaw, setCostRaw] = useState("");
  const [marginRateRaw, setMarginRateRaw] = useState("");

  const result = useMemo(() => calcSellingPrice(parseNumber(costRaw), parseNumber(marginRateRaw)), [costRaw, marginRateRaw]);
  const lines: ResultLine[] = [
    { label: "원가", hint: "입력값", value: `${result.cost.toLocaleString()}원` },
    { label: "목표 마진율", hint: "입력값", value: `${result.marginRate.toLocaleString()}%` },
    { label: "예상 매출총이익", hint: "판매가 − 원가", value: `${round0(result.grossProfit).toLocaleString()}원` },
  ];
  const total = { label: "권장 판매가", value: `${round0(result.sellingPrice).toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "판매가 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const onCsvDownload = () => downloadResultCsv({
    slug: "selling-price",
    title: "판매가 계산기",
    inputs: [
      { label: "원가(입력)", value: `${result.cost.toLocaleString()}원` },
      { label: "목표 마진율(입력)", value: `${result.marginRate.toLocaleString()}%` },
    ],
    lines,
    total,
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout
      tone="business"
      title="판매가 계산기"
      subtitle="원가와 목표 마진율로 권장 판매가를 계산합니다."
      intro="상품 원가에 원하는 마진을 더해 적정 판매가를 빠르게 잡아보세요."
      faqTitle="판매가 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 판매가는 어떻게 계산하나요?", a: "A. 판매가 = 원가 ÷ (1 − 마진율) 입니다. 예를 들어 원가 1만원, 마진율 40%라면 판매가는 1만6천666원입니다." },
        { q: "Q. 마진율 0%면 어떻게 되나요?", a: "A. 마진율이 0%면 판매가는 원가와 같습니다. 이 계산기는 0%일 때 원가를 그대로 표시합니다." },
        { q: "Q. 마진율이 100%면요?", a: "A. 100%는 분모가 0이 되어 계산할 수 없습니다. 그래서 100% 이상은 0원으로 처리합니다." },
        { q: "Q. 부가세는 포함되나요?", a: "A. 이 계산기는 부가세를 제외한 판매가 기준입니다. 실제 매장 가격은 부가세 포함 여부에 맞춰 별도로 조정하세요." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 원가·마진율과 권장 판매가, 예상 매출총이익이 함께 저장됩니다." },
      ]}
      result={<ResultPanel title="판매가 계산 결과" lines={lines} total={total} note="* 마진율은 매출 대비 매출총이익 비율 기준입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="원가 (원)" type="text" inputMode="numeric" value={costRaw} onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" />
        <InputBlock label="목표 마진율 (%)" type="text" inputMode="decimal" value={marginRateRaw} onChange={(e) => setMarginRateRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 40" />
      </div>
    </CalculatorLayout>
  );
}
