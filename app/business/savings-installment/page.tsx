"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

const TAX_RATE = 0.154; // 이자소득세 15.4%

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

export default function SavingsInstallmentPage() {
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");

  const result = useMemo(() => {
    const monthly = parseNumber(monthlyRaw);
    const annual = Number(parseDecimal(rateRaw)) || 0;
    const months = parseNumber(monthsRaw);
    const principal = monthly * months;
    // 정기적금 단리: 각 회차 납입금이 남은 개월수만큼 이자를 받는다.
    // 세전이자 = 월납입액 × (연이율/12) × n(n+1)/2
    const preInterest =
      months > 0 ? Math.round((monthly * (annual / 100 / 12) * months * (months + 1)) / 2) : 0;
    const tax = Math.round(preInterest * TAX_RATE);
    const afterTax = principal + preInterest - tax;
    return { principal, preInterest, tax, afterTax, months };
  }, [monthlyRaw, rateRaw, monthsRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "적금 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "총 납입 원금", value: `${result.principal.toLocaleString()}원` },
    { label: "세전 이자", value: `${result.preInterest.toLocaleString()}원` },
    { label: "이자소득세", hint: "(15.4%)", value: `${result.tax.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "세후 만기 수령액",
    value: `${result.afterTax.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "savings-installment",
      title: "적금 계산기",
      inputs: [
        { label: "월 납입액(입력)", value: `${parseNumber(monthlyRaw).toLocaleString()}원` },
        { label: "연이율(입력)", value: `${parseDecimal(rateRaw) || 0}%` },
        { label: "납입 기간(입력)", value: `${result.months}개월` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="적금 계산기"
      subtitle="매달 넣는 금액과 이율, 기간을 넣으면 정기적금 만기 수령액을 계산합니다."
      intro="매월 같은 금액을 넣는 정기적금(단리) 기준으로, 세전 이자와 이자소득세 15.4%를 뗀 세후 수령액까지 확인할 수 있어요."
      faqTitle="적금 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 적금 이자는 어떻게 계산되나요?", a: "A. 정기적금은 회차마다 납입일이 달라, 세전 이자 = 월납입액 × (연이율 ÷ 12) × 개월수 × (개월수+1) ÷ 2로 계산합니다. 먼저 넣은 돈일수록 이자가 더 붙습니다." },
        { q: "Q. 예금 복리 계산기와 무엇이 다른가요?", a: "A. 이 계산기는 매달 나눠 넣는 적금(단리)이고, 복리 계산기는 목돈을 한 번에 넣는 예금 기준입니다. 납입 방식이 달라 결과가 다릅니다." },
        { q: "Q. 이자소득세는 왜 떼나요?", a: "A. 적금 이자에는 15.4%(소득세 14% + 지방소득세 1.4%)의 이자소득세가 원천징수됩니다. 이 계산기는 세후 수령액도 함께 보여줍니다." },
        { q: "Q. 표시 금리와 실제 이자가 왜 다른가요?", a: "A. 적금은 마지막 회차 납입금이 한 달치 이자만 받기 때문에, 실제 받는 이자는 표시 연이율을 원금 전체에 곱한 값보다 작습니다. 이는 정상입니다." },
      ]}
      result={
        <ResultPanel
          title="적금 만기 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 정기적금 단리·이자소득세 15.4% 기준 단순 계산이며, 우대금리·비과세·중도해지 여부에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="월 납입액 (원)"
        type="text"
        inputMode="numeric"
        value={monthlyRaw}
        onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 500,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="연이율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(parseDecimal(e.target.value))}
          placeholder="예: 3.6"
        />
        <InputBlock
          label="납입 기간 (개월)"
          type="text"
          inputMode="numeric"
          value={monthsRaw}
          onChange={(e) => setMonthsRaw(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="예: 12"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
