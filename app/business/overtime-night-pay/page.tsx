"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function OvertimeNightPayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [hoursRaw, setHoursRaw] = useState("");
  const [overlapRaw, setOverlapRaw] = useState("0");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const hours = parseNumber(hoursRaw);
    const overlap = Math.min(parseNumber(overlapRaw), hours);
    const overtimeOnly = Math.max(0, hours - overlap);
    const nightOnly = Math.max(0, overlap);
    const overtimePremium = Math.round(hourly * overtimeOnly * 0.5);
    const nightPremium = Math.round(hourly * nightOnly * 0.5);
    const overlapPremium = Math.round(hourly * overlap * 1.0);
    const total = Math.round(hourly * hours + overtimePremium + nightPremium);
    return { hourly, hours, overlap, overtimeOnly, nightOnly, overtimePremium, nightPremium, overlapPremium, total };
  }, [hourlyRaw, hoursRaw, overlapRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연장·야간수당 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "전체 근로시간", value: `${result.hours.toFixed(1)}시간` },
    { label: "연장·야간 중복시간", value: `${result.overlap.toFixed(1)}시간` },
    { label: "연장가산(50%)", value: `${result.overtimePremium.toLocaleString()}원` },
    { label: "야간가산(50%)", value: `${result.nightPremium.toLocaleString()}원` },
  ];
  const total: ResultLine = { label: "예상 연장·야간수당", value: `${result.total.toLocaleString()}원` };

  const onCsvDownload = () => downloadResultCsv({
    slug: "overtime-night-pay",
    title: "연장·야간수당 계산기",
    inputs: [
      { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
      { label: "전체 근로시간(입력)", value: `${result.hours.toFixed(1)}시간` },
      { label: "연장·야간 중복시간(입력)", value: `${result.overlap.toFixed(1)}시간` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout
      tone="business"
      title="연장·야간수당 계산기"
      subtitle="연장근로와 야간근로가 겹치는 시간을 함께 계산합니다."
      intro="중복 구간은 연장 50%와 야간 50%가 함께 붙는 구조를 반영했습니다."
      faqTitle="연장·야간수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 겹치는 시간은 어떻게 계산하나요?", a: "A. 연장근로 가산 50%와 야간근로 가산 50%가 함께 적용되는 구간으로 봅니다. 그래서 해당 시간은 총 100% 가산이 더해집니다." },
        { q: "Q. 연장시간과 야간시간을 따로 넣어야 하나요?", a: "A. 이 계산기는 전체 근로시간과 그중 겹치는 시간을 넣는 방식입니다. 순수 연장시간만 있는 경우 overlap을 0으로 두세요." },
        { q: "Q. 0이나 빈값이면 어떻게 되나요?", a: "A. 가산수당은 0원으로 계산됩니다." },
        { q: "Q. 세후 금액인가요?", a: "A. 아니요. 세전 수당입니다." },
      ]}
      result={<ResultPanel title="연장·야간수당 리포트" lines={lines} total={total} note="* 연장가산 50% + 야간가산 50%를 중복 구간에 적용한 단순 계산입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="시급 (원)" type="text" inputMode="numeric" value={hourlyRaw} onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 12,000" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="전체 근로시간 (시간)" type="text" inputMode="decimal" value={hoursRaw} onChange={(e) => setHoursRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 8" />
        <InputBlock label="연장·야간 중복시간 (시간)" type="text" inputMode="decimal" value={overlapRaw} onChange={(e) => setOverlapRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 2" />
      </div>
    </CalculatorLayout>
  );
}
