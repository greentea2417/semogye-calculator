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

function calcNetProfit(salesRaw: number, cogsRaw: number, sgaRaw: number, otherIncomeRaw: number, otherExpenseRaw: number, taxRaw: number) {
  const sales = Math.max(0, salesRaw);
  const cogs = Math.max(0, cogsRaw);
  const sga = Math.max(0, sgaRaw);
  const otherIncome = Math.max(0, otherIncomeRaw);
  const otherExpense = Math.max(0, otherExpenseRaw);
  const tax = Math.max(0, taxRaw);
  const grossProfit = sales - cogs;
  const operatingProfit = grossProfit - sga;
  const preTaxProfit = operatingProfit + otherIncome - otherExpense;
  const netProfit = preTaxProfit - tax;
  const netMarginRate = sales > 0 ? (netProfit / sales) * 100 : 0;
  return { sales, cogs, sga, otherIncome, otherExpense, tax, grossProfit, operatingProfit, preTaxProfit, netProfit, netMarginRate };
}

export default function NetProfitPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [cogsRaw, setCogsRaw] = useState("");
  const [sgaRaw, setSgaRaw] = useState("");
  const [otherIncomeRaw, setOtherIncomeRaw] = useState("");
  const [otherExpenseRaw, setOtherExpenseRaw] = useState("");
  const [taxRaw, setTaxRaw] = useState("");

  const result = useMemo(() => calcNetProfit(parseNumber(salesRaw), parseNumber(cogsRaw), parseNumber(sgaRaw), parseNumber(otherIncomeRaw), parseNumber(otherExpenseRaw), parseNumber(taxRaw)), [salesRaw, cogsRaw, sgaRaw, otherIncomeRaw, otherExpenseRaw, taxRaw]);
  const lines: ResultLine[] = [
    { label: "매출", hint: "입력값", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가", hint: "입력값", value: `${result.cogs.toLocaleString()}원` },
    { label: "매출총이익", hint: "매출 − 매출원가", value: `${result.grossProfit.toLocaleString()}원` },
    { label: "판매관리비", hint: "입력값", value: `${result.sga.toLocaleString()}원` },
    { label: "영업이익", hint: "매출총이익 − 판매관리비", value: `${result.operatingProfit.toLocaleString()}원` },
    { label: "영업외수익", hint: "입력값", value: `${result.otherIncome.toLocaleString()}원` },
    { label: "영업외비용", hint: "입력값", value: `${result.otherExpense.toLocaleString()}원` },
    { label: "법인세/소득세", hint: "입력값", value: `${result.tax.toLocaleString()}원` },
    { label: "순이익", hint: "영업이익 + 영업외수익 − 영업외비용 − 법인세", value: `${result.netProfit.toLocaleString()}원` },
    { label: "순이익률", hint: "순이익 ÷ 매출 × 100", value: `${round(result.netMarginRate)}%` },
  ];
  const total = { label: "순이익", value: `${result.netProfit.toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "순이익 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };
  const onCsvDownload = () => downloadResultCsv({ slug: "net-profit", title: "순이익 계산기", inputs: [
    { label: "매출(입력)", value: `${result.sales.toLocaleString()}원` },
    { label: "매출원가(입력)", value: `${result.cogs.toLocaleString()}원` },
    { label: "판매관리비(입력)", value: `${result.sga.toLocaleString()}원` },
    { label: "영업외수익(입력)", value: `${result.otherIncome.toLocaleString()}원` },
    { label: "영업외비용(입력)", value: `${result.otherExpense.toLocaleString()}원` },
    { label: "법인세/소득세(입력)", value: `${result.tax.toLocaleString()}원` },
  ], lines, total, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return (
    <CalculatorLayout tone="business" title="순이익 계산기" subtitle="영업이익에 영업외수익·비용과 세금을 반영해 순이익을 계산합니다." intro="실제 남는 돈을 확인할 때 쓰는 최종 손익 계산기예요." faqTitle="순이익 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 순이익은 어떻게 계산하나요?", a: "A. 순이익 = 영업이익 + 영업외수익 − 영업외비용 − 법인세(또는 소득세)입니다." },
      { q: "Q. 법인세와 소득세를 같이 넣어도 되나요?", a: "A. 계산 목적에 맞게 하나의 세금 항목으로 합산해 넣어도 됩니다. 이 계산기는 세금 항목을 하나로 받아 처리합니다." },
      { q: "Q. 영업외수익·비용에는 무엇이 들어가나요?", a: "A. 이자수익, 배당금, 이자비용, 처분손익 같은 본업 외 항목이 들어갑니다." },
      { q: "Q. 입력하지 않으면 어떻게 되나요?", a: "A. 빈칸은 0으로 처리됩니다. 수익·비용이 없으면 영업이익을 기준으로 순이익이 계산됩니다." },
      { q: "Q. CSV에는 무엇이 저장되나요?", a: "A. 입력값과 매출총이익, 영업이익, 순이익, 순이익률이 함께 저장됩니다." },
    ]}
      result={<ResultPanel title="순이익 계산 결과" lines={lines} total={total} note="* 매출이 0이면 순이익률은 0%로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 30,000,000" />
        <InputBlock label="매출원가 (원)" type="text" inputMode="numeric" value={cogsRaw} onChange={(e) => setCogsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 16,000,000" />
        <InputBlock label="판매관리비 (원)" type="text" inputMode="numeric" value={sgaRaw} onChange={(e) => setSgaRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 8,000,000" />
        <InputBlock label="영업외수익 (원)" type="text" inputMode="numeric" value={otherIncomeRaw} onChange={(e) => setOtherIncomeRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 300,000" />
        <InputBlock label="영업외비용 (원)" type="text" inputMode="numeric" value={otherExpenseRaw} onChange={(e) => setOtherExpenseRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 200,000" />
        <InputBlock label="법인세/소득세 (원)" type="text" inputMode="numeric" value={taxRaw} onChange={(e) => setTaxRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
      </div>
    </CalculatorLayout>
  );
}
