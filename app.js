async function calculateTax() {
  const salaryInput = document.getElementById("salary");
  const mealInput = document.getElementById("meal");
  const carInput = document.getElementById("car");
  const familyInput = document.getElementById("family");
  const resultBox = document.getElementById("result");

  const salary = parseInt(salaryInput.value.replace(/,/g, "")) || 0;
  let meal = parseInt(mealInput.value.replace(/,/g, "")) || 0;
  let car = parseInt(carInput.value.replace(/,/g, "")) || 0;
  const family = parseInt(familyInput.value) || 0;

  // 비과세 한도 처리
  if (meal > 200000) meal = 200000;
  if (car > 200000) car = 200000;

  const taxable = salary - (meal + car);

  // JSON 불러오기
  const res = await fetch("./data/ganise_2024.json");
  const data = await res.json();
  const familyKey = family.toString();
  const table = data.byFamily?.[familyKey];

  if (!table) {
    resultBox.innerHTML = "⚠️ 부양가족 수 데이터가 없습니다.";
    return;
  }

  // 가장 근접한 세액 찾기
  let foundTax = null;
  for (let i = table.length - 1; i >= 0; i--) {
    if (taxable >= table[i].fromK && taxable < table[i].toK) {
      foundTax = table[i].tax;
      break;
    }
  }

  resultBox.innerHTML = `
    <div><b>과세소득:</b> ${taxable.toLocaleString()}원</div>
    <div>(세전 ${salary.toLocaleString()} - 식대 ${meal.toLocaleString()} - 차량유지비 ${car.toLocaleString()})</div>
    <hr>
    <div style="font-size:1.2em;">
      💰 <b>예상 원천징수 세액:</b> ${foundTax ? foundTax.toLocaleString() + "원" : "계산 불가"}
    </div>
  `;
}

// ✅ 입력 시 자동 콤마 추가
function addCommaFormat(input) {
  input.addEventListener("input", () => {
    let value = input.value.replace(/,/g, "");
    if (!isNaN(value) && value.length > 0) {
      input.value = parseInt(value).toLocaleString();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  ["salary", "meal", "car"].forEach((id) =>
    addCommaFormat(document.getElementById(id))
  );
  document
    .getElementById("calcBtn")
    .addEventListener("click", calculateTax);
});
