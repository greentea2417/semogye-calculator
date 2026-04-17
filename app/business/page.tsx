import Link from "next/link";

function Item({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-4 border-b border-gray-100"
    >
      <div>
        <p className="text-[15px] font-medium text-gray-900">{title}</p>
        <p className="text-[12px] text-gray-400 mt-1">{desc}</p>
      </div>
      <span className="text-gray-300">›</span>
    </Link>
  );
}

export default function BusinessPage() {
  return (
    <main className="max-w-md mx-auto px-5 py-8">

      <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        비즈니스
      </h1>

      {/* 사장님 필수 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-2 text-center">
          사장님 필수
        </h2>
        <div className="bg-white rounded-xl px-2">
          <Item href="/profit" title="손익 계산기" desc="판매 수익과 마진 확인" />
          <Item href="/hourly-multi" title="사장님 시급 계산" desc="직원 급여 한번에 계산" />
        </div>
      </section>

      {/* 급여 · 보상 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-2 text-center">
          급여 · 보상
        </h2>
        <div className="bg-white rounded-xl px-2">
          <Item href="/salary" title="월급 계산기" desc="세후 실수령액 확인" />
          <Item href="/bonus" title="상여금 계산기" desc="보너스 실수령액 계산" />
        </div>
      </section>

      {/* 근로 · 계약 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-2 text-center">
          근로 · 계약
        </h2>
        <div className="bg-white rounded-xl px-2">
          <Item href="/hourly" title="시급 계산기" desc="주휴 포함 월급 계산" />
          <Item href="/compare" title="월급 vs 프리랜서" desc="유리한 계약 비교" />
        </div>
      </section>

      {/* 대출 · 금융 */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 mb-2 text-center">
          대출 · 금융
        </h2>
        <div className="bg-white rounded-xl px-2">
          <Item
            href="/burden"
            title="👉 내 월급으로 이 대출 괜찮을까?"
            desc="소득 대비 대출 위험도 확인"
          />
        </div>
      </section>

    </main>
  );
}