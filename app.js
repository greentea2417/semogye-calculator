function calc(){
  const salary = parseInt(document.getElementById('salary').value.replace(/,/g,'')) || 0;
  const nontax = parseInt(document.getElementById('nontax').value.replace(/,/g,'')) || 0;

  // 실 테스트용 간단 버전
  const taxable = salary - nontax;
  const tax = Math.floor(taxable * 0.033);
  const result = salary - tax;

  document.getElementById('result').innerHTML = 
    `실수령액(간이테스트): ${result.toLocaleString()}원`;
}
