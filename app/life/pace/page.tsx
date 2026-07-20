"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcPace, formatPace, toTotalSeconds } from "../../utils/paceCalc";

export default function PacePage() {
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const distanceNum = parseFloat(distance);
  const totalSeconds = toTotalSeconds(
    parseInt(hours, 10),
    parseInt(minutes, 10),
    parseInt(seconds, 10)
  );
  const result = calcPace(distanceNum, totalSeconds);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "러닝 페이스 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="러닝 페이스 계산기"
      subtitle="달린 거리와 시간으로 1km당 페이스와 평균 속도를 계산해요."
      intro="마라톤·조깅 기록을 넣으면 페이스(min/km)와 속도(km/h)를 함께 보여줍니다."
      faqTitle="러닝 페이스 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 페이스는 어떻게 계산하나요?", a: "A. 총 소요 시간(초)을 거리(km)로 나눈 값입니다. 10km를 50분에 달렸다면 3000초 ÷ 10 = 300초, 즉 5:00/km입니다." },
        { q: "Q. 평균 속도는 어떻게 나오나요?", a: "A. 거리(km)를 시간(h)으로 나눕니다. 10km를 50분(0.8333시간)에 달리면 12km/h입니다." },
        { q: "Q. 페이스가 낮을수록 빠른 건가요?", a: "A. 네. 페이스는 1km를 달리는 데 걸린 시간이라 값이 작을수록 더 빠르게 달린 것입니다." },
        { q: "Q. 하프·풀코스 완주 시간도 예측할 수 있나요?", a: "A. 목표 페이스에 거리(하프 21.0975km, 풀 42.195km)를 곱하면 대략적인 완주 시간을 가늠할 수 있습니다." },
      ]}
      result={
        <LifeResult
          label="Pace (min/km)"
          value={result ? formatPace(result.paceSecPerKm) : "-"}
          status={result ? `${result.speedKmh.toFixed(2)} km/h` : undefined}
          desc={result ? "1km당 소요 시간 · 평균 속도" : undefined}
          note="거리와 시간을 정확히 입력할수록 페이스가 정확해집니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">거리 (km)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="10"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">시</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">분</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="50"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">초</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
