import Link from "next/link";
import HomeLink from "@/components/HomeLink";
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

export default function LifePage() {
  return (
    <main className="max-w-md mx-auto px-5 py-8">

      {/* 타이틀 */}
      <h1 className="text-lg font-bold text-gray-900 mb-6">라이프</h1>

      {/* 건강 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-2">건강</h2>
        <div className="bg-white rounded-xl px-2">
          <Item
            href="/life/bmi"
            title="BMI 계산기"
            desc="비만도 지수 확인"
          />
          <Item
            href="/life/body-age"
            title="신체 나이 계산기"
            desc="내 몸의 실제 나이 확인"
          />
        </div>
      </section>

      {/* 학습 */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 mb-2">학습</h2>
        <div className="bg-white rounded-xl px-2">
          <Item
            href="/life/grade"
            title="학점 계산기"
            desc="평균 학점 자동 계산"
          />
        </div>
      </section>

      {/* 재미 */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 mb-2">재미</h2>
        <div className="bg-white rounded-xl px-2">
          <Item
            href="/life/waste-time"
            title="인생 낭비 계산기"
            desc="내가 낭비한 시간 계산"
          />
        </div>
      </section>

    </main>
  );
}