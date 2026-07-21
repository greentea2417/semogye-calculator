"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult, { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcBmr, type ActivityLevel, type Gender } from "../../utils/bmrCalc";

const ACTIVITIES: { key: ActivityLevel; label: string }[] = [
  { key: "sedentary", label: "거의 안 함" },
  { key: "light", label: "가벼움(주1~3)" },
  { key: "moderate", label: "보통(주3~5)" },
  { key: "active", label: "활발(주6~7)" },
  { key: "veryActive", label: "매우 활발" },
];

export default function BmrPage() {
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

  const result = calcBmr(
    gender,
    parseFloat(weight),
    parseFloat(height),
    parseFloat(age),
    activity
  );

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "기초대사량 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

  return (
    <CalculatorLayout
      tone="life"
      title="기초대사량(BMR) 계산기"
      subtitle="성별·키·몸무게·나이로 기초대사량과 하루 권장 칼로리를 계산해요."
      intro="Mifflin-St Jeor 공식으로 BMR을 구하고, 활동 수준을 곱해 하루 필요 열량(TDEE)을 보여줍니다."
      faqTitle="기초대사량 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 기초대사량(BMR)이 뭔가요?", a: "A. 아무 활동 없이 생명 유지에만 쓰이는 하루 최소 열량입니다. 숨쉬기·체온유지·장기 활동 등에 소모돼요." },
        { q: "Q. 어떤 공식을 쓰나요?", a: "A. Mifflin-St Jeor 공식입니다. 남성 = 10×체중 + 6.25×키 − 5×나이 + 5, 여성 = 10×체중 + 6.25×키 − 5×나이 − 161 (kcal)." },
        { q: "Q. 하루 권장 칼로리(TDEE)는 어떻게 나오나요?", a: "A. BMR에 활동계수를 곱합니다. 거의 안 함 1.2, 가벼움 1.375, 보통 1.55, 활발 1.725, 매우 활발 1.9를 사용해요." },
        { q: "Q. 다이어트할 때 어떻게 활용하나요?", a: "A. 하루 권장 칼로리보다 적게 먹으면 체중이 줄고, 많이 먹으면 늘어납니다. 보통 500kcal 적자로 주당 약 0.5kg 감량을 목표합니다." },
      ]}
      result={
        <LifeResult
          label="기초대사량 (BMR)"
          value={result ? `${fmt(result.bmr)} kcal` : "-"}
          status={result ? `하루 권장 ${fmt(result.tdee)} kcal` : undefined}
          desc={result ? "생명 유지 최소 열량 · 활동 포함 권장 열량" : undefined}
          note="개인의 근육량·체질에 따라 실제 소모량은 달라질 수 있어요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <LifeChoice active={gender === "male"} onClick={() => setGender("male")}>
            남성
          </LifeChoice>
          <LifeChoice active={gender === "female"} onClick={() => setGender("female")}>
            여성
          </LifeChoice>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">몸무게 (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">키 (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">나이 (세)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
        <div>
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">활동 수준</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {ACTIVITIES.map((a) => (
              <LifeChoice key={a.key} active={activity === a.key} onClick={() => setActivity(a.key)}>
                {a.label}
              </LifeChoice>
            ))}
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
