// 하루 권장 수분 섭취량 계산기 순수 로직
// 기본 권장량 = 체중(kg) × 33ml  (≈ 0.033 L/kg, 일반 성인 권장 30~35ml/kg의 중간값)
// 운동 보정   = 운동 30분당 +350ml
// 컵 환산     = 250ml / 컵

export const ML_PER_KG = 33;
export const ML_PER_30MIN_EXERCISE = 350;
export const ML_PER_CUP = 250;

export type WaterResult = {
  totalMl: number; // 하루 총 권장량 (ml)
  liters: number; // 리터 환산
  cups: number; // 250ml 컵 개수
};

export function calcWaterIntake(weightKg: number, exerciseMinutes = 0): WaterResult | null {
  if (!(Number.isFinite(weightKg) && weightKg > 0)) return null;
  const exercise = Number.isFinite(exerciseMinutes) && exerciseMinutes > 0 ? exerciseMinutes : 0;
  const baseMl = weightKg * ML_PER_KG;
  const exerciseMl = (exercise / 30) * ML_PER_30MIN_EXERCISE;
  const totalMl = baseMl + exerciseMl;
  return {
    totalMl,
    liters: totalMl / 1000,
    cups: totalMl / ML_PER_CUP,
  };
}
