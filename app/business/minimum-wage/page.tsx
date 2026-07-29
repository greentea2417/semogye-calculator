"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

// 2026년 적용 최저임금 (고용노동부 고시, 2025.8.5): 시간급 10,320원
const MIN_HOURLY_2026 = 10320;
// 월 환산 근로시간 계산용: 1개월 평균 주 수 = 365 ÷ 12 ÷ 7
const WEEKS_PER_MONTH = 365 / 12 / 7;
// 최저임금 월 환산액(주 40시간, 월 209시간 기준)
const MIN_MONTHLY_2026 = MIN_HOURLY_2026 * 209;

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

export default function MinimumWagePage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [weeklyHoursRaw, setWeeklyHoursRaw] = useState("40");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const weeklyHours = Math.max(0, parseDecimal(weeklyHoursRaw));

    // 주휴시간: 주 소정근로 15시간 이상이면 (주소정 ÷ 40 × 8), 최대 8시간
    const weeklyHolidayHours = weeklyHours >= 15 ? Math.min(weeklyHours, 40) / 40 * 8 : 0;
    // 월 환산 근로시간(주휴 포함)
    const monthlyHours = Math.round((weeklyHours + weeklyHolidayHours) * WEEKS_PER_MONTH);
    // 내 시급 기준 예상 월급(주휴 포함 월 환산시간 × 시급)
    const monthlyPay = Math.round(hourly * monthlyHours);
    // 최저임금 충족 여부
    const meets = hourly === 0 ? null : hourly >= MIN_HOURLY_2026;
    const gap = hourly === 0 ? 0 : hourly - MIN_HOURLY_2026;

    return { hourly, weeklyHours, weeklyHolidayHours, monthlyHours, monthlyPay, meets, gap };
  }, [hourlyRaw, weeklyHoursRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "최저임금 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const meetLabel =
    result.meets === null ? "-" : result.meets ? "충족 ✅" : "미달 ⚠️";

  const resultLines: ResultLine[] = [
    { label: "2026년 최저시급", hint: "(고용노동부 고시)", value: `${MIN_HOURLY_2026.toLocaleString()}원` },
    { label: "주휴 포함 월 환산시간", hint: "(주휴시간 포함)", value: `${result.monthlyHours.toLocaleString()}시간` },
    { label: "최저임금 충족 여부", value: meetLabel },
    { label: "최저 월급(209시간 기준)", value: `${MIN_MONTHLY_2026.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "내 시급 기준 예상 월급",
    value: `${result.monthlyPay.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "minimum-wage",
      title: "최저임금 계산기",
      inputs: [
        { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
        { label: "주 소정근로시간(입력)", value: `${result.weeklyHours}시간` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="최저임금 계산기"
      subtitle="2026년 최저시급 10,320원 기준으로 최저임금 충족 여부와 월급을 계산합니다."
      intro="내 시급이 2026년 최저임금(시간급 10,320원)을 넘는지 확인하고, 주휴수당을 포함한 월급으로 환산해 볼 수 있어요."
      faqTitle="최저임금 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 2026년 최저임금은 얼마인가요?",
          a: "A. 2026년 적용 최저임금은 시간급 10,320원입니다. 월 환산액은 주 40시간(월 209시간) 기준 2,156,880원입니다. (고용노동부 2025.8.5 고시)",
        },
        {
          q: "Q. 월 209시간은 어떻게 나온 건가요?",
          a: "A. 주 40시간 근로 + 주휴 8시간을 더한 주 48시간에, 1개월 평균 주 수(365 ÷ 12 ÷ 7 ≈ 4.345)를 곱하면 약 209시간이 됩니다. 그래서 최저 월급 = 10,320원 × 209시간입니다.",
        },
        {
          q: "Q. 주휴수당은 왜 월급에 포함되나요?",
          a: "A. 주 15시간 이상 근무하고 소정근로일을 개근하면 하루치 임금을 주휴수당으로 유급 지급해야 합니다. 그래서 월 환산시간에 주휴시간을 함께 넣어 계산합니다.",
        },
        {
          q: "Q. 시급이 최저임금보다 낮으면 어떻게 되나요?",
          a: "A. 최저임금 미만으로 지급하는 계약은 무효이며, 사용자는 최저임금 이상을 지급할 의무가 있습니다. 위반 시 최저임금법에 따라 처벌될 수 있습니다.",
        },
        {
          q: "Q. 빈칸은 어떻게 처리하나요?",
          a: "A. 시급을 비워 두면 충족 여부는 표시하지 않고 0원으로 처리합니다. 주 근로시간을 비우면 0시간으로 계산합니다.",
        },
      ]}
      result={
        <ResultPanel
          title="최저임금 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 2026년 최저시급 10,320원·주휴 포함 월 환산 기준의 단순 계산이며, 실제 임금은 근로형태·수당·공제에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="시급 (원)"
        type="text"
        inputMode="numeric"
        value={hourlyRaw}
        onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 10,320"
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
