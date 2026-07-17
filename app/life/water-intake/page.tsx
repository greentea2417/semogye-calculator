"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult, { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

type Activity = { key: string; label: string; mlPerKg: number };
const ACTIVITIES: Activity[] = [
  { key: "low", label: "저활동", mlPerKg: 30 },
  { key: "normal", label: "보통", mlPerKg: 33 },
  { key: "high", label: "고활동", mlPerKg: 40 },
];

export default function WaterIntakePage() {
  const [weight, setWeight] = useState("");
  const [activityKey, setActivityKey] = useState("normal");

  const weightNum = parseFloat(weight);
  const activity = ACTIVITIES.find((a) => a.key === activityKey) ?? ACTIVITIES[1];

  const ml = weightNum > 0 ? Math.round(weightNum * activity.mlPerKg) : 0;
  const liters = ml > 0 ? Math.round((ml / 1000) * 100) / 100 : 0;
  const cups = ml > 0 ? Math.round((ml / 200) * 10) / 10 : 0; // 200ml 컵 기준

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
      title="하루 물 섭취량 계산기"
      subtitle="체중과 활동량으로 하루 권장 물 섭취량을 확인해보세요."
      intro="체중 1kg당 약 30~40ml를 기준으로 하루 권장 물 섭취량을 계산합니다."
      faqTitle="물 섭취량 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 하루 물 섭취량은 어떻게 계산하나요?", a: "A. 체중(kg) × 활동량별 계수(저활동 30ml·보통 33ml·고활동 40ml)로 계산합니다. 예를 들어 60kg·보통 활동이면 60 × 33 = 1,980ml(약 2L)입니다." },
        { q: "Q. 200ml 컵 기준으로 몇 잔인가요?", a: "A. 계산된 권장량을 200ml 컵으로 나눈 잔 수를 함께 보여줍니다. 1,980ml면 약 9.9잔입니다." },
        { q: "Q. 운동을 많이 하면 더 마셔야 하나요?", a: "A. 네. 땀으로 수분이 빠지므로 활동량을 '고활동(40ml)'으로 선택하면 권장량이 늘어납니다. 격한 운동 시에는 추가로 더 마시는 것이 좋습니다." },
        { q: "Q. 음식·음료의 수분도 포함인가요?", a: "A. 이 계산기는 하루 총 수분 목표의 참고값입니다. 국·과일 등 음식의 수분도 일부 포함되므로, 순수 물 섭취량은 이보다 다소 적어도 괜찮습니다. 신장 질환 등이 있으면 의사와 상담하세요." },
      ]}
      result={
        <LifeResult
          label="하루 권장 물 섭취량"
          value={ml > 0 ? `${liters}L` : "-"}
          status={ml > 0 ? `${ml.toLocaleString()}ml` : undefined}
          desc={ml > 0 ? `200ml 컵으로 약 ${cups}잔` : undefined}
          note="체중 1kg당 약 30~40ml 기준의 참고값입니다. 활동량·건강 상태에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <label className="space-y-2">
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
      <div className="mt-4">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">활동량</span>
        <div className="grid grid-cols-3 gap-3">
          {ACTIVITIES.map((a) => (
            <LifeChoice key={a.key} active={activityKey === a.key} onClick={() => setActivityKey(a.key)}>
              {a.label}
              <span className="mt-0.5 block text-[10px] font-medium opacity-70">{a.mlPerKg}ml/kg</span>
            </LifeChoice>
          ))}
        </div>
      </div>
    </CalculatorLayout>
  );
}
