import Link from "next/link";

const items = [
  { href: "/life/bmi", label: "BMI 계산기", desc: "체질량지수를 빠르게 확인" },
  { href: "/life/body-age", label: "신체 나이 계산기", desc: "몸 상태를 나이로 보기" },
  { href: "/life/kbm", label: "키빼몸 계산기", desc: "간단한 체형 기준 확인" },
  { href: "/life/grade", label: "학점 계산기", desc: "평균 학점 계산" },
  { href: "/life/waste-time", label: "내가 날린 인생 시간은?", desc: "재미로 보는 시간 계산" },
];

export default function LifePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center sm:block hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold tracking-wide text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          라이프 계산기
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          필요한 계산기를 골라보세요
        </h1>
        <p className="mt-3 text-gray-500">
          건강, 학업, 재미까지 일상에서 바로 쓰는 계산기만 모았습니다.
        </p>
      </div>

      <div className="md:hidden mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">라이프 계산기</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600">
                  {item.label}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
              </div>
              <span className="text-gray-300 transition-colors group-hover:text-green-500">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
