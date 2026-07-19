import Link from "next/link";

type Item = { href: string; label: string; desc: string };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "body 계산기",
    items: [
      { href: "/life/bmi", label: "BMI 계산기", desc: "체질량지수를 빠르게 확인" },
      { href: "/life/body-age", label: "신체 나이 계산기", desc: "몸 상태를 나이로 보기" },
      { href: "/life/kbm", label: "키빼몸 계산기", desc: "간단한 체형 기준 확인" },
      { href: "/life/future-height", label: "우리 아이 예상 키", desc: "부모 키로 간단히 예측" },
      { href: "/life/bmr", label: "기초대사량(BMR) 계산기", desc: "하루 소비·권장 칼로리 확인" },
      { href: "/life/waste-time", label: "내가 날린 인생 시간은?", desc: "재미로 보는 시간 계산" },
      { href: "/life/water-intake", label: "하루 물 섭취량 계산기", desc: "체중·활동량별 권장 물 섭취량" },
      { href: "/life/heart-rate", label: "목표 심박수 계산기", desc: "운동 강도별 목표 심박수 확인" },
    ],
  },
  {
    title: "생활 계산기",
    items: [
      { href: "/life/pyeong", label: "평 ↔ ㎡ 변환 계산기", desc: "부동산 면적 단위 양방향 변환" },
      { href: "/life/calorie-burn", label: "칼로리 소모 계산기", desc: "운동 시간으로 소모 칼로리 추정" },
      { href: "/life/screen-time", label: "스크린타임 절감 계산기", desc: "하루 절약 시간을 주·월 단위로 환산" },
    ],
  },
  {
    title: "day 계산기",
    items: [
      { href: "/life/korean-age", label: "만 나이 계산기", desc: "생년월일로 오늘 기준 만 나이 확인" },
      { href: "/life/dday", label: "D-day · 기념일 계산기", desc: "목표일까지 남은 날짜 계산" },
    ],
  },
  {
    title: "학점 계산기",
    items: [{ href: "/life/grade", label: "학점 계산기", desc: "평균 학점 계산" }],
  },
];

function Sidebar({ groups }: { groups: Group[] }) {
  return (
    <aside className="hidden md:block md:w-64 md:shrink-0">
      <div className="sticky top-6 space-y-2 rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/30">
        {groups.map((group) => (
          <a
            key={group.title}
            href={`#${group.title}`}
            className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <span>{group.title}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}

export default function LifePage() {
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

      <div className="flex flex-col gap-6 md:flex-row">
        <Sidebar groups={groups} />
        <div className="min-w-0 flex-1 hidden md:block">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {groups.flatMap((group) =>
              group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600">{item.label}</h2>
                      <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <span className="text-gray-300 transition-colors group-hover:text-green-500">→</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
