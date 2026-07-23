// 할인가 계산기 로직
// 결제금액 = 정가 × (1 − 할인율/100) × (1 − 추가할인율/100), 원 단위 반올림
// 할인액 = 정가 − 결제금액
// 실질 할인율 = 할인액 / 정가 × 100

export type DiscountResult = {
  discountAmount: number; // 총 할인액(원)
  finalPrice: number; // 결제 금액(원)
  effectiveRate: number; // 실질 할인율(%)
};

export function calcDiscount(price: number, rate: number, extraRate = 0): DiscountResult {
  const afterFirst = price * (1 - rate / 100);
  const finalPrice = Math.round(afterFirst * (1 - extraRate / 100));
  const discountAmount = price - finalPrice;
  const effectiveRate = price > 0 ? Number(((discountAmount / price) * 100).toFixed(1)) : 0;
  return { discountAmount, finalPrice, effectiveRate };
}
