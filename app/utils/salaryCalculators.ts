// app/utils/salaryCalculators.ts

// 2024 간이세액표(min/max/taxes[])를 export하는 taxTable.ts
import { taxTable, TaxRow } from "./taxTable";

// 2024 4대보험 및 비과세 요율 설정
const RATES = {
  pension: 0.045,        // 국민연금 (근로자 부담)
  health: 0.03545,       // 건강보험
  care: 0.1295,          // 장기요양보험 (건보료 × 12.95%)
  employment: 0.009,     // 고용보험
  MAX_MEAL_TAX_FREE: 200000, // 식대 비과세 한도 (2024년 상향 반영)
};

// ────────────────────────────────────────────────
// ✔ 1) 간이세액표 구간 찾기 (min ≤ salary < max)
// ────────────────────────────────────────────────
function findTaxRow(taxBase: number): TaxRow {
  const row = taxTable.find(
    (r) => taxBase >= r.min && taxBase < r.max
  );

  // 해당 구간이 없다면 가장 가까운 구간 반환 (fallback)
  if (!row) {
    return taxTable.reduce((closest, current) => {
      const closestMid = (closest.min + closest.max) / 2;
      const currentMid = (current.min + current.max) / 2;

      return Math.abs(currentMid - taxBase) <
        Math.abs(closestMid - taxBase)
        ? current
        : closest;
    });
  }

  return row;
}

// ────────────────────────────────────────────────
// ✔ 2) 간이세액표 기반 소득세 계산
// dependents → 최소 1명, 최대 11명(index 0~10)
// child20 → 자녀세액 15,000원씩 추가
// ────────────────────────────────────────────────
function lookupSimplifiedTax(
  monthlyTaxBase: number,
  dependents: number,
  child20: number
) {
  const row = findTaxRow(monthlyTaxBase);

  // 부양가족 수는 1~11명 → index 0~10
  const index = Math.min(Math.max(dependents - 1, 0), 10);

  let tax = row.taxes[index];

  // 20세 이하 자녀 추가세액
  tax += child20 * 15000;

  return Math.max(tax, 0);
}

// ────────────────────────────────────────────────
// ✔ 3) 메인 계산 함수 (세모계 공식)
// UI에서 호출하는 유일한 함수
// ────────────────────────────────────────────────
export function calculateSalary({
  salary,         // 월급(세전)
  dependents,     // 부양가족 수
  child20,        // 20세 이하 자녀
  nonTax,         // 입력받은 비과세(식대 포함)
  insured,        // 4대보험 여부 ("yes" | "no")
}: {
  salary: number;
  dependents: number;
  child20: number;
  nonTax: number;
  insured: "yes" | "no";
}) {
  if (!salary || salary <= 0) return null;

  // 1. 비과세 한도 적용 (식대 등 비과세 항목이 한도를 초과하지 않도록 제한)
  // 만약 nonTax가 식대만을 의미한다면 아래 로직이 정확히 작동합니다.
  const effectiveNonTax = Math.min(nonTax, RATES.MAX_MEAL_TAX_FREE);

  // 2. 비과세 제외 후 과세 대상 급여 (4대보험 및 소득세 산정 기준)
  const taxableSalary = Math.max(salary - effectiveNonTax, 0);

  // ───────────── 4대보험 계산 ─────────────
  // ※ 실무적으로 4대보험은 비과세(식대 등)를 제외한 '보수월액' 기준으로 산정합니다.
  let pension = 0;
  let health = 0;
  let care = 0;
  let employment = 0;

  if (insured === "yes") {
    pension = Math.floor(taxableSalary * RATES.pension);
    health = Math.floor(taxableSalary * RATES.health);
    care = Math.floor(health * RATES.care);
    employment = Math.floor(taxableSalary * RATES.employment);
  }

  // ───────────── 소득세 / 지방소득세 ─────────────
  const incomeTax = lookupSimplifiedTax(
    taxableSalary,
    dependents,
    child20
  );

  const residentTax = Math.floor(incomeTax * 0.1);

  // ───────────── 실수령액 ─────────────
  // 실수령액 = 세전 총액 - (4대보험 합계 + 소득세 합계)
  const takeHome =
    salary -
    (pension +
      health +
      care +
      employment +
      incomeTax +
      residentTax);

  return {
    pension,
    health,
    care,
    employment,
    incomeTax,
    residentTax,
    takeHome,
  };
}