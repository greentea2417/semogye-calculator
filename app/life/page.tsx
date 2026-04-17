import Link from "next/link";

function Item({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="block py-5 border-b border-gray-100 hover:bg-gray-50 transition"
    >
      <div className="flex flex-col items-center text-center">
        <p className="text-[15px] font-medium text-gray-900">
          {title}
        </p>
        <p className="text-[12px] text-gray-400 mt-1">
          {desc}
        </p>
      </div>
    </Link>
  );
}

export default function LifePage() {
  return (
    <main className="max-w-md mx-auto px-5 py-8 text-center">

      {/* 타이틀 */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">
        라이프 계산기
      </h1>

      {/* 건강 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-3">
          건강
        </h2>
        <div className="bg-white rounded-xl overflow-hidden">
          <Item href="/life/bmi" title="BMI 계산기" desc="비만도 지수 확인" />
          <Item href="/life/body-age" title="신체 나이 계산기" desc="내 몸의 실제 나이 확인" />
        </div>
      </section>

      {/* 학습 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-3">
          학습
        </h2>
        <div className="bg-white rounded-xl overflow-hidden">
          <Item href="/life/grade" title="학점 계산기" desc="평균 학점 자동 계산" />
        </div>
      </section>

      {/* 재미 */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 mb-3">
          재미
        </h2>
        <div className="bg-white rounded-xl overflow-hidden">
          <Item
            href="/life/waste-time"
            title="내가 날린 인생 시간은?"
            desc="지금까지 낭비한 시간 계산"
          />
        </div>
      </section>

    </main>
  );
}