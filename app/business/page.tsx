import Link from "next/link";

type Item = { href: string; label: string; desc: string };
type Group = { title: string; accent: string; items: Item[] };

const groups: Group[] = [
  {
    title: "급여 / 실수령",
    accent: "blue",
    items: [
      { href: "/business/salary", label: "월급 계산기", desc: "실수령액을 빠르게 확인" },
      { href: "/business/hourly-multi", label: "사장님용 시급 계산기", desc: "직원 여러 명 인건비를 한 번에 계산" },
      { href: "/business/freelance", label: "프리랜서 실수령액", desc: "3.3% 원천징수 기준 간이 계산" },
      { href: "/business/salary-conversion", label: "연봉 → 월급 계산기", desc: "연봉을 월급으로 환산" },
      { href: "/business/net-salary", label: "세후 실수령액 간이 계산기", desc: "보험·세금 공제 후 금액 확인" },
    ],
  },
  {
    title: "세금 / 공제",
    accent: "violet",
    items: [
      { href: "/business/vat", label: "부가세 계산기", desc: "공급가액/부가세 분리" },
      { href: "/business/four-insurance", label: "4대보험 계산기", desc: "월급으로 4대보험 공제액 계산" },
    ],
  },
  {
    title: "퇴직 / 실업",
    accent: "emerald",
    items: [
      { href: "/business/retirement", label: "퇴직금 계산기", desc: "퇴직금 예상액 확인" },
      { href: "/business/unemployment", label: "실업급여 계산기", desc: "수급 가능액 예상" },
      { href: "/business/annual", label: "연차수당 계산기", desc: "미사용 연차수당 계산" },
    ],
  },
  {
    title: "사업 / 수익",
    accent: "amber",
    items: [
      { href: "/business/profit", label: "손익 계산기", desc: "매출과 비용을 한 번에" },
      { href: "/business/compound", label: "복리 계산기", desc: "원금·이율·기간으로 만기 금액 계산" },
    ],
  },
  {
    title: "근로수당",
    accent: "rose",
    items: [
      { href: "/business/weekly-holiday", label: "주휴수당 계산기", desc: "주 15시간 이상 주휴수당 예상" },
      { href: "/business/night-pay", label: "야간수당 계산기", desc: "야간근로 가산수당 계산" },
      { href: "/business/rest-day-pay", label: "휴일근로수당 계산기", desc: "휴일근로 가산수당 계산" },
    ],
  },
];

const accentStyles: Record<string, { badge: string; heading: string; card: string; arrow: string }> = {
  blue: { badge: "bg-blue-50 text-blue-600", heading: "text-blue-700", card: "hover:border-blue-200", arrow: "group-hover:text-blue-500" },
  violet: { badge: "bg-violet-50 text-violet-600", heading: "text-violet-700", card: "hover:border-violet-200", arrow: "group-hover:text-violet-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-600", heading: "text-emerald-700", card: "hover:border-emerald-200", arrow: "group-hover:text-emerald-500" },
  amber: { badge: "bg-amber-50 text-amber-600", heading: "text-amber-700", card: "hover:border-amber-200", arrow: "group-hover:text-amber-500" },
  rose: { badge: "bg-rose-50 text-rose-600", heading: "text-rose-700", card: "hover:border-rose-200", arrow: "group-hover:text-rose-500" },
};

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          비즈니스 계산기
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-['Pretendard_Variable',sans-serif]">
          필요한 계산기를 골라보세요
        </h1>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
        <p className="mt-3 text-gray-500">급여, 세금, 퇴직, 실업급여, 연차수당까지 자주 쓰는 계산기만 모았습니다.</p>
      </div>

      <div className="space-y-8">
        {groups.map((group) => {
          const s = accentStyles[group.accent];
          return (
            <section key={group.title} className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm shadow-gray-200/30 sm:p-6">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${s.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${group.accent === 'blue' ? 'bg-blue-500' : group.accent === 'violet' ? 'bg-violet-500' : group.accent === 'emerald' ? 'bg-emerald-500' : group.accent === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                {group.title}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className={`group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 ${s.card} hover:shadow-lg`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className={`text-lg font-bold text-gray-900 transition-colors group-hover:${s.heading.split(' ')[0]}`}>
                          {item.label}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <span className={`text-gray-300 transition-colors ${s.arrow}`}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
