"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcDiscomfortIndex } from "@/utils/discomfortIndexCalc";

export default function DiscomfortIndexPage() {
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");

  const tempNum = temp === "" ? NaN : parseFloat(temp);
  const humidityNum = humidity === "" ? NaN : parseFloat(humidity);

  const result = useMemo(() => {
    if (Number.isNaN(tempNum) || Number.isNaN(humidityNum)) return null;
    if (humidityNum < 0 || humidityNum > 100) return null;
    return calcDiscomfortIndex(tempNum, humidityNum);
  }, [tempNum, humidityNum]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "불쾌지수 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="불쾌지수 계산기"
      subtitle="기온과 습도로 오늘의 불쾌지수를 알려드려요."
      intro="기상청 불쾌지수(THI) 공식으로 기온과 습도를 반영한 체감 불쾌 정도를 계산합니다."
      faqTitle="불쾌지수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 불쾌지수 = 0.81 × 기온 + 0.01 × 습도 × (0.99 × 기온 − 14.3) + 46.3 공식을 사용합니다. 기온은 섭씨, 습도는 상대습도(%)입니다." },
        { q: "Q. 단계 기준은요?", a: "A. 80 이상 매우 높음, 75~80 높음, 68~75 보통, 68 미만 낮음으로 구분합니다." },
        { q: "Q. 체감온도와 다른가요?", a: "A. 네. 불쾌지수는 여름철 습도까지 반영한 불쾌감 지표이고, 체감온도는 주로 바람·추위를 반영합니다." },
        { q: "Q. 겨울에도 쓸 수 있나요?", a: "A. 불쾌지수는 여름철 무더위 지표로 설계되어 기온이 낮은 겨울에는 의미가 크지 않습니다." },
      ]}
      result={
        <LifeResult
          label="불쾌지수 (THI)"
          value={result ? `${result.thi}` : "-"}
          status={result ? result.level : undefined}
          statusClass="text-emerald-600"
          desc={result ? result.desc : undefined}
          note={result ? "기상청 불쾌지수(THI) 공식 기준입니다." : "기온과 습도를 입력하면 불쾌지수가 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">기온 (°C)</span>
          <input type="number" inputMode="decimal" placeholder="30" value={temp} onChange={(e) => setTemp(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">상대습도 (%)</span>
          <input type="number" inputMode="decimal" placeholder="70" value={humidity} onChange={(e) => setHumidity(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
      </div>
    </CalculatorLayout>
  );
}
