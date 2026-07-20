// 대출 원리금균등상환 계산기 순수 로직
// 월 상환액 = P * r(1+r)^n / ((1+r)^n - 1)

export type LoanPaymentResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

export function calcLoanPayment(
  principal: number,
  annualRatePercent: number,
  months: number
): LoanPaymentResult | null {
  if (!(principal > 0) || !(annualRatePercent >= 0) || !(months > 0)) return null;
  const monthlyRate = annualRatePercent / 100 / 12;
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
  }
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;
  return { monthlyPayment, totalPayment, totalInterest };
}
