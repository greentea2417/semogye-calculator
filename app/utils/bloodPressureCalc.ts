// 혈압 분류 계산기 로직 (대한고혈압학회 2018 기준) + 맥압·평균동맥압
// 수축기(SBP)·이완기(DBP) 각각의 단계를 구한 뒤 더 높은 단계를 최종 분류로 채택한다.
//   정상혈압      : SBP < 120 그리고 DBP < 80
//   주의혈압      : SBP 120~129 그리고 DBP < 80
//   고혈압 전단계 : SBP 130~139 또는 DBP 80~89
//   1기 고혈압    : SBP 140~159 또는 DBP 90~99
//   2기 고혈압    : SBP ≥ 160 또는 DBP ≥ 100
//   맥압         = SBP − DBP
//   평균동맥압    = DBP + (SBP − DBP) / 3

export type BpCategory = "정상혈압" | "주의혈압" | "고혈압 전단계" | "1기 고혈압" | "2기 고혈압";

export type BloodPressureResult = {
  level: 0 | 1 | 2 | 3 | 4; // 단계 (숫자가 클수록 위험)
  category: BpCategory;
  pulsePressure: number; // 맥압 (SBP − DBP)
  map: number; // 평균동맥압 (소수 1자리)
};

const CATEGORIES: BpCategory[] = ["정상혈압", "주의혈압", "고혈압 전단계", "1기 고혈압", "2기 고혈압"];

function round1(n: number): number {
  return Number(n.toFixed(1));
}

function sbpLevel(sbp: number): 0 | 1 | 2 | 3 | 4 {
  if (sbp >= 160) return 4;
  if (sbp >= 140) return 3;
  if (sbp >= 130) return 2;
  if (sbp >= 120) return 1;
  return 0;
}

function dbpLevel(dbp: number): 0 | 2 | 3 | 4 {
  // DBP 는 '주의혈압(1단계)' 을 만들지 않는다 (주의혈압은 SBP 기준만 존재)
  if (dbp >= 100) return 4;
  if (dbp >= 90) return 3;
  if (dbp >= 80) return 2;
  return 0;
}

export function calcBloodPressure(sbp: number, dbp: number): BloodPressureResult | null {
  if (!Number.isFinite(sbp) || !Number.isFinite(dbp)) return null;
  if (sbp <= 0 || dbp <= 0) return null;
  // 수축기 혈압은 이완기 혈압보다 커야 한다
  if (sbp <= dbp) return null;

  const level = Math.max(sbpLevel(sbp), dbpLevel(dbp)) as 0 | 1 | 2 | 3 | 4;
  return {
    level,
    category: CATEGORIES[level],
    pulsePressure: sbp - dbp,
    map: round1(dbp + (sbp - dbp) / 3),
  };
}
