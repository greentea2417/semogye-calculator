"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

export default function ScreenTimePage() {
  const [minutesRaw, setMinutesRaw] = useState("30");
  const [daysRaw, setDaysRaw] = useState("30");

  const result = useMemo(() => {
    const minutes = Math.max(0, Math.min(1440, parseNumber(minutesRaw)));
    const days = Math.max(1, Math.min(365, parseNumber(daysRaw)));
    const hoursPerDay = minutes / 60;
    const weekly = hoursPerDay * 7;
    const monthly = hoursPerDay * days;
    return { minutes, days, hoursPerDay, weekly, monthly };
  }, [minutesRaw, daysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "스크린타임 절감 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout tone="life" title="스크린타임 절감 계산기" subtitle="하루에 아낀 시간을 주간·월간 단위로 환산합니다." intro="하루 몇 분을 절약할지 입력하면, 일주일과 한 달 기준으로 얼마나 많은 시간이 생기는지 바로 확인할 수 있습니다." faqTitle="스크린타임 절감 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 무엇을 계산하나요?", a: "A. 하루 절약 시간(분)을 기준으로 주간·월간 누적 시간을 계산합니다." }, { q: "Q. 한 달 기준은 어떻게 잡나요?", a: "A. 기본값은 30일이며, 필요하면 원하는 일수를 입력할 수 있습니다." }, { q: "Q. 분 단위가 아닌 시간으로 보고 싶어요.", a: "A. 결과는 시간 단위로 표시됩니다. 분 입력을 시간으로 나눠 확인하세요." }, { q: "Q. 0분도 입력 가능한가요?", a: "A. 네. 0분이면 누적 시간도 0으로 표시됩니다." }]} result={<LifeResult label="하루 절약 시간" value={`${result.hoursPerDay.toFixed(2)} 시간`} status={`주 ${result.weekly.toFixed(2)}시간 · 월 ${result.monthly.toFixed(2)}시간`} desc={`${result.minutes}분/일 기준`} note="절약한 시간을 공부, 운동, 휴식에 활용해 보세요." />} guide={<BottomActions onShare={onShare} />}>
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">절약 시간 (분/일)</span><input type="number" min={0} max={1440} value={minutesRaw} onChange={(e) => setMinutesRaw(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label>
        <label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">월 기준 일수</span><input type="number" min={1} max={365} value={daysRaw} onChange={(e) => setDaysRaw(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label>
      </div>
    </CalculatorLayout>
  );
}
