"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcBloodPressure } from "@/utils/bloodPressureCalc";

const LEVEL_CLASS = [
  "text-emerald-600", // 정상혈압
  "text-lime-600", // 주의혈압
  "text-amber-600", // 고혈압 전단계
  "text-orange-600", // 1기 고혈압
  "text-red-600", // 2기 고혈압
];

export default function BloodPressurePage() {
  const [sbp, setSbp] = useState("");
  const [dbp, setDbp] = useState("");

  const sbpNum = parseFloat(sbp);
  const dbpNum = parseFloat(dbp);

  const result = useMemo(() => {
    if (Number.isNaN(sbpNum) || Number.isNaN(dbpNum)) return null;
    return calcBloodPressure(sbpNum, dbpNum);
  }, [sbpNum, dbpNum]);

  const invalid = !Number.isNaN(sbpNum) && !Number.isNaN(dbpNum) && result === null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "혈압 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="혈압 계산기"
      subtitle="수축기·이완기 혈압을 넣으면 혈압 단계를 분류해 드려요."
      intro="대한고혈압학회(2018) 기준으로 수축기(최고)·이완기(최저) 혈압을 정상~2기 고혈압으로 분류하고, 맥압과 평균동맥압(MAP)도 함께 계산합니다. 두 값의 단계가 다르면 더 높은 단계를 채택합니다."
      faqTitle="혈압 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 혈압 단계는 어떻게 나뉘나요?", a: "A. 정상(120/80 미만), 주의(120~129/80 미만), 고혈압 전단계(130~139 또는 80~89), 1기 고혈압(140~159 또는 90~99), 2기 고혈압(160/100 이상)입니다." },
        { q: "Q. 수축기와 이완기 단계가 다르면요?", a: "A. 둘 중 더 높은 단계로 분류합니다. 예를 들어 135/95라면 이완기 기준 1기 고혈압으로 봅니다." },
        { q: "Q. 맥압과 평균동맥압이 뭔가요?", a: "A. 맥압 = 수축기 − 이완기이고, 평균동맥압(MAP) = 이완기 + (수축기 − 이완기) ÷ 3입니다." },
        { q: "Q. 이 결과로 진단할 수 있나요?", a: "A. 아니요. 1회 측정값 기준 참고용 분류입니다. 정확한 진단은 여러 번 측정 후 의료진 상담이 필요합니다." },
      ]}
      result={
        <LifeResult
          label="혈압 분류"
          value={result ? result.category : invalid ? "입력 오류" : "-"}
          statusClass={result ? LEVEL_CLASS[result.level] : "text-emerald-600"}
          status={result ? `맥압 ${result.pulsePressure} · MAP ${result.map}` : undefined}
          note={
            result
              ? "대한고혈압학회 2018 기준 분류입니다. 참고용으로만 활용하세요."
              : invalid
              ? "수축기 혈압은 이완기 혈압보다 커야 하며, 두 값 모두 0보다 커야 합니다."
              : "수축기·이완기 혈압을 입력하면 단계가 표시됩니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">수축기 혈압 (최고, mmHg)</span>
          <input type="number" inputMode="numeric" placeholder="예: 120" value={sbp} onChange={(e) => setSbp(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">이완기 혈압 (최저, mmHg)</span>
          <input type="number" inputMode="numeric" placeholder="예: 80" value={dbp} onChange={(e) => setDbp(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
      </div>
    </CalculatorLayout>
  );
}
