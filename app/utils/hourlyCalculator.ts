export function calculateHourly({
  hourlyWage,
  hoursPerWeek,
  includeHoliday
}: {
  hourlyWage: number;
  hoursPerWeek: number;
  includeHoliday: "yes" | "no";
}) {
  // 기본 월 환산 (4.345주 기준)
  const weeklyPay = hourlyWage * hoursPerWeek;
  let monthlyPay = weeklyPay * 4.345;

  // 주휴수당 계산 (조건: 주 15시간 이상)
  if (includeHoliday === "yes" && hoursPerWeek >= 15) {
    const holidayPay = hourlyWage * (hoursPerWeek / 5); // 주휴수당 공식
    monthlyPay += holidayPay * 4.345;
  }

  return Math.floor(monthlyPay);
}
