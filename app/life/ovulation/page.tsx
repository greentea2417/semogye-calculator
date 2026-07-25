"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcOvulation } from "@/utils/ovulationCalc";

export default function OvulationPage() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycle, setCycle] = useState("");

  const cycleNum = cycle === "" ? 28 : parseInt(cycle, 10);

  const result = useMemo(() => {
    if (!lastPeriod) return null;
    if (!(cycleNum >= 21 && cycleNum <= 40)) return null;
    return calcOvulation(lastPeriod, cycleNum);
  }, [lastPeriod, cycleNum]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "배란일·가임기 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="배란일·가임기 계산기"
      subtitle="마지막 생리 시작일과 주기만 넣으면 배란일과 가임기를 알려드려요."
      intro="마지막 생리 시작일과 평균 생리주기로 다음 생리 예정일·배란일·가임기를 계산합니다."
      faqTitle="배란일 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 다음 생리 예정일 = 마지막 생리 시작일 + 주기이고, 배란일 = 다음 생리 예정일 − 14일입니다. 가임기는 배란일 5일 전부터 1일 후까지로 봅니다." },
        { q: "Q. 생리주기를 모르면요?", a: "A. 비워두면 평균값인 28일로 계산합니다. 주기는 보통 21~40일 사이입니다." },
        { q: "Q. 정확한가요?", a: "A. 배란일 −14일 가정에 기반한 추정치입니다. 주기가 불규칙하면 오차가 커질 수 있어 참고용으로 활용하세요." },
        { q: "Q. 가임기가 무엇인가요?", a: "A. 임신 가능성이 높은 기간으로, 정자 생존 기간과 난자 수명을 고려해 배란일 전후로 잡습니다." },
      ]}
      result={
        <LifeResult
          label="배란 예정일"
          value={result ? result.ovulation : "-"}
          status={result ? `가임기 ${result.fertileStart} ~ ${result.fertileEnd}` : undefined}
          statusClass="text-emerald-600"
          desc={result ? `다음 생리 예정일 ${result.nextPeriod}` : undefined}
          note={result ? "배란일 −14일 가정에 기반한 추정치입니다." : "마지막 생리 시작일을 입력하면 배란일이 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">마지막 생리 시작일</span>
          <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">평균 생리주기 (일, 기본 28)</span>
          <input type="number" inputMode="numeric" placeholder="28" value={cycle} onChange={(e) => setCycle(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
      </div>
    </CalculatorLayout>
  );
}
