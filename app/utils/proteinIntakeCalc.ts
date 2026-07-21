// 단백질 권장 섭취량 계산기 순수 로직
// 일반 활동량: 체중(kg) × 0.8g
// 근력 운동: 체중(kg) × 1.2g
// 감량/고강도 운동: 체중(kg) × 1.6g

export type ProteinGoal = "general" | "strength" | "cut";

export type ProteinIntakeResult = {
  gramsPerDay: number;
  gramsPerMeal: number;
};

const FACTORS: Record<ProteinGoal, number> = {
  general: 0.8,
  strength: 1.2,
  cut: 1.6,
};

export function calcProteinIntake(weightKg: number, goal: ProteinGoal): ProteinIntakeResult | null {
  if (!(Number.isFinite(weightKg) && weightKg > 0)) return null;
  const gramsPerDay = weightKg * FACTORS[goal];
  return { gramsPerDay, gramsPerMeal: gramsPerDay / 3 };
}
