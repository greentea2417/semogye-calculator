export function calcWage({
  wage,
  hours,
  days,
  includeHoliday,
}: {
  wage: number;
  hours: number;
  days: number;
  includeHoliday: "yes" | "no";
}) {
  const basePay = wage * hours * days;

  // 주휴수당 조건: 주 15시간 이상
  const weeklyHours = hours * (days / 4);

  const holidayPay =
    includeHoliday === "yes" && weeklyHours >= 15 ? wage * 8 * 4 : 0;

  return {
    basePay,
    holidayPay,
    total: basePay + holidayPay,
  };
}
