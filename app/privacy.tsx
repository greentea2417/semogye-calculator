export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-20 mb-20">
      <section className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight not-italic">개인정보처리방침</h1>
        <p className="text-gray-400 text-sm mt-2 not-italic">최종 수정일: 2026. 04. 17</p>
      </section>

      <div className="space-y-10 text-sm text-gray-600 leading-relaxed not-italic">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            '세모계'는 별도의 회원가입 없이 모든 서비스를 이용하실 수 있습니다. 
            본 서비스는 사용자가 입력한 계산 데이터(금액, 신체 수치 등)를 서버에 저장하지 않으며, 
            단순 계산 결과를 제공하는 목적으로만 사용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. 광고 식별자 및 쿠키(Cookie) 이용</h2>
          <p>
            본 서비스는 구글 애드센스(Google AdSense)를 통해 광고를 게재합니다. 
            구글은 사용자의 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 
            사용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. 데이터 보안 및 보호</h2>
          <p>
            사용자가 입력한 모든 정보는 브라우저 내에서만 처리되며, 외부로 유출되지 않습니다. 
            '세모계'는 사장님의 정갈한 일상을 보호하기 위해 데이터 최소 수집 원칙을 준수합니다.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 mb-2">문의처</h2>
          <p className="text-xs text-gray-500">
            서비스 이용 및 개인정보 관련 문의는 제작자 이메일로 연락 주시기 바랍니다.
          </p>
        </section>
      </div>
    </main>
  );
}