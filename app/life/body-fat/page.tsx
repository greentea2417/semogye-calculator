"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult, { LifeChoice } from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcBodyFat, type Sex } from "@/utils/bodyFatCalc";

export default function BodyFatPage() {
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const ageNum = parseInt(age, 10);

  const result = useMemo(() => {
    if (!(heightNum > 0) || !(weightNum > 0) || !(ageNum > 0)) return null;
    return calcBodyFat(weightNum, heightNum, ageNum, sex);
  }, [heightNum, weightNum, ageNum, sex]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "체지방률 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="체지방률 계산기"
      subtitle="키·체중·나이만 넣으면 체지방률을 추정해 드려요."
      intro="Deurenberg 공식으로 키·체중·나이·성별을 이용해 체지방률을 추정합니다. 측정 장비 없이 대략적인 수준을 확인할 때 활용하세요."
      faqTitle="체지방률 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 체지방률(%) = 1.20 × BMI + 0.23 × 나이 − 10.8 × 성별 − 5.4 (남성=1, 여성=0) 공식을 사용합니다. BMI = 체중(kg) ÷ 키(m)² 입니다." },
        { q: "Q. 인바디 수치와 다른가요?", a: "A. 네. 이 값은 키·체중·나이로 추정한 근사치라 체성분 분석기(인바디) 측정값과 차이가 날 수 있습니다." },
        { q: "Q. 정상 범위는요?", a: "A. 남성은 대략 10~20%, 여성은 18~28%를 정상으로 봅니다. 나이·근육량에 따라 기준은 달라질 수 있습니다." },
        { q: "Q. 왜 성별을 나누나요?", a: "A. 같은 BMI라도 여성이 남성보다 체지방률이 높은 것이 정상이라 공식에 성별 항이 들어갑니다." },
      ]}
      result={
        <LifeResult
          label="추정 체지방률"
          value={result ? `${result.bodyFat}%` : "-"}
          status={result ? result.category : undefined}
          statusClass="text-emerald-600"
          desc={result ? `BMI ${result.bmi}` : undefined}
          note={result ? "Deurenberg 공식 기반 추정치입니다. 정확한 값은 체성분 분석을 권장합니다." : "성별·키·체중·나이를 입력하면 체지방률이 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">성별</span>
          <div className="grid grid-cols-2 gap-2">
            <LifeChoice active={sex === "male"} onClick={() => setSex("male")}>남성</LifeChoice>
            <LifeChoice active={sex === "female"} onClick={() => setSex("female")}>여성</LifeChoice>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">키 (cm)</span>
            <input type="number" inputMode="decimal" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">체중 (kg)</span>
            <input type="number" inputMode="decimal" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
          </label>
        </div>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">나이 (만)</span>
          <input type="number" inputMode="numeric" placeholder="30" value={age} onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
      </div>
    </CalculatorLayout>
  );
}
