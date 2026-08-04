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

export default function RaiseRatePage() {
  const [oldRaw, setOldRaw] = useState(""); // 기존 연봉
  const [newRaw, setNewRaw] = useState(""); // 변경 연봉

  const result = useMemo(() => {
    const oldSalary = Math.max(0, parseNumber(oldRaw));
    const newSalary = Math.max(0, parseNumber(newRaw));
    const diff = newSalary - oldSalary; // 인상액(삭감 시 음수)
    const rate = oldSalary > 0 ? round2((diff / oldSalary) * 100) : 0; // 인상률
    const monthlyDiff = Math.round(diff / 12); // 월 환산 인상액
    const oldMonthly = Math.round(oldSalary / 12);
    const newMonthly = Math.round(newSalary / 12);
    return { oldSalary, newSalary, diff, rate, monthlyDiff, oldMonthly, newMonthly };
  }, [oldRaw, newRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연봉 인상률 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "연봉 인상액", hint: "변경 연봉 − 기존 연봉", value: `${result.diff.toLocaleString()}원` },
    { label: "월 환산 인상액", hint: "인상액 ÷ 12", value: `${result.monthlyDiff.toLocaleString()}원` },
    { label: "기존 월 환산", hint: "기존 연봉 ÷ 12", value: `${result.oldMonthly.toLocaleString()}원` },
    { label: "변경 월 환산", hint: "변경 연봉 ÷ 12", value: `${result.newMonthly.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "raise-rate",
      title: "연봉 인상률 계산기",
      inputs: [
        { label: "기존 연봉(입력)", value: `${result.oldSalary.toLocaleString()}원` },
        { label: "변경 연봉(입력)", value: `${result.newSalary.toLocaleString()}원` },
      ],
      lines,
      total: { label: "연봉 인상률", value: `${result.rate}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="연봉 인상률 계산기"
      subtitle="기존 연봉과 변경 연봉을 넣으면 인상률·인상액과 월 환산 금액을 바로 계산합니다."
      intro="연봉 협상·연봉 통보 시 인상률(=(변경 연봉 − 기존 연봉) ÷ 기존 연봉)과 실제 늘어나는 월 급여를 함께 확인하는 간이 계산기입니다. 연봉이 줄면 인상률은 음수(삭감률)로 표시됩니다."
      faqTitle="연봉 인상률 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 연봉 인상률은 어떻게 계산하나요?",
          a: "A. 인상률 = (변경 연봉 − 기존 연봉) ÷ 기존 연봉 × 100 입니다. 예를 들어 기존 3,600만원에서 4,000만원으로 오르면 인상액 400만원, 인상률은 약 11.11%입니다.",
        },
        {
          q: "Q. 월급으로는 얼마나 오르나요?",
          a: "A. 인상액을 12로 나눈 값이 월 환산 인상액입니다. 인상액 400만원이면 월 약 33만3,333원이 늘어납니다. 다만 세전 기준이므로 실수령액 증가는 세금·4대보험 공제 후 조금 줄어듭니다.",
        },
        {
          q: "Q. 연봉이 깎이면 어떻게 표시되나요?",
          a: "A. 변경 연봉이 기존 연봉보다 낮으면 인상액과 인상률이 음수로 표시되어 삭감 폭을 그대로 확인할 수 있습니다.",
        },
        {
          q: "Q. 인센티브나 성과급도 포함해야 하나요?",
          a: "A. 계약상 확정된 연봉(기본급 + 고정수당) 기준으로 비교하는 것이 정확합니다. 변동 성과급까지 포함하면 총보상 인상률이 되므로 목적에 맞게 금액을 선택해 입력하세요.",
        },
        {
          q: "Q. 기존 연봉이 0이거나 비어 있으면 어떻게 되나요?",
          a: "A. 기존 연봉이 0원이면 인상률은 0%로 표시됩니다. CSV에는 기존·변경 연봉 입력값과 인상액·월 환산 금액·인상률이 모두 담겨 엑셀에서 바로 열 수 있습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="연봉 인상률 계산 결과"
          lines={lines}
          total={{ label: "연봉 인상률", value: `${result.rate}%` }}
          note="※ 세전 연봉 기준 계산입니다. 실수령액 변화는 세후 실수령액 계산기로 함께 확인해 보세요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="기존 연봉 (원)"
          type="text"
          inputMode="numeric"
          value={oldRaw}
          onChange={(e) => setOldRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 36,000,000"
        />
        <InputBlock
          label="변경 연봉 (원)"
          type="text"
          inputMode="numeric"
          value={newRaw}
          onChange={(e) => setNewRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 40,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 세전 연봉 기준입니다. 인상률은 소수점 둘째 자리까지 표시되며, 연봉이 줄면 음수로 표시됩니다.
      </p>
    </CalculatorLayout>
  );
}
