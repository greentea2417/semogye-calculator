// 표준체중 계산기 순수 로직
// 표준 체중 = BMI 22 기준 체중 = 키(m)^2 × 22

export type Gender = "male" | "female";

export type IdealWeightResult = {
  idealWeight: number;
  bmiAtIdeal: number;
};

export function calcIdealWeight(heightCm: number, _gender: Gender): IdealWeightResult | null {
  if (!(Number.isFinite(heightCm) && heightCm > 0)) return null;
  const heightM = heightCm / 100;
  const idealWeight = heightM * heightM * 22;
  return {
    idealWeight,
    bmiAtIdeal: idealWeight / (heightM * heightM),
  };
}
