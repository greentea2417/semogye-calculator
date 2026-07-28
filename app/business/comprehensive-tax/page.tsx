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
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

/** 소득세법 제55조 종합소득세 세율표 (과세표준 상한, 세율, 누진공제) */
const BRACKETS: { limit: number; rate: number; deduct: number }[] = [
  { limit: 14_000_000, rate: 0.06, deduct: 0 },
  { limit: 50_000_000, rate: 0.15, deduct: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduct: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduct: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduct: 19_940_000 },
  { limit: 500_000_000, rate: 0.4, deduct: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduct: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduct: 65_940_000 },
];

function bracketFor(base: number) {
  return BRACKETS.find((b) => base <= b.limit) ?? BRACKETS[BRACKETS.length - 1];
}

export default function ComprehensiveTaxPage() {
  const [baseRaw, setBaseRaw] = useState("");

  const result = useMemo(() => {
    const base = parseNumber(baseRaw);
    if (base <= 0) {
      return { base: 0, rate: 0, deduct: 0, income: 0, local: 0, total: 0 };
    }
    const { rate, deduct } = bracketFor(base);
    const income = Math.max(0, Math.round(base * rate - deduct)); // 산출세액
    const local = Math.round(income * 0.1); // 지방소득세 10%
    const total = income + local;
    return { base, rate, deduct, income, local, total };
  }, [baseRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "종합소득세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "적용 세율", hint: "(과세표준 구간)", value: `${(result.rate * 100).toFixed(0)}%` },
    { label: "누진공제", value: `${result.deduct.toLocaleString()}원` },
    { label: "산출세액", hint: "(과세표준×세율−누진공제)", value: `${result.income.toLocaleString()}원` },
    { label: "지방소득세", hint: "(산출세액의 10%)", value: `${result.local.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "총 납부세액",
    value: `${result.total.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "comprehensive-tax",
      title: "종합소득세 계산기",
      inputs: [{ label: "과세표준(입력)", value: `${parseNumber(baseRaw).toLocaleString()}원` }],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="종합소득세 계산기"
      subtitle="과세표준을 넣으면 종합소득세 산출세액과 지방소득세, 총 납부세액을 계산합니다."
      intro="소득세법 제55조 8단계 누진세율(6%~45%)을 적용해, 과세표준 기준 산출세액과 지방소득세(10%)를 함께 보여줍니다."
      faqTitle="종합소득세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 종합소득세는 어떻게 계산하나요?",
          a: "A. 산출세액 = 과세표준 × 세율 − 누진공제 입니다. 예를 들어 과세표준 3,000만원이면 3,000만원×15% − 126만원 = 324만원이 산출세액입니다(소득세법 제55조).",
        },
        {
          q: "Q. 과세표준은 무엇인가요?",
          a: "A. 과세표준 = 종합소득금액 − 소득공제 입니다. 이 계산기는 소득공제까지 반영된 '과세표준'을 입력값으로 받습니다. 매출이나 총소득이 아니라는 점에 유의하세요.",
        },
        {
          q: "Q. 누진공제는 왜 빼주나요?",
          a: "A. 누진세율은 구간별로 낮은 세율이 먼저 적용됩니다. 누진공제액은 이미 낮은 세율로 계산된 부분을 보정해, 한 번의 곱셈으로 세액을 구할 수 있게 해줍니다.",
        },
        {
          q: "Q. 지방소득세도 내야 하나요?",
          a: "A. 네. 종합소득세(산출세액)의 10%가 지방소득세로 별도 부과됩니다. 이 계산기는 산출세액과 지방소득세를 합한 총 납부세액을 함께 보여줍니다.",
        },
        {
          q: "Q. 세액공제·감면은 반영되나요?",
          a: "A. 아니요. 이 계산기는 산출세액까지 계산합니다. 자녀세액공제, 연금계좌 세액공제 등 각종 세액공제·감면을 적용하면 실제 납부액은 더 줄어들 수 있습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="종합소득세 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 산출세액 기준이며, 각종 세액공제·감면은 반영하지 않았습니다. 정확한 신고는 국세청 홈택스를 이용하세요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4">
        <InputBlock
          label="과세표준 (원)"
          type="text"
          inputMode="numeric"
          value={baseRaw}
          onChange={(e) => setBaseRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 30,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 과세표준 = 종합소득금액 − 소득공제. 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
