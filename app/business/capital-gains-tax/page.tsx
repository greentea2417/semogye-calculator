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
  const cleaned = String(raw ?? "").replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatWon(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function formatYears(n: number) {
  return Number.isFinite(n) && n !== 0 ? String(Math.floor(n)) : "";
}
function won(n: number) {
  return `${Math.floor(n).toLocaleString("ko-KR")}원`;
}

/** 2023년 이후 소득세 기본세율(누진세율). 단위: 원 */
function progressiveIncomeTax(base: number) {
  const brackets = [
    { upTo: 14_000_000, rate: 0.06, deduct: 0 },
    { upTo: 50_000_000, rate: 0.15, deduct: 1_260_000 },
    { upTo: 88_000_000, rate: 0.24, deduct: 5_760_000 },
    { upTo: 150_000_000, rate: 0.35, deduct: 15_440_000 },
    { upTo: 300_000_000, rate: 0.38, deduct: 19_940_000 },
    { upTo: 500_000_000, rate: 0.4, deduct: 25_940_000 },
    { upTo: 1_000_000_000, rate: 0.42, deduct: 35_940_000 },
    { upTo: Infinity, rate: 0.45, deduct: 65_940_000 },
  ];
  for (const b of brackets) {
    if (base <= b.upTo) return Math.max(0, base * b.rate - b.deduct);
  }
  return 0;
}

function calcCapitalGains(sale: number, acquire: number, expense: number, years: number) {
  const gain = sale - acquire - expense; // 양도차익
  const holding = Math.max(0, Math.floor(years));
  const ltRate = holding >= 3 ? Math.min(holding, 15) * 0.02 : 0; // 장기보유특별공제율(일반)
  const ltDeduction = gain > 0 ? gain * ltRate : 0;
  const incomeAmount = gain - ltDeduction; // 양도소득금액
  const base = Math.max(0, incomeAmount - 2_500_000); // 과세표준(기본공제 250만원)
  const calculatedTax = gain > 0 ? Math.floor(progressiveIncomeTax(base)) : 0; // 산출세액
  const localTax = Math.floor(calculatedTax * 0.1); // 지방소득세 10%
  const totalTax = calculatedTax + localTax;
  return { gain, ltRate, ltDeduction, incomeAmount, base, calculatedTax, localTax, totalTax };
}

export default function CapitalGainsTaxPage() {
  const [saleRaw, setSaleRaw] = useState("");
  const [acquireRaw, setAcquireRaw] = useState("");
  const [expenseRaw, setExpenseRaw] = useState("");
  const [yearsRaw, setYearsRaw] = useState("");

  const r = useMemo(
    () =>
      calcCapitalGains(
        parseNumber(saleRaw),
        parseNumber(acquireRaw),
        parseNumber(expenseRaw),
        parseNumber(yearsRaw),
      ),
    [saleRaw, acquireRaw, expenseRaw, yearsRaw],
  );

  const lines: ResultLine[] = [
    { label: "양도차익", hint: "양도가액−취득가액−필요경비", value: won(r.gain) },
    { label: "장기보유특별공제", hint: `${Math.round(r.ltRate * 100)}%`, value: won(r.ltDeduction) },
    { label: "양도소득금액", hint: "양도차익−장특공제", value: won(r.incomeAmount) },
    { label: "과세표준", hint: "기본공제 250만원 차감", value: won(r.base) },
    { label: "산출세액(양도소득세)", hint: "기본세율 6~45%", value: won(r.calculatedTax) },
    { label: "지방소득세", hint: "산출세액 10%", value: won(r.localTax) },
  ];
  const total = { label: "총 납부세액", value: won(r.totalTax) };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "양도소득세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "capital-gains-tax",
      title: "양도소득세 계산기",
      inputs: [
        { label: "양도가액(입력)", value: won(parseNumber(saleRaw)) },
        { label: "취득가액(입력)", value: won(parseNumber(acquireRaw)) },
        { label: "필요경비(입력)", value: won(parseNumber(expenseRaw)) },
        { label: "보유기간(입력)", value: `${Math.max(0, Math.floor(parseNumber(yearsRaw)))}년` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="양도소득세 계산기"
      subtitle="부동산 양도가액·취득가액·보유기간을 넣으면 양도소득세와 지방소득세를 계산합니다."
      intro="장기보유특별공제와 기본공제 250만원, 6~45% 기본세율을 적용한 예상 세액이에요."
      faqTitle="양도소득세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 양도소득세는 어떻게 계산하나요?",
          a: "A. 양도차익(양도가액−취득가액−필요경비)에서 장기보유특별공제를 뺀 양도소득금액에, 기본공제 250만원을 차감한 과세표준을 구합니다. 여기에 6~45% 기본세율을 적용해 산출세액을 계산하고, 그 10%를 지방소득세로 더합니다.",
        },
        {
          q: "Q. 장기보유특별공제는 얼마인가요?",
          a: "A. 일반 부동산은 보유기간 3년 이상부터 연 2%씩, 최대 15년 30%까지 공제합니다. 이 계산기는 이 일반 공제율을 적용하며, 3년 미만이면 공제가 없습니다. 1세대 1주택 고가주택의 보유·거주 각각 최대 40%(합 80%) 공제는 별도입니다.",
        },
        {
          q: "Q. 기본세율 구간은 어떻게 되나요?",
          a: "A. 2023년 이후 기준 과세표준 1,400만원 이하 6%, 5,000만원 이하 15%, 8,800만원 이하 24%, 1.5억원 이하 35%, 3억원 이하 38%, 5억원 이하 40%, 10억원 이하 42%, 10억원 초과 45%의 누진세율입니다.",
        },
        {
          q: "Q. 다주택 중과세나 단기 양도세율도 반영되나요?",
          a: "A. 아니요. 이 계산기는 기본세율만 적용합니다. 조정대상지역 다주택 중과, 보유 2년 미만 단기 양도(1년 미만 50~70%, 1~2년 40~60%) 등은 별도 세율이 적용되므로 실제와 다를 수 있습니다.",
        },
        {
          q: "Q. 손실(결손)이면 어떻게 되나요?",
          a: "A. 양도차익이 0 이하이면 납부할 양도소득세가 없어 세액은 0원으로 표시됩니다. 같은 해 다른 자산의 양도차익과 통산할 수 있으나 이 계산기에는 반영되지 않습니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 양도가액·취득가액·필요경비·보유기간과 양도차익, 장기보유특별공제, 과세표준, 산출세액, 지방소득세, 총 납부세액이 모두 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="양도소득세 계산 결과"
          lines={lines}
          total={total}
          note="* 기본세율·일반 장기보유특별공제 기준의 예상액입니다. 다주택 중과, 단기 양도세율, 비과세·감면 특례는 반영하지 않으므로 실제 신고 세액과 다를 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="양도가액 (원)"
          type="text"
          inputMode="numeric"
          value={saleRaw}
          onChange={(e) => setSaleRaw(formatWon(parseNumber(e.target.value)))}
          placeholder="예: 500,000,000"
        />
        <InputBlock
          label="취득가액 (원)"
          type="text"
          inputMode="numeric"
          value={acquireRaw}
          onChange={(e) => setAcquireRaw(formatWon(parseNumber(e.target.value)))}
          placeholder="예: 300,000,000"
        />
        <InputBlock
          label="필요경비 (원)"
          type="text"
          inputMode="numeric"
          value={expenseRaw}
          onChange={(e) => setExpenseRaw(formatWon(parseNumber(e.target.value)))}
          placeholder="예: 10,000,000 (취득세·중개보수 등)"
        />
        <InputBlock
          label="보유기간 (년)"
          type="text"
          inputMode="numeric"
          value={yearsRaw}
          onChange={(e) => setYearsRaw(formatYears(parseNumber(e.target.value)))}
          placeholder="예: 10"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 필요경비에는 취득세, 법무사·중개 보수, 자본적 지출 등 인정되는 경비를 넣으세요. 보유기간 3년
        미만은 장기보유특별공제가 적용되지 않습니다.
      </p>
    </CalculatorLayout>
  );
}
