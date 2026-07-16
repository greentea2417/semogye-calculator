"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult, { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

type Sex = "male" | "female";
type Activity = "low" | "normal" | "active" | "veryactive";

const ACTIVITY: { key: Activity; label: string; factor: number; desc: string }[] = [
  { key: "low", label: "활동 적음", factor: 1.2, desc: "거의 앉아서 생활" },
  { key: "normal", label: "보통", factor: 1.375, desc: "주 1~3회 가벼운 운동" },
  { key: "active", label: "활발", factor: 1.55, desc: "주 3~5회 운동" },
  { key: "veryactive", label: "매우 활발", factor: 1.725, desc: "주 6~7회 강한 운동" },
];

export default function BmrPage() {
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState<Activity>("normal");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const ageNum = parseFloat(age);

  const valid = heightNum > 0 && weightNum > 0 && ageNum > 0;
  // Mifflin-St Jeor: BMR = 10*kg + 6.25*cm - 5*age + (남 +5 / 여 -161)
  const bmr = valid
    ? Math.round(10 * weightNum + 6.25 * heightNum - 5 * ageNum + (sex === "male" ? 5 : -161))
    : 0;
  const factor = ACTIVITY.find((a) => a.key === activity)!.factor;
  const tdee = bmr > 0 ? Math.round(bmr * factor) : 0;

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

  return (
    <CalculatorLayout
      tone="life"
      title="기초대사량(BMR) 계산기"
      subtitle="성별·키·몸무게·나이로 하루에 소비하는 기초대사량을 확인해보세요."
      intro="가만히 있어도 쓰는 기초대사량(BMR)과 활동량을 반영한 하루 권장 칼로리(TDEE)를 함께 보여줍니다."
      faqTitle="기초대사량 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 기초대사량(BMR)이 무엇인가요?", a: "A. 아무 활동 없이 숨쉬고 체온을 유지하는 데 하루 동안 쓰는 최소 에너지입니다. 보통 하루 소비 칼로리의 60~70%를 차지합니다." },
        { q: "Q. 어떤 공식을 쓰나요?", a: "A. 현재 가장 널리 쓰이는 미핀-세인트 지어(Mifflin-St Jeor) 공식입니다. 남성은 10×몸무게 + 6.25×키 − 5×나이 + 5, 여성은 마지막에 −161을 적용합니다." },
        { q: "Q. TDEE는 무엇인가요?", a: "A. 총 에너지 소비량으로, 기초대사량에 활동량 계수(1.2~1.725)를 곱한 값입니다. 이 값이 하루에 필요한 대략적인 칼로리입니다." },
        { q: "Q. 살을 빼려면 얼마나 먹어야 하나요?", a: "A. 일반적으로 TDEE보다 하루 300~500kcal 적게 먹으면 서서히 감량됩니다. 다만 개인차가 크므로 참고용으로만 활용하세요." },
      ]}
      result={
        <LifeResult
          label="기초대사량 (BMR)"
          value={bmr > 0 ? `${bmr.toLocaleString()} kcal` : "-"}
          status={tdee > 0 ? `하루 권장 ${tdee.toLocaleString()} kcal` : undefined}
          desc={tdee > 0 ? "활동량을 반영한 하루 소비 칼로리(TDEE)예요." : undefined}
          note="미핀-세인트 지어 공식 기준 추정치이며, 근육량·체지방률에 따라 실제와 차이가 있을 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">성별</span>
          <div className="grid grid-cols-2 gap-2">
            <LifeChoice active={sex === "male"} onClick={() => setSex("male")}>
              남성
            </LifeChoice>
            <LifeChoice active={sex === "female"} onClick={() => setSex("female")}>
              여성
            </LifeChoice>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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

        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">활동량</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIVITY.map((a) => (
              <LifeChoice key={a.key} active={activity === a.key} onClick={() => setActivity(a.key)}>
                {a.label}
              </LifeChoice>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {ACTIVITY.find((a) => a.key === activity)!.desc} (×{factor})
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
