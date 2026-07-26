// 주택용 저압 전기요금 계산기 로직 (KEPCO 2024 기준, 하계 외 누진 3단계)
//   1단계 0~200kWh   : 기본요금 910원,   전력량요금 120.0원/kWh
//   2단계 201~400kWh : 기본요금 1,600원, 전력량요금 214.6원/kWh
//   3단계 400kWh 초과: 기본요금 7,300원, 전력량요금 307.3원/kWh
// - 기본요금: 총 사용량이 속한 "최종 단계" 값 하나만 적용
// - 전력량요금: 구간별 누진 합산 후 원단위 미만 절사
// - 전기요금계 = 기본요금 + 전력량요금
// - 부가가치세 = 전기요금계 × 10%  (원단위 반올림)
// - 전력산업기반기금 = 전기요금계 × 3.7%  (10원 미만 절사)
// - 청구금액 = 전기요금계 + 부가세 + 기금  (10원 미만 절사)

const TIER1_LIMIT = 200;
const TIER2_LIMIT = 400;
const RATE1 = 120.0;
const RATE2 = 214.6;
const RATE3 = 307.3;
const BASE1 = 910;
const BASE2 = 1600;
const BASE3 = 7300;

export type ElectricityResult = {
  base: number; // 기본요금
  energy: number; // 전력량요금 (원단위 미만 절사)
  subtotal: number; // 전기요금계
  vat: number; // 부가가치세
  fund: number; // 전력산업기반기금
  total: number; // 청구금액 (10원 미만 절사)
};

export function calcElectricityBill(kWh: number): ElectricityResult | null {
  if (!Number.isFinite(kWh) || kWh < 0) return null;

  const b1 = Math.min(kWh, TIER1_LIMIT);
  const b2 = Math.min(Math.max(kWh - TIER1_LIMIT, 0), TIER2_LIMIT - TIER1_LIMIT);
  const b3 = Math.max(kWh - TIER2_LIMIT, 0);

  const energy = Math.floor(b1 * RATE1 + b2 * RATE2 + b3 * RATE3); // 원단위 미만 절사
  const base = kWh <= TIER1_LIMIT ? BASE1 : kWh <= TIER2_LIMIT ? BASE2 : BASE3;

  const subtotal = base + energy;
  const vat = Math.round(subtotal * 0.1); // 원단위 반올림
  const fund = Math.floor((subtotal * 0.037) / 10) * 10; // 10원 미만 절사
  const total = Math.floor((subtotal + vat + fund) / 10) * 10; // 10원 미만 절사

  return { base, energy, subtotal, vat, fund, total };
}
