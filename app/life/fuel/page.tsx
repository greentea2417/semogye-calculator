"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcFuel } from "../../utils/fuelCalc";

export default function FuelPage() {
  const [distance, setDistance] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [price, setPrice] = useState("1700");
  const [roundTrip, setRoundTrip] = useState(false);

  const result = calcFuel(
    parseFloat(distance),
    parseFloat(efficiency),
    parseFloat(price),
    roundTrip
  );

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연료비 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="연료비 계산기"
      subtitle="주행 거리와 연비, 유가로 필요한 기름값을 계산해요."
      intro="편도·왕복을 선택해 여행이나 출퇴근 연료비를 미리 가늠해 보세요."
      faqTitle="연료비 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 연료비는 어떻게 계산하나요?", a: "A. 필요 연료(L) = 거리 ÷ 연비, 연료비 = 필요 연료 × 유가입니다. 100km를 연비 10km/L·1,700원으로 달리면 10L × 1,700 = 17,000원입니다." },
        { q: "Q. 왕복 버튼은 무엇인가요?", a: "A. 왕복을 켜면 입력한 거리를 2배로 계산합니다. 편도 50km라면 왕복 100km 기준으로 연료비가 나옵니다." },
        { q: "Q. 연비는 어디서 확인하나요?", a: "A. 차량 계기판의 평균 연비나 제조사 공인 복합연비(km/L)를 입력하면 됩니다. 실제 주행 연비를 쓰면 더 정확합니다." },
        { q: "Q. 유가는 어떤 값을 넣나요?", a: "A. 주유하려는 유종(휘발유·경유 등)의 리터당 가격을 입력하세요. 기본값은 참고용이며 자유롭게 수정할 수 있습니다." },
      ]}
      result={
        <LifeResult
          label="예상 연료비"
          value={result ? `${Math.round(result.cost).toLocaleString()}원` : "-"}
          status={result ? `${result.liters.toFixed(2)} L` : undefined}
          desc={result ? (roundTrip ? "왕복 기준 필요 연료" : "편도 기준 필요 연료") : undefined}
          note="실제 주행 조건(속도·냉난방·정체)에 따라 연비가 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">주행 거리 (km)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="100"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">연비 (km/L)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="10"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">유가 (원/L)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="1700"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LifeChoice active={!roundTrip} onClick={() => setRoundTrip(false)}>편도</LifeChoice>
          <LifeChoice active={roundTrip} onClick={() => setRoundTrip(true)}>왕복</LifeChoice>
        </div>
      </div>
    </CalculatorLayout>
  );
}
