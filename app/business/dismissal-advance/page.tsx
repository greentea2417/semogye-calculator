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

export default function DismissalAdvancePage() {
  const [avgWageRaw, setAvgWageRaw] = useState("");
  const [noticeDaysRaw, setNoticeDaysRaw] = useState("0");

  const result = useMemo(() => {
    const avgWage = Math.max(0, parseNumber(avgWageRaw));
    const noticeDays = Math.max(0, parseNumber(noticeDaysRaw));
    const shortNoticeDays = Math.max(0, 30 - noticeDays);
    const payable = noticeDays >= 30 ? 0 : round0(avgWage * 30);
    return { avgWage, noticeDays, shortNoticeDays, payable };
  }, [avgWageRaw, noticeDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "해고예고수당 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "평균임금 1일분", hint: "입력값", value: `${result.avgWage.toLocaleString()}원` },
    { label: "통지한 일수", hint: "30일 미만이면 차액 지급", value: `${result.noticeDays.toFixed(0)}일` },
    { label: "미통지 일수", hint: "30일 - 통지 일수", value: `${result.shortNoticeDays.toFixed(0)}일` },
    { label: "해고예고수당", hint: "평균임금 × 30일", value: `${result.payable.toLocaleString()}원` },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "dismissal-advance",
    title: "해고예고수당 계산기",
    inputs: [
      { label: "평균임금 1일분(입력)", value: `${result.avgWage.toLocaleString()}원` },
      { label: "통지한 일수(입력)", value: `${result.noticeDays.toFixed(0)}일` },
    ],
    lines,
    total: { label: "해고예고수당", value: `${result.payable.toLocaleString()}원` },
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout
      tone="business"
      title="해고예고수당 계산기"
      subtitle="30일 전 해고예고가 없을 때 지급될 수 있는 해고예고수당을 계산합니다."
      intro="근로기준법 제26조의 30일 예고 원칙을 기준으로 평균임금 1일분과 통지일수를 입력해 확인하세요."
      faqTitle="해고예고수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 언제 해고예고수당이 생기나요?", a: "A. 사용자가 30일 전에 예고하지 않고 근로자를 해고하는 경우, 예고 대신 평균임금 30일분 지급이 문제될 수 있습니다." },
        { q: "Q. 평균임금은 어떻게 보나요?", a: "A. 보통 해고 전 3개월간 임금총액을 그 기간의 총일수로 나눈 1일 평균임금을 사용합니다." },
        { q: "Q. 0원이나 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원으로 계산합니다." },
        { q: "Q. 실제 지급액과 다를 수 있나요?", a: "A. 해고 사유, 예외 적용, 평균임금 산정 방식에 따라 달라질 수 있습니다." },
      ]}
      result={<ResultPanel title="해고예고수당 리포트" lines={lines} total={{ label: "지급 예상액", value: `${result.payable.toLocaleString()}원` }} note="* 법 적용 여부는 해고 사유와 예외 규정에 따라 달라질 수 있습니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="평균임금 1일분 (원)" type="text" inputMode="numeric" value={avgWageRaw} onChange={(e) => setAvgWageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000" />
      <div className="mt-4"><InputBlock label="통지한 일수 (일)" type="text" inputMode="numeric" value={noticeDaysRaw} onChange={(e) => setNoticeDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 0" /></div>
    </CalculatorLayout>
  );
}
