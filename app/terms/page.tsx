export const metadata = {
  title: "이용약관",
  description: "세모계 이용 시 적용되는 기본 약관과 책임 범위를 확인하세요.",
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 mb-20">
      <section className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight not-italic">이용약관</h1>
        <p className="text-gray-400 text-sm mt-2 not-italic">최종 수정일: 2026. 07. 10</p>
      </section>

      <div className="space-y-10 text-sm text-gray-600 leading-relaxed not-italic">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. 서비스 목적</h2>
          <p>
            세모계는 생활, 급여, 세금, 자영업 등 각종 계산을 돕기 위한 정보 제공 서비스입니다.
            계산 결과는 참고용이며, 최종 판단과 책임은 사용자가 실제 상황에 맞게 확인해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. 계산 결과의 한계</h2>
          <p>
            법령, 제도, 세율, 지원정책 등은 변경될 수 있습니다.
            세모계는 공식 자료를 바탕으로 갱신하려 노력하지만, 이용 시점의 최신 법령과 공지사항을 함께 확인해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. 사용자의 책임</h2>
          <p>
            사용자는 입력값이 실제 상황과 일치하는지 확인해야 하며, 계산 결과를 계약·세무·노무 판단의 유일한 근거로 사용해서는 안 됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. 금지 행위</h2>
          <p>
            서비스의 정상 동작을 방해하거나, 허위 정보로 시스템을 교란하거나, 불법적인 방식으로 이용하는 행위는 금지됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. 책임 제한</h2>
          <p>
            세모계는 가능한 한 정확한 계산을 제공하기 위해 노력하지만, 계산 결과를 직접적 손해배상 책임의 근거로 보지 않습니다.
            중요한 의사결정 전에는 반드시 공식 문서와 전문가 확인을 병행하세요.
          </p>
        </section>
      </div>
    </main>
  );
}
