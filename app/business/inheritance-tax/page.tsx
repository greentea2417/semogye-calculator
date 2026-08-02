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

// 상속세 및 증여세법 제26조 세율 (과세표준 구간별 세율·누진공제액)
const TAX_BRACKETS = [
  { limit: 100_000_000, rate: 0.1, deduct: 0 },
  { limit: 500_000_000, rate: 0.2, deduct: 10_000_000 },
  { limit: 1_000_000_000, rate: 0.3, deduct: 60_000_000 },
  { limit: 3_000_000_000, rate: 0.4, deduct: 160_000_000 },
  { limit: Infinity, rate: 0.5, deduct: 460_000_000 },
];

function inheritanceTax(base: number) {
  const b = TAX_BRACKETS.find((x) => base <= x.limit) ?? TAX_BRACKETS[TAX_BRACKETS.length - 1];
  return Math.max(0, base * b.rate - b.deduct);
}

export default function InheritanceTaxPage() {
  const [estateRaw, setEstateRaw] = useState("");
  const [debtRaw, setDebtRaw] = useState("");
  const [deductionRaw, setDeductionRaw] = useState("500,000,000");

  const result = useMemo(() => {
    const estate = Math.max(0, parseNumber(estateRaw));
    const debt = Math.max(0, parseNumber(debtRaw));
    const deduction = Math.max(0, parseNumber(deductionRaw));
    const base = Math.max(0, estate - debt - deduction); // 상속세 과세표준
    const calculated = Math.round(inheritanceTax(base)); // 산출세액
    const filingCredit = Math.round(calculated * 0.03); // 신고세액공제 3%
    const payable = calculated - filingCredit; // 납부세액
    const effectiveRate = estate > 0 ? round2((payable / estate) * 100) : 0;
    return { estate, debt, deduction, base, calculated, filingCredit, payable, effectiveRate };
  }, [estateRaw, debtRaw, deductionRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "상속세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "상속세 과세표준", hint: "상속재산 − 채무 등 − 상속공제", value: `${result.base.toLocaleString()}원` },
    { label: "산출세액", hint: "과세표준 × 세율 − 누진공제", value: `${result.calculated.toLocaleString()}원` },
    { label: "신고세액공제", hint: "산출세액 × 3%", value: `${result.filingCredit.toLocaleString()}원` },
    { label: "실효세율", hint: "납부세액 ÷ 상속재산", value: `${result.effectiveRate}%` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "inheritance-tax",
      title: "상속세 계산기",
      inputs: [
        { label: "상속재산가액(입력)", value: `${result.estate.toLocaleString()}원` },
        { label: "채무·공과금·장례비(입력)", value: `${result.debt.toLocaleString()}원` },
        { label: "상속공제(입력)", value: `${result.deduction.toLocaleString()}원` },
      ],
      lines,
      total: { label: "납부세액", value: `${result.payable.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="상속세 계산기"
      subtitle="상속재산가액과 채무·상속공제를 넣으면 과세표준·산출세액·납부세액을 바로 계산합니다."
      intro="상속세 및 증여세법 제26조 누진세율(10~50%)과 신고세액공제 3%를 반영한 간이 계산기입니다. 상속공제 기본값은 일괄공제 5억원입니다."
      faqTitle="상속세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 상속세율은 어떻게 되나요?",
          a: "A. 과세표준 1억원 이하 10%, 5억원 이하 20%, 10억원 이하 30%, 30억원 이하 40%, 30억원 초과 50%의 누진세율입니다. 각 구간의 누진공제액(1,000만·6,000만·1억6,000만·4억6,000만원)을 빼서 산출세액을 계산합니다.",
        },
        {
          q: "Q. 상속공제는 얼마인가요?",
          a: "A. 기초공제 2억원과 그 밖의 인적공제 합계가 5억원에 못 미치면 일괄공제 5억원을 적용할 수 있어 기본값을 5억원으로 두었습니다. 배우자가 있으면 배우자 상속공제(최소 5억~최대 30억원)를 더해 공제란 금액을 늘려 입력하세요.",
        },
        {
          q: "Q. 채무·공과금·장례비는 왜 빼나요?",
          a: "A. 피상속인의 채무, 미납 공과금, 장례비용은 상속재산가액에서 차감한 뒤 공제를 적용해 과세표준을 구합니다. 해당 금액을 채무란에 합산해 입력하세요.",
        },
        {
          q: "Q. 신고세액공제는 무엇인가요?",
          a: "A. 상속개시일이 속하는 달의 말일부터 6개월 이내에 신고하면 산출세액의 3%를 공제합니다. 이 계산기는 기한 내 신고를 가정해 3%를 자동 반영합니다.",
        },
        {
          q: "Q. 상속재산이 공제액보다 적으면 어떻게 되나요?",
          a: "A. 과세표준이 0원이 되어 상속세도 0원으로 표시됩니다. 일괄공제 5억원 이하 상속이라면 대체로 세금이 발생하지 않습니다. CSV에는 입력값과 과세표준·산출세액·신고세액공제·납부세액이 모두 담깁니다.",
        },
      ]}
      result={
        <ResultPanel
          title="상속세 계산 결과"
          lines={lines}
          total={{ label: "납부세액", value: `${result.payable.toLocaleString()}원` }}
          note="※ 배우자공제 세부계산, 세대생략 할증, 사전증여재산 합산, 감정평가 등을 반영하지 않은 간이 계산입니다. 실제 신고세액은 세무 전문가와 확인하세요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock
          label="상속재산가액 (원)"
          type="text"
          inputMode="numeric"
          value={estateRaw}
          onChange={(e) => setEstateRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 1,500,000,000"
        />
        <InputBlock
          label="채무·공과금·장례비 (원)"
          type="text"
          inputMode="numeric"
          value={debtRaw}
          onChange={(e) => setDebtRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 0"
        />
        <InputBlock
          label="상속공제 (원)"
          type="text"
          inputMode="numeric"
          value={deductionRaw}
          onChange={(e) => setDeductionRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 500,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 공제 기본값은 일괄공제 5억원입니다. 배우자 상속공제(최소 5억원)가 있으면 합산해 금액을 늘려 입력하세요.
      </p>
    </CalculatorLayout>
  );
}
