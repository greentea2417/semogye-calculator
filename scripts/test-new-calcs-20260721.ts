// 2026-07-21 신규 계산기 3종 검증 스크립트 (실제 구현 코드 import)
// 각 계산기 5개 이상 테스트: 정상값 / 경계값 / 예외값
// 전체 스위트를 3회 반복해 결과가 동일한지 확인.
import { calcBmr, ACTIVITY_FACTORS } from "../app/utils/bmrCalc";
import { calcWaterIntake } from "../app/utils/waterIntakeCalc";
import { pyeongToSqm, sqmToPyeong, SQM_PER_PYEONG } from "../app/utils/pyeongCalc";

type Case = { name: string; got: unknown; want: unknown };

const round = (n: number, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

function bmrCases(): Case[] {
  // 남 65kg/170cm/30세: base=650+1062.5-150=1562.5 → +5 = 1567.5, TDEE(moderate 1.55)=2429.625
  const a = calcBmr("male", 65, 170, 30, "moderate")!;
  // 여 55kg/160cm/25세: base=550+1000-125=1425 → -161 = 1264, TDEE(sedentary 1.2)=1516.8
  const b = calcBmr("female", 55, 160, 25, "sedentary")!;
  // 경계값: 나이 1세, veryActive 1.9. 남 50kg/150cm/1세: base=500+937.5-5=1432.5 → +5=1437.5, TDEE=2731.25
  const c = calcBmr("male", 50, 150, 1, "veryActive")!;
  // 경계값 활동계수 확인
  const d = ACTIVITY_FACTORS.active;
  return [
    { name: "BMR 정상(남/보통) bmr", got: round(a.bmr, 2), want: 1567.5 },
    { name: "BMR 정상(남/보통) tdee", got: round(a.tdee, 3), want: 2429.625 },
    { name: "BMR 정상(여/좌식) bmr", got: round(b.bmr, 2), want: 1264 },
    { name: "BMR 정상(여/좌식) tdee", got: round(b.tdee, 2), want: 1516.8 },
    { name: "BMR 경계(나이1/매우활발) tdee", got: round(c.tdee, 2), want: 2731.25 },
    { name: "BMR 활동계수 active=1.725", got: d, want: 1.725 },
    { name: "BMR 예외(체중0) null", got: calcBmr("male", 0, 170, 30, "moderate"), want: null },
    { name: "BMR 예외(키 음수) null", got: calcBmr("male", 65, -1, 30, "moderate"), want: null },
    { name: "BMR 예외(나이 NaN) null", got: calcBmr("male", 65, 170, NaN, "moderate"), want: null },
  ];
}

function waterCases(): Case[] {
  // 60kg, 운동 0분: 60*33=1980ml, 1.98L, 7.92컵
  const a = calcWaterIntake(60, 0)!;
  // 70kg, 운동 60분: 70*33=2310 + (60/30)*350=700 = 3010ml
  const b = calcWaterIntake(70, 60)!;
  // 경계값: 45분 운동 → (45/30)*350=525. 50kg: 1650+525=2175
  const c = calcWaterIntake(50, 45)!;
  // 기본 인자(운동 미입력) = 0분과 동일해야 함
  const d = calcWaterIntake(60)!;
  return [
    { name: "물 정상(60kg/0분) ml", got: round(a.totalMl, 4), want: 1980 },
    { name: "물 정상(60kg/0분) L", got: round(a.liters, 4), want: 1.98 },
    { name: "물 정상(60kg/0분) 컵", got: round(a.cups, 4), want: 7.92 },
    { name: "물 정상(70kg/60분) ml", got: round(b.totalMl, 4), want: 3010 },
    { name: "물 경계(50kg/45분) ml", got: round(c.totalMl, 4), want: 2175 },
    { name: "물 기본인자=0분 동일", got: round(d.totalMl, 4), want: 1980 },
    { name: "물 예외(체중0) null", got: calcWaterIntake(0, 30), want: null },
    { name: "물 예외(체중 음수) null", got: calcWaterIntake(-5, 30), want: null },
    { name: "물 예외(운동 음수→0취급) ml", got: round(calcWaterIntake(60, -10)!.totalMl, 4), want: 1980 },
  ];
}

function pyeongCases(): Case[] {
  // 1평 = 3.305785㎡
  // 34평 → 112.39669㎡
  // 84㎡ → 25.41㎡... 84/3.305785=25.410평
  return [
    { name: "평→㎡ 정상(1평)", got: round(pyeongToSqm(1)!, 6), want: round(SQM_PER_PYEONG, 6) },
    { name: "평→㎡ 정상(34평)", got: round(pyeongToSqm(34)!, 4), want: round(34 * 400 / 121, 4) },
    { name: "㎡→평 정상(84㎡)", got: round(sqmToPyeong(84)!, 4), want: round(84 * 121 / 400, 4) },
    { name: "왕복 변환(50평→㎡→평)", got: round(sqmToPyeong(pyeongToSqm(50)!)!, 6), want: 50 },
    { name: "평→㎡ 경계(0평=0㎡)", got: pyeongToSqm(0), want: 0 },
    { name: "㎡→평 경계(0㎡=0평)", got: sqmToPyeong(0), want: 0 },
    { name: "평→㎡ 예외(음수) null", got: pyeongToSqm(-1), want: null },
    { name: "㎡→평 예외(NaN) null", got: sqmToPyeong(NaN), want: null },
  ];
}

function runSuite() {
  return [...bmrCases(), ...waterCases(), ...pyeongCases()];
}

let allPass = true;
const runs: string[] = [];
for (let r = 1; r <= 3; r++) {
  const cases = runSuite();
  let pass = 0;
  const lines: string[] = [];
  for (const c of cases) {
    const ok = Object.is(c.got, c.want) || c.got === c.want;
    if (ok) pass++;
    else allPass = false;
    lines.push(`${ok ? "PASS" : "FAIL"} | ${c.name} | got=${JSON.stringify(c.got)} want=${JSON.stringify(c.want)}`);
  }
  const signature = JSON.stringify(runSuite().map((c) => c.got));
  runs.push(signature);
  console.log(`\n===== RUN ${r} (${pass}/${cases.length} passed) =====`);
  console.log(lines.join("\n"));
}

const identical = runs.every((s) => s === runs[0]);
console.log(`\n===== SUMMARY =====`);
console.log(`3회 반복 결과 동일: ${identical ? "YES" : "NO"}`);
console.log(`전체 테스트 통과: ${allPass ? "YES" : "NO"}`);
if (!identical || !allPass) process.exit(1);
