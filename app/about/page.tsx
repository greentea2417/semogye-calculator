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
          <h2 className="text-lg font-bold text-gray-900 mb-3">어떤 계산기를 제공하나요?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>급여·시급·주휴수당·연장/휴일/야간수당 계산기</li>
            <li>세금·부가세·프리랜서 3.3%·종합소득세 계산기</li>
            <li>대출·예금·적금·복리 계산기</li>
            <li>퇴직금·실업급여·연차수당 계산기</li>
            <li>BMI·체지방률·D-day·생활 계산기</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">우리가 중요하게 보는 것</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>계산 정확성</li>
            <li>공식 근거 기반 구현</li>
            <li>결과를 바로 이해할 수 있는 설명</li>
            <li>검색엔진에서 찾기 쉬운 구조</li>
            <li>모바일에서도 편한 사용성</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">업데이트 방식</h2>
          <p>
            세모계는 사용자가 실제로 많이 찾는 계산기부터 우선 보강하고, 계산 공식·FAQ·예시·관련 계산기를 함께 정리합니다.
            계산 결과는 참고용이지만, 가능한 한 공식 기준에 맞춰 정확도를 높이는 것을 우선합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">앞으로의 방향</h2>
          <p>
            검색에서 잘 발견되고, 실제로 계산에 도움이 되며, 신뢰할 수 있는 계산기 플랫폼으로 성장하는 것이 목표입니다.
          </p>
        </section>
      </div>
    </main>
  );
}
