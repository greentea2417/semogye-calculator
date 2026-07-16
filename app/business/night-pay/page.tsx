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

export default function NightPayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [nightHoursRaw, setNightHoursRaw] = useState("0");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const nightHours = parseNumber(nightHoursRaw);
    const nightPremium = Math.round(hourly * nightHours * 0.5);
    const nightTotal = Math.round(hourly * nightHours * 1.5);
    return { hourly, nightHours, nightPremium, nightTotal };
  }, [hourlyRaw, nightHoursRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "야간수당 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "야간근무시간", value: `${result.nightHours.toFixed(1)}시간` },
    { label: "야간 가산수당", value: `${result.nightPremium.toLocaleString()}원` },
  ];
  const total: ResultLine = { label: "야간근무 총액", value: `${result.nightTotal.toLocaleString()}원` };

  const onCsvDownload = () => downloadResultCsv({
    slug: "night-pay",
    title: "야간수당 계산기",
    inputs: [
      { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
      { label: "야간근무시간(입력)", value: `${result.nightHours.toFixed(1)}시간` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout tone="business" title="야간수당 계산기" subtitle="야간근로 가산임금을 빠르게 계산합니다." intro="22시~06시 야간근로를 기준으로 가산수당과 총액을 확인할 수 있어요." faqTitle="야간수당 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 야간수당은 언제 붙나요?", a: "A. 통상적으로 밤 10시부터 오전 6시 사이의 근로에 50% 가산이 붙습니다." },
      { q: "Q. 연장근로랑 같이 붙나요?", a: "A. 네. 연장/휴일/야간이 중복되면 각각의 가산 여부가 달라질 수 있어 실제 계약 기준을 확인해야 합니다." },
      { q: "Q. 계산 결과가 실수령액인가요?", a: "A. 아니요. 가산임금의 세전 금액을 보여줍니다." },
      { q: "Q. 교대근무도 계산되나요?", a: "A. 야간 시간대에 해당하는 근로시간만 넣으면 참고 계산이 가능합니다." },
    ]}
    result={<ResultPanel title="야간수당 리포트" lines={lines} total={total} note="* 실제 가산율은 근로계약, 취업규칙, 법정 기준에 따라 달라질 수 있습니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="시급 (원)" type="text" inputMode="numeric" value={hourlyRaw} onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 12,000" />
      <div className="mt-4"><InputBlock label="야간근무시간 (시간)" type="text" inputMode="decimal" value={nightHoursRaw} onChange={(e) => setNightHoursRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 3.5" /></div>
    </CalculatorLayout>
  );
}
