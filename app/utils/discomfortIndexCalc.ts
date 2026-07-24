// 불쾌지수(THI, Temperature-Humidity Index) 계산기 로직 — 기상청 공식
// THI = 0.81 × 기온 + 0.01 × 습도 × (0.99 × 기온 − 14.3) + 46.3
//   기온: 섭씨(°C), 습도: 상대습도(%)
// 분류: 80 이상 매우 높음 / 75~80 높음 / 68~75 보통 / 68 미만 낮음

export type DiscomfortResult = {
  thi: number; // 불쾌지수 (소수 1자리)
  level: string; // 단계
  desc: string; // 설명
};

export function calcDiscomfortIndex(tempC: number, humidity: number): DiscomfortResult {
  const raw = 0.81 * tempC + 0.01 * humidity * (0.99 * tempC - 14.3) + 46.3;
  const thi = Number(raw.toFixed(1));
  let level: string;
  let desc: string;
  if (thi >= 80) {
    level = "매우 높음";
    desc = "전원 불쾌감을 느끼는 단계입니다.";
  } else if (thi >= 75) {
    level = "높음";
    desc = "절반 이상이 불쾌감을 느낍니다.";
  } else if (thi >= 68) {
    level = "보통";
    desc = "일부가 불쾌감을 느끼기 시작합니다.";
  } else {
    level = "낮음";
    desc = "대부분 쾌적하게 느낍니다.";
  }
  return { thi, level, desc };
}
