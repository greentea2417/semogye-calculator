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
  const cleaned = String(raw ?? "").replace(/[^\d.\-]/g, "");
  const n = cleaned ? Number(cleaned) : 0;
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function round(n: number) { return Math.round(n); }

function calcGrossProfit(salesRaw: number, cogsRaw: number) {
  const sales = Math.max(0, salesRaw);
  const cogs = Math.max(0, cogsRaw);
  const grossProfit = sales - cogs;
  const grossMarginRate = sales > 0 ? (grossProfit / sales) * 100 : 0;
  return { sales, cogs, grossProfit, grossMarginRate };
}

export default function GrossProfitPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [cogsRaw, setCogsRaw] = useState("");

  const result = useMemo(() => calcGrossProfit(parseNumber(salesRaw), parseNumber(cogsRaw)), [salesRaw, cogsRaw]);
  const lines: ResultLine[] = [
    { label: "매출", hint: "입력값", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가", hint: "입력값", value: `${result.cogs.toLocaleString()}원` },
    { label: "매출총이익", hint: "매출 − 매출원가", value: `${result.grossProfit.toLocaleString()}원` },
    { label: "매출총이익률", hint: "매출총이익 ÷ 매출 × 100", value: `${round(result.grossMarginRate)}%` },
  ];
  const total = { label: "매출총이익", value: `${result.grossProfit.toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "매출총이익 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };
  const onCsvDownload = () => downloadResultCsv({ slug: "gross-profit", title: "매출총이익 계산기", inputs: [
    { label: "매출(입력)", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가(입력)", value: `${result.cogs.toLocaleString()}원` },
  ], lines, total, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return (
    <CalculatorLayout tone="business" title="매출총이익 계산기" subtitle="매출과 매출원가를 넣으면 매출총이익과 매출총이익률을 계산합니다." intro="상품·서비스의 원가 구조를 빠르게 확인하고, 가격 정책을 점검해 보세요." faqTitle="매출총이익 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 매출총이익은 어떻게 계산하나요?", a: "A. 매출총이익 = 매출 − 매출원가입니다. 제조원가, 매입원가, 원재료비 등 매출에 직접 대응되는 비용을 뺀 값입니다." },
      { q: "Q. 매출총이익률은 어떻게 계산하나요?", a: "A. 매출총이익률 = 매출총이익 ÷ 매출 × 100 입니다." },
      { q: "Q. 매출원가가 매출보다 크면 어떻게 되나요?", a: "A. 매출총이익은 음수가 됩니다. 이는 제품 판매 자체에서 손실이 난다는 뜻입니다." },
      { q: "Q. 0이나 빈칸을 넣으면 어떻게 되나요?", a: "A. 빈칸은 0으로 처리하며, 매출이 0이면 매출총이익률은 0%로 표시합니다." },
      { q: "Q. CSV에는 무엇이 저장되나요?", a: "A. 입력한 매출·매출원가와 계산 결과인 매출총이익, 매출총이익률이 함께 저장됩니다." },
    ]}
      result={<ResultPanel title="매출총이익 계산 결과" lines={lines} total={total} note="* 매출이 0이면 매출총이익률은 0%로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 12,000,000" />
        <InputBlock label="매출원가 (원)" type="text" inputMode="numeric" value={cogsRaw} onChange={(e) => setCogsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 7,500,000" />
      </div>
    </CalculatorLayout>
  );
}
