"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function parseDecimal(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  return firstDot === -1
    ? cleaned
    : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function LoanRepaymentPage() {
  const [principalRaw, setPrincipalRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");

  const result = useMemo(() => {
    const principal = parseNumber(principalRaw);
    const annual = Number(parseDecimal(rateRaw)) || 0;
    const months = parseNumber(monthsRaw);
    if (principal <= 0 || months <= 0) {
      return { principal, months, monthly: 0, total: 0, interest: 0 };
    }
    const r = annual / 100 / 12;
    const monthly =
      r === 0
        ? Math.round(principal / months)
        : Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
    const total = monthly * months;
    const interest = Math.max(0, total - principal);
    return { principal, months, monthly, total, interest };
  }, [principalRaw, rateRaw, monthsRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "대출 이자 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "대출 원금", value: `${result.principal.toLocaleString()}원` },
    { label: "총 이자", hint: "(원리금균등)", value: `${result.interest.toLocaleString()}원` },
    { label: "총 상환금액", value: `${result.total.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "매월 상환액",
    value: `${result.monthly.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "loan-repayment",
      title: "대출 이자 계산기",
      inputs: [
        { label: "대출 원금(입력)", value: `${result.principal.toLocaleString()}원` },
        { label: "연이율(입력)", value: `${parseDecimal(rateRaw) || 0}%` },
        { label: "상환 기간(입력)", value: `${result.months}개월` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="대출 이자 계산기"
      subtitle="원금과 연이율, 기간을 넣으면 원리금균등상환 방식의 매월 상환액과 총 이자를 계산합니다."
      intro="매달 같은 금액을 갚는 원리금균등상환 기준으로, 총 상환금액과 이자 부담을 한눈에 확인할 수 있어요."
      faqTitle="대출 이자 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 원리금균등상환은 어떻게 계산되나요?", a: "A. 매월 상환액 = 원금 × 월이율 × (1+월이율)^개월수 ÷ ((1+월이율)^개월수 − 1)입니다. 월이율은 연이율 ÷ 12로 계산합니다." },
        { q: "Q. 원리금균등과 원금균등은 무엇이 다른가요?", a: "A. 원리금균등은 매달 갚는 금액(원금+이자)이 같고, 원금균등은 매달 갚는 원금이 같아 초반 상환액이 더 큽니다. 이 계산기는 원리금균등 기준입니다." },
        { q: "Q. 총 이자는 어떻게 나오나요?", a: "A. 매월 상환액 × 총 개월수에서 대출 원금을 뺀 금액이 총 이자입니다. 기간이 길수록 이자 부담이 커집니다." },
        { q: "Q. 중도상환수수료도 반영되나요?", a: "A. 아니요. 이 계산기는 중도상환수수료, 거치기간, 우대금리 등을 제외한 단순 계산이라 실제 상품과 차이가 있을 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="대출 상환 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 원리금균등상환 기준 단순 계산이며, 중도상환수수료·거치기간·변동금리 등은 반영되지 않았습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="대출 원금 (원)"
        type="text"
        inputMode="numeric"
        value={principalRaw}
        onChange={(e) => setPrincipalRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 30,000,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="연이율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(parseDecimal(e.target.value))}
          placeholder="예: 5.0"
        />
        <InputBlock
          label="상환 기간 (개월)"
          type="text"
          inputMode="numeric"
          value={monthsRaw}
          onChange={(e) => setMonthsRaw(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="예: 36"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
