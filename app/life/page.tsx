"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Item = { href: string; label: string; desc: string };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "body 계산기",
    items: [
      { href: "/life/bmi", label: "BMI 계산기", desc: "체질량지수를 빠르게 확인" },
      { href: "/life/body-age", label: "신체 나이 계산기", desc: "몸 상태를 나이로 보기" },
      { href: "/life/kbm", label: "키빼몸 계산기", desc: "간단한 체형 기준 확인" },
      { href: "/life/body-fat", label: "체지방률 계산기", desc: "키·체중·나이로 체지방률 추정" },
      { href: "/life/future-height", label: "우리 아이 예상 키", desc: "부모 키로 간단히 예측" },
      { href: "/life/waste-time", label: "내가 날린 인생 시간은?", desc: "재미로 보는 시간 계산" },
    ],
  },
  {
    title: "day 계산기",
    items: [
      { href: "/life/korean-age", label: "만 나이 계산기", desc: "생년월일로 오늘 기준 만 나이 확인" },
      { href: "/life/dday", label: "D-day · 기념일 계산기", desc: "목표일까지 남은 날짜 계산" },
      { href: "/life/ovulation", label: "배란일·가임기 계산기", desc: "생리주기로 배란일·가임기 계산" },
      { href: "/life/pregnancy-due-date", label: "출산예정일 계산기", desc: "마지막 생리일로 출산예정일·임신 주수 계산" },
    ],
  },
  {
    title: "건강·생활 계산기",
    items: [
      { href: "/life/discomfort-index", label: "불쾌지수 계산기", desc: "기온·습도로 여름철 불쾌지수 계산" },
      { href: "/life/dog-age", label: "강아지 나이 계산기", desc: "반려견 나이를 사람 나이로 환산" },
      { href: "/life/percentage", label: "퍼센트 계산기", desc: "퍼센트·비율·증감률 한 번에 계산" },
      { href: "/life/temperature", label: "온도 변환 계산기", desc: "섭씨·화씨·켈빈 서로 변환" },
      { href: "/life/electricity-bill", label: "전기요금 계산기", desc: "사용량(kWh)으로 누진 3단계 전기요금 계산" },
      { href: "/life/blood-pressure", label: "혈압 계산기", desc: "수축기·이완기 혈압으로 단계 분류" },
    ],
  },
  {
    title: "학점 계산기",
    items: [{ href: "/life/grade", label: "학점 계산기", desc: "평균 학점 계산" }],
  },
];

const ALL_TITLE = "전체";

function Sidebar({ groups, selected, onSelect }: { groups: Group[]; selected: string; onSelect: (title: string) => void }) {
  return (
    <aside className="hidden md:block md:w-64 md:shrink-0">
      <div className="sticky top-6 space-y-2">
        <a
          href="#전체"
          onClick={(e) => {
            e.preventDefault();
            onSelect(ALL_TITLE);
          }}
          className={`flex items-center justify-between rounded-2xl px-1 py-2 text-sm font-bold transition ${selected === ALL_TITLE ? "text-green-700" : "text-gray-700 hover:text-green-600"}`}
        >
          <span>{ALL_TITLE}</span>
        </a>
        {groups.map((group) => (
          <a
            key={group.title}
            href={`#${group.title}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(group.title);
            }}
            className={`flex items-center justify-between rounded-2xl px-1 py-2 text-sm font-bold transition ${selected === group.title ? "text-green-700" : "text-gray-700 hover:text-green-600"}`}
          >
            <span>{group.title}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function MobileSections({ groups }: { groups: Group[] }) {
  return (
    <div className="space-y-8 md:hidden">
      {groups.map((group) => {
        const s = { "body 계산기": "bg-blue-50 text-blue-600", "day 계산기": "bg-violet-50 text-violet-600", "건강·생활 계산기": "bg-emerald-50 text-emerald-600", "학점 계산기": "bg-amber-50 text-amber-600" }[group.title] ?? "bg-blue-50 text-blue-600";
        return (
          <section key={group.title} className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm shadow-gray-200/30">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${s}`}>{group.title}</div>
            <div className="grid grid-cols-1 gap-4">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600">{item.label}</h2>
                      <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <span className="text-gray-300 transition-colors group-hover:text-green-500">→</span>
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

export default function LifePage() {
  const [selected, setSelected] = useState(ALL_TITLE);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (hash && [...groups.map((g) => g.title), ALL_TITLE].includes(hash)) setSelected(hash);
  }, []);

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = selected === ALL_TITLE ? groups : groups.filter((group) => group.title === selected);
    if (!q) return base;
    return base
      .map((group) => ({ ...group, items: group.items.filter((item) => `${item.label} ${item.desc}`.toLowerCase().includes(q)) }))
      .filter((group) => group.items.length > 0);
  }, [selected, query]);

  const visibleItems = useMemo(() => visibleGroups.flatMap((group) => group.items), [visibleGroups]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold tracking-wide text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> 라이프 계산기
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-['Pretendard_Variable',sans-serif]">필요한 계산기를 골라보세요</h1>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-green-600 to-emerald-300" />
        <p className="mt-3 text-gray-500">건강, 학업, 재미까지 일상에서 바로 쓰는 계산기만 모았습니다.</p>
      </div>

      <div className="mb-7">
        <label className="sr-only" htmlFor="life-search">라이프 계산기 검색</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">⌕</span>
          <input
            id="life-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="계산기 이름이나 설명으로 검색"
            className="w-full rounded-2xl border border-gray-200 bg-white px-9 py-3 pr-10 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-300 focus:ring-4 focus:ring-green-100"
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
        <Sidebar groups={groups} selected={selected} onSelect={setSelected} />
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600">{item.label}</h2>
                    <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <span className="text-gray-300 transition-colors group-hover:text-green-500">→</span>
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
