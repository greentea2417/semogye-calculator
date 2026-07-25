// 체지방률 계산기 로직 (Deurenberg 공식, 1991)
// BMI = 체중(kg) / 키(m)^2
// 체지방률(%) = 1.20 × BMI + 0.23 × 나이 − 10.8 × 성별 − 5.4
//   성별: 남성 = 1, 여성 = 0
// 키·체중·나이로 추정하는 근사식이며 실제 측정(인바디 등)과 차이가 있을 수 있다.

export type Sex = "male" | "female";

export type BodyFatResult = {
  bmi: number; // 체질량지수 (소수 1자리)
  bodyFat: number; // 체지방률 % (소수 1자리)
  category: string; // 분류 (성별 기준)
};

// 성별별 대략적 체지방률 분류 구간(ACE 기준 근사)
function classify(bodyFat: number, sex: Sex): string {
  const t = sex === "male" ? [10, 20, 25] : [18, 28, 33];
  if (bodyFat < t[0]) return "낮음";
  if (bodyFat < t[1]) return "정상";
  if (bodyFat < t[2]) return "경계";
  return "높음";
}

export function calcBodyFat(weightKg: number, heightCm: number, age: number, sex: Sex): BodyFatResult {
  const h = heightCm / 100;
  const bmiRaw = weightKg / (h * h);
  const sexVal = sex === "male" ? 1 : 0;
  const bodyFatRaw = 1.2 * bmiRaw + 0.23 * age - 10.8 * sexVal - 5.4;
  const bmi = Number(bmiRaw.toFixed(1));
  const bodyFat = Number(bodyFatRaw.toFixed(1));
  return { bmi, bodyFat, category: classify(bodyFat, sex) };
}
