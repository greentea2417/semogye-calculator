// 적금/저축 성장 계산기 순수 로직
// 월복리 가정: FV = P(1+r)^n + PMT * (((1+r)^n - 1) / r)

export type SavingsGrowthResult = {
  futureValue: number;
  totalDeposit: number;
  interestEarned: number;
};

export function calcSavingsGrowth(
  initialDeposit: number,
  monthlyDeposit: number,
  annualRatePercent: number,
  months: number
): SavingsGrowthResult | null {
  if (!(initialDeposit >= 0) || !(monthlyDeposit >= 0) || !(annualRatePercent >= 0) || !(months > 0)) return null;
  const monthlyRate = annualRatePercent / 100 / 12;
  const totalDeposit = initialDeposit + monthlyDeposit * months;
  const futureValue = monthlyRate === 0
    ? totalDeposit
    : initialDeposit * Math.pow(1 + monthlyRate, months) + monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const interestEarned = futureValue - totalDeposit;
  return { futureValue, totalDeposit, interestEarned };
}
