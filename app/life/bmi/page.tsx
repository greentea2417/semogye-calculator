"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) return { label: "저체중", desc: "조금 더 든든하게 드셔도 좋겠어요.", color: "text-amber-500" };
  if (bmi < 23) return { label: "정상", desc: "건강하고 이상적인 상태입니다!", color: "text-emerald-600" };
  if (bmi < 25) return { label: "과체중", desc: "관리가 필요한 시점이에요.", color: "text-orange-500" };
  return { label: "비만", desc: "식단 조절과 운동을 권장합니다.", color: "text-red-500" };
}

export default function BmiPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const bmi =
    weightNum > 0 && heightNum > 0
      ? Number((weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1))
      : 0;
  const status = bmi > 0 ? getBmiStatus(bmi) : null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "BMI 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="BMI 계산기"
      subtitle="키와 몸무게로 체질량지수를 확인해보세요."
      intro="저체중·정상·과체중·비만 구간을 함께 보여줍니다."
      faqTitle="BMI 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. BMI는 어떻게 계산하나요?", a: "A. 몸무게(kg)를 키(m)의 제곱으로 나눈 값입니다. 키 170cm·몸무게 65kg이면 65 ÷ (1.7 × 1.7) ≈ 22.5입니다." },
        { q: "Q. 한국인 정상 범위는 얼마인가요?", a: "A. 대한비만학회 기준으로 18.5 이상 23 미만이 정상이며, 23 이상은 과체중, 25 이상은 비만으로 봅니다." },
        { q: "Q. 근육이 많아도 비만으로 나오나요?", a: "A. 네. BMI는 체지방과 근육을 구분하지 못해 근육량이 많으면 실제보다 높게 나올 수 있습니다." },
        { q: "Q. BMI만 보면 충분한가요?", a: "A. 아니요. 체지방률, 허리둘레, 혈압·혈당 같은 지표와 함께 보는 것이 좋습니다." },
      ]}
      result={
        <LifeResult
          label="Your BMI"
          value={bmi > 0 ? String(bmi) : "-"}
          status={status?.label}
          statusClass={status?.color}
          desc={status?.desc}
          note="임신 중이거나 근육량이 매우 많은 경우 정확하지 않을 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} showPdf={false} />}
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">키 (cm)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="160"
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
            placeholder="55"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
