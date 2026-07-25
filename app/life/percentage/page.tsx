"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult, { LifeChoice } from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { percentChange, percentOf, percentRatio, type PercentMode } from "@/utils/percentageCalc";

const LABELS: Record<PercentMode, { a: string; b: string; title: string }> = {
  of: { a: "전체 값", b: "퍼센트 (%)", title: "전체의 몇 %" },
  ratio: { a: "부분 값", b: "전체 값", title: "비율 (%)" },
  change: { a: "처음 값", b: "나중 값", title: "증감률 (%)" },
};

export default function PercentagePage() {
  const [mode, setMode] = useState<PercentMode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const aNum = parseFloat(a);
  const bNum = parseFloat(b);

  const result = useMemo(() => {
    if (Number.isNaN(aNum) || Number.isNaN(bNum)) return null;
    if (mode === "of") return { value: percentOf(aNum, bNum), suffix: "" };
    if (mode === "ratio") {
      const v = percentRatio(aNum, bNum);
      return v === null ? null : { value: v, suffix: "%" };
    }
    const v = percentChange(aNum, bNum);
    return v === null ? null : { value: v, suffix: "%" };
  }, [mode, aNum, bNum]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "퍼센트 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const L = LABELS[mode];

  return (
    <CalculatorLayout
      tone="life"
      title="퍼센트 계산기"
      subtitle="퍼센트 값, 비율, 증감률을 한 번에 계산해요."
      intro="세 가지 모드로 퍼센트를 계산합니다. '전체의 몇 %'는 값을, '비율'은 부분이 전체에서 차지하는 %를, '증감률'은 값의 변화율(%)을 구합니다."
      faqTitle="퍼센트 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 전체의 몇 %는 어떻게 계산하나요?", a: "A. 전체 값 × 퍼센트 ÷ 100 입니다. 예를 들어 200의 15%는 200 × 15 ÷ 100 = 30 입니다." },
        { q: "Q. 비율(%)은 어떻게 구하나요?", a: "A. 부분 값 ÷ 전체 값 × 100 입니다. 예를 들어 50은 200의 25% 입니다." },
        { q: "Q. 증감률은요?", a: "A. (나중 값 − 처음 값) ÷ 처음 값 × 100 입니다. 100에서 150으로 늘면 +50%, 200에서 150으로 줄면 −25% 입니다." },
        { q: "Q. 결과 소수점은 어떻게 처리하나요?", a: "A. 소수 둘째 자리까지 반올림해 표시합니다." },
      ]}
      result={
        <LifeResult
          label={L.title}
          value={result ? `${result.value}${result.suffix}` : "-"}
          note={result ? "소수 둘째 자리까지 반올림한 값입니다." : "모드를 고르고 값을 입력하면 결과가 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">계산 모드</span>
          <div className="grid grid-cols-3 gap-2">
            <LifeChoice active={mode === "of"} onClick={() => setMode("of")}>전체의 %</LifeChoice>
            <LifeChoice active={mode === "ratio"} onClick={() => setMode("ratio")}>비율</LifeChoice>
            <LifeChoice active={mode === "change"} onClick={() => setMode("change")}>증감률</LifeChoice>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{L.a}</span>
            <input type="number" inputMode="decimal" placeholder="0" value={a} onChange={(e) => setA(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{L.b}</span>
            <input type="number" inputMode="decimal" placeholder="0" value={b} onChange={(e) => setB(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
