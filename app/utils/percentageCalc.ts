// 퍼센트 계산기 로직 (3가지 모드)
//   mode "of":     전체(whole)의 percent% 는? → whole × percent / 100
//   mode "ratio":  part 는 whole 의 몇 % ? → part / whole × 100
//   mode "change": oldVal → newVal 증감률 → (newVal − oldVal) / oldVal × 100
// 결과는 소수 2자리로 반올림한다. 0으로 나누는 경우(ratio·change에서 기준이 0)는 null.

export type PercentMode = "of" | "ratio" | "change";

function round2(n: number): number {
  return Number(n.toFixed(2));
}

// 전체의 percent% 값
export function percentOf(whole: number, percent: number): number {
  return round2((whole * percent) / 100);
}

// part 는 whole 의 몇 %
export function percentRatio(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return round2((part / whole) * 100);
}

// oldVal → newVal 증감률(%)
export function percentChange(oldVal: number, newVal: number): number | null {
  if (oldVal === 0) return null;
  return round2(((newVal - oldVal) / oldVal) * 100);
}
