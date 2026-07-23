"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { bedtimesForWake, parseHHMM, wakesForBedtime, type SleepOption } from "@/utils/sleepCalc";

type Mode = "wake" | "bed";

export default function SleepPage() {
  const [mode, setMode] = useState<Mode>("wake");
  const [time, setTime] = useState("");

  const options = useMemo<SleepOption[] | null>(() => {
    const mins = parseHHMM(time);
    if (mins == null) return null;
    return mode === "wake" ? bedtimesForWake(mins) : wakesForBedtime(mins);
  }, [mode, time]);

  const best = options?.[0] ?? null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "수면 시간 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const label = mode === "wake" ? "추천 취침 시각" : "추천 기상 시각";

  return (
    <CalculatorLayout
      tone="life"
      title="수면 시간 계산기"
      subtitle="90분 수면 주기에 맞춰 개운하게 잘 수 있는 시각을 알려드려요."
      intro="사람의 잠은 약 90분 주기로 얕은 잠과 깊은 잠을 오갑니다. 주기가 끝나는 순간에 깨면 훨씬 개운합니다. 잠드는 데 걸리는 시간 15분도 함께 반영했어요."
      faqTitle="수면 시간 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 한 수면 주기를 90분으로 보고, 잠드는 데 걸리는 평균 15분을 더합니다. 기상 시각에서 (90분 × 주기수 + 15분)을 빼면 추천 취침 시각이 됩니다." },
        { q: "Q. 몇 주기를 자야 하나요?", a: "A. 보통 5~6주기(7시간 30분~9시간)를 권장합니다. 4주기(6시간)는 최소한으로 버틸 때 참고하세요." },
        { q: "Q. 15분은 왜 더하나요?", a: "A. 성인은 눕고 나서 잠들기까지 평균 10~20분이 걸립니다. 이 계산기는 15분을 기준으로 삼았습니다." },
        { q: "Q. 정확히 그 시각에 깨야 하나요?", a: "A. 수면 주기는 개인차가 있어 참고용입니다. 카페인·스트레스·수면 환경에 따라 달라질 수 있습니다." },
      ]}
      result={
        <LifeResult
          label={label}
          value={best ? best.time : "-"}
          desc={best ? `${best.cycles}주기 · 약 ${best.hours}시간 수면` : undefined}
          note={
            options
              ? `다른 선택: ${options.slice(1).map((o) => `${o.time}(${o.cycles}주기)`).join(" · ")}`
              : "시각을 입력하면 추천 시각이 표시됩니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("wake")}
            className={`rounded-2xl border p-3 text-sm font-bold transition ${
              mode === "wake" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            기상 시각으로 취침 찾기
          </button>
          <button
            type="button"
            onClick={() => setMode("bed")}
            className={`rounded-2xl border p-3 text-sm font-bold transition ${
              mode === "bed" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            취침 시각으로 기상 찾기
          </button>
        </div>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
            {mode === "wake" ? "일어날 시각" : "잠들 시각"}
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
    </CalculatorLayout>
  );
}
