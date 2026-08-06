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

export default function ShutdownAllowancePage() {
  const [avgWageRaw, setAvgWageRaw] = useState("");
  const [shutdownDaysRaw, setShutdownDaysRaw] = useState("0");

  const result = useMemo(() => {
    const avgWage = Math.max(0, parseNumber(avgWageRaw));
    const shutdownDays = Math.max(0, parseNumber(shutdownDaysRaw));
    const dailyAllowance = round0(avgWage * 0.7);
    const total = round0(avgWage * 0.7 * shutdownDays);
    return { avgWage, shutdownDays, dailyAllowance, total };
  }, [avgWageRaw, shutdownDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "휴업수당 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "평균임금 1일분", hint: "입력값", value: `${result.avgWage.toLocaleString()}원` },
    { label: "휴업수당 1일분", hint: "평균임금 × 70%", value: `${result.dailyAllowance.toLocaleString()}원` },
    { label: "휴업일수", hint: "입력값", value: `${result.shutdownDays.toFixed(0)}일` },
    { label: "휴업수당 합계", hint: "1일분 × 휴업일수", value: `${result.total.toLocaleString()}원` },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "shutdown-allowance",
    title: "휴업수당 계산기",
    inputs: [
      { label: "평균임금 1일분(입력)", value: `${result.avgWage.toLocaleString()}원` },
      { label: "휴업일수(입력)", value: `${result.shutdownDays.toFixed(0)}일` },
    ],
    lines,
    total: { label: "휴업수당 합계", value: `${result.total.toLocaleString()}원` },
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout
      tone="business"
      title="휴업수당 계산기"
      subtitle="사용자 귀책이 아닌 휴업 시 평균임금의 70% 기준으로 휴업수당을 계산합니다."
      intro="근로기준법 제46조의 휴업수당 원칙에 맞춰 1일 평균임금과 휴업일수를 입력하세요."
      faqTitle="휴업수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 휴업수당은 얼마인가요?", a: "A. 일반적으로 사용자의 책임 있는 사유로 휴업한 경우 평균임금의 70% 이상을 지급해야 합니다." },
        { q: "Q. 평균임금은 어떻게 계산하나요?", a: "A. 보통 직전 3개월 임금총액을 그 기간의 총일수로 나눈 1일 평균임금을 말합니다." },
        { q: "Q. 0원이나 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원입니다." },
        { q: "Q. 실제 법정 지급액과 다를 수 있나요?", a: "A. 예외 사유, 취업규칙, 개별 사정에 따라 달라질 수 있어 참고용입니다." },
      ]}
      result={<ResultPanel title="휴업수당 리포트" lines={lines} total={{ label: "지급 예상액", value: `${result.total.toLocaleString()}원` }} note="* 법 적용 여부와 예외 사유는 개별 사정에 따라 달라질 수 있습니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="평균임금 1일분 (원)" type="text" inputMode="numeric" value={avgWageRaw} onChange={(e) => setAvgWageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000" />
      <div className="mt-4"><InputBlock label="휴업일수 (일)" type="text" inputMode="numeric" value={shutdownDaysRaw} onChange={(e) => setShutdownDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 3" /></div>
    </CalculatorLayout>
  );
}
