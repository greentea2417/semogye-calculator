// Verification harness for 3 new calculators (2026-07-19).
// Mirrors the exact pure logic used in the implemented pages.

function parseNumber(raw) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatComma(n) {
  return n ? Math.round(n).toLocaleString("ko-KR") : "";
}

// ---------- 1) 마진율 계산기 ----------
function markupMarginCalc(costRaw, saleRaw) {
  const cost = parseNumber(costRaw);
  const sale = parseNumber(saleRaw);
  const profit = sale - cost;
  const marginRate = sale > 0 ? (profit / sale) * 100 : 0;
  const markupRate = cost > 0 ? (profit / cost) * 100 : 0;
  return {
    cost,
    sale,
    profit,
    marginRate: Math.round(marginRate * 10) / 10,
    markupRate: Math.round(markupRate * 10) / 10,
  };
}

// ---------- 2) 칼로리 소모 계산기 ----------
const METS = { walking: 3.5, running: 8.3, cycling: 6.8 };
function calorieBurnCalc(weightRaw, minutesRaw, activity) {
  const weight = Math.max(1, Math.min(300, parseNumber(weightRaw)));
  const minutes = Math.max(0, Math.min(600, parseNumber(minutesRaw)));
  const met = METS[activity];
  const calories = Math.round(((met * 3.5 * weight) / 200) * minutes);
  return { weight, minutes, met, calories };
}

// ---------- 3) 스크린타임 절감 계산기 ----------
function screenTimeCalc(minutesRaw, daysRaw) {
  const minutes = Math.max(0, Math.min(1440, parseNumber(minutesRaw)));
  const days = Math.max(1, Math.min(365, parseNumber(daysRaw)));
  const hoursPerDay = minutes / 60;
  const weekly = hoursPerDay * 7;
  const monthly = hoursPerDay * days;
  return { minutes, days, hoursPerDay: Number(hoursPerDay.toFixed(2)), weekly: Number(weekly.toFixed(2)), monthly: Number(monthly.toFixed(2)) };
}

const suites = {
  MarkupMargin: [
    ["normal cost 10000 sale 18000", () => markupMarginCalc("10,000", "18,000"), { cost: 10000, sale: 18000, profit: 8000, marginRate: 44.4, markupRate: 80 }],
    ["normal cost 2000 sale 3000", () => markupMarginCalc("2,000", "3,000"), { cost: 2000, sale: 3000, profit: 1000, marginRate: 33.3, markupRate: 50 }],
    ["boundary break-even", () => markupMarginCalc("1000", "1000"), { cost: 1000, sale: 1000, profit: 0, marginRate: 0, markupRate: 0 }],
    ["exception zero sale", () => markupMarginCalc("1000", "0"), { cost: 1000, sale: 0, profit: -1000, marginRate: 0, markupRate: -100 }],
    ["exception garbage text", () => markupMarginCalc("abc", "def"), { cost: 0, sale: 0, profit: 0, marginRate: 0, markupRate: 0 }],
  ],
  CalorieBurn: [
    ["normal walking 70kg 30m", () => calorieBurnCalc("70", "30", "walking"), { weight: 70, minutes: 30, met: 3.5, calories: 129 }],
    ["normal running 60kg 30m", () => calorieBurnCalc("60", "30", "running"), { weight: 60, minutes: 30, met: 8.3, calories: 261 }],
    ["boundary minutes 0", () => calorieBurnCalc("70", "0", "cycling"), { weight: 70, minutes: 0, met: 6.8, calories: 0 }],
    ["boundary weight clamp 300", () => calorieBurnCalc("999", "10", "walking"), { weight: 300, minutes: 10, met: 3.5, calories: 184 }],
    ["exception empty inputs", () => calorieBurnCalc("", "", "walking"), { weight: 1, minutes: 0, met: 3.5, calories: 0 }],
  ],
  ScreenTime: [
    ["normal 30 min/day, 30 days", () => screenTimeCalc("30", "30"), { minutes: 30, days: 30, hoursPerDay: 0.5, weekly: 3.5, monthly: 15 }],
    ["normal 90 min/day, 31 days", () => screenTimeCalc("90", "31"), { minutes: 90, days: 31, hoursPerDay: 1.5, weekly: 10.5, monthly: 46.5 }],
    ["boundary 0 min/day", () => screenTimeCalc("0", "30"), { minutes: 0, days: 30, hoursPerDay: 0, weekly: 0, monthly: 0 }],
    ["boundary days clamp 365", () => screenTimeCalc("60", "999"), { minutes: 60, days: 365, hoursPerDay: 1, weekly: 7, monthly: 365 }],
    ["exception garbage text", () => screenTimeCalc("abc", "xyz"), { minutes: 0, days: 1, hoursPerDay: 0, weekly: 0, monthly: 0 }],
  ],
};

function runOnce() {
  const results = {};
  for (const [name, cases] of Object.entries(suites)) {
    results[name] = cases.map(([label, fn]) => ({ label, out: fn() }));
  }
  return results;
}

function check(results) {
  let pass = 0;
  let fail = 0;
  const lines = [];
  for (const [suite, cases] of Object.entries(suites)) {
    for (let i = 0; i < cases.length; i++) {
      const [label, , expected] = cases[i];
      const got = results[suite][i].out;
      const ok = JSON.stringify(got) === JSON.stringify(expected);
      if (ok) pass++; else fail++;
      lines.push(`${ok ? "PASS" : "FAIL"} [${suite}] ${label} => ${JSON.stringify(got)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`);
    }
  }
  return { pass, fail, lines };
}

const runs = [runOnce(), runOnce(), runOnce()];
const identical = JSON.stringify(runs[0]) === JSON.stringify(runs[1]) && JSON.stringify(runs[1]) === JSON.stringify(runs[2]);
const { pass, fail, lines } = check(runs[0]);

console.log(lines.join("\n"));
console.log("\n--- SUMMARY ---");
console.log(`Total per run: ${pass + fail} tests | PASS ${pass} | FAIL ${fail}`);
console.log(`3x repeat identical: ${identical ? "YES ✅" : "NO ❌"}`);
process.exit(fail === 0 && identical ? 0 : 1);
