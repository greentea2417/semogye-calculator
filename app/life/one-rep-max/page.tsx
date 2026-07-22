"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcOneRepMax } from "../../utils/oneRepMaxCalc";

export default function OneRepMaxPage() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("5");

  const result = calcOneRepMax(parseFloat(weight), parseFloat(reps));

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "1RM 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="1RM(최대 반복 중량) 계산기"
      subtitle="운동 무게와 반복 횟수로 1회 최대 중량(1RM)을 추정해요."
      intro="Epley 공식으로 1RM을 추정하고, 반복 횟수별 목표 중량을 표로 확인해 보세요."
      faqTitle="1RM 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 1RM이 무엇인가요?", a: "A. 1RM(One-Rep Max)은 정확한 자세로 딱 1회 들 수 있는 최대 중량입니다. 근력 수준의 기준이 됩니다." },
        { q: "Q. 어떻게 계산하나요?", a: "A. Epley 공식으로 1RM = 무게 × (1 + 반복횟수 ÷ 30)입니다. 예를 들어 60kg로 5회 들면 60 × (1 + 5÷30) = 70kg입니다." },
        { q: "Q. 반복 횟수는 몇 회가 적당한가요?", a: "A. 추정 정확도는 보통 1~10회 구간에서 가장 좋습니다. 반복이 많아질수록 오차가 커지니 참고용으로 보세요." },
        { q: "Q. 표의 비율은 무엇인가요?", a: "A. 각 반복 횟수로 들 수 있는 추정 중량과 1RM 대비 비율입니다. 예: 5회는 약 1RM의 85.7% 무게로 수행합니다." },
      ]}
      result={
        <LifeResult
          label="추정 1RM"
          value={result ? `${result.oneRepMax.toFixed(1)} kg` : "-"}
          status={result ? `입력: ${weight}kg × ${reps}회` : undefined}
          desc={result ? "Epley 공식 기준" : undefined}
          note="추정값이며 부상 방지를 위해 실제 1RM 측정은 보조자와 함께 하세요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">무게 (kg)</span>
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
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">반복 횟수</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="5"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>

        {result && (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 text-left font-bold">반복</th>
                  <th className="px-3 py-2 text-right font-bold">추정 중량</th>
                  <th className="px-3 py-2 text-right font-bold">1RM 대비</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.reps} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-700">{row.reps}회</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">{row.weight.toFixed(1)} kg</td>
                    <td className="px-3 py-2 text-right text-gray-500">{(row.percent * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
