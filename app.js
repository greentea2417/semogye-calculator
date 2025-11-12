// ✅ 홈택스 2024 간이세액표 기반 계산 로직
async function calculateTax() {
  const salaryInput = document.getElementById('salary');
  const mealInput = document.getElementById('meal');
  const carInput = document.getElementById('car');
  const familyInput = document.getElementById('family');
  const resultBox = document.getElementById('result');

  const salary = parseInt(salaryInput.value.replace(/,/g, '')) || 0;
  let meal = parseInt(mealInput.value.replace(/,/g, '')) || 0;
  let car = parseInt(carInput.value.replace(/,/g, '')) || 0;
  const family = parseInt(familyInput.value) || 0;

  // 비과세 상한 적용
  if (meal > 200000) meal = 200000;
  if (car > 200000) car = 200000;

  // 과세대상 금액
  const taxableSalary = salary - (meal + car);

  // JSON 불러오기
  const res = await fetch('./data/ganise_2024.json');
  const data = await res.json();

  const familyKey = family.toString();
  const taxTable = data[familyKey];

  if (!taxTable) {
    resultBox.innerText = '데이터 없음 (부양가족 수를 확인해주세요)';
    return;
  }

  // 과세금액 이하 중 가장 근접한 세율 찾기
  let foundTax = null;
  for (let i = taxTable.length - 1; i >= 0; i--) {
    if (taxableSalary >= taxTable[i].salary) {
      foundTax = taxTable[i].tax;
      break;
    }
  }

  // 결과 표시
  const info = `
  <div style="margin-top:15px; font-size:1.1em; line-height:1.8;">
    <div><b>💰 과세소득:</b> ${taxableSalary.toLocaleString()}원</div>
    <div>└ 세전 ${salary.toLocaleString()}원 
      - 식대 ${meal.toLocaleString()}원 
      - 차량유지비 ${car.toLocaleString()}원
    </div>
    <br>
    <div style="font-size:1.2em; font-weight:bold; color:#0044cc;">
      📊 예상 원천징수 세액: ${foundTax ? foundTax.toLocaleString() + '원' : '계산 불가'}
    </div>
  </div>
`;
resultBox.innerHTML = info;

