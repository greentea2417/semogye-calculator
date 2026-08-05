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
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function won(n: number) {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** 근속연수공제 (소득세법 §48, 2023.1.1 이후) */
function serviceDeductionOf(years: number) {
  if (years <= 5) return 1_000_000 * years;
  if (years <= 10) return 5_000_000 + 2_000_000 * (years - 5);
  if (years <= 20) return 15_000_000 + 2_500_000 * (years - 10);
  return 40_000_000 + 3_000_000 * (years - 20);
}

/** 환산급여공제 (소득세법 §48) */
function convertedDeductionOf(converted: number) {
  if (converted <= 8_000_000) return converted;
  if (converted <= 70_000_000) return 8_000_000 + (converted - 8_000_000) * 0.6;
  if (converted <= 100_000_000) return 45_200_000 + (converted - 70_000_000) * 0.55;
  if (converted <= 300_000_000) return 61_700_000 + (converted - 100_000_000) * 0.45;
  return 151_700_000 + (converted - 300_000_000) * 0.35;
}

/** 종합소득 기본세율 (소득세법 §55, 2023.1.1 이후) */
function basicTaxOf(base: number) {
  if (base <= 14_000_000) return base * 0.06;
  if (base <= 50_000_000) return 840_000 + (base - 14_000_000) * 0.15;
  if (base <= 88_000_000) return 6_240_000 + (base - 50_000_000) * 0.24;
  if (base <= 150_000_000) return 15_360_000 + (base - 88_000_000) * 0.35;
  if (base <= 300_000_000) return 37_060_000 + (base - 150_000_000) * 0.38;
  if (base <= 500_000_000) return 94_060_000 + (base - 300_000_000) * 0.4;
  if (base <= 1_000_000_000) return 174_060_000 + (base - 500_000_000) * 0.42;
  return 384_060_000 + (base - 1_000_000_000) * 0.45;
}

function calcRetirementTax(payoutRaw: number, yearsRaw: number) {
  const payout = Math.max(0, payoutRaw);
  const years = Math.max(0, Math.floor(yearsRaw));
  const empty = {
    payout,
    years,
    serviceDeduction: 0,
    convertedSalary: 0,
    convertedDeduction: 0,
    taxBase: 0,
    incomeTax: 0,
    localTax: 0,
    totalTax: 0,
    effectiveRate: 0,
  };
  if (payout <= 0 || years <= 0) return empty;

  const serviceDeduction = Math.min(serviceDeductionOf(years), payout);
  const convertedSalary = ((payout - serviceDeduction) / years) * 12;
  const convertedDeduction = convertedDeductionOf(convertedSalary);
  const taxBase = Math.max(0, convertedSalary - convertedDeduction);
  const convertedTax = basicTaxOf(taxBase);
  const incomeTax = Math.floor(((convertedTax / 12) * years) / 10) * 10; // 10원 미만 절사
  const localTax = Math.floor((incomeTax * 0.1) / 10) * 10; // 10원 미만 절사
  const totalTax = incomeTax + localTax;
  const effectiveRate = payout > 0 ? (totalTax / payout) * 100 : 0;
  return {
    payout,
    years,
    serviceDeduction,
    convertedSalary,
    convertedDeduction,
    taxBase,
    incomeTax,
    localTax,
    totalTax,
    effectiveRate,
  };
}

export default function RetirementTaxPage() {
  const [payoutRaw, setPayoutRaw] = useState("");
  const [yearsRaw, setYearsRaw] = useState("");

  const result = useMemo(
    () => calcRetirementTax(parseNumber(payoutRaw), parseNumber(yearsRaw)),
    [payoutRaw, yearsRaw],
  );

  const lines: ResultLine[] = [
    { label: "근속연수공제", hint: "소득세법 별표", value: won(result.serviceDeduction) },
    { label: "환산급여", hint: "(퇴직급여−공제)÷연수×12", value: won(result.convertedSalary) },
    { label: "환산급여공제", value: won(result.convertedDeduction) },
    { label: "과세표준", value: won(result.taxBase) },
    { label: "퇴직소득세", hint: "산출세액", value: won(result.incomeTax) },
    { label: "지방소득세", hint: "소득세의 10%", value: won(result.localTax) },
    { label: "실효세율", hint: "총세액 ÷ 퇴직급여", value: `${round2(result.effectiveRate)}%` },
  ];

  const total = { label: "총 납부세액", value: won(result.totalTax) };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "퇴직소득세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "retirement-tax",
      title: "퇴직소득세 계산기",
      inputs: [
        { label: "퇴직급여(입력)", value: won(result.payout) },
        { label: "근속연수(입력)", value: `${result.years}년` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="퇴직소득세 계산기"
      subtitle="퇴직급여와 근속연수를 넣으면 퇴직소득세와 지방소득세를 계산합니다."
      intro="근속연수공제·환산급여·환산급여공제를 반영한 소득세법 방식의 간이 예상치입니다."
      faqTitle="퇴직소득세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 퇴직소득세는 어떻게 계산하나요?",
          a: "A. 퇴직급여에서 근속연수공제를 뺀 뒤 근속연수로 나누고 12를 곱해 환산급여를 구합니다. 여기서 환산급여공제를 뺀 과세표준에 기본세율을 적용해 환산산출세액을 구하고, 다시 12로 나눈 뒤 근속연수를 곱하면 퇴직소득세(산출세액)가 됩니다. 지방소득세는 그 10%입니다.",
        },
        {
          q: "Q. 근속연수공제는 얼마인가요?",
          a: "A. 소득세법 개정(2023년 이후) 기준으로 5년 이하는 연 100만원, 6~10년은 500만원+연 200만원, 11~20년은 1,500만원+연 250만원, 20년 초과는 4,000만원+연 300만원입니다.",
        },
        {
          q: "Q. 근속연수는 어떻게 넣나요?",
          a: "A. 1년 미만은 1년으로 올림해 계산하므로 근무 연수를 정수로 입력하세요. 예를 들어 3년 4개월이면 4년으로 입력합니다.",
        },
        {
          q: "Q. 실제 원천징수액과 다를 수 있나요?",
          a: "A. 이 계산기는 근속연수를 정수로 보고 산출한 간이 예상치입니다. 실제로는 일수 기준 근속연수, 비과세 퇴직소득, 임원 한도 등에 따라 달라질 수 있어 참고용으로만 사용하세요.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 퇴직급여·근속연수와 함께 근속연수공제, 환산급여, 환산급여공제, 과세표준, 퇴직소득세, 지방소득세, 총 납부세액이 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="퇴직소득세 계산 결과"
          lines={lines}
          total={total}
          note="* 소득세법 기준 간이 예상치입니다. 실제 원천징수액은 국세청 계산 결과와 다를 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="퇴직급여 (원)"
          type="text"
          inputMode="numeric"
          value={payoutRaw}
          onChange={(e) => setPayoutRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 50,000,000"
        />
        <InputBlock
          label="근속연수 (년)"
          type="text"
          inputMode="numeric"
          value={yearsRaw}
          onChange={(e) => setYearsRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 10"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 근속연수는 1년 미만을 1년으로 올림해 정수로 입력하세요.
      </p>
    </CalculatorLayout>
  );
}
