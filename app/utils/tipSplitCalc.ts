// 팁/더치페이 계산기 순수 로직
// 총액 = 기본금액 + 팁
// 1인당 금액 = 총액 ÷ 인원수

export type TipSplitResult = {
  tipAmount: number;
  totalAmount: number;
  perPerson: number;
};

export function calcTipSplit(
  billAmount: number,
  tipPercent: number,
  people: number
): TipSplitResult | null {
  if (!(billAmount > 0) || !(tipPercent >= 0) || !(people > 0)) return null;
  const tipAmount = billAmount * (tipPercent / 100);
  const totalAmount = billAmount + tipAmount;
  const perPerson = totalAmount / people;
  return { tipAmount, totalAmount, perPerson };
}
