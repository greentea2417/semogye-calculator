"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult, { LifeChoice } from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { convertTemperature, type TempUnit } from "@/utils/temperatureCalc";

const UNIT_LABEL: Record<TempUnit, string> = { C: "섭씨 ℃", F: "화씨 ℉", K: "켈빈 K" };

export default function TemperaturePage() {
  const [unit, setUnit] = useState<TempUnit>("C");
  const [value, setValue] = useState("");

  const valueNum = parseFloat(value);

  const result = useMemo(() => {
    if (Number.isNaN(valueNum)) return null;
    return convertTemperature(valueNum, unit);
  }, [valueNum, unit]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "온도 변환 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const invalid = !Number.isNaN(valueNum) && result === null;

  return (
    <CalculatorLayout
      tone="life"
      title="온도 변환 계산기"
      subtitle="섭씨·화씨·켈빈을 서로 변환해 드려요."
      intro="기준 단위를 고르고 값을 입력하면 섭씨(℃)·화씨(℉)·켈빈(K)으로 한 번에 변환합니다. 절대영도(−273.15℃) 미만은 물리적으로 불가능해 계산하지 않습니다."
      faqTitle="온도 변환 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 섭씨를 화씨로 어떻게 바꾸나요?", a: "A. ℉ = ℃ × 9/5 + 32 입니다. 예를 들어 36.5℃는 97.7℉ 입니다." },
        { q: "Q. 화씨를 섭씨로는요?", a: "A. ℃ = (℉ − 32) × 5/9 입니다. 예를 들어 98.6℉는 37℃ 입니다." },
        { q: "Q. 켈빈은 어떻게 계산하나요?", a: "A. K = ℃ + 273.15 입니다. 0K이 절대영도(−273.15℃)입니다." },
        { q: "Q. 소수점은 어떻게 처리하나요?", a: "A. 각 단위 모두 소수 둘째 자리까지 반올림해 표시합니다." },
      ]}
      result={
        <LifeResult
          label="변환 결과"
          value={result ? `${result.C}℃` : invalid ? "입력 오류" : "-"}
          desc={result ? `${result.F}℉ · ${result.K}K` : undefined}
          note={
            result
              ? "섭씨·화씨·켈빈으로 변환한 값입니다."
              : invalid
              ? "절대영도(−273.15℃) 미만은 변환할 수 없습니다."
              : "기준 단위를 고르고 값을 입력하면 결과가 표시됩니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">기준 단위</span>
          <div className="grid grid-cols-3 gap-2">
            <LifeChoice active={unit === "C"} onClick={() => setUnit("C")}>섭씨 ℃</LifeChoice>
            <LifeChoice active={unit === "F"} onClick={() => setUnit("F")}>화씨 ℉</LifeChoice>
            <LifeChoice active={unit === "K"} onClick={() => setUnit("K")}>켈빈 K</LifeChoice>
          </div>
        </div>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{UNIT_LABEL[unit]} 값</span>
          <input type="number" inputMode="decimal" placeholder="0" value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
      </div>
    </CalculatorLayout>
  );
}
