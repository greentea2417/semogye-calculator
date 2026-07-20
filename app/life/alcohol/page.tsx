"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcBac, formatHours, type Gender } from "../../utils/bacCalc";

export default function AlcoholPage() {
  const [volume, setVolume] = useState("");
  const [abv, setAbv] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");

  const result = calcBac(parseFloat(volume), parseFloat(abv), parseFloat(weight), gender);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "혈중 알코올 농도 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="혈중 알코올 농도 계산기"
      subtitle="마신 술의 양과 도수로 예상 혈중알코올농도(BAC)와 해독 시간을 계산해요."
      intro="Widmark 공식으로 예상 BAC와 운전 가능 시점을 알려드립니다. 참고용이며 절대 음주운전 판단 기준이 될 수 없습니다."
      faqTitle="혈중 알코올 농도 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 혈중알코올농도는 어떻게 계산하나요?", a: "A. Widmark 공식을 씁니다. 순수 알코올(g) = 마신 양(mL) × 도수 ÷ 100 × 0.789, BAC(%) = 알코올(g) ÷ (체중kg × r × 10)이며 r은 남성 0.68, 여성 0.55입니다." },
        { q: "Q. 언제 운전할 수 있나요?", a: "A. 도로교통법상 면허정지 기준은 0.03%입니다. 계산기는 시간당 0.015%씩 분해된다고 보고 0.03% 미만이 되는 시점과 완전 분해 시점을 함께 보여줍니다." },
        { q: "Q. 계산값이 실제와 같은가요?", a: "A. 아니요. 개인의 대사 속도, 공복 여부, 컨디션에 따라 크게 달라집니다. 결과는 참고용이며 음주 후에는 절대 운전하지 마세요." },
        { q: "Q. 소주 한 병은 얼마나 되나요?", a: "A. 일반 소주 한 병은 약 360mL, 도수 약 16~17%입니다. 맥주 500mL는 보통 4.5~5% 정도입니다." },
      ]}
      result={
        <LifeResult
          label="예상 혈중알코올농도"
          value={result ? `${result.bac.toFixed(3)}%` : "-"}
          status={
            result
              ? result.bac >= 0.03
                ? "운전 불가 (면허정지 기준 이상)"
                : "면허정지 기준 미만"
              : undefined
          }
          statusClass={result && result.bac >= 0.03 ? "text-red-500" : "text-emerald-600"}
          desc={
            result
              ? `운전 가능(0.03% 미만)까지 약 ${formatHours(result.hoursToLegal)} · 완전 분해까지 약 ${formatHours(result.hoursToZero)}`
              : undefined
          }
          note="개인차가 크며 참고용입니다. 음주 후에는 절대 운전하지 마세요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">마신 양 (mL)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="360"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">도수 (%)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="17"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">체중 (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <LifeChoice active={gender === "male"} onClick={() => setGender("male")}>남성</LifeChoice>
          <LifeChoice active={gender === "female"} onClick={() => setGender("female")}>여성</LifeChoice>
        </div>
      </div>
    </CalculatorLayout>
  );
}
