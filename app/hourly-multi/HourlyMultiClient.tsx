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
   타입
====================== */
type Row = {
  id: string;
  name: string;

  hourlyWageRaw: string; // 콤마 표시
  monthlyHoursRaw: string; // 숫자+점(입력중)

  isFreelancer: boolean; // 3.3%
  includeWeeklyHolidayPay: boolean; // 주휴(예상)
  avgWorkDaysPerWeekRaw: string; // 주휴용
};

type HourlyMultiInputsShare = {
  rows: Row[];
};

type HourlyMultiShareState = { v: 1; inputs: HourlyMultiInputsShare };

/* ======================
   유틸
====================== */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
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
  const clamped = clamp(num, 0, MAX_MONTHLY_HOURS);
  return clamped.toFixed(1);
}

function clampDays(raw: string) {
  const n = Math.round(parseNumber(raw) || 5);
  return clamp(n, 1, 7);
}

/** CSV 안전 처리 */
function csvEscape(value: string) {
  const v = String(value ?? "");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** 한글 엑셀 깨짐 방지(BOM 포함) */
function downloadCSV(filename: string, csvText: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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

  // 직원 접기/펼치기 상태
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // 공유 state (rows만)
  const shareState = useMemo<HourlyMultiShareState>(
    () => ({
      v: 1,
      inputs: { rows },
    }),
    [rows]
  );

  // 공유 URL: 항상 /hourly-multi 고정 (data= 방식)
  const shareUrl = useMemo(() => {
    const data = encodeShareState(shareState);
    return buildShareUrl("/hourly-multi", data);
  }, [shareState]);

  // 공유 링크로 들어왔을 때 복원
  useShareRestore<HourlyMultiInputsShare>({
    restore: (i) => {
      const nextRows = Array.isArray(i.rows) ? i.rows.slice(0, MAX_ROWS) : [];
      if (!nextRows.length) return;

      const fixed = nextRows.map((r, idx) => ({
        id: r.id || uid(),
        name: r.name ?? `직원 ${idx + 1}`,
        hourlyWageRaw: r.hourlyWageRaw ?? "",
        monthlyHoursRaw: r.monthlyHoursRaw ?? "",
        isFreelancer: !!r.isFreelancer,
        includeWeeklyHolidayPay: !!r.includeWeeklyHolidayPay,
        avgWorkDaysPerWeekRaw: r.avgWorkDaysPerWeekRaw ?? "5",
      }));

      setRows(fixed);
      setCollapsed({});
    },
  });

  const computed = useMemo(() => {
    const items = rows.map((r) => {
      const wage = clamp(parseNumber(r.hourlyWageRaw), 0, MAX_HOURLY_WAGE);
      const monthHours = clamp(parseNumber(r.monthlyHoursRaw), 0, MAX_MONTHLY_HOURS);

      const basePay = wage * monthHours;

      // 주휴(예상)
      const daysPerWeek = clampDays(r.avgWorkDaysPerWeekRaw);
      const weeklyHours = monthHours / WEEKS_PER_MONTH;
      const eligibleByHours = weeklyHours >= 15;

      const dailyHours = daysPerWeek > 0 ? weeklyHours / daysPerWeek : 0;
      const weeklyHolidayHoursPerWeek = eligibleByHours ? Math.min(8, dailyHours) : 0;
      const monthlyHolidayHours = weeklyHolidayHoursPerWeek * WEEKS_PER_MONTH;

      const weeklyHolidayPay = r.includeWeeklyHolidayPay ? wage * monthlyHolidayHours : 0;

      const grossPay = basePay + weeklyHolidayPay;

      // 프리랜서 3.3%
      const withholding = r.isFreelancer ? grossPay * WITHHOLD_FREELANCER : 0;
      const netPay = grossPay - withholding;

      return {
        id: r.id,
        wage,
        monthHours,
        daysPerWeek,
        eligibleByHours,
        basePay,
        weeklyHolidayPay,
        grossPay,
        withholding,
        netPay,
      };
    });

    const totalBase = items.reduce((a, x) => a + x.basePay, 0);
    const totalHoliday = items.reduce((a, x) => a + x.weeklyHolidayPay, 0);
    const totalGross = items.reduce((a, x) => a + x.grossPay, 0);
    const totalWithholding = items.reduce((a, x) => a + x.withholding, 0);
    const totalNet = items.reduce((a, x) => a + x.netPay, 0);
    const totalHours = items.reduce((a, x) => a + x.monthHours, 0);

    return {
      items,
      totalBase,
      totalHoliday,
      totalGross,
      totalWithholding,
      totalNet,
      totalHours,
    };
  }, [rows]);

  function addRow() {
    setRows((prev) => {
      if (prev.length >= MAX_ROWS) return prev;
      return [
        ...prev,
        {
          id: uid(),
          name: `직원 ${prev.length + 1}`,
          hourlyWageRaw: "",
          monthlyHoursRaw: "",
          isFreelancer: false,
          includeWeeklyHolidayPay: false,
          avgWorkDaysPerWeekRaw: "5",
        },
      ];
    });
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
    setCollapsed((prev) => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const canAdd = rows.length < MAX_ROWS;
  const canCollapse = rows.length >= 5;

  function toggleCollapseRow(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function collapseAll() {
    setCollapsed(() => {
      const next: Record<string, boolean> = {};
      for (const r of rows) next[r.id] = true;
      return next;
    });
  }

  function expandAll() {
    setCollapsed({});
  }

  const allCollapsed = canCollapse && rows.every((r) => collapsed[r.id]);

  function handleDownloadCSV() {
    const itemsById = new Map(computed.items.map((it) => [it.id, it]));

    const header = [
      "직원명",
      "시급(원)",
      "월 실근로시간(시간)",
      "주휴사용",
      "주당 평균 근무일수",
      "프리랜서3.3%사용",
      "기본인건비(세전,원)",
      "주휴수당(예상,원)",
      "세전합계(원)",
      "원천징수(원)",
      "실지급(예상,원)",
    ];

    const lines: string[] = [];
    lines.push(header.map(csvEscape).join(","));

    for (const r of rows) {
      const it = itemsById.get(r.id);

      const wage = it?.wage ?? 0;
      const monthHours = it?.monthHours ?? 0;

      lines.push(
        [
          r.name || "",
          String(Math.round(wage)),
          String(monthHours.toFixed(1)),
          r.includeWeeklyHolidayPay ? "Y" : "N",
          r.includeWeeklyHolidayPay ? String(clampDays(r.avgWorkDaysPerWeekRaw)) : "",
          r.isFreelancer ? "Y" : "N",
          String(Math.round(it?.basePay ?? 0)),
          String(Math.round(it?.weeklyHolidayPay ?? 0)),
          String(Math.round(it?.grossPay ?? 0)),
          String(Math.round(it?.withholding ?? 0)),
          String(Math.round(it?.netPay ?? 0)),
        ].map(csvEscape).join(",")
      );
    }

    // 합계 요약
    lines.push("");
    lines.push(["합계", "", "", "", "", "", "", "", "", "", ""].join(","));
    lines.push(
      [
        "총합(요약)",
        "",
        computed.totalHours.toFixed(1),
        "",
        "",
        "",
        String(Math.round(computed.totalBase)),
        String(Math.round(computed.totalHoliday)),
        String(Math.round(computed.totalGross)),
        String(Math.round(computed.totalWithholding)),
        String(Math.round(computed.totalNet)),
      ].map(csvEscape).join(",")
    );

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    downloadCSV(`semogye-hourly-multi-${y}${m}${d}.csv`, lines.join("\n"));
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">사장님용 시급 계산기</h1>
        <p className="mt-2 text-sm text-gray-500">
          시급을 기준으로 <b>사장님이 실제 부담하는 인건비</b>를 확인합니다.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">직원 입력</h2>
            <p className="mt-1 text-xs text-gray-500">
              최대 <b>{MAX_ROWS}명</b>까지 입력 가능 · 시간은 <b>실근로시간(휴게 제외)</b> 기준
            </p>

            {canCollapse && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={allCollapsed ? expandAll : collapseAll}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  {allCollapsed ? "모두 펼치기" : "모두 접기"}
                </button>
                <span className="self-center text-xs text-gray-400">(직원 5명 이상부터)</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={addRow}
            disabled={!canAdd}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              canAdd ? "bg-blue-600 hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            + 직원 추가 ({rows.length}/{MAX_ROWS})
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {rows.map((row, idx) => {
            const item = computed.items.find((x) => x.id === row.id);
            const isCollapsed = !!collapsed[row.id];

            return (
              <div key={row.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                {/* 상단: 직원명 / 접기 / 삭제 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {row.name || `직원 ${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {canCollapse && (
                      <button
                        type="button"
                        onClick={() => toggleCollapseRow(row.id)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        {isCollapsed ? "펼치기" : "접기"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-40 px-2 py-1 rounded-md hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 접힌 상태: 요약 */}
                {isCollapsed ? (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>세전 합계</span>
                      <span className="font-semibold">{formatKRW(item?.grossPay ?? 0)}원</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">실지급(예상)</span>
                      <span className="text-base font-extrabold text-gray-900">
                        {formatKRW(item?.netPay ?? 0)}원
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">시급/시간/옵션은 펼치면 수정 가능해요.</p>
                  </div>
                ) : (
                  <>
                    {/* 직원명 입력 */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600">직원명</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        placeholder={`직원 ${idx + 1}`}
                      />
                    </div>

                    {/* 입력들 */}
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {/* 시급 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600">시급</label>
                        <div className="relative mt-1">
                          <input
                            inputMode="numeric"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400"
                            placeholder="예: 12,000"
                            value={row.hourlyWageRaw}
                            onChange={(e) => {
                              const num = clamp(parseNumber(e.target.value), 0, MAX_HOURLY_WAGE);
                              updateRow(row.id, { hourlyWageRaw: formatWithComma(num) });
                            }}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
                            원
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500">
                          최대 {MAX_HOURLY_WAGE.toLocaleString("ko-KR")}원
                        </p>
                      </div>

                      {/* 월 총 실근로시간 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          월 총 실근로시간 <span className="text-gray-400">(휴게 제외)</span>
                        </label>
                        <div className="relative mt-1">
                          <input
                            inputMode="decimal"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-12 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400"
                            placeholder="예: 120 또는 86.5"
                            value={row.monthlyHoursRaw}
                            onChange={(e) =>
                              updateRow(row.id, { monthlyHoursRaw: normalizeDecimalInput(e.target.value) })
                            }
                            onBlur={() =>
                              updateRow(row.id, { monthlyHoursRaw: toFixed1OnBlur(row.monthlyHoursRaw) })
                            }
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
                            시간
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500">최대 {MAX_MONTHLY_HOURS}시간 · 소수 1자리</p>
                      </div>
                    </div>

                    {/* 옵션 토글 */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          프리랜서 3.3%
                          <span className="block text-xs text-gray-400">원천징수 후 실지급 계산</span>
                        </span>
                        <Switch
                          checked={row.isFreelancer}
                          onClick={() => updateRow(row.id, { isFreelancer: !row.isFreelancer })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          주휴수당(예상)
                          <span className="block text-xs text-gray-400">조건에 따라 달라질 수 있음</span>
                        </span>
                        <Switch
                          checked={row.includeWeeklyHolidayPay}
                          onClick={() =>
                            updateRow(row.id, { includeWeeklyHolidayPay: !row.includeWeeklyHolidayPay })
                          }
                        />
                      </div>
                    </div>

                    {/* 주휴 ON일 때만 */}
                    {row.includeWeeklyHolidayPay && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600">주당 평균 근무일수</label>
                        <input
                          inputMode="numeric"
                          className="mt-1 w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400"
                          value={row.avgWorkDaysPerWeekRaw}
                          onChange={(e) => updateRow(row.id, { avgWorkDaysPerWeekRaw: e.target.value })}
                        />
                        <p className="mt-1 text-[11px] text-gray-400">주휴 계산용 (1~7)</p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          주휴 적용 여부는 근무 형태에 따라 달라질 수 있어요.
                        </p>
                      </div>
                    )}

                    {/* 직원별 결과 */}
                    <div className="mt-4 grid gap-2 border-t border-gray-200 pt-3 text-sm">
                      <div className="flex items-center justify-between text-gray-700">
                        <span>기본 인건비(세전)</span>
                        <span className="font-semibold">{formatKRW(item?.basePay ?? 0)}원</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-700">
                        <span>주휴수당(예상)</span>
                        <span className="font-semibold">{formatKRW(item?.weeklyHolidayPay ?? 0)}원</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-700">
                        <span>세전 합계</span>
                        <span className="font-semibold">{formatKRW(item?.grossPay ?? 0)}원</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-700">
                        <span>원천징수</span>
                        <span className="font-semibold">{formatKRW(item?.withholding ?? 0)}원</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">실지급(예상)</span>
                        <span className="text-base font-extrabold text-gray-900">
                          {formatKRW(item?.netPay ?? 0)}원
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 합계 */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5">
          <h3 className="text-base font-bold text-gray-900">합계</h3>

          <div className="mt-3 grid gap-2 text-sm text-gray-800">
            <div className="flex items-center justify-between text-gray-600">
              <span>총 실근로시간 합계</span>
              <span>{computed.totalHours.toFixed(1)}시간</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>기본 인건비 합계(세전)</span>
              <span>{formatKRW(computed.totalBase)}원</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>주휴수당 합계(예상)</span>
              <span>{formatKRW(computed.totalHoliday)}원</span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-base font-bold">총 인건비(세전)</span>
              <span className="text-xl font-extrabold">{formatKRW(computed.totalGross)}원</span>
            </div>

            <div className="flex items-center justify-between text-gray-700">
              <span>총 원천징수</span>
              <span className="font-bold">{formatKRW(computed.totalWithholding)}원</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-bold">총 실지급(예상)</span>
              <span className="text-xl font-extrabold">{formatKRW(computed.totalNet)}원</span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              * 근무시간은 <b>실근로시간(휴게시간 제외)</b> 기준입니다. 주휴수당은 <b>예상</b>치이며,
              실제 적용 여부는 근무 형태/조건에 따라 달라질 수 있습니다.
            </p>
          </div>

          {/* 액션: 엑셀 + 링크복사 + 공유하기 */}
          <BottomActions
            excelLabel="엑셀 다운로드"
            excelHint="엑셀에서 바로 열 수 있어요 (.csv)"
            onExcelDownload={handleDownloadCSV}
            copyLabel="링크복사"
            onCopyLink={async () => {
              await copyToClipboardSafe(shareUrl);
              alert("현재 입력값이 포함된 링크가 복사되었습니다.");
            }}
            onShare={async () => {
              const r = await shareOrCopy("세모계 사장님용 시급 계산기", shareUrl);
              if (r.method === "copy") alert("현재 입력값이 포함된 링크가 복사되었습니다.");
            }}
          />
        </div>
      </section>

      {/* ✅ 설명 섹션 */}
      <section className="mt-10 space-y-4">
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
            기본 급여 외에도 <b className="font-medium text-gray-900">주휴수당(예상)</b>, 프리랜서 선택 시{" "}
            <b className="font-medium text-gray-900">3.3% 원천징수</b> 등을 함께 고려해 총액을 보여줍니다.
          </p>

          <p className="text-xs leading-5 text-gray-500">
            ※ 본 계산은 참고용이며, 실제 4대보험 적용 여부, 주휴수당 발생 조건, 사업장·근무 형태에 따라 실제 부담 금액은 달라질 수
            있습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
