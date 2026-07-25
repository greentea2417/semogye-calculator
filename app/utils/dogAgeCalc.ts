// 강아지 나이 계산기 로직 (반려견 나이 → 사람 나이 환산)
// 널리 쓰이는 단계별(size-based) 환산표를 연속 함수로 구현한다.
//   - 1년차: 사람 15세 (0→1년 구간은 0→15로 선형 보간)
//   - 2년차: 사람 24세 (1→2년 구간은 15→24, 즉 +9 선형 보간)
//   - 2년 이후: 매년 체급별로 소형 +4, 중형 +5, 대형 +6
// 체급은 성견 체중 기준: 소형 ≤9kg, 중형 10~22kg, 대형 ≥23kg

export type DogSize = "small" | "medium" | "large";

export type DogAgeResult = {
  humanAge: number; // 사람 나이 환산 (소수 1자리)
  stage: string; // 생애 단계 (사람 기준 근사)
};

const RATE: Record<DogSize, number> = { small: 4, medium: 5, large: 6 };

function classifyStage(humanAge: number): string {
  if (humanAge < 13) return "어린이";
  if (humanAge < 20) return "청소년";
  if (humanAge < 40) return "청년";
  if (humanAge < 60) return "중년";
  return "노년";
}

// dogYears: 강아지 나이(년, 소수 허용), size: 체급
export function calcDogAge(dogYears: number, size: DogSize): DogAgeResult {
  const d = dogYears;
  let human: number;
  if (d <= 0) {
    human = 0;
  } else if (d <= 1) {
    human = d * 15;
  } else if (d <= 2) {
    human = 15 + (d - 1) * 9;
  } else {
    human = 24 + (d - 2) * RATE[size];
  }
  const humanAge = Number(human.toFixed(1));
  return { humanAge, stage: classifyStage(humanAge) };
}
