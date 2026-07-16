import Link from "next/link";

const items = [
  { href: "/business/salary", label: "월급 계산기", desc: "실수령액을 빠르게 확인" },
  { href: "/business/hourly-multi", label: "사장님용 시급 계산기", desc: "직원 여러 명 인건비를 한 번에 계산" },
  { href: "/business/freelance", label: "프리랜서 실수령액", desc: "3.3% 원천징수 기준 간이 계산" },
  { href: "/business/salary-conversion", label: "연봉 → 월급 계산기", desc: "연봉을 월급으로 환산" },
  { href: "/business/net-salary", label: "세후 실수령액 간이 계산기", desc: "보험·세금 공제 후 금액 확인" },
  { href: "/business/profit", label: "손익 계산기", desc: "매출과 비용을 한 번에" },
  { href: "/business/retirement", label: "퇴직금 계산기", desc: "퇴직금 예상액 확인" },
  { href: "/business/unemployment", label: "실업급여 계산기", desc: "수급 가능액 예상" },
  { href: "/business/annual", label: "연차수당 계산기", desc: "미사용 연차수당 계산" },
  { href: "/business/vat", label: "부가세 계산기", desc: "공급가액/부가세 분리" },
  { href: "/business/four-insurance", label: "4대보험 계산기", desc: "월급으로 4대보험 공제액 계산" },
  { href: "/business/compound", label: "복리 계산기", desc: "원금·이율·기간으로 만기 금액 계산" },
  { href: "/business/weekly-holiday", label: "주휴수당 계산기", desc: "주 15시간 이상 주휴수당 예상" },
  { href: "/business/night-pay", label: "야간수당 계산기", desc: "야간근로 가산수당 계산" },
  { href: "/business/rest-day-pay", label: "휴일근로수당 계산기", desc: "휴일근로 가산수당 계산" },
];

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          비즈니스 계산기
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-['Pretendard_Variable',sans-serif]">
          필요한 계산기를 골라보세요
        </h1>
        <div className="mt-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
        <p className="mt-3 text-gray-500">
          급여, 세금, 퇴직, 실업급여, 연차수당까지 자주 쓰는 계산기만 모았습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                  {item.label}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
              </div>
              <span className="text-gray-300 transition-colors group-hover:text-blue-500">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
