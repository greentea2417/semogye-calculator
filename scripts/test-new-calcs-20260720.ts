// 2026-07-20 신규 계산기 검증 스크립트
// 실제 구현 코드(app/utils/*)를 import 하여 정상/경계/예외 값을 검증한다.
import { calcPace, formatPace, toTotalSeconds } from "../app/utils/paceCalc";
import { calcFuel } from "../app/utils/fuelCalc";
import { calcBac, formatHours } from "../app/utils/bacCalc";

type Case = { name: string; got: unknown; want: unknown };

function eq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// 소수 반올림 헬퍼 (비교 안정화)
const r = (n: number, d = 4) => Number(n.toFixed(d));

function paceCases(): Case[] {
  return [
    // 정상: 10km를 50분 → 5:00/km, 12km/h
    { name: "pace 10km/50min", got: (() => { const x = calcPace(10, toTotalSeconds(0, 50, 0))!; return { pace: formatPace(x.paceSecPerKm), speed: r(x.speedKmh, 2) }; })(), want: { pace: "5:00", speed: 12 } },
    // 정상: 5km를 25분 30초 → 5:06/km
    { name: "pace 5km/25:30", got: formatPace(calcPace(5, toTotalSeconds(0, 25, 30))!.paceSecPerKm), want: "5:06" },
    // 정상: 하프마라톤 21.0975km 1:45:00 → 속도
    { name: "half 1:45", got: r(calcPace(21.0975, toTotalSeconds(1, 45, 0))!.speedKmh, 2), want: 12.06 },
    // 경계: 1km를 1분 → 60초/km = 1:00
    { name: "pace 1km/1min", got: formatPace(calcPace(1, toTotalSeconds(0, 1, 0))!.paceSecPerKm), want: "1:00" },
    // 경계/반올림: 3km를 20분 → 400초/km = 6:40
    { name: "pace 3km/20min", got: formatPace(calcPace(3, toTotalSeconds(0, 20, 0))!.paceSecPerKm), want: "6:40" },
    // 예외: 거리 0 → null
    { name: "pace dist=0", got: calcPace(0, 3000), want: null },
    // 예외: 시간 0 → null
    { name: "pace time=0", got: calcPace(10, 0), want: null },
    // 예외: 음수 거리 → null
    { name: "pace dist<0", got: calcPace(-5, 1000), want: null },
  ];
}

function fuelCases(): Case[] {
  return [
    // 정상: 100km, 연비 10km/L, 1700원/L → 10L, 17000원
    { name: "fuel 100/10/1700", got: calcFuel(100, 10, 1700), want: { liters: 10, cost: 17000 } },
    // 정상: 240km, 연비 12km/L, 1650원 → 20L, 33000원
    { name: "fuel 240/12/1650", got: (() => { const x = calcFuel(240, 12, 1650)!; return { liters: r(x.liters), cost: r(x.cost) }; })(), want: { liters: 20, cost: 33000 } },
    // 정상: 왕복 50km(→100km), 연비 8km/L, 1800원 → 12.5L, 22500원
    { name: "fuel roundtrip 50", got: calcFuel(50, 8, 1800, true), want: { liters: 12.5, cost: 22500 } },
    // 경계: 유가 0원 → 비용 0
    { name: "fuel price=0", got: calcFuel(100, 10, 0), want: { liters: 10, cost: 0 } },
    // 경계: 아주 짧은 거리 1km, 연비 20 → 0.05L
    { name: "fuel 1/20/2000", got: (() => { const x = calcFuel(1, 20, 2000)!; return { liters: r(x.liters), cost: r(x.cost) }; })(), want: { liters: 0.05, cost: 100 } },
    // 예외: 연비 0 → null (0으로 나눗셈 방지)
    { name: "fuel eff=0", got: calcFuel(100, 0, 1700), want: null },
    // 예외: 거리 음수 → null
    { name: "fuel dist<0", got: calcFuel(-10, 10, 1700), want: null },
    // 예외: 유가 음수 → null
    { name: "fuel price<0", got: calcFuel(100, 10, -100), want: null },
  ];
}

function bacCases(): Case[] {
  return [
    // 정상: 70kg 남성, 소주 360mL 17% → 알코올 g, BAC
    { name: "bac soju male", got: (() => { const x = calcBac(360, 17, 70, "male")!; return { g: r(x.alcoholGrams, 2), bac: r(x.bac, 4) }; })(), want: { g: 48.29, bac: 0.1014 } },
    // 정상: 60kg 여성, 맥주 500mL 4.5% → BAC
    { name: "bac beer female", got: (() => { const x = calcBac(500, 4.5, 60, "female")!; return { g: r(x.alcoholGrams, 2), bac: r(x.bac, 4) }; })(), want: { g: 17.75, bac: 0.0538 } },
    // 정상: 위 남성 케이스 완전분해 시간 = BAC/0.015
    { name: "bac soju hoursToZero", got: r(calcBac(360, 17, 70, "male")!.hoursToZero, 2), want: 6.76 },
    // 정상: 운전가능(0.03%)까지 시간
    { name: "bac soju hoursToLegal", got: r(calcBac(360, 17, 70, "male")!.hoursToLegal, 2), want: 4.76 },
    // 경계: 아주 소량이라 이미 0.03% 미만 → hoursToLegal=0
    { name: "bac tiny -> legal 0", got: calcBac(50, 4, 70, "male")!.hoursToLegal, want: 0 },
    // 정상: formatHours 포맷 확인 (1.5h → 1시간 30분)
    { name: "formatHours 1.5", got: formatHours(1.5), want: "1시간 30분" },
    // 예외: 마신 양 0 → null
    { name: "bac vol=0", got: calcBac(0, 17, 70, "male"), want: null },
    // 예외: 체중 0 → null
    { name: "bac weight=0", got: calcBac(360, 17, 0, "male"), want: null },
    // 예외: 도수 음수 → null
    { name: "bac abv<0", got: calcBac(360, -1, 70, "male"), want: null },
  ];
}

function runOnce() {
  const groups: Record<string, Case[]> = {
    "러닝 페이스": paceCases(),
    "연료비": fuelCases(),
    "혈중알코올(BAC)": bacCases(),
  };
  const results: { name: string; pass: boolean; got: unknown; want: unknown }[] = [];
  for (const [g, cases] of Object.entries(groups)) {
    for (const c of cases) {
      results.push({ name: `[${g}] ${c.name}`, pass: eq(c.got, c.want), got: c.got, want: c.want });
    }
  }
  return results;
}

// 동일 결과 3회 재현 확인
const runs = [runOnce(), runOnce(), runOnce()];
const serialized = runs.map((r) => JSON.stringify(r));
const identical = serialized[0] === serialized[1] && serialized[1] === serialized[2];

const r1 = runs[0];
let failed = 0;
for (const res of r1) {
  const mark = res.pass ? "✅" : "❌";
  if (!res.pass) failed++;
  console.log(`${mark} ${res.name}` + (res.pass ? "" : `  got=${JSON.stringify(res.got)} want=${JSON.stringify(res.want)}`));
}
console.log("------------------------------------------------------------");
console.log(`총 ${r1.length}개 테스트, 통과 ${r1.length - failed}, 실패 ${failed}`);
console.log(`3회 반복 결과 동일 여부: ${identical ? "동일함 ✅" : "불일치 ❌"}`);
if (failed > 0 || !identical) process.exit(1);
