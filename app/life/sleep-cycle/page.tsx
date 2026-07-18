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

export default function SleepCyclePage() {
  const [bedtimeRaw, setBedtimeRaw] = useState("23");
  const [cyclesRaw, setCyclesRaw] = useState("5");

  const result = useMemo(() => {
    const bedtime = parseNumber(bedtimeRaw);
    const cycles = Math.max(1, Math.min(7, Math.round(parseNumber(cyclesRaw) || 0)));
    const sleepMinutes = cycles * 90;
    const wakeMinutes = bedtime * 60 + sleepMinutes;
    const wakeHours = ((Math.floor(wakeMinutes / 60) % 24) + 24) % 24;
    const wakeMins = ((wakeMinutes % 60) + 60) % 60;
    return { bedtime, cycles, sleepMinutes, wakeHours, wakeMins };
  }, [bedtimeRaw, cyclesRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "수면 사이클 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="수면 사이클 계산기"
      subtitle="잠드는 시간을 넣으면 수면 사이클에 맞는 기상 시간을 알려줍니다."
      intro="수면 1사이클을 약 90분으로 보고, 1~7사이클 범위의 기상 시간을 계산합니다."
      faqTitle="수면 사이클 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 왜 90분 단위로 계산하나요?", a: "A. 사람의 수면은 대체로 렘·비렘 주기를 반복하며, 한 주기를 약 90분으로 잡아 계산하는 경우가 많습니다." },
        { q: "Q. 몇 사이클이 좋나요?", a: "A. 보통 성인은 4~6사이클(약 6~9시간)을 권장합니다. 개인차가 있으니 가장 개운한 시간을 찾아보세요." },
        { q: "Q. 실제로 바로 잠든다고 가정하나요?", a: "A. 네. 이 계산기는 잠드는 시간을 기준으로 단순 계산합니다. 실제로는 잠드는 데 걸리는 시간이 있으므로 약간의 여유를 두는 것이 좋습니다." },
        { q: "Q. 낮잠도 적용되나요?", a: "A. 가능합니다. 짧은 낮잠은 1사이클보다 짧게 잡아도 되지만, 이 계산기는 정수 사이클 기준의 기상 시간만 제공합니다." },
      ]}
      result={
        <LifeResult
          label="추천 기상 시간"
          value={`${String(result.wakeHours).padStart(2, "0")}:${String(result.wakeMins).padStart(2, "0")}`}
          status={`${result.cycles}사이클 · 약 ${result.sleepMinutes}분 수면`}
          desc="잠드는 시각을 기준으로 90분 단위로 더한 값이에요."
          note="수면 주기는 개인차가 있어 참고용으로만 활용하세요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">취침 시각 (시)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={23}
            value={bedtimeRaw}
            onChange={(e) => setBedtimeRaw(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">수면 사이클 수</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={7}
            value={cyclesRaw}
            onChange={(e) => setCyclesRaw(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
