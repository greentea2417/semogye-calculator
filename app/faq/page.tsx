export const metadata = {
  title: "FAQ",
  description: "세모계 계산기 이용 방법과 자주 묻는 질문을 확인하세요.",
};

const items = [
  {
    q: "계산 결과는 어떻게 검증하나요?",
    a: "공식 자료와 법령, 제도 기준을 우선으로 확인하고, 여러 테스트 케이스로 수작업 계산과 결과를 비교합니다.",
  },
  {
    q: "계산 결과가 실제와 다를 수 있나요?",
    a: "법령 변경, 입력값 오류, 개인 상황 차이 때문에 차이가 날 수 있습니다. 중요한 결정 전에는 공식 문서도 함께 확인하세요.",
  },
  {
    q: "모바일에서도 잘 되나요?",
    a: "네. 세모계는 모바일에서도 계산 흐름이 끊기지 않도록 반응형 UI를 지향합니다.",
  },
  {
    q: "새 계산기는 어떻게 제안하나요?",
    a: "문의하기 페이지를 통해 요청하면 검색 수요와 우선순위를 검토해 반영 여부를 판단합니다.",
  },
];

export default function FAQPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 mb-20">
      <section className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight not-italic">FAQ</h1>
        <p className="text-gray-400 text-sm mt-2 not-italic">세모계 이용 중 자주 묻는 질문</p>
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-gray-200 bg-white p-5">
            <summary className="cursor-pointer list-none font-bold text-gray-900 not-italic">
              {item.q}
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed not-italic">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
