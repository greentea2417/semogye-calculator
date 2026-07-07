import Link from "next/link";

function Item({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all"
    >
      <div className="text-left">
        <p className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <p className="text-[12px] text-gray-400 mt-1">{desc}</p>
      </div>
      <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
        →
      </span>
    </Link>
  );
}

export default function BusinessPage() {
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            사장님을 위한 계산기
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            비즈니스 계산기
          </h1>
          <p className="mt-3 text-gray-500">
            급여, 세금, 인건비까지. 필요한 계산을 골라보세요.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              사장님 필수
            </h2>
            <div className="space-y-3">
              <Item href="/profit" title="손익 계산기" desc="판매 수익과 마진 확인" />
              <Item href="/hourly-multi" title="사장님 시급 계산" desc="직원 급여 한번에 계산" />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              급여 · 보상
            </h2>
            <div className="space-y-3">
              <Item href="/salary" title="월급 계산기" desc="세후 실수령액 확인" />
              <Item href="/bonus" title="상여금 계산기" desc="보너스 실수령액 계산" />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              근로 · 계약
            </h2>
            <div className="space-y-3">
              <Item href="/hourly" title="시급 계산기" desc="주휴 포함 월급 계산" />
              <Item href="/compare" title="알바 vs 프리랜서" desc="유리한 계약 비교" />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">
              대출 · 금융
            </h2>
            <div className="space-y-3">
              <Item
                href="/burden"
                title="내 월급으로 이 대출 괜찮을까?"
                desc="소득 대비 대출 위험도 확인"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
