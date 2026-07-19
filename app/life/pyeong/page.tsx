"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult, { LifeChoice } from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

// 1평 = 400/121 ㎡ ≈ 3.3057851239 ㎡ (지적법상 정의)
const SQM_PER_PYEONG = 400 / 121;

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

type Mode = "sqmToPyeong" | "pyeongToSqm";

export default function PyeongPage() {
  const [mode, setMode] = useState<Mode>("sqmToPyeong");
  const [valueRaw, setValueRaw] = useState("84");

  const result = useMemo(() => {
    const input = parseNumber(valueRaw);
    if (mode === "sqmToPyeong") {
      const pyeong = input / SQM_PER_PYEONG;
      return { input, output: pyeong, unit: "평", fromUnit: "㎡" };
    }
    const sqm = input * SQM_PER_PYEONG;
    return { input, output: sqm, unit: "㎡", fromUnit: "평" };
  }, [mode, valueRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "평 ↔ ㎡ 변환 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="평 ↔ ㎡ 변환 계산기"
      subtitle="제곱미터와 평을 서로 빠르게 변환합니다."
      intro="부동산 면적 단위인 평과 제곱미터(㎡)를 양방향으로 변환합니다. 1평은 약 3.3058㎡입니다."
      faqTitle="평 ↔ ㎡ 변환 자주 묻는 질문"
      faqItems={[
        { q: "Q. 1평은 몇 ㎡인가요?", a: "A. 1평은 정확히 400/121㎡로, 약 3.3058㎡입니다. 반대로 1㎡는 약 0.3025평입니다." },
        { q: "Q. 84㎡는 몇 평인가요?", a: "A. 84 ÷ 3.3058 ≈ 25.41평입니다. 흔히 '국민주택 84㎡ = 약 34평형'이라 부르지만, 34평형은 공급면적(발코니·공용 포함) 기준이고 전용 84㎡는 약 25평입니다." },
        { q: "Q. 전용면적과 공급면적은 무엇이 다른가요?", a: "A. 전용면적은 실제 사용하는 집 내부 면적이고, 공급면적은 전용면적에 계단·복도 등 주거공용면적을 더한 값입니다. 분양 '평형'은 보통 공급면적 기준입니다." },
        { q: "Q. 계산 결과를 그대로 신뢰해도 되나요?", a: "A. 단위 환산은 정확합니다. 다만 실제 등기·분양 면적은 소수점 처리 방식이 다를 수 있어 참고용으로 활용하세요." },
      ]}
      result={
        <LifeResult
          label={mode === "sqmToPyeong" ? "환산 면적 (평)" : "환산 면적 (㎡)"}
          value={`${formatNumber(result.output)} ${result.unit}`}
          status={`${formatNumber(result.input)} ${result.fromUnit} 기준`}
          desc={mode === "sqmToPyeong" ? "㎡ ÷ 3.3058 = 평" : "평 × 3.3058 = ㎡"}
          note="1평 = 400/121㎡ ≈ 3.3058㎡ 기준의 단위 환산입니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <LifeChoice active={mode === "sqmToPyeong"} onClick={() => setMode("sqmToPyeong")}>
          ㎡ → 평
        </LifeChoice>
        <LifeChoice active={mode === "pyeongToSqm"} onClick={() => setMode("pyeongToSqm")}>
          평 → ㎡
        </LifeChoice>
      </div>
      <label className="mt-4 block space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
          {mode === "sqmToPyeong" ? "면적 (㎡)" : "면적 (평)"}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={valueRaw}
          onChange={(e) => setValueRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder={mode === "sqmToPyeong" ? "예: 84" : "예: 25"}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
