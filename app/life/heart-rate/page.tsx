"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { heartRateZones, maxHeartRate } from "@/utils/heartRateCalc";

export default function HeartRatePage() {
  const [age, setAge] = useState("");
  const [resting, setResting] = useState("");

  const ageNum = parseInt(age, 10);
  const restNum = resting === "" ? 70 : parseInt(resting, 10);

  const data = useMemo(() => {
    if (!(ageNum > 0 && ageNum < 120)) return null;
    if (!(restNum >= 30 && restNum <= 120)) return null;
    const hrmax = maxHeartRate(ageNum);
    if (restNum >= hrmax) return null;
    return { hrmax, zones: heartRateZones(ageNum, restNum) };
  }, [ageNum, restNum]);

  const fatZone = data?.zones.find((z) => z.name === "지방연소") ?? null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "목표 심박수 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="목표 심박수 계산기"
      subtitle="나이와 안정시 심박수로 운동 강도별 목표 심박수를 계산해요."
      intro="카르보넨 공식을 사용합니다. 최대심박수(220−나이)에서 안정시 심박수를 뺀 '여유심박수'에 운동 강도를 곱해, 실제 체력에 맞는 목표 심박수를 구합니다."
      faqTitle="목표 심박수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 최대심박수 = 220 − 나이, 여유심박수 = 최대심박수 − 안정시 심박수. 목표심박수 = 여유심박수 × 강도(%) + 안정시 심박수 입니다." },
        { q: "Q. 안정시 심박수는 무엇인가요?", a: "A. 아침에 깨어나 가만히 있을 때의 분당 심박수입니다. 모르면 보통 성인 평균인 70을 기본값으로 씁니다." },
        { q: "Q. 지방 연소에는 어떤 강도가 좋나요?", a: "A. 여유심박수의 60~70% 구간이 지방 연소에 효율적이라고 알려져 있습니다. 대화가 가능한 정도의 강도입니다." },
        { q: "Q. 이 값이 정확한가요?", a: "A. 220−나이 공식은 통계적 추정치로 ±10~12bpm 오차가 있을 수 있습니다. 건강 이상이 있다면 전문가와 상담하세요." },
      ]}
      result={
        <LifeResult
          label="최대 심박수"
          value={data ? `${data.hrmax} bpm` : "-"}
          desc={fatZone ? `지방연소 목표 ${fatZone.low}~${fatZone.high} bpm` : undefined}
          note={
            data
              ? data.zones.map((z) => `${z.name} ${z.low}~${z.high}`).join(" · ")
              : "나이를 입력하면 구간별 목표 심박수가 표시됩니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="grid grid-cols-2 gap-4">
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
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">안정시 심박수 (bpm)</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="70"
            value={resting}
            onChange={(e) => setResting(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
