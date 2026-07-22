// 운동 칼로리 소모 계산기 순수 로직
// 표준 공식(MET 방식): 소모 칼로리(kcal) = MET × 체중(kg) × 운동 시간(시간)
//   - 운동 시간은 분으로 입력받아 시간(= 분 ÷ 60)으로 환산한다.
//   - 지방 1g ≈ 7.7kcal 로 환산해 참고용 지방 소모량을 함께 제공한다.

export type CalorieResult = {
  calories: number; // 소모 칼로리 (kcal)
  fatGrams: number; // 참고용 지방 소모량 (g)
};

// 대표 운동별 MET 참고값 (성인 기준 근사치)
export const MET_PRESETS: { label: string; met: number }[] = [
  { label: "걷기 (보통)", met: 3.5 },
  { label: "빠르게 걷기", met: 4.3 },
  { label: "조깅", met: 7.0 },
  { label: "달리기", met: 9.8 },
  { label: "자전거", met: 7.5 },
  { label: "수영", met: 8.0 },
  { label: "등산", met: 6.5 },
  { label: "줄넘기", met: 11.0 },
  { label: "요가", met: 2.5 },
  { label: "웨이트", met: 5.0 },
];

export function calcCalorie(
  met: number,
  weightKg: number,
  minutes: number
): CalorieResult | null {
  if (!(met > 0) || !(weightKg > 0) || !(minutes > 0)) return null;
  const hours = minutes / 60;
  const calories = met * weightKg * hours;
  const fatGrams = calories / 7.7;
  return { calories, fatGrams };
}
