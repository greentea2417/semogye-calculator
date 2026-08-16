export const metadata = {
  title: "개인정보처리방침 | 세모계",
  description: "세모계의 개인정보 수집, 이용, 광고 및 쿠키 정책을 확인하세요.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 mb-20">
      <section className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight not-italic">개인정보처리방침</h1>
        <p className="text-gray-400 text-sm mt-2 not-italic">최종 수정일: 2026. 07. 10</p>
      </section>

      <div className="space-y-10 text-sm text-gray-600 leading-relaxed not-italic">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. 수집하는 정보</h2>
          <p>
            세모계는 별도의 회원가입 없이 서비스를 제공하며, 사용자가 입력한 계산값을 서버에 저장하지 않습니다.
            계산기는 기본적으로 브라우저 내에서 동작하며, 단순 계산 결과 제공을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. 광고 및 쿠키 사용</h2>
          <p>
            본 서비스는 Google AdSense 및 분석 도구를 사용할 수 있으며, 광고 제공과 서비스 개선을 위해 쿠키를 사용할 수 있습니다.
            사용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. 로그와 보관 정책</h2>
          <p>
            사용자가 입력한 정보는 계산을 위해 일시적으로 처리될 수 있으나, 원칙적으로 별도 보관하지 않습니다.
            세모계는 데이터 최소 수집 원칙을 지향하며, 서비스 운영에 필요한 최소한의 접속 정보만 처리할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. 외부 서비스</h2>
          <p>
            광고, 통계, 링크 미리보기 등 일부 기능은 외부 서비스의 영향을 받을 수 있습니다.
            외부 서비스의 쿠키 및 개인정보 처리 방식은 해당 서비스의 정책을 따릅니다.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 mb-2">문의처</h2>
          <p className="text-xs text-gray-500">문의하기 페이지를 통해 서비스 관련 문의를 남겨주세요. 계산 오류 제보도 환영합니다.</p>
        </section>
      </div>
    </main>
  );
}
