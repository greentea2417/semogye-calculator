// 혈중 알코올 농도(BAC) · 해독 시간 계산기 순수 로직 — Widmark 공식
//
// 순수 알코올(g)  = 마신 양(mL) × (도수% ÷ 100) × 0.789(에탄올 밀도 g/mL)
// BAC(%)          = 알코올(g) ÷ (체중kg × r × 10)      // r: 남 0.68, 여 0.55
//   (Widmark 원식: BAC = A(g) / (체중g × r) × 100, 체중g = kg×1000)
// 완전 분해까지 시간(h) = BAC ÷ 0.015 (시간당 대사율 0.015%)
// 운전 가능(0.03% 미만)까지 시간(h) = max(0, (BAC − 0.03) ÷ 0.015)

export type Gender = "male" | "female";

export type BacResult = {
  alcoholGrams: number; // 순수 알코올 (g)
  bac: number; // 혈중 알코올 농도 (%)
  hoursToZero: number; // 완전 분해까지 시간 (h)
  hoursToLegal: number; // 면허정지 기준(0.03%) 미만까지 시간 (h)
};

const ETHANOL_DENSITY = 0.789; // g/mL
const METABOLISM_RATE = 0.015; // %/h
const LEGAL_LIMIT = 0.03; // % (도로교통법 면허정지 기준)

export function calcBac(
  volumeMl: number,
  abvPercent: number,
  weightKg: number,
  gender: Gender
): BacResult | null {
  if (!(volumeMl > 0) || !(abvPercent > 0) || !(weightKg > 0)) return null;
  const r = gender === "male" ? 0.68 : 0.55;
  const alcoholGrams = volumeMl * (abvPercent / 100) * ETHANOL_DENSITY;
  const bac = alcoholGrams / (weightKg * r * 10);
  const hoursToZero = bac / METABOLISM_RATE;
  const hoursToLegal = bac > LEGAL_LIMIT ? (bac - LEGAL_LIMIT) / METABOLISM_RATE : 0;
  return { alcoholGrams, bac, hoursToZero, hoursToLegal };
}

/** 시간(소수)을 "N시간 M분" 문자열로 포맷 */
export function formatHours(hours: number): string {
  if (!(hours > 0)) return "0분";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}분`;
  if (m <= 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
