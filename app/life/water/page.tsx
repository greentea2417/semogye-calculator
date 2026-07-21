"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcWaterIntake } from "../../utils/waterIntakeCalc";

export default function WaterPage() {
  const [weight, setWeight] = useState("");
  const [exercise, setExercise] = useState("");

  const result = calcWaterIntake(parseFloat(weight), parseFloat(exercise) || 0);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "하루 물 섭취량 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="하루 권장 수분 섭취량 계산기"
      subtitle="몸무게와 운동 시간으로 하루에 마셔야 할 물의 양을 계산해요."
      intro="체중 1kg당 약 33ml를 기준으로, 운동량을 더해 하루 권장 수분량을 리터·컵 단위로 보여줍니다."
      faqTitle="수분 섭취량 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 하루 물 섭취량은 어떻게 계산하나요?", a: "A. 몸무게(kg) × 33ml를 기본으로 합니다. 예를 들어 60kg이면 60 × 33 = 1,980ml, 약 2리터입니다." },
        { q: "Q. 운동하면 얼마나 더 마셔야 하나요?", a: "A. 운동 30분당 약 350ml를 추가로 권장합니다. 땀으로 빠져나간 수분을 보충하기 위해서예요." },
        { q: "Q. 한 컵은 몇 ml인가요?", a: "A. 이 계산기는 250ml를 한 컵으로 봅니다. 총 권장량을 250으로 나눠 컵 개수를 알려드려요." },
        { q: "Q. 커피나 국물도 포함되나요?", a: "A. 음식·음료의 수분도 일부 도움이 되지만, 이 값은 '순수하게 마시는 물' 기준으로 참고하는 것이 좋습니다." },
      ]}
      result={
        <LifeResult
          label="하루 권장 수분량"
          value={result ? `${result.liters.toFixed(2)} L` : "-"}
          status={result ? `${Math.round(result.totalMl).toLocaleString("ko-KR")} ml` : undefined}
          desc={result ? `약 ${Math.round(result.cups)}컵 (250ml 기준)` : undefined}
          note="기온·건강 상태에 따라 필요한 수분량은 달라질 수 있어요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">몸무게 (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="60"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="block space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">하루 운동 시간 (분, 선택)</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="30"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
