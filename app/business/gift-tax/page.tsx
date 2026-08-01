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

// 상속세 및 증여세법 제56조 세율 (과세표준 구간별 세율·누진공제액)
const GIFT_BRACKETS = [
  { limit: 100_000_000, rate: 0.1, deduct: 0 },
  { limit: 500_000_000, rate: 0.2, deduct: 10_000_000 },
  { limit: 1_000_000_000, rate: 0.3, deduct: 60_000_000 },
  { limit: 3_000_000_000, rate: 0.4, deduct: 160_000_000 },
  { limit: Infinity, rate: 0.5, deduct: 460_000_000 },
];

function giftTax(base: number) {
  const b = GIFT_BRACKETS.find((x) => base <= x.limit) ?? GIFT_BRACKETS[GIFT_BRACKETS.length - 1];
  return Math.max(0, base * b.rate - b.deduct);
}

export default function GiftTaxPage() {
  const [amountRaw, setAmountRaw] = useState("");
  const [deductionRaw, setDeductionRaw] = useState("50,000,000");

  const result = useMemo(() => {
    const amount = Math.max(0, parseNumber(amountRaw));
    const deduction = Math.max(0, parseNumber(deductionRaw));
    const base = Math.max(0, amount - deduction); // 증여세 과세표준
    const calculated = Math.round(giftTax(base)); // 산출세액
    const filingCredit = Math.round(calculated * 0.03); // 신고세액공제 3%
    const payable = calculated - filingCredit; // 납부세액
    const effectiveRate = amount > 0 ? round2((payable / amount) * 100) : 0;
    return { amount, deduction, base, calculated, filingCredit, payable, effectiveRate };
  }, [amountRaw, deductionRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "증여세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "증여세 과세표준", hint: "증여재산 − 증여재산공제", value: `${result.base.toLocaleString()}원` },
    { label: "산출세액", hint: "과세표준 × 세율 − 누진공제", value: `${result.calculated.toLocaleString()}원` },
    { label: "신고세액공제", hint: "산출세액 × 3%", value: `${result.filingCredit.toLocaleString()}원` },
    { label: "실효세율", hint: "납부세액 ÷ 증여재산", value: `${result.effectiveRate}%` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "gift-tax",
      title: "증여세 계산기",
      inputs: [
        { label: "증여재산가액(입력)", value: `${result.amount.toLocaleString()}원` },
        { label: "증여재산공제(입력)", value: `${result.deduction.toLocaleString()}원` },
      ],
      lines,
      total: { label: "납부세액", value: `${result.payable.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="증여세 계산기"
      subtitle="증여재산가액과 증여재산공제를 넣으면 과세표준·산출세액·납부세액을 바로 계산합니다."
      intro="상속세 및 증여세법 제56조 누진세율(10~50%)과 신고세액공제 3%를 반영한 간이 계산기입니다."
      faqTitle="증여세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 증여세율은 어떻게 되나요?",
          a: "A. 과세표준 1억원 이하 10%, 5억원 이하 20%, 10억원 이하 30%, 30억원 이하 40%, 30억원 초과 50%의 누진세율입니다. 각 구간의 누진공제액(1,000만·6,000만·1억6,000만·4억6,000만원)을 빼서 산출세액을 계산합니다.",
        },
        {
          q: "Q. 증여재산공제는 얼마인가요?",
          a: "A. 10년간 합산 기준으로 배우자 6억원, 성인 자녀 등 직계비속 5,000만원(미성년자 2,000만원), 직계존속 5,000만원, 기타 친족 1,000만원입니다. 관계에 맞는 금액을 공제란에 입력하세요.",
        },
        {
          q: "Q. 신고세액공제는 무엇인가요?",
          a: "A. 증여일이 속하는 달의 말일부터 3개월 이내에 신고하면 산출세액의 3%를 공제합니다. 이 계산기는 기한 내 신고를 가정해 3%를 자동 반영합니다.",
        },
        {
          q: "Q. 증여재산이 공제액보다 적으면 어떻게 되나요?",
          a: "A. 과세표준이 0원이 되어 증여세도 0원으로 표시됩니다. 예를 들어 성인 자녀에게 5,000만원 이하를 증여하면 공제 범위 안이라 세금이 없습니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 증여재산가액·증여재산공제와 과세표준, 산출세액, 신고세액공제, 납부세액이 모두 들어가며 엑셀에서 열 수 있는 CSV로 내려받습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="증여세 계산 결과"
          lines={lines}
          total={{ label: "납부세액", value: `${result.payable.toLocaleString()}원` }}
          note="※ 세대생략 할증, 증여추정·합산, 감정평가 등을 반영하지 않은 간이 계산입니다. 실제 신고세액은 세무 전문가와 확인하세요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="증여재산가액 (원)"
          type="text"
          inputMode="numeric"
          value={amountRaw}
          onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 200,000,000"
        />
        <InputBlock
          label="증여재산공제 (원)"
          type="text"
          inputMode="numeric"
          value={deductionRaw}
          onChange={(e) => setDeductionRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 50,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 공제액 기본값은 성인 자녀(직계비속) 5,000만원입니다. 배우자 6억원, 미성년 자녀 2,000만원, 기타 친족 1,000만원 등 관계에 맞게 수정하세요.
      </p>
    </CalculatorLayout>
  );
}
