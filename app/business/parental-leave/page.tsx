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
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

// 2025년 개편 기준(2026년 적용): 하한 70만원, 사후지급 폐지(매월 전액 지급)
const FLOOR = 700_000;
function monthlyBenefit(ordinaryWage: number, month: number) {
  if (ordinaryWage <= 0) return 0;
  const rate = month <= 6 ? 1.0 : 0.8;
  const cap = month <= 3 ? 2_500_000 : month <= 6 ? 2_000_000 : 1_600_000;
  const raw = ordinaryWage * rate;
  return Math.round(Math.min(cap, Math.max(FLOOR, raw)));
}

export default function ParentalLeavePage() {
  const [wageRaw, setWageRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("12");

  const result = useMemo(() => {
    const wage = Math.max(0, parseNumber(wageRaw));
    const months = Math.min(18, Math.max(0, Math.floor(parseNumber(monthsRaw))));
    const m1 = wage > 0 ? monthlyBenefit(wage, 1) : 0; // 1~3개월
    const m4 = wage > 0 ? monthlyBenefit(wage, 4) : 0; // 4~6개월
    const m7 = wage > 0 ? monthlyBenefit(wage, 7) : 0; // 7개월 이후
    let total = 0;
    for (let m = 1; m <= months; m++) total += monthlyBenefit(wage, m);
    const n1 = Math.min(months, 3);
    const n2 = Math.min(Math.max(months - 3, 0), 3);
    const n3 = Math.max(months - 6, 0);
    return { wage, months, m1, m4, m7, n1, n2, n3, total };
  }, [wageRaw, monthsRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "육아휴직 급여 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: `1~3개월 (${result.n1}개월)`, hint: "통상임금 100%·상한 250만원", value: `${result.m1.toLocaleString()}원/월` },
    { label: `4~6개월 (${result.n2}개월)`, hint: "통상임금 100%·상한 200만원", value: `${result.m4.toLocaleString()}원/월` },
    { label: `7개월 이후 (${result.n3}개월)`, hint: "통상임금 80%·상한 160만원", value: `${result.m7.toLocaleString()}원/월` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "parental-leave",
      title: "육아휴직 급여 계산기",
      inputs: [
        { label: "월 통상임금(입력)", value: `${result.wage.toLocaleString()}원` },
        { label: "육아휴직 기간(입력)", value: `${result.months}개월` },
      ],
      lines: [
        { label: "1~3개월 월 지급액", value: `${result.m1.toLocaleString()}원` },
        { label: "4~6개월 월 지급액", value: `${result.m4.toLocaleString()}원` },
        { label: "7개월 이후 월 지급액", value: `${result.m7.toLocaleString()}원` },
      ],
      total: { label: "총 예상 수령액", value: `${result.total.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="육아휴직 급여 계산기"
      subtitle="월 통상임금과 육아휴직 기간으로 고용보험 육아휴직 급여를 계산합니다."
      intro="2025년 개편(2026년 적용) 기준입니다. 1~3개월은 통상임금 100%(상한 250만원), 4~6개월은 100%(상한 200만원), 7개월 이후는 80%(상한 160만원), 하한은 70만원이며 사후지급 없이 매월 전액 지급됩니다."
      faqTitle="육아휴직 급여 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 육아휴직 급여는 어떻게 계산하나요?", a: "A. 통상임금에 기간별 지급률을 곱하고 상한액을 적용합니다. 1~3개월은 통상임금의 100%(상한 250만원), 4~6개월은 100%(상한 200만원), 7개월 이후는 80%(상한 160만원)이며, 계산값이 70만원 미만이면 하한액 70만원을 지급합니다." },
        { q: "Q. 통상임금이 무엇인가요?", a: "A. 정기적·일률적으로 지급되는 임금으로 기본급과 고정수당을 포함합니다. 실제 급여명세서의 통상임금을 입력하면 됩니다." },
        { q: "Q. 사후지급 25%는 어떻게 되나요?", a: "A. 2025년부터 사후지급 유보 방식이 폐지되어 복직 여부와 관계없이 육아휴직 기간 중 매월 전액을 받습니다." },
        { q: "Q. 부부가 함께 쓰면 더 받나요?", a: "A. 6+6 부모 육아휴직 특례가 별도로 있어 첫 6개월 상한액이 더 높아집니다. 이 계산기는 1인 기준 일반 급여를 계산합니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 통상임금이 비어 있으면 0원으로 처리합니다." },
      ]}
      result={<ResultPanel title="육아휴직 급여 계산 결과" lines={lines} total={{ label: `총 예상 수령액 (${result.months}개월)`, value: `${result.total.toLocaleString()}원` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="월 통상임금 (원)" type="text" inputMode="numeric" value={wageRaw} onChange={(e) => setWageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 3,000,000" />
        <InputBlock label="육아휴직 기간 (개월, 최대 18)" type="text" inputMode="numeric" value={monthsRaw} onChange={(e) => setMonthsRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 12" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 실제 지급액은 고용센터 심사 결과에 따라 달라질 수 있습니다.</p>
    </CalculatorLayout>
  );
}
