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
function round0(n: number) { return Math.round(n); }

export default function OrdinaryWageReversePage() {
  const [monthlyPayRaw, setMonthlyPayRaw] = useState("");
  const [monthlyHoursRaw, setMonthlyHoursRaw] = useState("209");

  const result = useMemo(() => {
    const monthlyPay = Math.max(0, parseNumber(monthlyPayRaw));
    const monthlyHours = Math.max(0, parseNumber(monthlyHoursRaw));
    const hourly = monthlyHours > 0 ? round0(monthlyPay / monthlyHours) : 0;
    const daily8 = round0(hourly * 8);
    return { monthlyPay, monthlyHours, hourly, daily8 };
  }, [monthlyPayRaw, monthlyHoursRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "통상시급 역산 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "월 통상임금", hint: "입력값", value: `${result.monthlyPay.toLocaleString()}원` },
    { label: "월 환산시간", hint: "기본 209시간", value: `${result.monthlyHours.toFixed(0)}시간` },
    { label: "통상시급", hint: "월 통상임금 ÷ 월 환산시간", value: `${result.hourly.toLocaleString()}원` },
    { label: "8시간 기준 통상일급", hint: "통상시급 × 8", value: `${result.daily8.toLocaleString()}원` },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "ordinary-wage-reverse",
    title: "통상시급 역산 계산기",
    inputs: [
      { label: "월 통상임금(입력)", value: `${result.monthlyPay.toLocaleString()}원` },
      { label: "월 환산시간(입력)", value: `${result.monthlyHours.toFixed(0)}시간` },
    ],
    lines,
    total: { label: "통상시급", value: `${result.hourly.toLocaleString()}원` },
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout
      tone="business"
      title="통상시급 역산 계산기"
      subtitle="월 통상임금과 월 환산시간으로 통상시급을 역산합니다."
      intro="통상임금 산정에 자주 쓰는 월 209시간 기준과 사용자 입력값을 비교해 바로 확인하세요."
      faqTitle="통상시급 역산 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 209시간은 무엇인가요?", a: "A. 통상적으로 월 소정근로 40시간 기준에 연장·주휴를 반영한 대표 환산값으로 많이 사용됩니다." },
        { q: "Q. 다른 월 환산시간도 되나요?", a: "A. 네. 회사 취업규칙이나 계약 기준이 다르면 해당 시간을 입력해 계산할 수 있습니다." },
        { q: "Q. 빈칸이나 0도 되나요?", a: "A. 네. 월 환산시간이 0이면 결과를 0원으로 처리합니다." },
        { q: "Q. 법정 통상임금과 완전히 동일한가요?", a: "A. 통상임금 범위는 수당 포함 여부에 따라 달라질 수 있어 참고용입니다." },
      ]}
      result={<ResultPanel title="통상시급 리포트" lines={lines} total={{ label: "통상시급", value: `${result.hourly.toLocaleString()}원` }} note="* 수당 포함 여부와 산정 기준에 따라 결과가 달라질 수 있습니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="월 통상임금 (원)" type="text" inputMode="numeric" value={monthlyPayRaw} onChange={(e) => setMonthlyPayRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 2,500,000" />
      <div className="mt-4"><InputBlock label="월 환산시간 (시간)" type="text" inputMode="numeric" value={monthlyHoursRaw} onChange={(e) => setMonthlyHoursRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 209" /></div>
    </CalculatorLayout>
  );
}
