// 배란일·가임기 계산기 로직
// 마지막 생리 시작일(lastPeriod)과 평균 생리주기(cycleLength, 기본 28일)로 계산한다.
// 다음 생리 예정일 = 마지막 생리 시작일 + 주기
// 배란일 = 다음 생리 예정일 − 14일 (황체기 14일 가정)
// 가임기 = 배란일 −5일 ~ 배란일 +1일 (정자 생존·난자 수명 고려)
// 날짜 계산은 UTC 기준으로 처리해 시간대 오차를 없앤다.

export type OvulationResult = {
  nextPeriod: string; // 다음 생리 예정일 (YYYY-MM-DD)
  ovulation: string; // 배란 예정일 (YYYY-MM-DD)
  fertileStart: string; // 가임기 시작 (YYYY-MM-DD)
  fertileEnd: string; // 가임기 종료 (YYYY-MM-DD)
};

function toUTCDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmt(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

export function calcOvulation(lastPeriodIso: string, cycleLength = 28): OvulationResult {
  const start = toUTCDate(lastPeriodIso);
  const nextPeriod = addDays(start, cycleLength);
  const ovulation = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  return {
    nextPeriod: fmt(nextPeriod),
    ovulation: fmt(ovulation),
    fertileStart: fmt(fertileStart),
    fertileEnd: fmt(fertileEnd),
  };
}
