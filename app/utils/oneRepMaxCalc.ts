// 1RM(최대 반복 중량) 계산기 순수 로직
// Epley 공식: 1RM = 무게(kg) × (1 + 반복횟수 / 30)
//   - 반복횟수 1회는 그 무게 자체가 1RM이므로 그대로 반환한다.
// 특정 반복횟수 목표 중량: 무게 = 1RM / (1 + 목표반복 / 30)
//   - 1RM 대비 비율(%1RM) = 1 / (1 + 반복횟수 / 30)

export type OneRepRow = {
  reps: number; // 반복횟수
  weight: number; // 해당 반복으로 들 수 있는 추정 중량 (kg)
  percent: number; // 1RM 대비 비율 (0 ~ 1)
};

export type OneRepMaxResult = {
  oneRepMax: number; // 추정 1RM (kg)
  rows: OneRepRow[]; // 반복횟수별 추정 중량 표
};

// 표로 보여줄 대표 반복횟수
export const REP_TABLE = [1, 2, 3, 5, 8, 10, 12, 15];

export function calcOneRepMax(weight: number, reps: number): OneRepMaxResult | null {
  if (!(weight > 0) || !(reps > 0)) return null;

  const oneRepMax = reps <= 1 ? weight : weight * (1 + reps / 30);

  const rows: OneRepRow[] = REP_TABLE.map((r) => {
    const percent = r <= 1 ? 1 : 1 / (1 + r / 30);
    const w = oneRepMax * percent;
    return { reps: r, weight: w, percent };
  });

  return { oneRepMax, rows };
}
