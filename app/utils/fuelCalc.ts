// 연료비 계산기 순수 로직
// 필요 연료(L) = 거리 ÷ 연비, 연료비 = 필요 연료 × 유가
// 왕복 선택 시 거리를 2배로 계산한다.

export type FuelResult = {
  liters: number; // 필요 연료 (L)
  cost: number; // 연료비 (원)
};

export function calcFuel(
  distanceKm: number,
  efficiencyKmPerL: number,
  pricePerL: number,
  roundTrip: boolean = false
): FuelResult | null {
  if (!(distanceKm > 0) || !(efficiencyKmPerL > 0) || !(pricePerL >= 0)) return null;
  const factor = roundTrip ? 2 : 1;
  const liters = (distanceKm * factor) / efficiencyKmPerL;
  const cost = liters * pricePerL;
  return { liters, cost };
}
