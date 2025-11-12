async function calculateTax() {
  const salaryInput = document.getElementById("salary").value.replace(/,/g, "");
  const foodInput = document.getElementById("food").value.replace(/,/g, "");
  const carInput = document.getElementById("car").value.replace(/,/g, "");
  const familyCount = parseInt(document.getElementById("family").value);

  const salary = Number(salaryInput);
  const food = Math.min(Number(foodInput) || 0, 200000);
  const car = Math.min(Number(carInput) || 0, 200000);

  const taxable = Math.max(0, salary - food - car);
  const taxableK = Math.floor(taxable / 1000);

  const resultDiv = document.getElementById("result");

  try {
    const response = await fetch("./data/ganise_2024.json");
    const data = await response.json();

    const famKey = familyCount.toString();
    const famData = data.byFamily[famKey];

    if (!famData) {
      resultDiv.innerHTML = `<div class="alert">⚠️ 부양가족 수 데이터가 없습니다.</div>`;
      return;
    }

    const match = famData.find(row => taxableK >= row.fromK && taxableK < row.toK);

    if (!match) {
      resultDiv.innerHTML = `
        <div class="result-box">
          과세소득: ${taxable.toLocaleString()}원<br>
          (세전 ${salary.toLocaleString()} - 식대 ${food.toLocaleString()} - 차량 ${car.toLocaleString()})<br><br>
          💡 <b>해당 구간의 세액표 데이터가 없습니다.</b><br>
          계산 불가 ⚠️
        </div>`;
      return;
    }

    const tax = match.tax * 1000;

    resultDiv.innerHTML = `
      <div class="result-box success">
        💰 예상 원천징수 세액: <b>${tax.toLocaleString()}원</b><br><br>
        <small>과세소득 ${taxable.toLocaleString()}원<br>(세전 ${salary.toLocaleString()} - 식대 ${food.toLocaleString()} - 차량 ${car.toLocaleString()})</small>
      </div>`;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = `<div class="alert">❌ 계산 중 오류가 발생했습니다. (JSON 경로 확인)</div>`;
  }
}
