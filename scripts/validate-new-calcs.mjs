// Independent formula validation for the 3 new calculators (pre-implementation).
// Run: node scripts/validate-new-calcs.mjs
// Re-implements each formula from scratch and asserts hand-computed expected values.

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = got === want;
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  got=${got} want=${want}`);
}

// ---------- 1) 연장근로수당 (overtime pay) ----------
// 배수: 5인 이상 1.5, 5인 미만 1.0. 총액 = round(시급 * 시간 * 배수)
function overtime(hourly, hours, over5) {
  const mult = over5 ? 1.5 : 1.0;
  const base = Math.round(hourly * hours);         // 가산 전 임금
  const total = Math.round(hourly * hours * mult); // 총 연장수당
  const premium = over5 ? total - base : 0;        // 가산분
  return { base, premium, total };
}
{
  const r1 = overtime(12000, 20, true);
  check("overtime base (12000x20)", r1.base, 240000);
  check("overtime premium", r1.premium, 120000);
  check("overtime total", r1.total, 360000);

  const r2 = overtime(10030, 15, false); // 5인 미만
  check("overtime<5 total", r2.total, 150450);
  check("overtime<5 premium", r2.premium, 0);
}

// ---------- 2) 전월세 전환 (jeonse -> wolse) ----------
// 전환대상 = max(0, 전세 - 남길보증금); 월세 = round(전환대상 * rate/100 / 12)
function jeonseToWolse(jeonse, deposit, ratePct) {
  const convert = Math.max(0, jeonse - deposit);
  const yearly = convert * (ratePct / 100);
  const monthly = Math.round(yearly / 12);
  return { convert, monthly };
}
{
  const j1 = jeonseToWolse(300000000, 100000000, 5.5);
  check("jeonse convert", j1.convert, 200000000);
  check("jeonse monthly", j1.monthly, 916667);

  const j2 = jeonseToWolse(200000000, 50000000, 6);
  check("jeonse2 monthly", j2.monthly, 750000);

  const j3 = jeonseToWolse(100000000, 100000000, 5); // deposit == jeonse
  check("jeonse3 monthly (no convert)", j3.monthly, 0);
}

// ---------- 3) 하루 물 섭취량 (water intake) ----------
// 권장량(ml) = round(체중 * ml/kg). 활동량: 저 30, 보통 33, 고 40
function water(weight, mlPerKg) {
  const ml = Math.round(weight * mlPerKg);
  const cups = Math.round((ml / 200) * 10) / 10; // 200ml 기준, 소수1자리
  const liters = Math.round((ml / 1000) * 100) / 100;
  return { ml, cups, liters };
}
{
  const w1 = water(60, 33);
  check("water ml (60x33)", w1.ml, 1980);
  check("water cups", w1.cups, 9.9);
  check("water liters", w1.liters, 1.98);

  const w2 = water(75, 40);
  check("water2 ml (75x40)", w2.ml, 3000);
  check("water2 cups", w2.cups, 15);
  check("water2 liters", w2.liters, 3);
}

console.log(`\n--- ${pass} passed, ${fail} failed ---`);
process.exit(fail ? 1 : 0);
