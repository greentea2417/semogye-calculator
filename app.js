// ✅ 월급 계산기 로직 (홈택스 2024 간이세액표 기반)
async function calculateTax() {
  const salaryInput = document.getElementById('salary');
  const familyInput = document.getElementById('family');
  const resultBox = document.getElementById('result');

  const salary = parseInt(salaryInput.value.replace(/,/g, '')) || 0;
  const family = parseInt(familyInput.value) || 0;

  // JSON 불러오기
  const res = await fetch('./data/ganise_2024.json');
  const data = await res.json();

  const familyKey = family.toString();
  const taxTable = data[familyKey];

  if (!taxTable) {
    resultBox.innerText = '데이터 없음 (부양가족 수를 확인해주세요)';
    return;
  }

  // 월급 이하 중 가장 근접한 세액 찾기
  let foundTax = null;
  for (let i = taxTable.length - 1; i >= 0; i--) {
    if (salary >= taxTable[i].salary) {
      foundTax = taxTable[i].tax;
      break;
    }
  }

  resultBox.innerText = foundTax
    ? `예상 원천징수 세액: ${foundTax.toLocaleString()}원`
    : '월급 범위 내 세액표가 없습니다.';
}

// ✅ 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('calcBtn');
  btn.addEventListener('click', calculateTax);
});
