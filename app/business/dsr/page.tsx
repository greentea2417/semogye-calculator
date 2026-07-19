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

export default function DsrPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const [existingRaw, setExistingRaw] = useState("0");
  const [newRaw, setNewRaw] = useState("0");

  const result = useMemo(() => {
    const income = parseNumber(incomeRaw);
    const existing = parseNumber(existingRaw);
    const newLoan = parseNumber(newRaw);
    const totalRepayment = existing + newLoan;
    // DSR = 연간 원리금상환액 합계 ÷ 연소득 × 100
    const dsr = income > 0 ? (totalRepayment / income) * 100 : 0;
    return { income, existing, newLoan, totalRepayment, dsr };
  }, [incomeRaw, existingRaw, newRaw]);

  const dsrText = `${(Math.round(result.dsr * 10) / 10).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  })}%`;

  const status =
    result.income <= 0
      ? "연소득을 입력하세요"
      : result.dsr <= 40
        ? "규제 기준 40% 이내"
        : "규제 기준 40% 초과";

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "DSR 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "연소득", value: `${result.income.toLocaleString()}원` },
    { label: "기존 대출 연 원리금", value: `${result.existing.toLocaleString()}원` },
    { label: "신규 대출 연 원리금", value: `${result.newLoan.toLocaleString()}원` },
    { label: "연간 원리금 합계", value: `${result.totalRepayment.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: `DSR (${status})`,
    value: dsrText,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "dsr",
      title: "DSR 계산기",
      inputs: [
        { label: "연소득(입력)", value: `${result.income.toLocaleString()}원` },
        { label: "기존 대출 연 원리금(입력)", value: `${result.existing.toLocaleString()}원` },
        { label: "신규 대출 연 원리금(입력)", value: `${result.newLoan.toLocaleString()}원` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="DSR 계산기"
      subtitle="연소득과 대출 원리금으로 총부채원리금상환비율(DSR)을 계산합니다."
      intro="DSR은 연소득 대비 연간 원리금 상환액의 비율입니다. 은행권은 보통 DSR 40%를 대출 한도 기준으로 삼습니다."
      faqTitle="DSR 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. DSR은 어떻게 계산하나요?", a: "A. (모든 대출의 연간 원리금 상환액 합계 ÷ 연소득) × 100입니다. 예를 들어 연소득 5,000만원에 연 원리금이 2,000만원이면 DSR은 40%입니다." },
        { q: "Q. DSR과 DTI는 무엇이 다른가요?", a: "A. DTI는 주택담보대출 원리금 + 기타대출 '이자'만 반영하지만, DSR은 모든 대출의 '원리금'을 전부 반영해 더 엄격합니다." },
        { q: "Q. 연 원리금은 어떻게 넣나요?", a: "A. 매달 상환액에 12를 곱한 연간 금액을 넣으면 됩니다. 원금균등·원리금균등 등 상환방식과 무관하게 1년간 실제 갚는 원금+이자 합계를 입력하세요." },
        { q: "Q. DSR 40%를 넘으면 대출이 안 되나요?", a: "A. 은행권 기준선이 대체로 40%지만 대출 종류·규제지역·차주 조건에 따라 달라집니다. 이 계산기는 참고용이며 실제 심사 결과와 다를 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="DSR 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 연간 원리금 합계 ÷ 연소득 기준의 단순 계산입니다. 실제 심사 기준은 금융기관·규제에 따라 다릅니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="연소득 (원)"
        type="text"
        inputMode="numeric"
        value={incomeRaw}
        onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 50,000,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="기존 대출 연 원리금 (원)"
          type="text"
          inputMode="numeric"
          value={existingRaw}
          onChange={(e) => setExistingRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 12,000,000"
        />
        <InputBlock
          label="신규 대출 연 원리금 (원)"
          type="text"
          inputMode="numeric"
          value={newRaw}
          onChange={(e) => setNewRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 8,000,000"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 매월 상환액 × 12 = 연 원리금. 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
