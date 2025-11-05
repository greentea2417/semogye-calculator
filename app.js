// ====== 설정(연도별 상수는 여기서만 바꾸면 됨) ======
const RATES = {
  // 4대보험 (근로자 부담분)
  np: 0.045,          // 국민연금 4.5%
  hi: 0.0709,         // 건강보험 7.09% (연도별 조정 가능)
  ltcOnHI: 0.1281,    // 장기요양 = 건강보험료의 12.81%
  ei: 0.009,          // 고용보험 0.9%

  // 비과세 한도
  nontaxMealCap: 200000 // 식대 등 월 최대 20만원
};

// ====== 유틸 ======
const fmt = n => (Math.round(n)||0).toLocaleString()+"원";
const nz  = v => Number(v||0);

// 과세대상 급여 = 세전 - (비과세 실제 반영액)
function taxableBase(gross, nontax){
  const cap = Math.min(nz(nontax), RATES.nontaxMealCap);
  return Math.max(0, nz(gross) - cap);
}

// 4대보험 자동 계산
function socialInsurances(gross){
  const base = nz(gross); // 통상 보수월액 = 세전(간단화)
  const np  = base * RATES.np;
  const hi  = base * RATES.hi;
  const ltc = hi * RATES.ltcOnHI;
  const ei  = base * RATES.ei;
  return { np, hi, ltc, ei, total: np+hi+ltc+ei };
}

// (핵심) 간이세액표 룩업 구조
// 실제 배포에서 아래 TABLES에 "월급 구간 × 부양가족/자녀" 테이블을 주입하면 100% 일치.
// 지금은 보수적 근사(세율 구간 계산)로 동작.
function withholdingTaxByTable(taxable, dependents, kids){
  // ---- 근사 버전 (테이블 미주입 시): 누진세율 근사 + 기본공제 ----
  // * 실제 홈택스 간이세액표와 100% 일치하려면 JSON 테이블을 주입하세요.
  // 세율표(월 기준 근사)
  const brackets = [
    { upTo: 1400000, rate: 0.06,  quick: 0   },
    { upTo: 2800000, rate: 0.15,  quick: 126000 },
    { upTo: 4200000, rate: 0.24,  quick: 366000 },
    { upTo: 8800000, rate: 0.35,  quick: 804000 },
    { upTo: 15000000,rate: 0.38,  quick: 1230000 },
    { upTo: 0,       rate: 0.40,  quick: 1530000 } // 초과
  ];

  let rate=0.06, quick=0, prev=0;
  for(const b of brackets){
    if(b.upTo===0 || taxable<=b.upTo){ rate=b.rate; quick=b.quick; break; }
    prev = b.upTo;
  }
  let it = taxable*rate - quick;

  // 부양가족/자녀 공제(간이세액표 근사): 가족수·자녀수 증가 시 보수적 감액
  const fam     = Math.max(0, nz(dependents));
  const child   = Math.max(0, nz(kids));
  it -= fam * 15000;     // 근사
  it -= child * 10000;   // 근사
  it = Math.max(0, it);

  return Math.round(it);
}

function localIncomeTax(incomeTax){
  return Math.round(incomeTax * 0.10);
}

// ====== 메인 계산 ======
function calculate(){
  const gross      = nz(document.getElementById('gross').value);
  const nontaxIn   = nz(document.getElementById('nontax').value);
  const dependents = nz(document.getElementById('dependents').value);
  const kids       = nz(document.getElementById('kids').value);

  // 1) 과세대상 급여
  const taxable = taxableBase(gross, nontaxIn);

  // 2) 4대보험
  const si = socialInsurances(gross);

  // 3) 소득세(간이) — 테이블 룩업 구조 (현재는 근사)
  const it  = withholdingTaxByTable(taxable, dependents, kids);
  const lit = localIncomeTax(it);

  // 4) 실수령
  const totalDeduct = si.total + it + lit;
  const takeHome    = gross - totalDeduct;

  // 5) 출력
  document.getElementById('np').innerText  = fmt(si.np);
  document.getElementById('hi').innerText  = fmt(si.hi);
  document.getElementById('ltc').innerText = fmt(si.ltc);
  document.getElementById('ei').innerText  = fmt(si.ei);
  document.getElementById('it').innerText  = fmt(it);
  document.getElementById('lit').innerText = fmt(lit);
  document.getElementById('totalDeduct').innerText = fmt(totalDeduct);
  document.getElementById('takeHome').innerText    = fmt(takeHome);

  document.getElementById('result').classList.remove('hide');
}

document.getElementById('calcBtn').addEventListener('click', calculate);
