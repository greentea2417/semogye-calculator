// 자동차세 계산기 순수 로직 (비영업용 승용차, 배기량 기준)
// 표준 공식:
//   1) cc당 세액: 1,000cc 이하 80원 / 1,600cc 이하 140원 / 1,600cc 초과 200원
//   2) 자동차세(본세) = 배기량(cc) × cc당 세액
//   3) 차령 경감: 신차 등록 3년째부터 매년 5%씩 경감, 최대 50%
//        경감률 = min(50%, (차령 - 2) × 5%), 차령 2년 이하는 경감 없음
//   4) 경감 후 본세 = 본세 × (1 - 경감률)  (10원 미만 절사)
//   5) 지방교육세 = 경감 후 본세 × 30%     (10원 미만 절사)
//   6) 연간 총액 = 경감 후 본세 + 지방교육세

export type CarTaxResult = {
  ratePerCc: number; // cc당 세액 (원)
  baseTax: number; // 자동차세 본세 (원)
  reduceRate: number; // 차령 경감률 (0 ~ 0.5)
  reducedBase: number; // 경감 후 본세 (원)
  eduTax: number; // 지방교육세 (원)
  total: number; // 연간 총액 (원)
};

const floor10 = (n: number) => Math.floor(n / 10) * 10;

export function calcCarTax(cc: number, carAge: number = 0): CarTaxResult | null {
  if (!(cc > 0)) return null;
  const age = carAge > 0 ? carAge : 0;

  const ratePerCc = cc <= 1000 ? 80 : cc <= 1600 ? 140 : 200;
  const baseTax = cc * ratePerCc;

  const reduceRate = age < 3 ? 0 : Math.min(0.5, (age - 2) * 0.05);

  const reducedBase = floor10(baseTax * (1 - reduceRate));
  const eduTax = floor10(reducedBase * 0.3);
  const total = reducedBase + eduTax;

  return { ratePerCc, baseTax, reduceRate, reducedBase, eduTax, total };
}
