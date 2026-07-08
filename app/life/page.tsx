import Link from "next/link";

export default function LifePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-20">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold tracking-wide mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        라이프 계산기
      </span>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
        왼쪽에서 계산기를 선택해주세요
      </h1>
      <p className="text-gray-500 mb-8">
        건강, 학업, 그리고 재미까지. 숫자로 확인해보세요.
      </p>
      <Link
        href="/life/bmi"
        className="px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        BMI 계산기로 시작하기 →
      </Link>
    </div>
  );
}
