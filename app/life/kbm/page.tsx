"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function getStatus(kbm: number) {
  if (kbm <= -10) return { label: "마름", desc: "연예인급 체형이에요.", color: "text-sky-600" };
  if (kbm <= -5) return { label: "슬림", desc: "가볍고 날씬한 구간입니다.", color: "text-emerald-600" };
  if (kbm <= 0) return { label: "보통", desc: "건강한 표준 라인이에요.", color: "text-emerald-600" };
  if (kbm <= 5) return { label: "통통", desc: "귀여운 단계입니다.", color: "text-amber-500" };
  return { label: "과체중", desc: "관리가 필요한 구간이에요.", color: "text-red-500" };
}

export default function KbmPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const h = Number(height);
  const w = Number(weight);
  const valid = h > 0 && w > 0;
  const kbm = valid ? Number((w - (h - 100)).toFixed(1)) : null;
  const status = kbm !== null ? getStatus(kbm) : null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "키빼몸 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="키빼몸 계산기"
      subtitle="키에서 몸무게를 뺀 간단한 체형 지표를 확인해보세요."
      intro="몸무게 − (키 − 100) 공식을 사용하는 직관적인 체형 비교 지표입니다."
      faqTitle="키빼몸 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 키빼몸은 어떻게 계산하나요?", a: "A. 몸무게 − (키 − 100)으로 계산합니다. 키 165cm·몸무게 55kg이면 55 − 65 = −10입니다." },
        { q: "Q. 기준표는 어떻게 되나요?", a: "A. −10 이하는 마름, −10~−5는 슬림, −5~0은 보통, 0~5는 통통, 5 이상은 과체중으로 봅니다." },
        { q: "Q. BMI와 무엇이 다른가요?", a: "A. BMI는 국제 표준 의학 지표이고, 키빼몸은 계산이 쉬워 감각적으로 비교할 때 쓰는 간이 지표입니다." },
        { q: "Q. 근육량이 많으면 어떻게 되나요?", a: "A. 실제보다 과체중으로 나올 수 있어 참고용으로만 활용하세요." },
      ]}
      result={
        <LifeResult
          label="키빼몸 지수"
          value={kbm !== null ? String(kbm) : "-"}
          status={status?.label}
          statusClass={status?.color}
          desc={status?.desc}
          note="체지방과 근육량을 구분하지 못하는 간이 지표입니다."
        />
      }
      guide={<BottomActions onShare={onShare} showPdf={false} />}
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">키 (cm)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="160"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">몸무게 (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="55"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
