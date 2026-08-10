"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { href: string; label: string; desc: string };
type Group = { title: string; accent: string; items: Item[] };

const groups: Group[] = [
  { title: "급여 / 실수령", accent: "blue", items: [
    { href: "/business/salary", label: "월급 계산기", desc: "실수령액을 빠르게 확인" },
    { href: "/business/hourly-multi", label: "사장님용 시급 계산기", desc: "직원 여러 명 인건비를 한 번에 계산" },
    { href: "/business/freelance", label: "프리랜서 실수령액", desc: "3.3% 원천징수 기준 간이 계산" },
    { href: "/business/freelance-backcalc", label: "프리랜서 세후금액 역산", desc: "원하는 실수령액으로 세전 계약금 계산" },
    { href: "/business/salary-conversion", label: "연봉 → 월급 계산기", desc: "연봉을 월급으로 환산" },
    { href: "/business/net-salary", label: "세후 실수령액 간이 계산기", desc: "보험·세금 공제 후 금액 확인" },
    { href: "/business/minimum-wage", label: "최저임금 계산기", desc: "2026년 최저시급 기준 충족 여부·월급 환산" },
    { href: "/business/daily-wage", label: "일용직 급여 계산기", desc: "일당과 근무일수로 원천징수 세금 계산" },
    { href: "/business/prorated-salary", label: "월급 일할계산기", desc: "중도 입퇴사 시 재직일수 기준 월급 일할계산" },
  ]},
  { title: "세금 / 공제", accent: "violet", items: [
    { href: "/business/vat", label: "부가세 계산기", desc: "공급가액/부가세 분리" },
    { href: "/business/four-insurance", label: "4대보험 계산기", desc: "월급으로 4대보험 공제액 계산" },
    { href: "/business/pension", label: "국민연금 계산기", desc: "기준소득월액으로 국민연금 보험료 계산" },
    { href: "/business/health-insurance", label: "건강보험료 계산기", desc: "건강보험료와 장기요양보험료 계산" },
    { href: "/business/employment-insurance", label: "고용보험료 계산기", desc: "근로자·사업주 고용보험료 계산" },
    { href: "/business/corporate-tax-interim", label: "법인세 중간예납 계산기", desc: "직전 사업연도 법인세로 중간예납세액 계산" },
    { href: "/business/comprehensive-tax-interim", label: "종합소득세 중간예납 계산기", desc: "직전 귀속 종합소득세로 중간예납세액 계산" },
    { href: "/business/vat-pre-notice", label: "부가세 예정고지 계산기", desc: "직전 납부세액 기준 예정고지세액 계산" },
    { href: "/business/comprehensive-tax", label: "종합소득세 계산기", desc: "과세표준으로 산출세액·지방소득세 계산" },
    { href: "/business/simplified-vat", label: "간이과세자 부가세 계산기", desc: "업종별 부가가치율로 간이과세 납부세액 계산" },
    { href: "/business/corporate-tax", label: "법인세 계산기", desc: "과세표준으로 법인세·지방소득세 산출세액 계산" },
    { href: "/business/gift-tax", label: "증여세 계산기", desc: "증여재산·공제로 과세표준·납부세액 계산" },
    { href: "/business/inheritance-tax", label: "상속세 계산기", desc: "상속재산·공제로 과세표준·납부세액 계산" },
    { href: "/business/other-income-tax", label: "기타소득 원천징수 계산기", desc: "강연료·원고료 등 기타소득 8.8% 원천징수 계산" },
    { href: "/business/retirement-tax", label: "퇴직소득세 계산기", desc: "퇴직급여·근속연수로 퇴직소득세·지방소득세 계산" },
    { href: "/business/car-tax", label: "자동차세 계산기", desc: "배기량·차령으로 승용차 자동차세·지방교육세 계산" },
    { href: "/business/capital-gains-tax", label: "양도소득세 계산기", desc: "양도가액·취득가액·보유기간으로 양도소득세·지방소득세 계산" },
    { href: "/business/property-tax", label: "재산세 계산기", desc: "주택 공시가격·공정시장가액비율로 재산세·지방교육세 계산" },
    { href: "/business/stamp-tax", label: "인지세 계산기", desc: "계약서 기재금액 구간별 부동산 인지세 계산" },
  ]},
  { title: "퇴직 / 실업", accent: "emerald", items: [
    { href: "/business/retirement", label: "퇴직금 계산기", desc: "퇴직금 예상액 확인" },
    { href: "/business/unemployment", label: "실업급여 계산기", desc: "수급 가능액 예상" },
    { href: "/business/annual", label: "연차수당 계산기", desc: "미사용 연차수당 계산" },
    { href: "/business/average-wage", label: "평균임금 계산기", desc: "3개월 임금총액으로 1일 평균임금 계산" },
    { href: "/business/parental-leave", label: "육아휴직 급여 계산기", desc: "통상임금·기간으로 육아휴직 급여 예상액 계산" },
    { href: "/business/annual-days", label: "연차 개수 계산기", desc: "입사일 기준 근로기준법 연차 발생 일수 계산" },
  ]},
  { title: "사업 / 수익", accent: "amber", items: [
    { href: "/business/profit", label: "손익 계산기", desc: "매출과 비용을 한 번에" },
    { href: "/business/gross-profit", label: "매출총이익 계산기", desc: "매출과 매출원가로 매출총이익을 계산" },
    { href: "/business/operating-profit", label: "영업이익 계산기", desc: "매출총이익에서 판매관리비를 차감" },
    { href: "/business/net-profit", label: "순이익 계산기", desc: "영업외수익·비용과 법인세까지 반영" },
    { href: "/business/compound", label: "복리 계산기", desc: "원금·이율·기간으로 만기 금액 계산" },
    { href: "/business/margin", label: "마진율 계산기", desc: "원가·판매가로 마진율·마크업률 계산" },
    { href: "/business/break-even", label: "손익분기점 계산기", desc: "고정비·공헌이익률로 BEP 매출·판매량 계산" },
    { href: "/business/cost-ratio", label: "원가율 계산기", desc: "매출·원가로 원가율과 매출총이익률 계산" },
    { href: "/business/selling-price-backcalc", label: "판매가 역산 계산기", desc: "원가와 목표 이익률로 권장 판매가 계산" },
    { href: "/business/net-margin", label: "순이익률 계산기", desc: "매출·원가·기타비용으로 순이익률 계산" },
    { href: "/business/discount", label: "할인율 계산기", desc: "정가와 판매가로 할인액·할인율 계산" },
    { href: "/business/fee", label: "수수료 계산기", desc: "금액과 수수료율로 정산금액 계산" },
    { href: "/business/target-revenue", label: "목표매출 계산기", desc: "고정비·변동비·목표이익으로 필요 매출 계산" },
    { href: "/business/labor-cost-ratio", label: "인건비 비율 계산기", desc: "매출 대비 인건비 비율과 잔여 금액 계산" },
    { href: "/business/roas", label: "ROAS 계산기", desc: "광고비 대비 매출로 광고수익률 계산" },
    { href: "/business/average-order-value", label: "객단가 계산기", desc: "매출·주문 건수로 평균 주문금액 계산" },
    { href: "/business/conversion-rate", label: "전환율 계산기", desc: "방문 수·전환 수로 전환율 계산" },
    { href: "/business/vat-included", label: "부가세 포함/제외 계산기", desc: "부가세 포함 금액에서 공급가액·부가세 분리" },
    { href: "/business/withholding-33", label: "원천세 3.3% 계산기", desc: "지급액에서 3.3% 공제 후 실수령액 계산" },
    { href: "/business/supply-price", label: "공급가액 역산 계산기", desc: "공급가액으로 부가세 포함 금액 계산" },
    { href: "/business/depreciation", label: "감가상각 계산기", desc: "정액법으로 연·월 감가상각비와 장부가액 계산" },
    { href: "/business/inventory-turnover", label: "재고회전율 계산기", desc: "매출원가·평균재고로 재고회전율·회전일수 계산" },
    { href: "/business/roi", label: "투자수익률(ROI) 계산기", desc: "투자금액·회수금액으로 순이익과 투자수익률 계산" },
    { href: "/business/roe", label: "자기자본이익률(ROE) 계산기", desc: "당기순이익·자기자본으로 자기자본이익률 계산" },
    { href: "/business/debt-ratio", label: "부채비율 계산기", desc: "부채총계·자기자본으로 재무건전성 부채비율 계산" },
    { href: "/business/receivables-turnover", label: "매출채권회전율 계산기", desc: "매출액·평균매출채권으로 회전율·회수기간 계산" },
  ]},
  { title: "대출 / 금융", accent: "sky", items: [
    { href: "/business/loan", label: "대출 이자 계산기", desc: "원리금·원금균등 월 상환금과 총이자" },
    { href: "/business/savings", label: "적금 이자 계산기", desc: "정기적금 만기 수령액(세후) 계산" },
    { href: "/business/deposit", label: "예금 이자 계산기", desc: "정기예금 만기 수령액(세후) 계산" },
    { href: "/business/prepayment-fee", label: "중도상환수수료 계산기", desc: "잔존일수 기준 대출 중도상환수수료 계산" },
    { href: "/business/dsr", label: "DSR 계산기", desc: "연소득·연간 원리금으로 총부채원리금상환비율 계산" },
    { href: "/business/ltv", label: "LTV 계산기", desc: "담보가치·한도율로 최대 대출액과 담보인정비율 계산" },
    { href: "/business/dti", label: "DTI 계산기", desc: "연소득·대출 상환액으로 총부채상환비율 계산" },
  ]},
  { title: "근로수당", accent: "rose", items: [
    { href: "/business/weekly-holiday", label: "주휴수당 계산기", desc: "주 15시간 이상 주휴수당 예상" },
    { href: "/business/dismissal-advance", label: "해고예고수당 계산기", desc: "30일 예고 미준수 시 평균임금 30일분 계산" },
    { href: "/business/shutdown-allowance", label: "휴업수당 계산기", desc: "휴업일수에 따른 평균임금 70% 계산" },
    { href: "/business/ordinary-wage-reverse", label: "통상시급 역산 계산기", desc: "월 통상임금과 환산시간으로 시급 역산" },
    { href: "/business/night-pay", label: "야간수당 계산기", desc: "야간근로 가산수당 계산" },
    { href: "/business/rest-day-pay", label: "휴일근로수당 계산기", desc: "휴일근로 가산수당 계산" },
    { href: "/business/overtime-pay", label: "연장근로수당 계산기", desc: "통상시급 1.5배 연장근로 가산수당 계산" },
    { href: "/business/ordinary-wage", label: "통상임금 계산기", desc: "월 통상임금으로 통상시급·통상일급 계산" },
  ]},
];

