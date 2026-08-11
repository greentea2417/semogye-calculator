"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";

import { encodeShareState } from "../components/lib/shareState";
import { buildShareUrl, shareOrCopy } from "../components/lib/shareUtils";
import { useShareRestore } from "../components/lib/useShareRestore";
import { toast } from "../components/toast";

const WEEKS_PER_MONTH = 52 / 12;
const MAX_HOURLY_WAGE = 1_000_000;
const MAX_MONTHLY_HOURS = 744;

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function formatKRW(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
function formatWithComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

type HourlyInputsShare = {
  hourlyWageRaw: string;
  monthlyHoursRaw: string;
  includeWeeklyHolidayPay: boolean;
  avgWorkDaysPerWeekRaw: string;
};
type HourlyShareState = { v: 1; inputs: HourlyInputsShare };

export default function HourlyClient() {
  const [hourlyWageRaw, setHourlyWageRaw] = useState("");
  const [monthlyHoursRaw, setMonthlyHoursRaw] = useState("");
  const [includeWeeklyHolidayPay, setIncludeWeeklyHolidayPay] = useState(false);
  const [avgWorkDaysPerWeekRaw, setAvgWorkDaysPerWeekRaw] = useState("5");

  const shareState = useMemo<HourlyShareState>(
    () => ({
      v: 1,
      inputs: { hourlyWageRaw, monthlyHoursRaw, includeWeeklyHolidayPay, avgWorkDaysPerWeekRaw },
    }),
    [hourlyWageRaw, monthlyHoursRaw, includeWeeklyHolidayPay, avgWorkDaysPerWeekRaw]
  );

  const shareUrl = useMemo(() => buildShareUrl("/hourly", encodeShareState(shareState)), [shareState]);

  useShareRestore<HourlyInputsShare>({
    restore: (i) => {
      setHourlyWageRaw(i.hourlyWageRaw ?? "");
      setMonthlyHoursRaw(i.monthlyHoursRaw ?? "");
      setIncludeWeeklyHolidayPay(!!i.includeWeeklyHolidayPay);
      setAvgWorkDaysPerWeekRaw(i.avgWorkDaysPerWeekRaw ?? "5");
    },
  });

  const calc = useMemo(() => {
    const wage = clamp(parseNumber(hourlyWageRaw), 0, MAX_HOURLY_WAGE);
    const hours = clamp(parseNumber(monthlyHoursRaw), 0, MAX_MONTHLY_HOURS);
    const days = clamp(Math.round(parseNumber(avgWorkDaysPerWeekRaw) || 5), 1, 7);

    const basePay = wage * hours;
    const weeklyHours = hours / WEEKS_PER_MONTH;
    const eligible = weeklyHours >= 15;

    const dailyHours = weeklyHours / days;
    const weeklyHolidayHours = eligible ? Math.min(8, dailyHours) : 0;
    const monthlyHolidayHours = weeklyHolidayHours * WEEKS_PER_MONTH;
    const weeklyHolidayPay = includeWeeklyHolidayPay ? wage * monthlyHolidayHours : 0;

    return { basePay, weeklyHolidayPay, totalPay: basePay + weeklyHolidayPay };
  }, [hourlyWageRaw, monthlyHoursRaw, includeWeeklyHolidayPay, avgWorkDaysPerWeekRaw]);

  const onShare = async () => {
    const r = await shareOrCopy("세모계 시급 계산기", shareUrl);
    if (r.method === "copy") toast("현재 입력값이 포함된 링크를 복사했어요!");
  };

  const resultLines: ResultLine[] = [
            { label: "기본급", hint: "(시급 × 근로시간)", value: `${formatKRW(calc.basePay)}원` },
            { label: "주휴수당(예상)", value: `${formatKRW(calc.weeklyHolidayPay)}원` },
          ];
  const resultTotal: ResultLine = { label: "월 총 급여(세전)", value: `${formatKRW(calc.totalPay)}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "hourly",
      title: "시급 계산기",
      inputs: [
        { label: "시급(입력)", value: `${formatKRW(parseNumber(hourlyWageRaw))}원` },
        { label: "월 실근로시간(입력)", value: `${parseNumber(monthlyHoursRaw)}시간` },
        { label: "주휴수당 포함(입력)", value: includeWeeklyHolidayPay ? "포함" : "미포함" },
        { label: "주당 평균 근무일수(입력)", value: `${parseNumber(avgWorkDaysPerWeekRaw) || 5}일` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="시급 계산기 | 세모계"
      subtitle="시급과 월 근로시간으로 월 총 급여(세전)를 계산합니다."
      intro="주휴수당 포함 여부를 선택하면 알바·파트타임 근로자의 월 총 급여를 바로 확인할 수 있어요."
      faqTitle="시급 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 월 총 급여는 어떻게 계산되나요?", a: "A. 기본급 = 시급 × 월 실근로시간이며, 주휴수당을 포함하면 그만큼 더해집니다. 세전 기준입니다." },
        { q: "Q. 주휴수당은 언제 받을 수 있나요?", a: "A. 주 15시간 이상 근무하고 소정 근로일을 개근하면 발생할 수 있습니다. 실제 지급 여부는 근무 형태와 계약 조건에 따라 달라집니다." },
        { q: "Q. 근무시간에 휴게시간도 포함하나요?", a: "A. 아니요. 무급 휴게시간은 제외한 실근로시간만 입력하세요. 근로기준법상 4시간마다 30분의 휴게시간이 주어집니다." },
        { q: "Q. 여기 나온 금액이 통장에 들어오나요?", a: "A. 세전 금액입니다. 4대보험과 세금이 공제되면 실수령액은 더 적어집니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 세전 기준이며 실근로시간(휴게시간 제외)으로 계산합니다. 주휴수당은 예상치이며 근무 조건에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div>
        <label className="input-label">시급</label>
        <div className="relative mt-1">
          <input
            inputMode="numeric"
            className="input-field w-full pr-10"
            placeholder="예: 12,000"
            value={hourlyWageRaw}
            onChange={(e) => setHourlyWageRaw(formatWithComma(parseNumber(e.target.value)))}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
            원
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          최대 {MAX_HOURLY_WAGE.toLocaleString("ko-KR")}원까지 입력 가능
        </p>
      </div>

      <div className="mt-4">
        <label className="input-label">
          월 총 실근로시간 <span className="text-gray-400">(휴게시간 제외)</span>
        </label>
        <div className="relative mt-1">
          <input
            inputMode="decimal"
            className="input-field w-full pr-12"
            placeholder="예: 86.5"
            value={monthlyHoursRaw}
            onChange={(e) => {
              const next = e.target.value.replace(/[^\d.]/g, "");
              const firstDot = next.indexOf(".");
              const normalized =
                firstDot === -1
                  ? next
                  : next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
              setMonthlyHoursRaw(normalized);
            }}
            onBlur={() => {
              const num = parseNumber(monthlyHoursRaw);
              setMonthlyHoursRaw(num ? num.toFixed(1) : "");
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
            시간
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          매일 시간이 달라도 합산만 입력하면 돼요 (최대 {MAX_MONTHLY_HOURS}시간)
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">주휴수당 포함 여부</p>
          <p className="text-xs text-gray-400">주 15시간 이상 근무·개근 시 발생할 수 있어요</p>
        </div>
        <button
          type="button"
          onClick={() => setIncludeWeeklyHolidayPay((v) => !v)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
            includeWeeklyHolidayPay ? "bg-blue-600" : "bg-gray-300"
          }`}
          aria-pressed={includeWeeklyHolidayPay}
          aria-label="주휴수당 포함 토글"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              includeWeeklyHolidayPay ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {includeWeeklyHolidayPay && (
        <div className="mt-4">
          <label className="input-label">주당 평균 근무일수</label>
          <input
            inputMode="numeric"
            className="input-field mt-1 w-24"
            value={avgWorkDaysPerWeekRaw}
            onChange={(e) => setAvgWorkDaysPerWeekRaw(e.target.value.replace(/[^\d]/g, ""))}
          />
          <p className="mt-1 text-xs text-gray-400">주휴 계산용 (1~7)</p>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
