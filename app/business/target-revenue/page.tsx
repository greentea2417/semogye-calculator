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
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }
function round2(n: number) { return Math.round(n * 100) / 100; }

export default function TargetRevenuePage() {
  const [fixedCostRaw, setFixedCostRaw] = useState("");
  const [variableRateRaw, setVariableRateRaw] = useState("0");
  const [targetProfitRaw, setTargetProfitRaw] = useState("");

  const result = useMemo(() => {
    const fixedCost = Math.max(0, parseNumber(fixedCostRaw));
    const variableRate = Math.max(0, parseNumber(variableRateRaw));
    const targetProfit = Math.max(0, parseNumber(targetProfitRaw));
    const contributionRate = Math.max(0, 100 - variableRate);
    const requiredRevenue = contributionRate > 0 ? round2((fixedCost + targetProfit) / (contributionRate / 100)) : 0;
    const breakEvenRevenue = contributionRate > 0 ? round2(fixedCost / (contributionRate / 100)) : 0;
    return { fixedCost, variableRate, targetProfit, contributionRate, requiredRevenue, breakEvenRevenue };
  }, [fixedCostRaw, variableRateRaw, targetProfitRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "목표매출 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "공헌이익률", hint: "100% − 변동비율", value: `${result.contributionRate}%` },
    { label: "손익분기점 매출", hint: "고정비 ÷ 공헌이익률", value: `${result.breakEvenRevenue.toLocaleString()}원` },
    { label: "목표매출", hint: "(고정비 + 목표이익) ÷ 공헌이익률", value: `${result.requiredRevenue.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "target-revenue",
      title: "목표매출 계산기",
      inputs: [
        { label: "고정비(입력)", value: `${result.fixedCost.toLocaleString()}원` },
        { label: "변동비율(입력)", value: `${result.variableRate}%` },
        { label: "목표이익(입력)", value: `${result.targetProfit.toLocaleString()}원` },
      ],
      lines,
      total: { label: "목표매출", value: `${result.requiredRevenue.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="목표매출 계산기"
      subtitle="고정비, 변동비율, 목표이익으로 필요한 매출을 계산합니다."
      intro="가게·쇼핑몰·서비스업에서 손익분기점과 목표 순이익 달성을 위해 필요한 매출 규모를 확인할 때 쓰기 좋아요."
      faqTitle="목표매출 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 목표매출은 어떻게 계산하나요?", a: "A. 목표매출 = (고정비 + 목표이익) ÷ 공헌이익률 입니다. 공헌이익률은 100% − 변동비율로 계산합니다." },
        { q: "Q. 변동비율이 100%면 어떻게 되나요?", a: "A. 판매할수록 남는 금액이 0이므로 목표매출을 계산할 수 없어 0원으로 표시합니다." },
        { q: "Q. 손익분기점도 같이 볼 수 있나요?", a: "A. 네. 목표이익을 0원으로 둔 손익분기점 매출도 함께 보여줍니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0원으로 처리합니다." },
      ]}
      result={<ResultPanel title="목표매출 계산 결과" lines={lines} total={{ label: "목표매출", value: `${result.requiredRevenue.toLocaleString()}원` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock label="고정비 (원)" type="text" inputMode="numeric" value={fixedCostRaw} onChange={(e) => setFixedCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 2,000,000" />
        <InputBlock label="변동비율 (%)" type="text" inputMode="decimal" value={variableRateRaw} onChange={(e) => setVariableRateRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 60" />
        <InputBlock label="목표이익 (원)" type="text" inputMode="numeric" value={targetProfitRaw} onChange={(e) => setTargetProfitRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
