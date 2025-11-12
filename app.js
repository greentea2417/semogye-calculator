// ----- 유틸 -----
const $ = (id) => document.getElementById(id);
const num = (v) => {
  if (!v) return 0;
  return parseInt(String(v).replace(/,/g, "").trim(), 10) || 0;
};

function pickValue(candidates) {
  for (const id of candidates) {
    const el = $(id);
    if (el && el.value != null) return el.value;
  }
  return "0";
}

function pickElem(candidates) {
  for (const id of candidates) {
    const el = $(id);
    if (el) return el;
  }
  return null;
}

function fmt(n) {
  return (Number(n) || 0).toLocaleString("ko-KR") + "원";
}

// ----- 간이세액표 로딩 -----
let TAX_TABLE = null;
async function loadTaxTable() {
  if (TAX_TABLE) return TAX_TABLE;
  try {
    const res = await fetch("/data/ganise_2024.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    TAX_TABLE = await res.json();
    if (!TAX_TABLE.byFamily) throw new Error("JSON 구조(byFamily) 없음");
    return TAX_TABLE;
  } catch (e) {
    const out = pickElem(["result", "taxResult", "output"]);
    if (out) {
      out.innerHTML = `<span style="color:#d00">간이세액표 로드 오류: ${e.message}. <br>경로를 확인하세요: /data/ganise_2024.json</span>`;
    } else {
      alert("간이세액표 로드 실패: " + e.message);
    }
    throw e;
  }
}

// ----- 룩업 -----
function findWithholdingTaxKRW(table, familyCount, taxableKRW) {
  const famKey = String(Math.min(11, Math.max(0, Number(familyCount) || 0)));
  const rows = table.byFamily[famKey];
  if (!rows || !rows.length) return 0;

  const k = Math.floor((Number(taxableKRW) || 0) / 1000); // 천원단위
  for (const r of rows) {
    if (k >= r.fromK && k < r.toK) {
      return Number(r.tax) || 0; // 이미 원단위
    }
  }
  return 0;
}

// ----- 메인 -----
window.addEventListener("DOMContentLoaded", () => {
  // 다양한 id 후보 지원 (네가 어떤 HTML을 쓰든 웬만하면 잡힙니다)
  const grossEl   = pickElem(["grossInput", "gross", "salary"]);
  const mealEl    = pickElem(["mealInput", "meal", "mealAllowance"]);
  const carEl     = pickElem(["vehicleInput", "car", "vehicle", "carAllowance"]);
  const famEl     = pickElem(["familyInput", "dependents", "fam"]);
  const btn       = pickElem(["calcBtn", "calculate", "btnCalc"]);
  const resultEl  = pickElem(["result", "taxResult", "output"]);

  if (!btn) {
    console.warn("계산 버튼(calcBtn) 요소가 없습니다. 버튼 id 확인 필요.");
    return;
  }
  if (!resultEl) {
    console.warn("결과 출력(result) 요소가 없습니다. 결과 표시용 div id 확인 필요.");
  }

  btn.addEventListener("click", async () => {
    // 입력값 읽기 (없으면 0)
    const gross = num(grossEl ? grossEl.value : pickValue(["grossInput","gross","salary"]));
    const meal  = num(mealEl ? mealEl.value   : pickValue(["mealInput","meal","mealAllowance"]));
    const car   = num(carEl ? carEl.value     : pickValue(["vehicleInput","car","vehicle","carAllowance"]));
    const fam   = num(famEl ? famEl.value     : pickValue(["familyInput","dependents","fam"]));

    // 비과세 상한 (필요시 값 알려주면 바꿔줄게요)
    const mealExempt = Math.min(meal, 200000);
    const carExempt  = Math.min(car,  200000);

    // 과세월급
    const taxable = Math.max(0, gross - mealExempt - carExempt);

    // 표 로드 & 세액
    const table = await loadTaxTable();
    const tax = findWithholdingTaxKRW(table, fam, taxable);

    // 출력
    if (resultEl) {
      resultEl.innerHTML = `
        <div><b>간이세액</b> ${fmt(tax)}</div>
        <div style="color:#6b7280">과세소득 ${fmt(taxable)} (세전 ${fmt(gross)} - 식대 ${fmt(mealExempt)} - 차량유지비 ${fmt(carExempt)})</div>
      `;
    }
  });
});
