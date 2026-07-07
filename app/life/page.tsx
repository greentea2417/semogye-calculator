import Link from "next/link";

function Item({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="relative flex items-center justify-center p-4 rounded-xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-sm transition-all group"
    >
      <div className="text-center">
        <p className="text-[14px] font-bold text-gray-900 group-hover:text-green-600 transition-colors">
          {title}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{desc}</p>
      </div>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all">
        →
      </span>
    </Link>
  );
}

export default function LifePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tight text-gray-900">
            세모계
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← 홈으로
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold tracking-wide mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            일상을 위한 계산기
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            라이프 계산기
          </h1>
          <p className="mt-3 text-gray-500">
            건강, 학업, 그리고 재미까지. 숫자로 확인해보세요.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              건강
            </h2>
            <div className="space-y-2.5">
              <Item href="/life/bmi" title="BMI 계산기" desc="비만도 지수 확인" />
              <Item href="/life/body-age" title="신체 나이 계산기" desc="내 몸의 실제 나이 확인" />
              <Item href="/life/kbm" title="키빼몸 계산기" desc="내 몸매 기준 한눈에 확인" />
            </div>
          </section>

          <section>
            <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              학습
            </h2>
            <div className="space-y-2.5">
              <Item href="/life/grade" title="학점 계산기" desc="평균 학점 자동 계산" />
            </div>
          </section>

          <section>
            <h2 className="text-center text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              재미
            </h2>
            <div className="space-y-2.5">
              <Item
                href="/life/waste-time"
                title="내가 날린 인생 시간은?"
                desc="지금까지 낭비한 시간 계산"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
