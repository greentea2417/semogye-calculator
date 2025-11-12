let TAX_TABLE = null;

// JSON 로드
async function loadTaxTable() {
  if (TAX_TABLE) return TAX_TABLE;
  const res = await fetch('/data/ganise_2024.json', { cache: 'no-store' });
  TAX_TABLE = await res.json();
  return TAX_TABLE;
}

// 간이세액표 조회
function findWithholdingTaxKRW(taxTable, familyCount, taxableKRW) {
  const famKey = String(Math.min(11, Math.max(0, Number(familyCount) || 0)));
  const rows = taxTable.byFamily[famKey];
  if (!rows || !rows.length) return 0;
  const k = Math.floor(taxableKRW / 1000);
  for (const r of rows) {
    if (k >= r.fromK && k < r.toK) return Number(r.tax) || 0;
  }
  return 0;
}

document.getElementById('calcBtn').addEventListener('click', async () => {
  const table = await loadTaxTable();
  const gross = parseInt((document.getElementById('grossInput').value || '0').replace(/,/g,''), 10);
  const meal  = parseInt((document.getElementById('mealInput').value  || '0').replace(/,/g,''), 10);
  const car   = parseInt((document.getElementById('vehicleInput').value || '0').replace(/,/g,''), 10);
  const fam   = parseInt(document.getElementById('familyInput').value || '0', 10);

  const mealExempt = Math.min(meal, 200000);
  const carExempt  = Math.min(car, 200000);
  const taxable = Math.max(0, gross - mealExempt - carExempt);

  const tax = findWithholdingTaxKRW(table, fam, taxable);

  document.getElementById('result').innerHTML = `
    <b>간이세액: ${tax.toLocaleString('ko-KR')}원</b><br>
    (과세소득: ${taxable.toLocaleString('ko-KR')}원)
  `;
});
