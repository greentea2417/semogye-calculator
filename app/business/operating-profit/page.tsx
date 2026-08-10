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
function formatComma(n: number) { return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : ""; }
function round(n: number) { return Math.round(n); }

function calcOperatingProfit(salesRaw: number, cogsRaw: number, sgaRaw: number) {
  const sales = Math.max(0, salesRaw);
  const cogs = Math.max(0, cogsRaw);
  const sga = Math.max(0, sgaRaw);
  const grossProfit = sales - cogs;
  const operatingProfit = grossProfit - sga;
  const operatingMarginRate = sales > 0 ? (operatingProfit / sales) * 100 : 0;
  return { sales, cogs, sga, grossProfit, operatingProfit, operatingMarginRate };
}

export default function OperatingProfitPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [cogsRaw, setCogsRaw] = useState("");
  const [sgaRaw, setSgaRaw] = useState("");

  const result = useMemo(() => calcOperatingProfit(parseNumber(salesRaw), parseNumber(cogsRaw), parseNumber(sgaRaw)), [salesRaw, cogsRaw, sgaRaw]);
  const lines: ResultLine[] = [
    { label: "매출", hint: "입력값", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가", hint: "입력값", value: `${result.cogs.toLocaleString()}원` },
    { label: "매출총이익", hint: "매출 − 매출원가", value: `${result.grossProfit.toLocaleString()}원` },
    { label: "판매관리비", hint: "입력값", value: `${result.sga.toLocaleString()}원` },
    { label: "영업이익", hint: "매출총이익 − 판매관리비", value: `${result.operatingProfit.toLocaleString()}원` },
    { label: "영업이익률", hint: "영업이익 ÷ 매출 × 100", value: `${round(result.operatingMarginRate)}%` },
  ];
  const total = { label: "영업이익", value: `${result.operatingProfit.toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "영업이익 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };
  const onCsvDownload = () => downloadResultCsv({ slug: "operating-profit", title: "영업이익 계산기", inputs: [
    { label: "매출(입력)", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가(입력)", value: `${result.cogs.toLocaleString()}원` },
    { label: "판매관리비(입력)", value: `${result.sga.toLocaleString()}원` },
  ], lines, total, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return (
    <CalculatorLayout tone="business" title="영업이익 계산기" subtitle="매출, 매출원가, 판매관리비를 넣으면 영업이익과 영업이익률을 계산합니다." intro="사업의 본업 성과를 확인할 때 쓰는 계산기예요." faqTitle="영업이익 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 영업이익은 어떻게 계산하나요?", a: "A. 영업이익 = 매출총이익 − 판매관리비입니다. 다시 쓰면 매출 − 매출원가 − 판매관리비입니다." },
      { q: "Q. 영업이익률은 어떻게 계산하나요?", a: "A. 영업이익률 = 영업이익 ÷ 매출 × 100 입니다." },
      { q: "Q. 판매관리비에는 무엇이 들어가나요?", a: "A. 급여, 임차료, 광고선전비, 복리후생비, 감가상각비 등 일반적인 판관비 항목이 들어갑니다." },
      { q: "Q. 매출이 0이면 어떻게 되나요?", a: "A. 매출이 0이면 영업이익률은 0%로 표시합니다. 계산은 가능하지만 비율 해석은 어렵습니다." },
      { q: "Q. CSV에는 무엇이 저장되나요?", a: "A. 입력한 매출·매출원가·판매관리비와 계산 결과가 모두 저장됩니다." },
    ]}
      result={<ResultPanel title="영업이익 계산 결과" lines={lines} total={total} note="* 매출이 0이면 영업이익률은 0%로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 20,000,000" />
        <InputBlock label="매출원가 (원)" type="text" inputMode="numeric" value={cogsRaw} onChange={(e) => setCogsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 11,000,000" />
        <InputBlock label="판매관리비 (원)" type="text" inputMode="numeric" value={sgaRaw} onChange={(e) => setSgaRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 5,000,000" />
      </div>
    </CalculatorLayout>
  );
}
