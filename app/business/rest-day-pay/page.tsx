"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) { const cleaned = String(raw ?? "").replace(/[^\d.]/g, ""); return cleaned ? Number(cleaned) : 0; }
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function RestDayPayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [restHoursRaw, setRestHoursRaw] = useState("0");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const restHours = parseNumber(restHoursRaw);
    const premium = Math.round(hourly * restHours);
    return { hourly, restHours, premium };
  }, [hourlyRaw, restHoursRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "휴일근로수당 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "휴일근로시간", value: `${result.restHours.toFixed(1)}시간` },
    { label: "휴일 가산수당", value: `${result.premium.toLocaleString()}원` },
  ];
  const total: ResultLine = { label: "예상 휴일근로수당", value: `${result.premium.toLocaleString()}원` };

  const onCsvDownload = () => downloadResultCsv({
    slug: "rest-day-pay",
    title: "휴일근로수당 계산기",
    inputs: [
      { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
      { label: "휴일근로시간(입력)", value: `${result.restHours.toFixed(1)}시간` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout tone="business" title="휴일근로수당 계산기" subtitle="휴일 근로에 붙는 가산수당을 계산합니다." intro="휴일에 일한 시간과 시급만 넣으면 예상 수당을 바로 확인할 수 있어요." faqTitle="휴일근로수당 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 휴일근로는 어떻게 계산하나요?", a: "A. 휴일에 근로하면 통상임금에 가산이 붙는 구조로 계산됩니다. 실제 가산율은 근로형태에 따라 달라질 수 있어요." },
      { q: "Q. 주휴일과 공휴일이 같은가요?", a: "A. 아니요. 주휴일과 공휴일은 법적 성격이 다를 수 있어 취업규칙을 함께 확인해야 합니다." },
      { q: "Q. 연장근로와 중복되나요?", a: "A. 중복 여부는 실제 근로시간/휴일/야간 조건을 함께 봐야 합니다." },
      { q: "Q. 세후 금액인가요?", a: "A. 아니요. 가산수당의 세전 금액입니다." },
    ]}
    result={<ResultPanel title="휴일근로수당 리포트" lines={lines} total={total} note="* 공휴일/주휴일/약정휴일에 따라 실제 적용이 달라질 수 있습니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="시급 (원)" type="text" inputMode="numeric" value={hourlyRaw} onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 12,000" />
      <div className="mt-4"><InputBlock label="휴일근로시간 (시간)" type="text" inputMode="decimal" value={restHoursRaw} onChange={(e) => setRestHoursRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 8" /></div>
    </CalculatorLayout>
  );
}
