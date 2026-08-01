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
  return n ? n.toLocaleString("ko-KR") : "";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function LaborCostRatioPage() {
  const [revenueRaw, setRevenueRaw] = useState("");
  const [laborRaw, setLaborRaw] = useState("");

  const result = useMemo(() => {
    const revenue = Math.max(0, parseNumber(revenueRaw));
    const labor = Math.max(0, parseNumber(laborRaw));
    const ratio = revenue > 0 ? round2((labor / revenue) * 100) : 0; // 인건비율(%)
    const remaining = revenue - labor; // 인건비 제외 금액
    return { revenue, labor, ratio, remaining };
  }, [revenueRaw, laborRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "인건비 비율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "인건비율", hint: "인건비 ÷ 매출 × 100", value: `${result.ratio}%` },
    { label: "인건비 제외 금액", hint: "매출 − 인건비", value: `${result.remaining.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "labor-cost-ratio",
      title: "인건비 비율 계산기",
      inputs: [
        { label: "매출액(입력)", value: `${result.revenue.toLocaleString()}원` },
        { label: "인건비(입력)", value: `${result.labor.toLocaleString()}원` },
      ],
      lines,
      total: { label: "인건비율", value: `${result.ratio}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="인건비 비율 계산기"
      subtitle="매출액과 인건비를 넣으면 매출 대비 인건비 비율을 바로 계산합니다."
      intro="매장·사업장의 인건비율(인건비 ÷ 매출)을 확인해 적정 인력 규모를 점검할 때 유용합니다."
      faqTitle="인건비 비율 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 인건비율은 어떻게 계산하나요?",
          a: "A. 인건비율(%) = 인건비 ÷ 매출액 × 100 입니다. 월 매출 1,000만원에 인건비 300만원이면 인건비율은 30%입니다.",
        },
        {
          q: "Q. 적정 인건비율은 얼마인가요?",
          a: "A. 업종에 따라 다르지만 외식업은 보통 매출의 25~35%, 서비스업은 30~40%를 적정 범위로 봅니다. 이 계산기는 현재 비율을 확인하는 용도이며 절대 기준은 아닙니다.",
        },
        {
          q: "Q. 인건비에는 무엇을 포함하나요?",
          a: "A. 급여뿐 아니라 사업주 부담 4대보험료, 주휴수당, 상여금, 퇴직급여 충당금 등 인력에 들어가는 비용을 모두 포함해 넣으면 더 정확합니다.",
        },
        {
          q: "Q. 매출이 0원이면 어떻게 되나요?",
          a: "A. 매출이 0원이면 비율 계산이 불가능하므로 인건비율은 0%로 표시됩니다. 인건비 제외 금액은 매출에서 인건비를 뺀 값(음수 가능)으로 표시됩니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 매출액·인건비와 인건비율, 인건비 제외 금액이 모두 들어가며 엑셀에서 열 수 있는 CSV로 내려받습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="인건비 비율 계산 결과"
          lines={lines}
          total={{ label: "인건비율", value: `${result.ratio}%` }}
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="매출액 (원)"
          type="text"
          inputMode="numeric"
          value={revenueRaw}
          onChange={(e) => setRevenueRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 10,000,000"
        />
        <InputBlock
          label="인건비 (원)"
          type="text"
          inputMode="numeric"
          value={laborRaw}
          onChange={(e) => setLaborRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 3,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 같은 기간(월·연) 기준의 매출과 인건비를 입력하세요.</p>
    </CalculatorLayout>
  );
}
