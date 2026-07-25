"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult, { LifeChoice } from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcDogAge, type DogSize } from "@/utils/dogAgeCalc";

export default function DogAgePage() {
  const [size, setSize] = useState<DogSize>("small");
  const [age, setAge] = useState("");

  const ageNum = parseFloat(age);

  const result = useMemo(() => {
    if (!(ageNum > 0)) return null;
    return calcDogAge(ageNum, size);
  }, [ageNum, size]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "강아지 나이 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="강아지 나이 계산기"
      subtitle="우리 강아지 나이를 사람 나이로 환산해 드려요."
      intro="반려견의 나이와 체급(성견 체중 기준)을 넣으면 사람 나이로 환산합니다. 첫 1년은 15세, 2년은 24세, 이후에는 체급에 따라 매년 다르게 나이가 듭니다."
      faqTitle="강아지 나이 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 1년차는 사람 15세, 2년차는 24세로 보고, 2년이 지난 뒤부터는 매년 소형견 +4세, 중형견 +5세, 대형견 +6세를 더합니다." },
        { q: "Q. 체급은 어떻게 나누나요?", a: "A. 성견 기준 몸무게로 소형견 9kg 이하, 중형견 10~22kg, 대형견 23kg 이상으로 봅니다." },
        { q: "Q. 왜 대형견이 나이를 더 빨리 먹나요?", a: "A. 일반적으로 대형견이 소형견보다 노화가 빠르고 평균 수명이 짧아, 나이가 든 뒤 매년 더해지는 사람 나이가 큽니다." },
        { q: "Q. 개월 수는 어떻게 넣나요?", a: "A. 나이를 년 단위로 환산해 소수로 입력하세요. 예를 들어 6개월이면 0.5, 18개월이면 1.5 입니다." },
      ]}
      result={
        <LifeResult
          label="사람 나이 환산"
          value={result ? `${result.humanAge}세` : "-"}
          status={result ? result.stage : undefined}
          statusClass="text-emerald-600"
          note={result ? "널리 쓰이는 체급별 환산표 기반의 근사치입니다." : "강아지 나이와 체급을 입력하면 사람 나이가 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">체급 (성견 체중)</span>
          <div className="grid grid-cols-3 gap-2">
            <LifeChoice active={size === "small"} onClick={() => setSize("small")}>소형견</LifeChoice>
            <LifeChoice active={size === "medium"} onClick={() => setSize("medium")}>중형견</LifeChoice>
            <LifeChoice active={size === "large"} onClick={() => setSize("large")}>대형견</LifeChoice>
          </div>
        </div>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">강아지 나이 (년)</span>
          <input type="number" inputMode="decimal" placeholder="3" value={age} onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
      </div>
    </CalculatorLayout>
  );
}
