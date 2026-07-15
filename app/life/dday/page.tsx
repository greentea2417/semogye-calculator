"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DdayPage() {
  const [base, setBase] = useState(todayISO());
  const [target, setTarget] = useState("");

  const result = useMemo(() => {
    if (!base || !target) return null;
    const b = startOfDay(base);
    const t = startOfDay(target);
    if (Number.isNaN(b.getTime()) || Number.isNaN(t.getTime())) return null;

    const diff = Math.round((t.getTime() - b.getTime()) / 86400000);
    // 당일 포함 카운트(디데이 = 목표일까지 며칠)
    const label =
      diff === 0 ? "D-DAY" : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
    const weeks = Math.floor(Math.abs(diff) / 7);
    const remDays = Math.abs(diff) % 7;
    return { diff, label, weeks, remDays };
  }, [base, target]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "D-day 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const desc = result
    ? result.diff > 0
      ? `${result.weeks}주 ${result.remDays}일 남았어요`
      : result.diff < 0
      ? `${result.weeks}주 ${result.remDays}일 지났어요`
      : "바로 오늘이에요!"
    : undefined;

  return (
    <CalculatorLayout
      tone="life"
      title="D-day · 기념일 계산기"
      subtitle="기준일부터 목표 날짜까지 며칠 남았는지 계산해드려요."
      intro="시험일, 기념일, 전역일까지 남은 날짜를 D-day로 확인해보세요."
      faqTitle="D-day 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. D-day는 어떻게 계산하나요?", a: "A. 기준일부터 목표 날짜까지 남은 일수입니다. 목표일이 미래면 D-숫자, 이미 지났으면 D+숫자로 표시합니다." },
        { q: "Q. 기준일을 오늘이 아닌 날로 바꿀 수 있나요?", a: "A. 네. 기준일을 원하는 날짜로 바꾸면 그 날짜를 기준으로 남은 일수를 다시 계산합니다." },
        { q: "Q. 며칠째인지(카운트업)도 알 수 있나요?", a: "A. 목표 날짜가 이미 지난 경우 D+로 표시되어 며칠이 지났는지 확인할 수 있습니다." },
        { q: "Q. 오늘이 목표일이면 어떻게 표시되나요?", a: "A. 기준일과 목표일이 같으면 D-DAY로 표시됩니다." },
      ]}
      result={
        <LifeResult
          label="디데이"
          value={result ? result.label : "-"}
          desc={desc}
          note="날짜 차이는 자정(0시) 기준으로 계산한 참고값입니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <label className="block space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">기준일</span>
        <input
          type="date"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
        />
      </label>

      <label className="mt-5 block space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">목표 날짜</span>
        <input
          type="date"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
        />
      </label>
    </CalculatorLayout>
  );
}
