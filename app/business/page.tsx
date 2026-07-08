import Link from "next/link";

export default function BusinessPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-20">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        비즈니스 계산기
      </span>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
        왼쪽에서 계산기를 선택해주세요
      </h1>
      <p className="text-gray-500 mb-8">
        급여, 세금, 인건비까지. 필요한 계산을 골라보세요.
      </p>
      <Link
        href="/business/profit"
        className="px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        손익 계산기로 시작하기 →
      </Link>
    </div>
  );
}
