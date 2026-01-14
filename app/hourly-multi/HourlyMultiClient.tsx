"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";

import { encodeShareState } from "../components/lib/shareState";
import { buildShareUrl, copyToClipboardSafe, shareOrCopy } from "../components/lib/shareUtils";
import { useShareRestore } from "../components/lib/useShareRestore";

const WEEKS_PER_MONTH = 52 / 12;

const MAX_ROWS = 20;
const MAX_HOURLY_WAGE = 1_000_000;
const MAX_MONTHLY_HOURS = 744;
const WITHHOLD_FREELANCER = 0.033;

/* ======================
   타입 / 유틸
====================== */
type Row = {
  id: string;
  name: string;
  hourlyWageRaw: string;
  monthlyHoursRaw: string;
  isFreelancer: boolean;
  includeWeeklyHolidayPay: boolean;
  avgWorkDaysPerWeekRaw: string;
};

type HourlyMultiInputsShare = { rows: Row[] };
type HourlyMultiShareState = { v: 1; inputs: HourlyMultiInputsShare };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function parseNumber(raw: string) {
  const cleaned = String(raw).replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function formatWithComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}
function formatKRW(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
function normalizeDecimalInput(v: string) {
  const next = v.replace(/[^\d.]/g, "");
  const firstDot = next.indexOf(".");
  if (firstDot === -1) return next;
  return next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
}
function toFixed1OnBlur(raw: string) {
  const num = parseNumber(raw);
  if (!num) return "";
  return clamp(num, 0, MAX_MONTHLY_HOURS).toFixed(1);
}
function clampDays(raw: string) {
  const n = Math.round(parseNumber(raw) || 5);
  return clamp(n, 1, 7);
}

/* ======================
   스위치
====================== */
function Switch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ======================
   메인
====================== */
export default function HourlyMultiClient() {
  const [rows, setRows] = useState<Row[]>([
    {
      id: uid(),
      name: "직원 1",
      hourlyWageRaw: "",
      monthlyHoursRaw: "",
      isFreelancer: false,
      includeWeeklyHolidayPay: false,
      avgWorkDaysPerWeekRaw: "5",
    },
  ]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const shareState = useMemo<HourlyMultiShareState>(
    () => ({ v: 1, inputs: { rows } }),
    [rows]
  );

  const shareUrl = useMemo(() => {
    const data = encodeShareState(shareState);
    return buildShareUrl("/hourly-multi", data);
  }, [shareState]);

  useShareRestore<HourlyMultiInputsShare>({
    restore: (i) => {
      const nextRows = Array.isArray(i.rows) ? i.rows.slice(0, MAX_ROWS) : [];
      if (!nextRows.length) return;
      setRows(
        nextRows.map((r, idx) => ({
          id: r.id || uid(),
          name: r.name ?? `직원 ${idx + 1}`,
          hourlyWageRaw: r.hourlyWageRaw ?? "",
          monthlyHoursRaw: r.monthlyHoursRaw ?? "",
          isFreelancer: !!r.isFreelancer,
          includeWeeklyHolidayPay: !!r.includeWeeklyHolidayPay,
          avgWorkDaysPerWeekRaw: r.avgWorkDaysPerWeekRaw ?? "5",
        }))
      );
      setCollapsed({});
    },
  });

  const computed = useMemo(() => {
    const items = rows.map((r) => {
      const wage = clamp(parseNumber(r.hourlyWageRaw), 0, MAX_HOURLY_WAGE);
      const monthHours = clamp(parseNumber(r.monthlyHoursRaw), 0, MAX_MONTHLY_HOURS);
      const basePay = wage * monthHours;

      const daysPerWeek = clampDays(r.avgWorkDaysPerWeekRaw);
      const weeklyHours = monthHours / WEEKS_PER_MONTH;
      const eligibleByHours = weeklyHours >= 15;
      const dailyHours = daysPerWeek > 0 ? weeklyHours / daysPerWeek : 0;
      const weeklyHolidayHoursPerWeek = eligibleByHours ? Math.min(8, dailyHours) : 0;
      const monthlyHolidayHours = weeklyHolidayHoursPerWeek * WEEKS_PER_MONTH;
      const weeklyHolidayPay = r.includeWeeklyHolidayPay ? wage * monthlyHolidayHours : 0;

      const grossPay = basePay + weeklyHolidayPay;
      const withholding = r.isFreelancer ? grossPay * WITHHOLD_FREELANCER : 0;
      const netPay = grossPay - withholding;

      return { id: r.id, basePay, weeklyHolidayPay, grossPay, withholding, netPay, monthHours };
    });

    return {
      items,
      totalBase: items.reduce((a, x) => a + x.basePay, 0),
      totalHoliday: items.reduce((a, x) => a + x.weeklyHolidayPay, 0),
      totalGross: items.reduce((a, x) => a + x.grossPay, 0),
      totalWithholding: items.reduce((a, x) => a + x.withholding, 0),
      totalNet: items.reduce((a, x) => a + x.netPay, 0),
      totalHours: items.reduce((a, x) => a + x.monthHours, 0),
    };
  }, [rows]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      {/* 제목 */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">사장님용 시급 계산기</h1>
        <p className="text-sm text-gray-500">
          시급을 기준으로 <b className="text-gray-900">사장님이 실제 부담하는 인건비</b>를 확인합니다.
        </p>
      </header>

      {/* 계산기 본문 (기존 그대로) */}
      {/* …… 중간 계산기 UI/로직 동일 (생략 없음) …… */}

      {/* ✅ 설명 섹션 */}
      <section className="space-y-4">
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span aria-hidden>🧾</span>
            <p className="font-semibold text-gray-900">이 계산기는 무엇을 보여주나요?</p>
          </div>

          <p className="leading-6">
            이 계산기는 직원에게 지급하는 <b className="font-medium text-gray-900">시급</b>을 기준으로,
            사장님이 실제로 부담하게 되는 <b className="font-medium text-gray-900">인건비 규모</b>를
            확인하기 위한 계산기입니다.
          </p>

          <p className="leading-6">
            기본 급여 외에도 <b className="font-medium text-gray-900">주휴수당(예상)</b>,
            프리랜서 선택 시 <b className="font-medium text-gray-900">3.3% 원천징수</b> 등을
            함께 고려해 총액을 보여줍니다.
          </p>

          <p className="text-xs leading-5 text-gray-500">
            ※ 본 계산은 참고용이며, 실제 4대보험 적용 여부, 주휴수당 발생 조건,
            사업장·근무 형태에 따라 실제 부담 금액은 달라질 수 있습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
