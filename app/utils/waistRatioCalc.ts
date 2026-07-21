// 허리-키 비율 계산기 순수 로직
// WHtR = 허리둘레(cm) / 키(cm)

export type WaistRatioResult = {
  ratio: number;
  percent: number;
  category: "낮음" | "주의" | "위험";
};

export function calcWaistHeightRatio(waistCm: number, heightCm: number): WaistRatioResult | null {
  if (!(Number.isFinite(waistCm) && Number.isFinite(heightCm))) return null;
  if (!(waistCm > 0) || !(heightCm > 0)) return null;
  const ratio = waistCm / heightCm;
  const percent = ratio * 100;
  let category: WaistRatioResult["category"] = "위험";
  if (ratio < 0.5) category = "낮음";
  else if (ratio < 0.6) category = "주의";
  return { ratio, percent, category };
}
