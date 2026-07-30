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

export default function CostRatioPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [costRaw, setCostRaw] = useState("");

  const result = useMemo(() => {
    const sales = Math.max(0, parseNumber(salesRaw));
    const cost = Math.max(0, parseNumber(costRaw));
    const grossProfit = Math.max(0, sales - cost);
    const costRatio = sales > 0 ? cost / sales : 0;
    const grossMargin = sales > 0 ? grossProfit / sales : 0;
    const markup = cost > 0 ? grossProfit / cost : 0;
    return { sales, cost, grossProfit, costRatio, grossMargin, markup };
  }, [salesRaw, costRaw]);

  const lines: ResultLine[] = [
    { label: "원가율", hint: "원가 ÷ 매출", value: `${round2(result.costRatio * 100)}%` },
    { label: "매출총이익", hint: "매출 − 원가", value: `${result.grossProfit.toLocaleString()}원` },
    { label: "매출총이익률", hint: "매출총이익 ÷ 매출", value: `${round2(result.grossMargin * 100)}%` },
    { label: "마크업률", hint: "매출총이익 ÷ 원가", value: result.cost > 0 ? `${round2(result.markup * 100)}%` : "0%" },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "원가율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "cost-ratio",
      title: "원가율 계산기",
      inputs: [
        { label: "매출(입력)", value: `${result.sales.toLocaleString()}원` },
        { label: "원가(입력)", value: `${result.cost.toLocaleString()}원` },
      ],
      lines,
      total: { label: "매출총이익", value: `${result.grossProfit.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="원가율 계산기"
      subtitle="매출과 원가를 넣으면 원가율, 매출총이익률, 마크업률을 계산합니다."
      intro="판매가격과 재료비·상품원가를 바로 비교해 수익 구조를 빠르게 확인할 수 있어요."
      faqTitle="원가율 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 원가율은 어떻게 계산하나요?", a: "A. 원가율 = 원가 ÷ 매출 × 100 입니다. 매출 100,000원, 원가 60,000원이면 원가율은 60%입니다." },
        { q: "Q. 매출총이익과 매출총이익률은 무엇인가요?", a: "A. 매출총이익 = 매출 − 원가, 매출총이익률 = 매출총이익 ÷ 매출 × 100 입니다. 회계에서 흔히 쓰는 기본 수익성 지표입니다." },
        { q: "Q. 매출이 0원이면 어떻게 되나요?", a: "A. 매출이 0원이면 비율 계산은 0%로 처리합니다. 금액 입력이 없으면 안전하게 0으로 계산합니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 매출, 원가, 원가율, 매출총이익, 매출총이익률, 마크업률이 함께 들어갑니다." },
      ]}
      result={<ResultPanel title="원가율 계산 결과" lines={lines} total={{ label: "매출총이익", value: `${result.grossProfit.toLocaleString()}원` }} note="* 매출총이익은 0원 미만으로 내려가지 않게 계산합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,500,000" />
        <InputBlock label="원가 (원)" type="text" inputMode="numeric" value={costRaw} onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 900,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 원가는 상품원가·재료비·외주비 등 판매를 위해 직접 든 비용 기준입니다.</p>
    </CalculatorLayout>
  );
}
