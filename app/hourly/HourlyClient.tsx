"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";

import { encodeShareState } from "../components/lib/shareState";
import { buildShareUrl, copyToClipboardSafe, shareOrCopy } from "../components/lib/shareUtils";
import { useShareRestore } from "../components/lib/useShareRestore";

const WEEKS_PER_MONTH = 52 / 12;
const MAX_HOURLY_WAGE = 1_000_000;
const MAX_MONTHLY_HOURS = 744;

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
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
  // 🔧 초기값은 빈 값 → placeholder만 보여서 그레이 처리
  const [hourlyWageRaw, setHourlyWageRaw] = useState("");
  const [monthlyHoursRaw, setMonthlyHoursRaw] = useState("");
  const [includeWeeklyHolidayPay, setIncludeWeeklyHolidayPay] = useState(false);
  const [avgWorkDaysPerWeekRaw, setAvgWorkDaysPerWeekRaw] = useState("5");

  // ✅ 하단 폴딩
  const [infoOpen, setInfoOpen] = useState(false);

  // ✅ 공유 state (입력만)
  const shareState = useMemo<HourlyShareState>(
    () => ({
      v: 1,
      inputs: {
        hourlyWageRaw,
        monthlyHoursRaw,
        includeWeeklyHolidayPay,
        avgWorkDaysPerWeekRaw,
      },
    }),
    [hourlyWageRaw, monthlyHoursRaw, includeWeeklyHolidayPay, avgWorkDaysPerWeekRaw]
  );

  // ✅ 공유 URL: 무조건 /hourly 로 고정 (홈 튀는 문제 방지)
  const shareUrl = useMemo(() => {
    const data = encodeShareState(shareState);
    return buildShareUrl("/hourly", data);
  }, [shareState]);

  // ✅ 공유 링크로 들어오면 입력 복원 + URL에서 data 제거
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

    return {
      basePay,
      weeklyHolidayPay,
      totalPay: basePay + weeklyHolidayPay,
    };
  }, [hourlyWageRaw, monthlyHoursRaw, includeWeeklyHolidayPay, avgWorkDaysPerWeekRaw]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold">시급 계산기</h1>
      <p className="mt-2 text-center text-sm text-gray-500">월 총 급여 자동 계산</p>

      {/* ✅ SEO/UX 한 줄 요약 */}
      <p className="mt-2 text-center text-sm text-gray-600">
        시급을 입력하면 월 기준 총 급여를 자동으로 계산해줍니다.
      </p>

      <section className="mt-8 space-y-5 rounded-2xl border p-6 shadow-sm bg-white">
        {/* 시급 */}
        <div>
          <label className="text-sm font-medium text-gray-700">시급</label>
          <div className="relative mt-2">
            <input
              inputMode="numeric"
              className="w-full rounded-xl border px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400"
              placeholder="예: 12,000"
              value={hourlyWageRaw}
              onChange={(e) => {
                const num = parseNumber(e.target.value);
                setHourlyWageRaw(formatWithComma(num));
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">최대 1,000,000원까지 입력 가능</p>
        </div>

        {/* 월 실근로시간 */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            월 총 실근로시간 <span className="text-gray-400">(휴게시간 제외)</span>
          </label>

          <div className="relative mt-2">
            <input
              inputMode="decimal"
              className="w-full rounded-xl border px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400"
              placeholder="예: 86.5"
              value={monthlyHoursRaw}
              onChange={(e) => {
                // 입력 중엔 사용자가 친 값 최대한 보존 (숫자와 점만 허용)
                const next = e.target.value.replace(/[^\d.]/g, "");
                // 점이 여러 개 들어가면 첫 점만 유지
                const firstDot = next.indexOf(".");
                const normalized =
                  firstDot === -1 ? next : next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
                setMonthlyHoursRaw(normalized);
              }}
              onBlur={() => {
                // 입력 끝났을 때만 소수 1자리로 정리
                const num = parseNumber(monthlyHoursRaw);
                if (!num) {
                  setMonthlyHoursRaw("");
                  return;
                }
                setMonthlyHoursRaw(num.toFixed(1));
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">시간</span>
          </div>

          <p className="mt-1 text-xs text-gray-500">매일 시간이 달라도 합산만 입력하면 돼요 (최대 744시간)</p>
        </div>

        {/* 주휴 토글 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">주휴수당 포함 여부</p>

              {/* ✅ 툴팁(한 줄) */}
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs text-gray-600 hover:bg-gray-50"
                title="주 15시간 이상 근무하고, 소정 근로일을 개근한 경우 주휴수당이 발생할 수 있습니다."
                aria-label="주휴수당 설명"
              >
                i
              </button>
            </div>
            <p className="text-xs text-gray-500">* 조건에 따라 달라질 수 있어요</p>
          </div>

          <button
            type="button"
            onClick={() => setIncludeWeeklyHolidayPay(!includeWeeklyHolidayPay)}
            className={`h-7 w-12 rounded-full ${includeWeeklyHolidayPay ? "bg-blue-600" : "bg-gray-300"}`}
            aria-pressed={includeWeeklyHolidayPay}
            aria-label="주휴수당 포함 토글"
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white transition ${
                includeWeeklyHolidayPay ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {includeWeeklyHolidayPay && (
          <div>
            <label className="text-sm font-medium text-gray-700">주당 평균 근무일수</label>
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={avgWorkDaysPerWeekRaw}
              onChange={(e) => setAvgWorkDaysPerWeekRaw(e.target.value)}
            />
          </div>
        )}

        {/* 결과 */}
        <div className="rounded-2xl bg-gray-50 p-6">
          <h2 className="font-bold">계산 결과</h2>

          <div className="mt-3 flex justify-between text-sm">
            <span>기본급</span>
            <span className="font-semibold">{formatKRW(calc.basePay)}원</span>
          </div>

          {includeWeeklyHolidayPay && (
            <div className="mt-1 flex justify-between text-sm">
              <span>주휴수당(예상)</span>
              <span className="font-semibold">{formatKRW(calc.weeklyHolidayPay)}원</span>
            </div>
          )}

          <div className="mt-3 flex justify-between border-t pt-3">
            <span className="font-bold">월 총 급여(세전)</span>
            <span className="text-xl font-extrabold">{formatKRW(calc.totalPay)}원</span>
          </div>

          <p className="mt-2 text-xs text-gray-500">* 세전 기준 / 실근로시간(휴게시간 제외)</p>

          {/* ✅ 액션(공유/복사) */}
          <BottomActions
          onShare={async () => {
            await shareOrCopy("세모계 시급 계산기", shareUrl);
          }}
        />
        </div>
      </section>

      {/* ✅ 하단 폴딩 설명(SEO + 신뢰) */}
      <section className="mt-6 rounded-2xl border bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
          aria-expanded={infoOpen}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span className="font-semibold text-gray-900">이 시급 계산기는 어떻게 계산하나요?</span>
          </div>
          <span className="text-gray-500">{infoOpen ? "▲" : "▼"}</span>
        </button>

        {infoOpen && (
          <div className="px-6 pb-5 pt-0 text-sm text-gray-700 space-y-2">
            <p>
              이 시급 계산기는 시급과 월 실제 근무시간을 기준으로 <b>주휴수당 포함 여부</b>를 선택해{" "}
              <b>월 총 급여(세전)</b>를 계산합니다.
            </p>
            <p>알바·파트타임 근로자가 월급으로 얼마를 받는지 빠르게 확인할 수 있습니다.</p>
            <p className="text-xs text-gray-500">
              * 본 계산 결과는 2025년 기준 정보를 바탕으로 산출되었으며, 실제 급여는 근로 형태·계약 조건·사업장
              정책에 따라 달라질 수 있습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
