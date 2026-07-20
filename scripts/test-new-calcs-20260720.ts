// 2026-07-20 신규 계산기 검증 스크립트 (2차)
// 실제 구현 코드(app/utils/*)를 import 하여 정상/경계/예외 값을 검증한다.
import { calcTipSplit } from "../app/utils/tipSplitCalc";
import { calcSavingsGrowth } from "../app/utils/savingsGrowthCalc";
import { calcLoanPayment } from "../app/utils/loanPaymentCalc";

type Case = { name: string; got: unknown; want: unknown };
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const r = (n: number, d = 2) => Number(n.toFixed(d));

function tipCases(): Case[] {
  return [
    { name: "tip 48000/10/2", got: (() => { const x = calcTipSplit(48000, 10, 2)!; return { tip: r(x.tipAmount), total: r(x.totalAmount), per: r(x.perPerson) }; })(), want: { tip: 4800, total: 52800, per: 26400 } },
    { name: "tip 1000/0/1", got: calcTipSplit(1000, 0, 1), want: { tipAmount: 0, totalAmount: 1000, perPerson: 1000 } },
    { name: "tip 99999/12.5/3", got: (() => { const x = calcTipSplit(99999, 12.5, 3)!; return { tip: r(x.tipAmount), per: r(x.perPerson) }; })(), want: { tip: 12499.88, per: 37499.63 } },
    { name: "tip bill=0", got: calcTipSplit(0, 10, 2), want: null },
    { name: "tip people=0", got: calcTipSplit(1000, 10, 0), want: null },
  ];
}

function savingsCases(): Case[] {
  return [
    { name: "save 1000000/300000/4/12", got: (() => { const x = calcSavingsGrowth(1000000, 300000, 4, 12)!; return { fv: r(x.futureValue), total: r(x.totalDeposit), interest: r(x.interestEarned) }; })(), want: { fv: 4707480.41, total: 4600000, interest: 107480.41 } },
    { name: "save zero rate", got: calcSavingsGrowth(1000, 100, 0, 10), want: { futureValue: 2000, totalDeposit: 2000, interestEarned: 0 } },
    { name: "save 0/50000/3/6", got: (() => { const x = calcSavingsGrowth(0, 50000, 3, 6)!; return { fv: r(x.futureValue), interest: r(x.interestEarned) }; })(), want: { fv: 301881.26, interest: 1881.26 } },
    { name: "save months=0", got: calcSavingsGrowth(1000, 100, 5, 0), want: null },
    { name: "save negative rate", got: calcSavingsGrowth(1000, 100, -1, 12), want: null },
  ];
}

function loanCases(): Case[] {
  return [
    { name: "loan 30000000/5.5/60", got: (() => { const x = calcLoanPayment(30000000, 5.5, 60)!; return { m: r(x.monthlyPayment), total: r(x.totalPayment), interest: r(x.totalInterest) }; })(), want: { m: 573034.87, total: 34382091.91, interest: 4382091.91 } },
    { name: "loan zero rate", got: calcLoanPayment(1200000, 0, 12), want: { monthlyPayment: 100000, totalPayment: 1200000, totalInterest: 0 } },
    { name: "loan 1000000/3.0/36", got: (() => { const x = calcLoanPayment(1000000, 3.0, 36)!; return { m: r(x.monthlyPayment), interest: r(x.totalInterest) }; })(), want: { m: 29081.21, interest: 46923.55 } },
    { name: "loan principal=0", got: calcLoanPayment(0, 3, 12), want: null },
    { name: "loan months=0", got: calcLoanPayment(1000, 3, 0), want: null },
  ];
}

function runOnce() {
  const groups: Record<string, Case[]> = {
    "팁 더치페이": tipCases(),
    "적금 성장": savingsCases(),
    "대출 원리금균등": loanCases(),
  };
  const results: { name: string; pass: boolean; got: unknown; want: unknown }[] = [];
  for (const [g, cases] of Object.entries(groups)) {
    for (const c of cases) results.push({ name: `[${g}] ${c.name}`, pass: eq(c.got, c.want), got: c.got, want: c.want });
  }
  return results;
}

const runs = [runOnce(), runOnce(), runOnce()];
const identical = JSON.stringify(runs[0]) === JSON.stringify(runs[1]) && JSON.stringify(runs[1]) === JSON.stringify(runs[2]);
const first = runs[0];
let failed = 0;
for (const res of first) {
  if (!res.pass) failed++;
  console.log(`${res.pass ? "✅" : "❌"} ${res.name}${res.pass ? "" : ` got=${JSON.stringify(res.got)} want=${JSON.stringify(res.want)}`}`);
}
console.log("------------------------------------------------------------");
console.log(`총 ${first.length}개 테스트, 통과 ${first.length - failed}, 실패 ${failed}`);
console.log(`3회 반복 결과 동일 여부: ${identical ? "동일함 ✅" : "불일치 ❌"}`);
if (failed > 0 || !identical) process.exit(1);
