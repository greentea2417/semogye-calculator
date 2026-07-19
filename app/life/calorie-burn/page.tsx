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

const METS: Record<string, number> = {
  walking: 3.5,
  running: 8.3,
  cycling: 6.8,
};

export default function CalorieBurnPage() {
  const [weightRaw, setWeightRaw] = useState("70");
  const [minutesRaw, setMinutesRaw] = useState("30");
  const [activity, setActivity] = useState<keyof typeof METS>("walking");

  const result = useMemo(() => {
    const weight = Math.max(1, Math.min(300, parseNumber(weightRaw)));
    const minutes = Math.max(0, Math.min(600, parseNumber(minutesRaw)));
    const met = METS[activity];
    const calories = Math.round(((met * 3.5 * weight) / 200) * minutes);
    return { weight, minutes, met, calories };
  }, [weightRaw, minutesRaw, activity]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "칼로리 소모 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const activityLabel = activity === "walking" ? "걷기" : activity === "running" ? "달리기" : "자전거";

  return (
    <CalculatorLayout tone="life" title="칼로리 소모 계산기" subtitle="체중과 운동 시간으로 소모 칼로리를 추정합니다." intro="MET 값을 이용한 간단 추정식입니다. 운동 종류와 강도에 따라 실제 소모 칼로리는 달라질 수 있습니다." faqTitle="칼로리 소모 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 어떻게 계산하나요?", a: "A. 소모 칼로리 ≈ MET × 3.5 × 체중(kg) ÷ 200 × 운동시간(분) 공식을 사용합니다." }, { q: "Q. MET가 뭔가요?", a: "A. 운동 강도를 수치화한 값입니다. 같은 시간이라도 MET가 높을수록 칼로리 소모가 커집니다." }, { q: "Q. 정확한 값인가요?", a: "A. 개인의 체력, 운동 강도, 휴식 여부에 따라 달라지는 추정치입니다. 참고용으로 사용하세요." }, { q: "Q. 어떤 운동을 지원하나요?", a: "A. 걷기, 달리기, 자전거를 기본으로 넣었습니다. 필요하면 MET 값을 바꿔 다른 운동도 계산할 수 있습니다." }]} result={<LifeResult label={`${activityLabel} 소모 칼로리`} value={`${result.calories} kcal`} status={`${result.weight}kg · ${result.minutes}분 · MET ${result.met}`} desc="MET 기반 추정치" note="체중과 시간에 따른 단순 추정입니다." />} guide={<BottomActions onShare={onShare} />}>
      <div className="grid grid-cols-3 gap-3">
        {([
          ["walking", "걷기"],
          ["running", "달리기"],
          ["cycling", "자전거"],
        ] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActivity(key)} className={`rounded-2xl border px-3 py-3 text-sm font-bold ${activity === key ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-600"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">체중 (kg)</span><input type="number" min={1} max={300} value={weightRaw} onChange={(e) => setWeightRaw(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label>
        <label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">시간 (분)</span><input type="number" min={0} max={600} value={minutesRaw} onChange={(e) => setMinutesRaw(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label>
      </div>
    </CalculatorLayout>
  );
}
