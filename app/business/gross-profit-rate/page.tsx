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
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function calcGrossProfitRate(salesRaw: number, cogsRaw: number) {
  const sales = Math.max(0, salesRaw);
  const cogs = Math.max(0, cogsRaw);
  const grossProfit = sales - cogs;
  const grossProfitRate = sales > 0 ? (grossProfit / sales) * 100 : 0;
  const costRatio = sales > 0 ? (cogs / sales) * 100 : 0;
  return { sales, cogs, grossProfit, grossProfitRate, costRatio };
}

export default function GrossProfitRatePage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [cogsRaw, setCogsRaw] = useState("");

  const result = useMemo(() => calcGrossProfitRate(parseNumber(salesRaw), parseNumber(cogsRaw)), [salesRaw, cogsRaw]);
  const lines: ResultLine[] = [
    { label: "매출", hint: "입력값", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가", hint: "입력값", value: `${result.cogs.toLocaleString()}원` },
    { label: "매출총이익", hint: "매출 − 매출원가", value: `${result.grossProfit.toLocaleString()}원` },
  ];
  const total = { label: "매출총이익률", value: `${round2(result.grossProfitRate).toLocaleString()}%` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "매출총이익률 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const onCsvDownload = () => downloadResultCsv({
    slug: "gross-profit-rate",
    title: "매출총이익률 계산기",
    inputs: [
      { label: "매출(입력)", value: `${result.sales.toLocaleString()}원` },
      { label: "매출원가(입력)", value: `${result.cogs.toLocaleString()}원` },
    ],
    lines,
    total,
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout
      tone="business"
      title="매출총이익률 계산기"
      subtitle="매출과 매출원가로 매출총이익률과 원가율을 계산합니다."
      intro="상품과 서비스의 기본 수익성을 빠르게 확인할 수 있어요."
      faqTitle="매출총이익률 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 매출총이익률은 어떻게 계산하나요?", a: "A. 매출총이익률 = (매출 − 매출원가) ÷ 매출 × 100 입니다. 매출 100만원, 매출원가 70만원이면 매출총이익률은 30%입니다." },
        { q: "Q. 원가율과는 다른가요?", a: "A. 네. 원가율은 매출원가 ÷ 매출 × 100이고, 매출총이익률은 100% − 원가율입니다." },
        { q: "Q. 매출이 0이면요?", a: "A. 나눗셈이 불가능하므로 0%로 표시합니다." },
        { q: "Q. 반품이나 할인은 반영되나요?", a: "A. 이 계산기는 입력값 그대로 계산합니다. 할인·반품을 포함하려면 실제 순매출과 순매출원가 기준으로 넣으세요." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 매출·매출원가와 매출총이익, 매출총이익률이 함께 저장됩니다." },
      ]}
      result={<ResultPanel title="매출총이익률 계산 결과" lines={lines} total={total} note="* 매출총이익률은 유통·제조·서비스업 모두에서 기본적으로 확인하는 수익성 지표입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000,000" />
        <InputBlock label="매출원가 (원)" type="text" inputMode="numeric" value={cogsRaw} onChange={(e) => setCogsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 7,000,000" />
      </div>
    </CalculatorLayout>
  );
}
