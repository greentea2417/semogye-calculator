// 온도 변환 계산기 로직 (섭씨 ↔ 화씨 ↔ 켈빈)
//   C→F: C × 9/5 + 32      F→C: (F − 32) × 5/9
//   C→K: C + 273.15        K→C: K − 273.15
// 절대영도 미만(물리적으로 불가능한 값)은 입력 오류로 보고 null 을 반환한다.
//   절대영도: 0 K = −273.15 ℃ = −459.67 ℉

export type TempUnit = "C" | "F" | "K";

export type TempResult = {
  C: number; // 섭씨 (소수 2자리)
  F: number; // 화씨 (소수 2자리)
  K: number; // 켈빈 (소수 2자리)
};

const ABS_ZERO = { C: -273.15, F: -459.67, K: 0 } as const;

function round2(n: number): number {
  // -0 방지 위해 +0
  return Number(n.toFixed(2)) + 0;
}

// value 를 unit 기준으로 해석해 섭씨로 환산
function toCelsius(value: number, unit: TempUnit): number {
  if (unit === "C") return value;
  if (unit === "F") return ((value - 32) * 5) / 9;
  return value - 273.15; // K
}

export function convertTemperature(value: number, unit: TempUnit): TempResult | null {
  // 절대영도 미만이면 무효
  if (value < ABS_ZERO[unit]) return null;
  const c = toCelsius(value, unit);
  const f = (c * 9) / 5 + 32;
  const k = c + 273.15;
  return { C: round2(c), F: round2(f), K: round2(k) };
}
