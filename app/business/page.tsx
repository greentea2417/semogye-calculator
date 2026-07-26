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
    { href: "/business/salary-conversion", label: "연봉 → 월급 계산기", desc: "연봉을 월급으로 환산" },
    { href: "/business/net-salary", label: "세후 실수령액 간이 계산기", desc: "보험·세금 공제 후 금액 확인" },
  ]},
  { title: "세금 / 공제", accent: "violet", items: [
    { href: "/business/vat", label: "부가세 계산기", desc: "공급가액/부가세 분리" },
    { href: "/business/four-insurance", label: "4대보험 계산기", desc: "월급으로 4대보험 공제액 계산" },
  ]},
  { title: "퇴직 / 실업", accent: "emerald", items: [
    { href: "/business/retirement", label: "퇴직금 계산기", desc: "퇴직금 예상액 확인" },
    { href: "/business/unemployment", label: "실업급여 계산기", desc: "수급 가능액 예상" },
    { href: "/business/annual", label: "연차수당 계산기", desc: "미사용 연차수당 계산" },
  ]},
  { title: "사업 / 수익", accent: "amber", items: [
    { href: "/business/profit", label: "손익 계산기", desc: "매출과 비용을 한 번에" },
    { href: "/business/compound", label: "복리 계산기", desc: "원금·이율·기간으로 만기 금액 계산" },
    { href: "/business/margin", label: "마진율 계산기", desc: "원가·판매가로 마진율·마크업률 계산" },
  ]},
  { title: "대출 / 금융", accent: "sky", items: [
    { href: "/business/loan", label: "대출 이자 계산기", desc: "원리금·원금균등 월 상환금과 총이자" },
    { href: "/business/savings", label: "적금 이자 계산기", desc: "정기적금 만기 수령액(세후) 계산" },
  ]},
  { title: "근로수당", accent: "rose", items: [
    { href: "/business/weekly-holiday", label: "주휴수당 계산기", desc: "주 15시간 이상 주휴수당 예상" },
    { href: "/business/night-pay", label: "야간수당 계산기", desc: "야간근로 가산수당 계산" },
    { href: "/business/rest-day-pay", label: "휴일근로수당 계산기", desc: "휴일근로 가산수당 계산" },
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

export default function BusinessPage() {
  const [selected, setSelected] = useState(ALL_TITLE);
  const visibleItems = useMemo(
    () => (selected === ALL_TITLE ? groups.flatMap((g) => g.items) : groups.filter((g) => g.title === selected).flatMap((g) => g.items)),
    [selected],
  );

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

      <MobileSections groups={groups} />
    </div>
  );
}
