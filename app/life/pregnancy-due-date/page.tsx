"use client";

import { useEffect, useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcPregnancy } from "@/utils/pregnancyCalc";

function localTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PregnancyDueDatePage() {
  const [lmp, setLmp] = useState("");
  const [today, setToday] = useState("");
  const [cycle, setCycle] = useState("");

  // 하이드레이션 불일치 방지: 마운트 이후에 오늘 날짜 채움
  useEffect(() => {
    setToday(localTodayIso());
  }, []);

  const cycleNum = cycle === "" ? 28 : parseInt(cycle, 10);

  const result = useMemo(() => {
    if (!lmp || !today) return null;
    return calcPregnancy(lmp, today, cycleNum);
  }, [lmp, today, cycleNum]);

  const invalid = !!lmp && !!today && result === null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "출산예정일 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="출산예정일 계산기"
      subtitle="마지막 생리 시작일만 넣으면 출산예정일과 임신 주수를 알려드려요."
      intro="네겔레 법칙(Naegele's rule)으로 마지막 생리 시작일에 280일을 더해 출산예정일을 계산하고, 오늘 기준 임신 주수와 삼분기, 남은 날짜(D-day)를 함께 보여드립니다."
      faqTitle="출산예정일 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 출산예정일 = 마지막 생리 시작일 + 280일(40주)입니다. 생리주기가 28일이 아니면 (주기 − 28)일만큼 보정합니다." },
        { q: "Q. 임신 주수는 어떻게 세나요?", a: "A. 마지막 생리 시작일부터 오늘까지 지난 날짜를 7로 나눠 '몇 주 며칠'로 표시합니다. 이를 임신 주수(재태연령)라고 합니다." },
        { q: "Q. 삼분기(트라이메스터)가 뭔가요?", a: "A. 임신 기간을 셋으로 나눈 것으로, 1기는 0~13주, 2기는 14~27주, 3기는 28주 이후입니다." },
        { q: "Q. 정확한가요?", a: "A. 28일 주기를 가정한 추정치입니다. 실제 분만일은 예정일 전후 2주 이내에서 달라질 수 있어 참고용으로 활용하세요." },
      ]}
      result={
        <LifeResult
          label="출산예정일"
          value={result ? result.dueDate : invalid ? "입력 오류" : "-"}
          status={result ? `임신 ${result.weeks}주 ${result.days}일 · ${result.trimester}기` : undefined}
          statusClass="text-emerald-600"
          desc={result ? (result.dday >= 0 ? `출산예정일까지 D-${result.dday}` : `예정일 ${-result.dday}일 지남`) : undefined}
          note={
            result
              ? "네겔레 법칙(마지막 생리일 +280일) 기반 추정치입니다."
              : invalid
              ? "날짜와 생리주기(20~45일)를 확인해 주세요. 마지막 생리일은 오늘 이전이어야 합니다."
              : "마지막 생리 시작일을 입력하면 출산예정일이 표시됩니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">마지막 생리 시작일</span>
          <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">기준일 (오늘)</span>
          <input type="date" value={today} onChange={(e) => setToday(e.target.value)}
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
