function calcNetSalary(){
  const salary = Number(document.getElementById("salary").value||0);
  const dependents = Number(document.getElementById("dependents").value||0);
  const kids = Number(document.getElementById("kids").value||0);
  const taxfree = Number(document.getElementById("taxfree").value||0);

  // (엄밀 계산식 X) — MVP, 간이 버전
  const afterTax = salary * 0.935; // 그냥 평균 공제 6.5%

  const total = afterTax + taxfree;

  document.getElementById("resultValue").innerText = total.toLocaleString()+"원";
}

document.getElementById("calculate").addEventListener("click", calcNetSalary);

document.getElementById("dependents").addEventListener("input",e=>{
  document.getElementById("dependentsValue").innerText = e.target.value;
});

document.getElementById("kids").addEventListener("input",e=>{
  document.getElementById("kidsValue").innerText = e.target.value;
});
