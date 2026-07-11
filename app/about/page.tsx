export const metadata = {
  title: "소개 | 세모계",
  description: "세모계가 어떤 서비스인지, 무엇을 목표로 하는지 확인하세요.",
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 mb-20">
      <section className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight not-italic">소개</h1>
        <p className="text-gray-400 text-sm mt-2 not-italic">세상의 모든 계산을 더 쉽고 정확하게</p>
      </section>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed not-italic">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">세모계는</h2>
          <p>
            세모계는 일상과 업무에서 자주 필요한 계산을 한곳에 모은 계산기 플랫폼입니다.
            급여, 시급, 세금, 사업 정산, 생활 계산을 빠르고 정확하게 확인할 수 있도록 만드는 것이 목표입니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">우리가 중요하게 보는 것</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>계산 정확성</li>
            <li>공식 근거 기반 구현</li>
            <li>검색엔진에서 찾기 쉬운 구조</li>
            <li>모바일에서도 편한 사용성</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">앞으로의 방향</h2>
          <p>
            사용자가 실제로 많이 찾는 계산기부터 하나씩 확장하고, 계산 결과를 설명하는 콘텐츠와 FAQ를 함께 제공하여
            신뢰할 수 있는 계산기 플랫폼으로 성장하는 것이 목표입니다.
          </p>
        </section>
      </div>
    </main>
  );
}
