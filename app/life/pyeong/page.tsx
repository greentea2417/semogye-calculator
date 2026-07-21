"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult, { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { pyeongToSqm, sqmToPyeong } from "../../utils/pyeongCalc";

type Mode = "pyeongToSqm" | "sqmToPyeong";

export default function PyeongPage() {
  const [mode, setMode] = useState<Mode>("pyeongToSqm");
  const [value, setValue] = useState("");

  const num = parseFloat(value);
  const converted = mode === "pyeongToSqm" ? pyeongToSqm(num) : sqmToPyeong(num);
  const outUnit = mode === "pyeongToSqm" ? "㎡" : "평";
  const inLabel = mode === "pyeongToSqm" ? "평" : "㎡";

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "평수 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="평수 계산기 (평 ↔ ㎡)"
      subtitle="평과 제곱미터(㎡)를 서로 변환해요. 부동산·인테리어에 바로 쓰세요."
      intro="1평은 약 3.3058㎡(정확히 400/121㎡)입니다. 방향을 골라 값을 넣으면 즉시 환산해 드려요."
      faqTitle="평수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 1평은 몇 ㎡인가요?", a: "A. 1평 = 400/121 ㎡ ≈ 3.3058㎡ 입니다. 반대로 1㎡ ≈ 0.3025평이에요." },
        { q: "Q. 국민평형 84㎡는 몇 평인가요?", a: "A. 84 ÷ 3.3058 ≈ 25.4평입니다. 흔히 말하는 '34평형'은 공급면적(발코니·공용 포함) 기준이라 전용 84㎡와 다릅니다." },
        { q: "Q. 전용면적과 공급면적이 뭔가요?", a: "A. 전용면적은 실제 사용하는 집 내부 넓이, 공급면적은 여기에 계단·복도 같은 주거공용면적을 더한 값입니다. 분양 평형은 보통 공급면적 기준입니다." },
        { q: "Q. 왜 1평이 정확히 3.3058㎡인가요?", a: "A. 1평은 사방 6자(약 1.818m)의 정사각형으로, 계산하면 400/121㎡가 됩니다. 흔히 3.3㎡로 간단히 쓰기도 합니다." },
      ]}
      result={
        <LifeResult
          label={mode === "pyeongToSqm" ? "제곱미터 (㎡)" : "평"}
          value={converted != null ? `${converted.toFixed(2)} ${outUnit}` : "-"}
          status={converted != null ? `1평 = 3.3058㎡ 기준` : undefined}
          desc={converted != null ? `${inLabel} → ${outUnit} 변환` : undefined}
          note="공급면적·전용면적 구분에 따라 체감 넓이가 달라질 수 있어요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <LifeChoice active={mode === "pyeongToSqm"} onClick={() => setMode("pyeongToSqm")}>
            평 → ㎡
          </LifeChoice>
          <LifeChoice active={mode === "sqmToPyeong"} onClick={() => setMode("sqmToPyeong")}>
            ㎡ → 평
          </LifeChoice>
        </div>
        <label className="block space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
            {inLabel} 입력
          </span>
          <input
            type="number"
            inputMode="decimal"
            placeholder={mode === "pyeongToSqm" ? "34" : "84"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
