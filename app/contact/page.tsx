export const metadata = {
  title: "문의하기 | 세모계",
  description: "세모계 서비스 문의, 오류 제보, 제안 사항을 남겨주세요.",
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 mb-20">
      <section className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight not-italic">문의하기</h1>
        <p className="text-gray-400 text-sm mt-2 not-italic">오류 제보, 제휴 문의, 개선 제안 환영</p>
      </section>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed not-italic">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">연락 방법</h2>
          <p>
            문의용 이메일 또는 사이트 내 메시지 채널을 통해 연락해 주세요.
            가능한 경우 계산기 이름, 입력값, 기대 결과, 실제 결과를 함께 보내주시면 빠르게 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">이런 문의를 보내주세요</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>계산 오류 또는 오차 의심 사례</li>
            <li>새로운 계산기 제안</li>
            <li>검색 노출/SEO 관련 의견</li>
            <li>광고 배치 또는 사용성 피드백</li>
            <li>모바일에서 잘 보이지 않는 화면 제보</li>
          </ul>
        </section>

        <section className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">빠른 제보 팁</h2>
          <p>
            계산기 이름과 함께 입력값, 기대한 결과, 실제 결과를 적어주시면 더 빨리 확인할 수 있습니다.
            스크린샷을 함께 보내주면 재현이 쉬워집니다.
          </p>
        </section>
      </div>
    </main>
  );
}
