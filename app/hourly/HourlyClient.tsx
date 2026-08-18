"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorArticle from "@/components/CalculatorArticle";
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
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "시급 계산기란?",
              body: (
                <p>
                  시급 계산기는 <strong>시급과 한 달 실근로시간</strong>을 입력하면 월 총 급여(세전)를 바로 계산하는 도구입니다.
                  아르바이트·파트타임·시간제 근로처럼 매달 근무시간이 달라지는 경우, 이번 달에 받을 급여가 얼마인지 빠르게
                  확인할 때 사용합니다. 주휴수당 포함 여부까지 선택할 수 있어 실제 받는 금액에 더 가깝게 잡을 수 있습니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    기본급 = 시급 × 월 실근로시간
                    <br />
                    주휴수당 = 시급 × 주휴시간 × (52주 ÷ 12개월)
                    <br />
                    월 총 급여(세전) = 기본급 + 주휴수당
                  </p>
                  <p>
                    주휴시간은 <strong>min(1일 소정근로시간, 8시간)</strong>으로 보며, 1일 소정근로시간은 주간 실근로시간을
                    주당 근무일수로 나눠 구합니다. 1주 소정근로시간이 15시간 미만이면 주휴수당은 발생하지 않습니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>시급 12,000원, 월 실근로시간 100시간(주휴 미포함)인 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>기본급 = 12,000 × 100 = <strong>1,200,000원</strong></li>
                    <li>주휴수당을 포함하면 주 15시간 이상·개근 조건에서 예상 주휴수당이 더해집니다.</li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  이 계산기는 <strong>세전(공제 전) 금액</strong>을 보여줍니다. 실제 통장에 들어오는 금액은 4대보험과
                  세금이 공제되어 더 적어질 수 있습니다. 또한 근무시간에는 무급 휴게시간을 제외한 실근로시간만 입력해야
                  정확하며(근로기준법 제54조), 주휴수당 지급 여부는 근로계약과 실제 근무 형태에 따라 달라질 수 있습니다.
                </p>
              ),
            },
          ]}
        />
      }
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
