"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcCalorie, MET_PRESETS } from "../../utils/calorieCalc";

export default function CaloriePage() {
  const [presetIdx, setPresetIdx] = useState(2); // 기본: 조깅
  const [weight, setWeight] = useState("");
  const [minutes, setMinutes] = useState("30");

  const met = MET_PRESETS[presetIdx].met;
  const result = calcCalorie(met, parseFloat(weight), parseFloat(minutes));

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "운동 칼로리 소모 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="운동 칼로리 소모 계산기"
      subtitle="운동 종류와 체중, 시간으로 소모 칼로리를 계산해요."
      intro="MET 방식으로 대표 운동별 예상 소모 칼로리와 지방 소모량을 확인해 보세요."
      faqTitle="운동 칼로리 소모 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 소모 칼로리는 어떻게 계산하나요?", a: "A. 소모 칼로리(kcal) = MET × 체중(kg) × 운동 시간(시간)입니다. 조깅(MET 7)을 60kg인 사람이 30분 하면 7 × 60 × 0.5 = 210kcal입니다." },
        { q: "Q. MET가 무엇인가요?", a: "A. MET는 안정 시 대비 운동 강도를 나타내는 단위로, 걷기 3.5·조깅 7·달리기 9.8처럼 운동마다 정해진 값을 씁니다." },
        { q: "Q. 지방 소모량은 어떻게 나오나요?", a: "A. 지방 1g은 약 7.7kcal이므로 소모 칼로리 ÷ 7.7 로 참고용 지방량을 환산합니다. 실제 체지방 감소와는 차이가 있습니다." },
        { q: "Q. 결과가 실제와 다를 수 있나요?", a: "A. 네. 나이·근육량·운동 강도·개인차에 따라 달라지므로 참고용으로만 활용하세요." },
      ]}
      result={
        <LifeResult
          label="예상 소모 칼로리"
          value={result ? `${Math.round(result.calories).toLocaleString()} kcal` : "-"}
          status={result ? `지방 약 ${result.fatGrams.toFixed(1)} g` : undefined}
          desc={result ? `${MET_PRESETS[presetIdx].label} · ${minutes}분 기준` : undefined}
          note="MET 값은 성인 평균 근사치이며 개인차가 있어 참고용입니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">운동 종류</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MET_PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresetIdx(i)}
                className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                  i === presetIdx
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">체중 (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="60"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">운동 시간 (분)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="30"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
