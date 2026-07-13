"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

const EXPECTED_LIFE = 80; // 기대 수명(년)
const HOURLY_WAGE = 10030; // 최저시급 기준 기회비용

export default function WasteTimePage() {
  const [hours, setHours] = useState(3);

  const yearlyHours = hours * 365;
  const yearsWasted = ((yearlyHours * EXPECTED_LIFE) / 24 / 365).toFixed(1);
  const moneyWasted = (yearlyHours * HOURLY_WAGE).toLocaleString();

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "내가 날린 인생 시간 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="내가 날린 인생 시간 계산기"
      subtitle="하루 스마트폰 사용 시간이 평생 얼마가 되는지 확인해보세요."
      intro="하루 사용 시간을 기대수명(80년) 기준으로 환산한 재미용 계산입니다."
      faqTitle="인생 시간 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 계산 기준이 무엇인가요?", a: "A. 하루 사용 시간 × 365일 × 기대수명 80년을 더해 하루 24시간 단위의 '년'으로 환산합니다." },
        { q: "Q. 기회비용 금액은 어떻게 계산하나요?", a: "A. 1년치 사용 시간에 최저시급을 곱한 값으로, 그 시간을 일했다면 벌 수 있었을 금액을 보여줍니다." },
        { q: "Q. 한국인 평균 스마트폰 사용 시간은?", a: "A. 조사마다 다르지만 하루 4~5시간 수준으로 보고됩니다." },
        { q: "Q. 사용 시간을 줄이는 방법이 있나요?", a: "A. 스크린 타임 확인, SNS·영상 앱 사용 시간 제한, 폰을 들 때 대체할 행동 정하기가 효과적입니다." },
      ]}
      result={
        <LifeResult
          label="평생 동안 쓰게 되는 시간"
          value={`약 ${yearsWasted}년`}
          status={`1년치 기회비용 ${moneyWasted}원`}
          statusClass="text-red-500"
          desc="금액보다 중요한 건 그 시간에 할 수 있었던 일들이에요."
          note="재미로 보는 계산이며, 스마트폰 사용이 모두 낭비인 것은 아닙니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-3 text-center">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
          하루 평균 스마트폰 사용 시간
        </span>
        <input
          type="range"
          min={0}
          max={24}
          step={1}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-emerald-600"
        />
        <div className="text-4xl font-black tracking-tight text-gray-900">{hours}시간</div>
      </div>
    </CalculatorLayout>
  );
}
