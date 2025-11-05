// ===== 연도 스위치: 표 나오면 '2025'로 바꾸면 끝 =====
const YEAR = '2024';

// ===== 고정율(연도별 조정 지점) =====
const RATES = {
  np: 0.045,         // 국민연금 근로자 4.5%
  hi: 0.0709,        // 건강보험 7.09%  (연도별 조정 가능)
  ltcOnHI: 0.1281,   // 장기요양 = 건강보험료의 12.81%
  ei: 0.009,         // 고용보험 0.9%
  mealCap: 200000,   // 식대 비과세 한도
  carCap: 200000     // 차량유지비 비과세 한도(요건 충족 가정)
};

// ===== 간이세액표 JSON 자리 (부양가족->급여구간index->세액) =====
// 실제 표 주입 시: TAX_TABLES['2024'] = {...}, TAX_TABLES['2025'] = {...}
const TAX_TABLES = {
  '2024': null,
  '2025': null
};

// ===== 유틸 =====
const nz  = v => Number(v||0);
const fmt = n => (Math.round(n)||0).toLocaleString() + '원';

// 과세대상 = 세전 - (비과세 식대/차량유지비 각 한도 내 반영)
function taxableBase(gross, meal, car){
  const ntMeal = Math.min(nz(meal), RATES.mealCap);
  const ntCar  = Math.min(nz(car),  RATES.carCap);
  return Math.max(0, nz(gross) - ntMeal - ntCar);
}

// 4대보험(간단화: 보수월액=세전 적용)
// * 실제 상/하한선 반영은 추후 옵션화 가능
function socialInsurances(gross){
  const base = nz(gross);
  const np  = base * RATES.np;
  const hi  = base * RATES.hi;
  const ltc = hi * RATES.ltcOnHI;
  const ei  = base * RATES.ei;
  return { np, hi, ltc, ei, total: np+hi+ltc+ei };
}

// 급여를 구간 인덱스로 변환(표 주입용)
// 실제 표의 급여 step에 맞춰 조정 필요. 예: 20,000원 단위.
function payToIndex(pay){
  // 예시: 20,000원 구간화
  const step = 20000;
  return Math.floor(nz(pay) / step);
}

// (핵심) 간이세액 룩업: 표가 있으면 100% 일치, 없으면 근사
function withholdingTaxByTable(taxable, dependents, kids){
  const table = TAX_TABLES[YEAR];
  if (table) {
    const famKey = String(Math.max(0, nz(dependents))); // 부양가족(본인 제외)
    const idx    = String(payToIndex(taxable));
    // 자녀수 보정이 별도 표로 분리된 경우 테이블 구조 수정 필요.
    // 여기서는 "가족수 보정만 있는 표"를 가정하고, 자녀수는 보수적 감액.
    const base = nz(table[famKey]?.[idx]);
    const childAdj = Math.max(0, nz(kids)) * 10000; // 자녀 감액(보수적)
    return Math.max(0, Math.round(base - childAdj));
  }

  // ----- 표가 없을 때: 보수적 근사 -----
  const brackets = [
    { upTo: 1400000, rate: 0.06,  quick: 0 },
    { upTo: 2800000, rate: 0.15,  quick: 126000 },
    { upTo: 4200000, rate: 0.24,  quick: 366000 },
    { upTo: 8800000, rate: 0.35,  quick: 804000 },
    { upTo: 15000000,rate: 0.38,  quick: 1230000 },
    { upTo: 0,       rate: 0.40,  quick: 1530000 }
  ];
  let rate=0.06, quick=0;
  for (const b of brackets){
    if (b.upTo===0 || taxable<=b.upTo){ rate=b.rate; quick=b.quick; break; }
  }
  let it = taxable*rate - quick;
  it -= Math.max(0, nz(dependents)) * 15000;
  it -= Math.max(0, nz(kids))       * 10000;
  return Math.max(0, Math.round(it));
}

const localIncomeTax = it => Math.round(it * 0.10);

// ===== 메인 =====
function calculate(){
  const gross      = nz(document.getElementById('gross').value);
  const meal       = nz(document.getElementById('meal').value);
  const car        = nz(document.getElementById('car').value);
  const dependents = nz(document.getElementById('dependents').value);
  const kids       = nz(document.getElementById('kids').value);

  // 1) 과세대상
  const taxable = taxableBase(gross, meal, car);

  // 2) 4대보험
  const si = socialInsurances(gross);

  // 3) 소득세(간이)
  const it  = withholdingTaxByTable(taxable, dependents, kids);
  const lit = localIncomeTax(it);

  // 4) 실수령
  const totalDeduct = si.total + it + lit;
  const takeHome    = gross - totalDeduct;
  const takeHomeY   = takeHome * 12;

  // 5) 출력
  document.getElementById('np').innerText  = fmt(si.np);
  document.getElementById('hi').innerText  = fmt(si.hi);
  document.getElementById('ltc').innerText = fmt(si.ltc);
  document.getElementById('ei').innerText  = fmt(si.ei);
  document.getElementById('it').innerText  = fmt(it);
  document.getElementById('lit').innerText = fmt(lit);
  document.getElementById('totalDeduct').innerText = fmt(totalDeduct);

  document.getElementById('takeHome').innerText     = fmt(takeHome);
  document.getElementById('takeHomeYear').innerText = fmt(takeHomeY);
  document.getElementById('result').classList.remove('hide');
}

document.getElementById('calcBtn').addEventListener('click', calculate);
