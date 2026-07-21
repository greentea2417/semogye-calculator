// 평수 계산기 순수 로직 (평 ↔ ㎡ 변환)
// 1평 = 400/121 ㎡ ≈ 3.3057851 ㎡ (한국 부동산 표준 환산)

export const SQM_PER_PYEONG = 400 / 121; // 3.305785123966942...

/** 평 → ㎡ */
export function pyeongToSqm(pyeong: number): number | null {
  if (!(Number.isFinite(pyeong) && pyeong >= 0)) return null;
  return pyeong * SQM_PER_PYEONG;
}

/** ㎡ → 평 */
export function sqmToPyeong(sqm: number): number | null {
  if (!(Number.isFinite(sqm) && sqm >= 0)) return null;
  return sqm / SQM_PER_PYEONG;
}
