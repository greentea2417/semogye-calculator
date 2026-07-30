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

export default function NetMarginPage() {
  const [revenueRaw, setRevenueRaw] = useState("");
  const [costRaw, setCostRaw] = useState("");
  const [expenseRaw, setExpenseRaw] = useState("");

  const result = useMemo(() => {
    const revenue = Math.max(0, parseNumber(revenueRaw));
    const cost = Math.max(0, parseNumber(costRaw));
    const expense = Math.max(0, parseNumber(expenseRaw));
    const totalCost = cost + expense;
    const netProfit = revenue - totalCost;
    const netMargin = revenue > 0 ? netProfit / revenue : 0;
    const operatingMargin = revenue > 0 ? (revenue - cost) / revenue : 0;
    return { revenue, cost, expense, totalCost, netProfit, netMargin, operatingMargin };
  }, [revenueRaw, costRaw, expenseRaw]);

  const lines: ResultLine[] = [
    { label: "총비용", hint: "원가 + 기타비용", value: `${result.totalCost.toLocaleString()}원` },
    { label: "순이익", hint: "매출 − 총비용", value: `${result.netProfit.toLocaleString()}원` },
    { label: "순이익률", hint: "순이익 ÷ 매출", value: `${round2(result.netMargin * 100)}%` },
    { label: "영업이익률", hint: "(매출 − 원가) ÷ 매출", value: `${round2(result.operatingMargin * 100)}%` },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "순이익률 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "net-margin",
      title: "순이익률 계산기",
      inputs: [
        { label: "매출(입력)", value: `${result.revenue.toLocaleString()}원` },
        { label: "원가(입력)", value: `${result.cost.toLocaleString()}원` },
        { label: "기타비용(입력)", value: `${result.expense.toLocaleString()}원` },
      ],
      lines,
      total: { label: "순이익", value: `${result.netProfit.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="순이익률 계산기"
      subtitle="매출, 원가, 기타비용을 넣으면 순이익과 순이익률을 계산합니다."
      intro="임대료, 광고비, 수수료 같은 부대비용까지 반영해 최종 수익성을 확인할 수 있어요."
      faqTitle="순이익률 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 순이익률은 어떻게 계산하나요?", a: "A. 순이익률 = 순이익 ÷ 매출 × 100 입니다. 순이익은 매출에서 원가와 기타비용을 뺀 금액입니다." },
        { q: "Q. 영업이익률과 무엇이 다른가요?", a: "A. 영업이익률은 일반적으로 영업 관련 비용만 반영하고, 순이익률은 이자·세금·기타비용까지 포함해 최종 이익성을 봅니다. 이 계산기는 입력한 기타비용까지 포함한 간이 순이익률입니다." },
        { q: "Q. 비용이 매출보다 많으면요?", a: "A. 순이익이 음수가 되어 순손실이 표시됩니다. 비율도 음수로 나옵니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 매출, 원가, 기타비용, 총비용, 순이익, 순이익률, 영업이익률이 포함됩니다." },
      ]}
      result={<ResultPanel title="순이익률 계산 결과" lines={lines} total={{ label: "순이익", value: `${result.netProfit.toLocaleString()}원` }} note="* 순이익은 음수도 그대로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={revenueRaw} onChange={(e) => setRevenueRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 3,000,000" />
        <InputBlock label="원가 (원)" type="text" inputMode="numeric" value={costRaw} onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,700,000" />
        <InputBlock label="기타비용 (원)" type="text" inputMode="numeric" value={expenseRaw} onChange={(e) => setExpenseRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 500,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 기타비용에는 임대료, 광고비, 배달수수료, 카드수수료 등을 넣을 수 있습니다.</p>
    </CalculatorLayout>
  );
}
