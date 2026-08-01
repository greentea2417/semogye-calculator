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

const MIN_TAXABLE = 50000; // 과세최저한: 기타소득금액 5만원 이하는 과세하지 않음

export default function OtherIncomeTaxPage() {
  const [grossRaw, setGrossRaw] = useState("");
  const [expenseRateRaw, setExpenseRateRaw] = useState("60");

  const result = useMemo(() => {
    const gross = Math.max(0, parseNumber(grossRaw));
    const expenseRate = Math.min(100, Math.max(0, parseNumber(expenseRateRaw)));
    const expense = gross * (expenseRate / 100);
    const otherIncome = Math.max(0, gross - expense); // 기타소득금액
    const belowMin = otherIncome <= MIN_TAXABLE; // 과세최저한 적용 여부
    const incomeTax = belowMin ? 0 : Math.floor((otherIncome * 0.2) / 10) * 10; // 소득세 20%, 10원 미만 절사
    const localTax = belowMin ? 0 : Math.floor((incomeTax * 0.1) / 10) * 10; // 지방소득세 10%, 10원 미만 절사
    const totalTax = incomeTax + localTax;
    const net = gross - totalTax;
    const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0;
    return { gross, expenseRate, expense, otherIncome, belowMin, incomeTax, localTax, totalTax, net, effectiveRate };
  }, [grossRaw, expenseRateRaw]);

  const lines: ResultLine[] = [
    { label: "필요경비", hint: `지급액 × ${result.expenseRate}%`, value: won(result.expense) },
    { label: "기타소득금액", hint: "지급액 − 필요경비", value: won(result.otherIncome) },
    { label: "소득세", hint: "기타소득금액 × 20%", value: won(result.incomeTax) },
    { label: "지방소득세", hint: "소득세 × 10%", value: won(result.localTax) },
    { label: "원천징수 합계", hint: "소득세 + 지방소득세", value: won(result.totalTax) },
    { label: "실효세율", hint: "원천징수 ÷ 지급액", value: `${(Math.round(result.effectiveRate * 100) / 100).toFixed(2)}%` },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "기타소득 원천징수 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "other-income-tax",
      title: "기타소득 원천징수 계산기",
      inputs: [
        { label: "지급액(입력)", value: won(result.gross) },
        { label: "필요경비율(입력)", value: `${result.expenseRate}%` },
      ],
      lines,
      total: { label: "실지급액", value: won(result.net) },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="기타소득 원천징수 계산기"
      subtitle="강연료·원고료 등 기타소득 지급 시 떼는 원천징수 세액과 실지급액을 계산합니다."
      intro="필요경비 60% 기준이면 지급액의 8.8%를 원천징수합니다. 필요경비율을 바꿔 다른 기타소득도 계산할 수 있어요."
      faqTitle="기타소득 원천징수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 기타소득 원천징수는 어떻게 계산하나요?", a: "A. 기타소득금액 = 지급액 − 필요경비이고, 소득세 = 기타소득금액 × 20%, 지방소득세 = 소득세 × 10% 입니다. 필요경비 60%를 적용하면 지급액의 8.8%가 원천징수됩니다. (소득세법 제21조·제129조)" },
        { q: "Q. 필요경비율은 몇 %인가요?", a: "A. 강연료·원고료·인적용역 등 일반적인 기타소득은 60%입니다. 일부 소득(공익법인 상금, 서화·골동품 양도 등)은 80%가 적용되어 실효세율이 4.4%가 됩니다. 실제 필요경비가 더 크면 그 금액을 인정받을 수도 있습니다." },
        { q: "Q. 왜 8.8%인가요?", a: "A. 지급액 × (1−60%) = 기타소득금액이 지급액의 40%이고, 여기에 소득세 20% + 지방소득세(소득세의 10%)를 합쳐 22%를 곱하면 지급액 기준 8.8%가 됩니다." },
        { q: "Q. 과세최저한이 무엇인가요?", a: "A. 기타소득금액이 건별 5만원 이하이면 소득세를 과세하지 않습니다(소득세법 제84조). 필요경비 60% 기준으로는 지급액 125,000원 이하가 여기에 해당해 원천징수 세액이 0원입니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 지급액·필요경비율 입력값과 필요경비, 기타소득금액, 소득세, 지방소득세, 원천징수 합계, 실효세율, 실지급액이 모두 들어갑니다." },
      ]}
      result={
        <ResultPanel
          title="기타소득 원천징수 결과"
          lines={lines}
          total={{ label: "실지급액", value: won(result.net) }}
          note={result.belowMin && result.gross > 0 ? "* 기타소득금액이 5만원 이하라 과세최저한이 적용되어 원천징수 세액이 0원입니다." : "* 원천징수 세액은 10원 미만을 절사해 계산했습니다."}
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="지급액 (원)" type="text" inputMode="numeric" value={grossRaw} onChange={(e) => setGrossRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
        <InputBlock label="필요경비율 (%)" type="text" inputMode="numeric" value={expenseRateRaw} onChange={(e) => setExpenseRateRaw(String(Math.min(100, Math.max(0, parseNumber(e.target.value)))) )} placeholder="예: 60" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 일반 기타소득(강연료·원고료 등)은 필요경비 60%가 기본입니다. 지급자(원천징수의무자)가 세액을 떼고 지급합니다.</p>
    </CalculatorLayout>
  );
}
