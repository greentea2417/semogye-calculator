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
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function WeeklyHolidayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [weeklyHoursRaw, setWeeklyHoursRaw] = useState("40");
  const [workDaysRaw, setWorkDaysRaw] = useState("5");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const weeklyHours = parseNumber(weeklyHoursRaw);
    const workDays = Math.max(1, Math.min(7, parseNumber(workDaysRaw) || 5));
    const eligible = weeklyHours >= 15;
    const dailyHours = weeklyHours / workDays;
    const weeklyHolidayHours = eligible ? Math.min(8, dailyHours) : 0;
    const monthlyHolidayPay = Math.round(hourly * weeklyHolidayHours * (52 / 12));
    return { hourly, weeklyHours, workDays, eligible, dailyHours, weeklyHolidayHours, monthlyHolidayPay };
  }, [hourlyRaw, weeklyHoursRaw, workDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "주휴수당 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "주간 실근로시간", value: `${result.weeklyHours.toFixed(1)}시간` },
    { label: "주휴수당 대상 여부", value: result.eligible ? "대상" : "미달" },
  ];
  const total: ResultLine = { label: "월 예상 주휴수당", value: `${result.monthlyHolidayPay.toLocaleString()}원` };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "weekly-holiday",
      title: "주휴수당 계산기",
      inputs: [
        { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
        { label: "주간 실근로시간(입력)", value: `${result.weeklyHours.toFixed(1)}시간` },
        { label: "주당 평균 근무일수(입력)", value: `${result.workDays}일` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="주휴수당 계산기"
      subtitle="주 15시간 이상 근무 시 발생할 수 있는 주휴수당을 계산합니다."
      intro="주간 실근로시간과 근무일수를 기준으로 월 예상 주휴수당을 바로 확인해보세요."
      faqTitle="주휴수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 주휴수당은 언제 생기나요?", a: "A. 일반적으로 1주 소정근로시간이 15시간 이상이고, 개근 요건을 충족할 때 발생합니다." },
        { q: "Q. 하루 8시간을 넘게 받을 수 있나요?", a: "A. 보통 1일 소정근로시간을 한도로 보며, 이 계산기는 8시간 상한을 적용합니다." },
        { q: "Q. 아르바이트도 받을 수 있나요?", a: "A. 네. 주 15시간 이상이고 요건을 충족하면 아르바이트도 대상이 될 수 있습니다." },
        { q: "Q. 사업장마다 다를 수 있나요?", a: "A. 근로계약과 실제 근로형태에 따라 달라질 수 있으니 최종 판단은 계약서와 노무 기준을 확인하세요." },
      ]}
      result={<ResultPanel title="주휴수당 리포트" lines={lines} total={total} note="* 근로계약, 개근 여부, 실제 소정근로시간에 따라 달라질 수 있는 참고용 계산입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="시급 (원)" type="text" inputMode="numeric" value={hourlyRaw} onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" />
      <div className="mt-4"><InputBlock label="주간 실근로시간 (시간)" type="text" inputMode="decimal" value={weeklyHoursRaw} onChange={(e) => setWeeklyHoursRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 40" /></div>
      <div className="mt-4"><InputBlock label="주당 평균 근무일수 (일)" type="text" inputMode="numeric" value={workDaysRaw} onChange={(e) => setWorkDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 5" /></div>
    </CalculatorLayout>
  );
}
