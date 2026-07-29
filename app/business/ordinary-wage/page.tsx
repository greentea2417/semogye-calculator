"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

// 월 환산 근로시간 계산용: 1개월 평균 주 수 = 365 ÷ 12 ÷ 7
const WEEKS_PER_MONTH = 365 / 12 / 7;
const DAILY_HOURS = 8; // 1일 소정근로시간(통상일급 환산 기준)
const OVERTIME_RATE = 1.5; // 연장·야간·휴일근로 가산 1.5배

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function parseDecimal(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  return firstDot === -1
    ? Number(cleaned || 0)
    : Number(cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "") || 0);
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function OrdinaryWagePage() {
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [weeklyHoursRaw, setWeeklyHoursRaw] = useState("40");

  const result = useMemo(() => {
    const monthly = parseNumber(monthlyRaw);
    const weeklyHours = Math.max(0, parseDecimal(weeklyHoursRaw));

    // 주휴시간: 주 소정근로 15시간 이상이면 (주소정 ÷ 40 × 8), 최대 8시간
    const weeklyHolidayHours = weeklyHours >= 15 ? Math.min(weeklyHours, 40) / 40 * 8 : 0;
    // 월 소정근로시간(주휴 포함) — 통상임금 산정 기준시간
    const monthlyHours = Math.round((weeklyHours + weeklyHolidayHours) * WEEKS_PER_MONTH);
    // 통상시급 = 월 통상임금 ÷ 월 소정근로시간
    const hourly = monthlyHours > 0 ? Math.round(monthly / monthlyHours) : 0;
    // 통상일급 = 통상시급 × 1일 소정근로시간(8시간)
    const daily = hourly * DAILY_HOURS;
    // 연장·야간·휴일 1시간 가산수당(1.5배)
    const overtimeHourly = Math.round(hourly * OVERTIME_RATE);

    return { monthly, weeklyHours, monthlyHours, hourly, daily, overtimeHourly };
  }, [monthlyRaw, weeklyHoursRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "통상임금 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "월 소정근로시간", hint: "(주휴 포함)", value: `${result.monthlyHours.toLocaleString()}시간` },
    { label: "통상일급", hint: "(통상시급 × 8시간)", value: `${result.daily.toLocaleString()}원` },
    { label: "연장·야간·휴일 1시간 가산", hint: "(통상시급 × 1.5)", value: `${result.overtimeHourly.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "통상시급",
    value: `${result.hourly.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "ordinary-wage",
      title: "통상임금 계산기",
      inputs: [
        { label: "월 통상임금(입력)", value: `${result.monthly.toLocaleString()}원` },
        { label: "주 소정근로시간(입력)", value: `${result.weeklyHours}시간` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="통상임금 계산기"
      subtitle="월 통상임금과 소정근로시간으로 통상시급·통상일급을 계산합니다."
      intro="기본급과 고정수당을 더한 월 통상임금을 넣으면, 연장·야간·휴일수당의 기준이 되는 통상시급을 바로 확인할 수 있어요."
      faqTitle="통상임금 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 통상시급은 어떻게 계산하나요?",
          a: "A. 통상시급 = 월 통상임금 ÷ 월 소정근로시간입니다. 주 40시간 근로자는 주휴시간을 포함해 월 209시간이 기준이 됩니다.",
        },
        {
          q: "Q. 월 통상임금에는 무엇이 포함되나요?",
          a: "A. 기본급과 함께 정기적·일률적·고정적으로 지급되는 고정수당(직책수당·정기상여 등)이 포함됩니다. 실적급·연장근로수당처럼 변동적인 금액은 제외합니다.",
        },
        {
          q: "Q. 통상임금은 어디에 쓰이나요?",
          a: "A. 연장·야간·휴일근로수당, 연차수당, 해고예고수당 등의 산정 기준이 됩니다. 예를 들어 연장근로수당은 통상시급의 1.5배로 계산합니다.",
        },
        {
          q: "Q. 월 소정근로시간 209시간은 어떻게 나오나요?",
          a: "A. 주 40시간 + 주휴 8시간 = 주 48시간에 1개월 평균 주 수(365 ÷ 12 ÷ 7 ≈ 4.345)를 곱하면 약 209시간이 됩니다.",
        },
        {
          q: "Q. 빈칸은 어떻게 처리하나요?",
          a: "A. 빈칸은 0으로 처리합니다. 월 통상임금이나 근로시간이 0이면 통상시급은 0원으로 표시됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="통상임금 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 월 통상임금 ÷ 월 소정근로시간(주휴 포함) 기준의 단순 계산이며, 수당의 통상임금 포함 여부에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="월 통상임금 (원)"
        type="text"
        inputMode="numeric"
        value={monthlyRaw}
        onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 2,090,000"
      />
      <div className="mt-4">
        <InputBlock
          label="주 소정근로시간 (시간)"
          type="text"
          inputMode="decimal"
          value={weeklyHoursRaw}
          onChange={(e) => setWeeklyHoursRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 40"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 주 40시간을 넣으면 월 209시간으로 환산됩니다. 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
