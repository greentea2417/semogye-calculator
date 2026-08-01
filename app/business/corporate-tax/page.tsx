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

// 법인세법 제55조 세율 (2023.1.1 이후 개시 사업연도 ~ 2025년 기준)
// 구간별 세율과 누진공제액
const BRACKETS = [
  { limit: 200_000_000, rate: 0.09, deduct: 0 },
  { limit: 20_000_000_000, rate: 0.19, deduct: 20_000_000 },
  { limit: 300_000_000_000, rate: 0.21, deduct: 420_000_000 },
  { limit: Infinity, rate: 0.24, deduct: 9_420_000_000 },
];

function corporateTax(base: number) {
  const b = BRACKETS.find((x) => base <= x.limit) ?? BRACKETS[BRACKETS.length - 1];
  return Math.max(0, base * b.rate - b.deduct);
}

export default function CorporateTaxPage() {
  const [baseRaw, setBaseRaw] = useState("");

  const result = useMemo(() => {
    const base = Math.max(0, parseNumber(baseRaw));
    const corpTax = Math.round(corporateTax(base));
    const localTax = Math.round(corpTax * 0.1); // 지방소득세(법인세분) = 법인세액의 10%
    const total = corpTax + localTax;
    const effectiveRate = base > 0 ? round2((total / base) * 100) : 0;
    return { base, corpTax, localTax, total, effectiveRate };
  }, [baseRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "법인세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "법인세 산출세액", hint: "과세표준 × 세율 − 누진공제", value: `${result.corpTax.toLocaleString()}원` },
    { label: "지방소득세", hint: "법인세액 × 10%", value: `${result.localTax.toLocaleString()}원` },
    { label: "실효세율", hint: "총 세액 ÷ 과세표준", value: `${result.effectiveRate}%` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "corporate-tax",
      title: "법인세 계산기",
      inputs: [{ label: "과세표준(입력)", value: `${result.base.toLocaleString()}원` }],
      lines,
      total: { label: "총 납부세액", value: `${result.total.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="법인세 계산기"
      subtitle="과세표준을 넣으면 법인세 산출세액과 지방소득세, 총 납부세액을 바로 계산합니다."
      intro="2025년 기준 법인세법 제55조 세율(9~24%)과 지방소득세 10%를 반영한 간이 계산기입니다."
      faqTitle="법인세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 법인세 세율은 어떻게 되나요?",
          a: "A. 2025년 기준 과세표준 2억원 이하 9%, 2억원 초과 200억원 이하 19%, 200억원 초과 3,000억원 이하 21%, 3,000억원 초과 24%의 누진세율입니다. 각 구간별 누진공제액(2,000만원·4억2,000만원·94억2,000만원)을 빼서 산출합니다.",
        },
        {
          q: "Q. 지방소득세는 어떻게 계산하나요?",
          a: "A. 법인지방소득세는 법인세 산출세액의 10%입니다. 과세표준 5억원이면 법인세 7,500만원, 지방소득세 750만원으로 총 8,250만원이 됩니다.",
        },
        {
          q: "Q. 과세표준은 무엇을 넣어야 하나요?",
          a: "A. 각 사업연도 소득금액에서 이월결손금·비과세·소득공제를 뺀 '과세표준'을 입력합니다. 세액공제·감면(고용·투자세액공제 등)은 반영하지 않은 산출세액 기준 간이 계산이므로 실제 납부세액과 차이가 날 수 있습니다.",
        },
        {
          q: "Q. 과세표준이 0원이면 어떻게 되나요?",
          a: "A. 과세표준이 0원이거나 결손이면 산출세액은 0원으로 표시됩니다. 실제로는 최저한세·가산세 등이 적용될 수 있으니 참고용으로만 활용하세요.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 과세표준과 법인세 산출세액, 지방소득세, 실효세율, 총 납부세액이 모두 들어가며 엑셀에서 열 수 있는 CSV로 내려받습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="법인세 계산 결과"
          lines={lines}
          total={{ label: "총 납부세액", value: `${result.total.toLocaleString()}원` }}
          note="※ 세액공제·감면·최저한세·가산세를 반영하지 않은 간이 계산입니다. 실제 신고세액은 세무 전문가와 확인하세요."
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
          placeholder="예: 500,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 각 사업연도 소득에서 이월결손금·소득공제를 뺀 과세표준을 입력하세요.</p>
    </CalculatorLayout>
  );
}
