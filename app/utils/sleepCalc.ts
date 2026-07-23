// 수면 시간 계산기 로직
// 사람의 수면은 약 90분 주기로 반복되며, 주기가 끝나는 시점에 깨면 개운합니다.
// 잠드는 데 걸리는 시간(평균 15분)을 더해 취침/기상 시각을 추천합니다.

export const SLEEP_CYCLE_MIN = 90; // 한 수면 주기(분)
export const FALL_ASLEEP_MIN = 15; // 잠드는 데 걸리는 평균 시간(분)

// "HH:MM" -> 자정 기준 분(0~1439). 형식이 잘못되면 null.
export function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

// 분 -> "HH:MM" (24시간 순환)
export function toHHMM(mins: number): string {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export type SleepOption = { cycles: number; hours: number; time: string };

// 한 주기 수에 해당하는 전체 오프셋(분): 수면주기 + 잠드는 시간
function offsetFor(cycles: number): number {
  return cycles * SLEEP_CYCLE_MIN + FALL_ASLEEP_MIN;
}

// 기상 시각이 주어졌을 때 추천 취침 시각
// 취침시각 = 기상시각 − (주기수 × 90분 + 15분)
export function bedtimesForWake(wakeMins: number, cycles: number[] = [6, 5, 4]): SleepOption[] {
  return cycles.map((c) => ({
    cycles: c,
    hours: (c * SLEEP_CYCLE_MIN) / 60,
    time: toHHMM(wakeMins - offsetFor(c)),
  }));
}

// 취침 시각이 주어졌을 때 추천 기상 시각
// 기상시각 = 취침시각 + (주기수 × 90분 + 15분)
export function wakesForBedtime(bedMins: number, cycles: number[] = [6, 5, 4]): SleepOption[] {
  return cycles.map((c) => ({
    cycles: c,
    hours: (c * SLEEP_CYCLE_MIN) / 60,
    time: toHHMM(bedMins + offsetFor(c)),
  }));
}
