"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

// 카르보넨(Karvonen) 공식: 목표심박수 = (여유심박수 × 운동강도) + 안정시심박수
// 여유심박수(HRR) = 최대심박수(220 - 나이) - 안정시심박수
function karvonen(maxHr: number, resting: number, intensity: number) {
  return Math.round((maxHr - resting) * intensity + resting);
}

export default function HeartRatePage() {
  const [ageRaw, setAgeRaw] = useState("30");
  const [restingRaw, setRestingRaw] = useState("70");
  const [intensityRaw, setIntensityRaw] = useState("70");

  const result = useMemo(() => {
    const age = Math.max(1, Math.min(120, parseNumber(ageRaw)));
    const resting = Math.max(30, Math.min(150, parseNumber(restingRaw) || 0));
    const intensity = Math.max(0, Math.min(100, parseNumber(intensityRaw) || 0)) / 100;
    const maxHr = 220 - age;
    const target = karvonen(maxHr, resting, intensity);
    // 유산소 권장 구간 50~85%
    const zoneLow = karvonen(maxHr, resting, 0.5);
    const zoneHigh = karvonen(maxHr, resting, 0.85);
    return { age, resting, intensityPct: Math.round(intensity * 100), maxHr, target, zoneLow, zoneHigh };
  }, [ageRaw, restingRaw, intensityRaw]);

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
      subtitle="나이와 안정시 심박수로 운동 강도별 목표 심박수를 계산합니다."
      intro="카르보넨(Karvonen) 공식을 사용해 운동 강도에 맞는 목표 심박수(bpm)와 권장 유산소 구간을 알려줍니다."
      faqTitle="목표 심박수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 최대심박수는 220 - 나이로 구하고, 여유심박수(최대심박수 - 안정시심박수)에 운동강도를 곱한 뒤 안정시심박수를 더합니다. 이를 카르보넨 공식이라고 합니다." },
        { q: "Q. 안정시 심박수는 어떻게 재나요?", a: "A. 아침에 일어나 편히 누운 상태에서 1분간 맥박을 세면 됩니다. 보통 성인은 분당 60~80회 정도입니다." },
        { q: "Q. 운동 강도는 몇 %가 좋나요?", a: "A. 체지방 연소는 50~70%, 심폐지구력 향상은 70~85%가 흔히 권장됩니다. 무리하지 말고 본인 체력에 맞춰 조절하세요." },
        { q: "Q. 220-나이 공식이 정확한가요?", a: "A. 최대심박수를 간단히 추정하는 대표 공식이지만 개인차가 큽니다. 정확한 값은 운동부하검사로 측정하며, 이 계산기는 참고용입니다." },
      ]}
      result={
        <LifeResult
          label={`목표 심박수 (강도 ${result.intensityPct}%)`}
          value={`${result.target} bpm`}
          status={`권장 유산소 구간 ${result.zoneLow}~${result.zoneHigh} bpm`}
          desc={`최대 심박수 ${result.maxHr} bpm · 안정시 ${result.resting} bpm 기준`}
          note="220-나이 기반 추정치입니다. 개인차가 있으니 운동 시 몸 상태를 우선하세요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="grid grid-cols-3 gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">나이 (세)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={ageRaw}
            onChange={(e) => setAgeRaw(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">안정시 심박 (bpm)</span>
          <input
            type="number"
            inputMode="numeric"
            min={30}
            max={150}
            value={restingRaw}
            onChange={(e) => setRestingRaw(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">운동 강도 (%)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={intensityRaw}
            onChange={(e) => setIntensityRaw(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
