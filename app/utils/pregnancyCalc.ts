// 출산예정일(분만예정일) 계산기 로직 — Naegele's rule 기반
//   출산예정일 = 마지막 생리 시작일(LMP) + 280일 (28일 주기 기준)
//   주기 보정  = LMP + 280 + (cycleLength − 28)
//   임신 주수  = floor(경과일/7)주 + (경과일 % 7)일,  경과일 = 기준일 − LMP
//   삼분기     = 1기 0~13주 · 2기 14~27주 · 3기 28주 이상
// 날짜 계산은 UTC 기준으로 처리해 시간대 오차를 없앤다.

export type PregnancyResult = {
  dueDate: string; // 출산예정일 (YYYY-MM-DD)
  weeks: number; // 현재 임신 주수(주)
  days: number; // 현재 임신 주수의 나머지 일수(0~6)
  trimester: 1 | 2 | 3; // 임신 삼분기
  dday: number; // 출산예정일까지 남은 일수(음수면 예정일 경과)
};

const DAY_MS = 86400000;

function toUTCDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  // 존재하지 않는 날짜(예: 2월 30일) 방어
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
}

function fmt(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function calcPregnancy(lmpIso: string, todayIso: string, cycleLength = 28): PregnancyResult | null {
  const lmp = toUTCDate(lmpIso);
  const today = toUTCDate(todayIso);
  if (!lmp || !today) return null;
  if (!Number.isFinite(cycleLength) || cycleLength < 20 || cycleLength > 45) return null;
  // 마지막 생리일이 기준일보다 미래이면 무효
  if (today.getTime() < lmp.getTime()) return null;

  const due = addDays(lmp, 280 + (cycleLength - 28));
  const elapsed = Math.floor((today.getTime() - lmp.getTime()) / DAY_MS);
  const weeks = Math.floor(elapsed / 7);
  const days = elapsed % 7;
  const trimester: 1 | 2 | 3 = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;
  const dday = Math.round((due.getTime() - today.getTime()) / DAY_MS);

  return { dueDate: fmt(due), weeks, days, trimester, dday };
}
