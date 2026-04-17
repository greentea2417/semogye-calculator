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
      
      {/* 하단 통합 컨텐츠 */}
<section className="mt-20 space-y-8 text-left border-t border-gray-100 pt-12">

  <h2 className="text-xl font-bold text-gray-900 tracking-tight text-center">
    당신의 하루 3시간, 정말 괜찮을까요?
  </h2>

  <p className="text-sm text-gray-500 leading-relaxed">
    요즘 평균 스마트폰 사용 시간은 하루 4~5시간 수준입니다.  
    얼핏 보면 “다들 이 정도는 쓰지”라고 생각할 수 있지만, 이 시간이 1년, 10년, 평생 쌓이면 이야기가 달라집니다.  
    단순한 휴식이 아니라 <b>반복적인 짧은 도파민 소비</b>는 집중력 저하, 시간 인식 왜곡, 그리고 생산성 감소로 이어질 수 있습니다.
  </p>

  <div className="bg-red-50 rounded-[24px] p-6 space-y-2">
    <h3 className="font-bold text-gray-900 text-sm">⚠️ 우리가 놓치고 있는 것</h3>
    <p className="text-xs text-gray-600 leading-relaxed">
      하루 3시간은 1년에 1,000시간이 넘습니다.  
      이 시간은 새로운 기술을 배우거나, 운동을 하거나, 가족과 더 많은 시간을 보낼 수 있는 기회였습니다.  
      중요한 건 단순한 “시간 낭비”가 아니라, <b>기회 상실</b>입니다.
    </p>
  </div>

  <div className="bg-blue-50 rounded-[24px] p-6 space-y-3">
    <h3 className="font-bold text-gray-900 text-sm">💡 현실적으로 줄이는 방법</h3>
    <ul className="text-xs text-gray-600 space-y-2 list-disc ml-4">
      <li><b>스크린 타임 확인:</b> 하루 사용 시간을 숫자로 인식하는 것부터 시작하세요.</li>
      <li><b>앱 사용 제한:</b> SNS·영상 앱 사용 시간을 하루 1~2시간으로 제한합니다.</li>
      <li><b>대체 행동 만들기:</b> 무의식적으로 폰을 들 때, 대신 할 행동을 정해두세요.</li>
    </ul>
  </div>

  <p className="text-sm text-gray-500 leading-relaxed">
    스마트폰은 문제의 원인이 아니라 도구입니다.  
    중요한 건 “얼마나 쓰느냐”가 아니라 <b>어떻게 쓰느냐</b>입니다.  
    지금 이 순간부터 단 30분만 줄여도, 당신의 하루는 완전히 달라질 수 있습니다.
  </p>

</section>
      </footer>
    </main>
  );
}