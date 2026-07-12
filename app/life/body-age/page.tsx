"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult, { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

const GROUPS = [
  { key: "sleep", label: "수면 시간", options: ["7시간 이상", "5-6시간", "5시간 미만"], penalty: [0, 2, 5] },
  { key: "exercise", label: "운동 주기", options: ["주 3회 이상", "주 1-2회", "거의 안 함"], penalty: [0, 2, 4] },
  { key: "diet", label: "식습관", options: ["건강식 위주", "가끔 야식/폭식", "가공식품 위주"], penalty: [0, 2, 5] },
] as const;

export default function BodyAgePage() {
  const [realAge, setRealAge] = useState("30");
  const [picked, setPicked] = useState<Record<string, number>>({ sleep: 0, exercise: 0, diet: 0 });

  const age = Number(realAge) || 0;
  const penalty = GROUPS.reduce((sum, g) => sum + g.penalty[picked[g.key] ?? 0], 0);
  const bodyAge = age > 0 ? age + penalty : 0;
  const improvement = penalty > 5 ? penalty - 2 : 0;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "신체 나이 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="신체 나이 계산기"
      subtitle="생활 습관으로 보는 내 몸의 나이를 확인해보세요."
      intro="수면·운동·식습관 세 가지 습관에 가중치를 적용한 참고용 지표입니다."
      faqTitle="신체 나이 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 신체 나이(생체 나이)란 무엇인가요?", a: "A. 실제 나이와 별개로 생활 습관과 신체 상태로 추정한 나이입니다. 습관을 바꾸면 낮아질 수 있습니다." },
        { q: "Q. 이 계산기는 무엇을 반영하나요?", a: "A. 수면 시간, 운동 주기, 식습관 세 가지를 기준으로 실제 나이에 가산점을 더해 추정합니다." },
        { q: "Q. 신체 나이를 낮추려면 어떻게 하나요?", a: "A. 하루 7시간 이상 수면, 주 3회 이상 운동, 가공식품 줄이기가 가장 효과가 큽니다." },
        { q: "Q. 의학적 진단으로 볼 수 있나요?", a: "A. 아니요. 설문 기반 추정치이며 유전·기저질환은 반영되지 않습니다. 정확한 상태는 건강검진으로 확인하세요." },
      ]}
      result={
        <LifeResult
          label="나의 신체 나이"
          value={bodyAge > 0 ? `${bodyAge}세` : "-"}
          status={penalty > 0 ? `실제보다 +${penalty}년` : "실제 나이와 동일"}
          statusClass={penalty > 0 ? "text-red-500" : "text-emerald-600"}
          desc={
            improvement > 0
              ? `습관을 교정하면 최대 ${improvement}년 더 젊어질 수 있어요.`
              : "지금 습관을 잘 유지하고 있어요."
          }
          note="설문 기반 추정치이며 의학적 진단을 대체하지 않습니다."
        />
      }
      guide={<BottomActions onShare={onShare} showPdf={false} />}
    >
      <label className="block space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">실제 나이</span>
        <input
          type="number"
          inputMode="numeric"
          value={realAge}
          onChange={(e) => setRealAge(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
        />
      </label>

      {GROUPS.map((g) => (
        <div key={g.key} className="mt-5 space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{g.label}</span>
          <div className="grid grid-cols-3 gap-2">
            {g.options.map((opt, i) => (
              <LifeChoice
                key={opt}
                active={(picked[g.key] ?? 0) === i}
                onClick={() => setPicked((prev) => ({ ...prev, [g.key]: i }))}
              >
                {opt}
              </LifeChoice>
            ))}
          </div>
        </div>
      ))}
    </CalculatorLayout>
  );
}
