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

function calcRoas(revenueRaw: number, adCostRaw: number) {
  const revenue = Math.max(0, revenueRaw);
  const adCost = Math.max(0, adCostRaw);
  const profit = revenue - adCost;
  const roas = adCost > 0 ? (revenue / adCost) * 100 : 0;
  const profitRate = adCost > 0 ? (profit / adCost) * 100 : 0;
  return { revenue, adCost, profit, roas, profitRate };
}

export default function RoasPage() {
  const [revenueRaw, setRevenueRaw] = useState("");
  const [adCostRaw, setAdCostRaw] = useState("");

  const result = useMemo(() => calcRoas(parseNumber(revenueRaw), parseNumber(adCostRaw)), [revenueRaw, adCostRaw]);
  const lines: ResultLine[] = [
    { label: "광고비", hint: "입력값", value: `${result.adCost.toLocaleString()}원` },
    { label: "매출", hint: "입력값", value: `${result.revenue.toLocaleString()}원` },
    { label: "순이익", hint: "매출 − 광고비", value: `${result.profit.toLocaleString()}원` },
    { label: "ROAS", hint: "매출 ÷ 광고비 × 100", value: `${round2(result.roas)}%` },
  ];
  const total = { label: "ROAS", value: `${round2(result.roas)}%` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "ROAS 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const onCsvDownload = () => downloadResultCsv({
    slug: "roas",
    title: "ROAS 계산기",
    inputs: [
      { label: "매출(입력)", value: `${result.revenue.toLocaleString()}원` },
      { label: "광고비(입력)", value: `${result.adCost.toLocaleString()}원` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout
      tone="business"
      title="ROAS 계산기"
      subtitle="광고비와 매출을 넣으면 ROAS와 순이익을 계산합니다."
      intro="광고 효율을 빠르게 점검하고, 캠페인별 수익성을 비교할 수 있어요."
      faqTitle="ROAS 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. ROAS는 어떻게 계산하나요?", a: "A. ROAS(Return On Ad Spend) = 매출 ÷ 광고비 × 100 입니다. 광고비 10만원으로 매출 50만원이면 ROAS는 500%입니다." },
        { q: "Q. ROAS와 ROI는 다른가요?", a: "A. 네. ROAS는 광고비 대비 매출 중심 지표이고, ROI는 투자금 대비 순이익 중심 지표입니다. ROAS가 높아도 원가가 높으면 순이익은 낮을 수 있습니다." },
        { q: "Q. 광고비가 0이면 어떻게 되나요?", a: "A. 광고비가 0이면 나눗셈이 불가능하므로 ROAS는 0%로 표시합니다. 정확한 효율 비교를 위해 실제 집행 광고비를 입력하세요." },
        { q: "Q. 매출이 광고비보다 낮아도 계산되나요?", a: "A. 네. 그 경우 ROAS는 100% 미만이며 순이익은 음수로 표시됩니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 매출·광고비와 순이익, ROAS가 함께 저장됩니다." },
      ]}
      result={<ResultPanel title="ROAS 계산 결과" lines={lines} total={total} note="* 광고비와 매출이 모두 0일 때는 ROAS를 0%로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={revenueRaw} onChange={(e) => setRevenueRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 5,000,000" />
        <InputBlock label="광고비 (원)" type="text" inputMode="numeric" value={adCostRaw} onChange={(e) => setAdCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* ROAS는 보통 %로 표현합니다. 부가세·환불 반영 기준은 운영 방식에 맞게 맞춰 넣으세요.</p>
    </CalculatorLayout>
  );
}
