import { calcIdealWeight } from "../app/utils/idealWeightCalc";
import { calcWaistHeightRatio } from "../app/utils/waistRatioCalc";
import { calcProteinIntake } from "../app/utils/proteinIntakeCalc";

type Case = { name: string; got: unknown; want: unknown };
const round = (n: number, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

function idealCases(): Case[] {
  const a = calcIdealWeight(170, "male")!;
  const b = calcIdealWeight(160, "female")!;
  const c = calcIdealWeight(150, "male")!;
  return [
    { name: "표준체중 170cm", got: round(a.idealWeight, 2), want: 63.58 },
    { name: "표준체중 160cm", got: round(b.idealWeight, 2), want: 56.32 },
    { name: "표준체중 경계 150cm", got: round(c.idealWeight, 2), want: 49.5 },
    { name: "표준체중 BMI at ideal", got: round(a.bmiAtIdeal, 4), want: 22 },
    { name: "표준체중 예외(키0)", got: calcIdealWeight(0, "male"), want: null },
  ];
}

function waistCases(): Case[] {
  const a = calcWaistHeightRatio(70, 170)!;
  const b = calcWaistHeightRatio(90, 170)!;
  const c = calcWaistHeightRatio(110, 170)!;
  return [
    { name: "허리비율 정상 70/170", got: round(a.ratio, 4), want: round(70 / 170, 4) },
    { name: "허리비율 정상 퍼센트", got: round(a.percent, 2), want: round((70 / 170) * 100, 2) },
    { name: "허리비율 주의 구간", got: b.category, want: "주의" },
    { name: "허리비율 위험 구간", got: c.category, want: "위험" },
    { name: "허리비율 예외(음수)", got: calcWaistHeightRatio(-1, 170), want: null },
  ];
}

function proteinCases(): Case[] {
  const a = calcProteinIntake(60, "general")!;
  const b = calcProteinIntake(60, "strength")!;
  const c = calcProteinIntake(60, "cut")!;
  return [
    { name: "단백질 일반 60kg", got: round(a.gramsPerDay, 2), want: 48 },
    { name: "단백질 근력 60kg", got: round(b.gramsPerDay, 2), want: 72 },
    { name: "단백질 감량 60kg", got: round(c.gramsPerDay, 2), want: 96 },
    { name: "단백질 1끼 분배", got: round(a.gramsPerMeal, 2), want: 16 },
    { name: "단백질 예외(체중0)", got: calcProteinIntake(0, "general"), want: null },
  ];
}

function runSuite() { return [...idealCases(), ...waistCases(), ...proteinCases()]; }
let allPass = true;
const runs: string[] = [];
for (let i = 1; i <= 3; i++) {
  const cases = runSuite();
  let pass = 0;
  console.log(`\n===== RUN ${i} =====`);
  for (const c of cases) {
    const ok = Object.is(c.got, c.want) || c.got === c.want;
    if (ok) pass++; else allPass = false;
    console.log(`${ok ? "PASS" : "FAIL"} | ${c.name} | got=${JSON.stringify(c.got)} want=${JSON.stringify(c.want)}`);
  }
  runs.push(JSON.stringify(cases.map((c) => c.got)));
  console.log(`passed ${pass}/${cases.length}`);
}
console.log(`same results across 3 runs: ${runs.every((r) => r === runs[0])}`);
console.log(`all pass: ${allPass}`);
if (!allPass || !runs.every((r) => r === runs[0])) process.exit(1);
