// 기초대사량(BMR)·하루 권장 칼로리(TDEE) 계산기 순수 로직
// Mifflin-St Jeor 공식 사용
//   남성 BMR = 10×체중(kg) + 6.25×키(cm) − 5×나이 + 5
//   여성 BMR = 10×체중(kg) + 6.25×키(cm) − 5×나이 − 161
// TDEE = BMR × 활동계수

export type Gender = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

/** 활동 수준별 계수 (TDEE = BMR × 계수) */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // 거의 운동 안 함
  light: 1.375, // 가벼운 활동 (주 1~3회)
  moderate: 1.55, // 보통 활동 (주 3~5회)
  active: 1.725, // 활발한 활동 (주 6~7회)
  veryActive: 1.9, // 매우 활발 (육체노동·하루 2회 운동)
};

export type BmrResult = {
  bmr: number; // 기초대사량 (kcal/day)
  tdee: number; // 활동대사량 = 하루 권장 칼로리 (kcal/day)
};

export function calcBmr(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
  activity: ActivityLevel
): BmrResult | null {
  if (![weightKg, heightCm, age].every((n) => Number.isFinite(n) && n > 0)) return null;
  const factor = ACTIVITY_FACTORS[activity];
  if (!factor) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? base + 5 : base - 161;
  return { bmr, tdee: bmr * factor };
}
