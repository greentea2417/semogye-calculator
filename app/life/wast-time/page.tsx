"use client";

import { useState } from "react";

export default function WasteTimeCalculator() {
  const [hours, setHours] = useState<number>(0);
  const EXPECTED_LIFE = 80; // 기대 수명
  const HOURLY_WAGE = 10030; // 2026년 최저시급 기준 (예시)

  const calculateWaste = () => {
    const dailyHours = hours;
    const yearlyHours = dailyHours * 365;
    const totalLifeHours = yearlyHours * EXPECTED_LIFE;
    const yearsWasted = (totalLifeHours / 24 / 365).toFixed(1);
    const moneyWasted = (yearlyHours * HOURLY_WAGE).toLocaleString();

    return { yearsWasted, moneyWasted };
  };

  const { yearsWasted, moneyWasted } = calculateWaste();

  return (
    <main className="max-w-md mx-auto px-5 py-12 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">인생 낭비 환산기</h1>
        <p className="text-sm text-red-500 font-bold italic">⚠️ 주의: 뼈 맞을 수 있음</p>
      </section>

      {/* 입력 섹션 */}
      <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm space-y-6">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold text-gray-600">하루 평균 스마트폰 사용 시간</p>
          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="text-4xl font-black text-gray-900">{hours}시간</div>
        </div>
      </div>

      {/* 결과 섹션 (충격 요법) */}
      {hours > 0 && (
        <div className="bg-gray-900 rounded-[40px] p-10 space-y-8 text-center shadow-2xl">
          <div className="space-y-1">
            <p className="text-white/50 text-xs font-bold uppercase">평생 동안 버리는 시간</p>
            <div className="text-5xl font-black text-red-400 italic tracking-tighter">
              약 {yearsWasted}년
            </div>
          </div>
          
          <div className="h-[1px] bg-white/10 w-full"></div>

          <div className="space-y-1">
            <p className="text-white/50 text-xs font-bold uppercase">1년치 기회비용 (최저시급 기준)</p>
            <div className="text-3xl font-black text-white">
              {moneyWasted}원
            </div>
            <p className="text-[10px] text-blue-400 font-bold">금액보다 중요한 건 당신이 놓쳐버린 수만 가지 기회들입니다.</p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-[32px] p-6 text-center">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          "스마트폰은 도구일 뿐, 노예가 되지 마세요." <br />
          지금 이 계산기를 끄고 가족과 눈을 맞추는 건 어떨까요?
        </p>
      </div>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      
      {/* SEO를 위한 정보성 컨텐츠 섹션 */}
      <section className="mt-20 space-y-10 text-left border-t border-gray-50 pt-16">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            당신의 스마트폰 사용 시간, 왜 중요할까요?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            현대인의 평균 스마트폰 사용 시간은 하루 5시간 이상으로 조사되었습니다. 
            단순히 <b>쇼츠, 릴스, 틱톡</b>을 보는 즐거움을 넘어, 이 시간이 평생 쌓였을 때 
            우리가 잃어버리는 기회비용은 상상 이상입니다. '세모계'의 <b>인생 낭비 환산기</b>는 
            여러분의 소중한 시간을 시각화하여 더 나은 라이프스타일을 제안합니다.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="p-6 bg-blue-50/50 rounded-[24px] space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">✅ 스마트폰 중독 방지를 위한 3단계 습관</h3>
            <ul className="text-xs text-gray-500 space-y-2 list-disc ml-4">
              <li><b>스크린 타임 확인:</b> 매일 아침 전날 사용 시간을 체크하며 메타인지를 높이세요.</li>
              <li><b>방해 금지 모드 활용:</b> 집중이 필요한 업무나 공부 시간에는 알림을 차단하세요.</li>
              <li><b>대체 취미 찾기:</b> 독서, 산책 등 오프라인 활동 시간을 10분씩 늘려보세요.</li>
            </ul>
          </div>

          <div className="p-6 bg-gray-50 rounded-[24px] space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">💡 시간 관리의 경제적 가치</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              하루 1시간만 아껴도 1년에 365시간, 최저시급 기준 약 360만 원 이상의 가치를 창출할 수 있습니다. 
              재테크의 시작은 소비를 줄이는 것이 아니라, <b>시간이라는 자원을 관리하는 것</b>에서 시작됩니다.
            </p>
          </div>
        </div>
      </section>

      </footer>
    </main>
  );
}