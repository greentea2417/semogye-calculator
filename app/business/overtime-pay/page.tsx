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

export default function OvertimePayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [hoursRaw, setHoursRaw] = useState("");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const hours = parseNumber(hoursRaw);
    const premiumRate = 0.5;
    const premium = Math.round(hourly * hours * premiumRate);
    const total = Math.round(hourly * hours + premium);
    return { hourly, hours, premiumRate, premium, total };
  }, [hourlyRaw, hoursRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연장근로수당 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "연장근로시간", value: `${result.hours.toFixed(1)}시간` },
    { label: "가산율", value: "50%" },
    { label: "연장근로 가산수당", value: `${result.premium.toLocaleString()}원` },
  ];
  const total: ResultLine = { label: "예상 연장근로수당", value: `${result.total.toLocaleString()}원` };

  const onCsvDownload = () => downloadResultCsv({
    slug: "overtime-pay",
    title: "연장근로수당 계산기",
    inputs: [
      { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
      { label: "연장근로시간(입력)", value: `${result.hours.toFixed(1)}시간` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout
      tone="business"
      title="연장근로수당 계산기"
      subtitle="연장근로에 붙는 50% 가산수당을 계산합니다."
      intro="연장근로시간과 시급만 넣으면 가산수당과 총액을 바로 확인할 수 있어요."
      faqTitle="연장근로수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 연장근로수당은 어떻게 계산하나요?", a: "A. 통상시급 × 연장근로시간 × 50%로 계산합니다. 연장근로의 법정 가산율은 50%입니다." },
        { q: "Q. 연장근로시간이 0시간이면 얼마인가요?", a: "A. 가산수당은 0원입니다. 다만 실제 급여에서는 기본급은 별도로 지급됩니다." },
        { q: "Q. 야간근로와 겹치면 어떻게 되나요?", a: "A. 같은 시간에 야간근로까지 겹치면 야간 가산도 추가될 수 있어 별도 계산이 필요합니다." },
        { q: "Q. 세후 금액인가요?", a: "A. 아니요. 세전 가산수당입니다." },
      ]}
      result={<ResultPanel title="연장근로수당 리포트" lines={lines} total={total} note="* 근로기준법상 연장근로 가산율 50%를 적용한 단순 계산입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="시급 (원)" type="text" inputMode="numeric" value={hourlyRaw} onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 12,000" />
      <div className="mt-4"><InputBlock label="연장근로시간 (시간)" type="text" inputMode="decimal" value={hoursRaw} onChange={(e) => setHoursRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 3.5" /></div>
    </CalculatorLayout>
  );
}
