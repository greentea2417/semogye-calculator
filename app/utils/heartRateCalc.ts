// 목표 심박수 계산기 로직 (카르보넨 공식)
// 최대심박수(HRmax) = 220 − 나이
// 여유심박수(HRR) = HRmax − 안정시 심박수
// 목표심박수 = 여유심박수 × 운동강도(%) + 안정시 심박수

export function maxHeartRate(age: number): number {
  return 220 - age;
}

// intensity 는 0~1 사이 비율. 결과는 정수 bpm 으로 반올림.
export function targetHR(age: number, resting: number, intensity: number): number {
  const hrmax = maxHeartRate(age);
  const reserve = hrmax - resting;
  return Math.round(reserve * intensity + resting);
}

export type HRZoneDef = { name: string; lowPct: number; highPct: number };
export type HRZone = HRZoneDef & { low: number; high: number };

// 운동 강도 구간 정의 (여유심박수 기준 %)
export const ZONE_DEFS: HRZoneDef[] = [
  { name: "준비운동·회복", lowPct: 0.5, highPct: 0.6 },
  { name: "지방연소", lowPct: 0.6, highPct: 0.7 },
  { name: "유산소(심폐)", lowPct: 0.7, highPct: 0.8 },
  { name: "무산소(고강도)", lowPct: 0.8, highPct: 0.9 },
  { name: "최대(전력)", lowPct: 0.9, highPct: 1.0 },
];

export function heartRateZones(age: number, resting: number): HRZone[] {
  return ZONE_DEFS.map((z) => ({
    ...z,
    low: targetHR(age, resting, z.lowPct),
    high: targetHR(age, resting, z.highPct),
  }));
}