const ALL_TITLE = "전체";

function DesktopMenu({ selected, onSelect }: { selected: string; onSelect: (title: string) => void }) {
  return (
    <div className="sticky top-6 space-y-2">
      <a href="#전체" onClick={(e) => { e.preventDefault(); onSelect(ALL_TITLE); }} className={`flex items-center justify-between rounded-2xl px-1 py-2 text-sm font-bold transition ${selected === ALL_TITLE ? "text-blue-700" : "text-gray-700 hover:text-blue-600"}`}>
        <span>{ALL_TITLE}</span>
      </a>
      {groups.map((group) => (
        <a key={group.title} href={`#${group.title}`} onClick={(e) => { e.preventDefault(); onSelect(group.title); }} className={`flex items-center justify-between rounded-2xl px-1 py-2 text-sm font-bold transition ${selected === group.title ? "text-blue-700" : "text-gray-700 hover:text-blue-600"}`}>
          <span>{group.title}</span>
        </a>
      ))}
    </div>
  );
}

function MobileSections({ groups }: { groups: Group[] }) {
  return (
    <div className="space-y-8 md:hidden">
      {groups.map((group) => {
        const s = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600", sky: "bg-sky-50 text-sky-600" }[group.accent];
        return (
          <section key={group.title} className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm shadow-gray-200/30">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${s}`}>{group.title}</div>
            <div className="grid grid-cols-1 gap-4">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">{item.label}</h2>
                      <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <span className="text-gray-300 transition-colors group-hover:text-blue-500">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">{message}</div>;
}

export default function BusinessPage() {
  const [selected, setSelected] = useState(ALL_TITLE);
  const [query, setQuery] = useState("");
  const visibleItems = useMemo(
    () => {
      const base = selected === ALL_TITLE ? groups.flatMap((g) => g.items) : groups.filter((g) => g.title === selected).flatMap((g) => g.items);
      const q = query.trim().toLowerCase();
      return q ? base.filter((item) => `${item.label} ${item.desc}`.toLowerCase().includes(q)) : base;
    },
    [selected, query],
  );
  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = selected === ALL_TITLE ? groups : groups.filter((g) => g.title === selected);
    if (!q) return base;
    return base
      .map((group) => ({ ...group, items: group.items.filter((item) => `${item.label} ${item.desc}`.toLowerCase().includes(q)) }))
      .filter((group) => group.items.length > 0);
  }, [selected, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> 비즈니스 계산기
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-['Pretendard_Variable',sans-serif]">필요한 계산기를 골라보세요</h1>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
        <p className="mt-3 text-gray-500">급여, 세금, 퇴직, 실업급여, 연차수당까지 자주 쓰는 계산기만 모았습니다.</p>
      </div>

      <div className="mb-7">
        <label className="sr-only" htmlFor="business-search">비즈니스 계산기 검색</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">⌕</span>
          <input
            id="business-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="계산기 이름이나 설명으로 검색"
            className="w-full rounded-2xl border border-gray-200 bg-white px-9 py-3 pr-10 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span>이름/설명으로 바로 찾기</span>
          <span>{visibleItems.length}개 결과</span>
        </div>
      </div>

      <div className="hidden gap-6 md:flex md:flex-row">
        <div className="md:w-56 md:shrink-0">
          <DesktopMenu selected={selected} onSelect={setSelected} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">{item.label}</h2>
                    <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <span className="text-gray-300 transition-colors group-hover:text-blue-500">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {visibleGroups.length ? <MobileSections groups={visibleGroups} /> : <EmptyState message="검색 결과가 없어요. 다른 키워드로 찾아보세요." />}
    </div>
  );
}
