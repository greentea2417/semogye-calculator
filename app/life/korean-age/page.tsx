"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

const DAY = 1000 * 60 * 60 * 24;

export default function KoreanAgePage() {
  const [birth, setBirth] = useState("");

  const result = useMemo(() => {
    if (!birth) return null;
    const b = new Date(birth);
    if (Number.isNaN(b.getTime())) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 만 나이: 생일이 지났는지 기준
    let age = today.getFullYear() - b.getFullYear();
    const hadBirthday =
      today.getMonth() > b.getMonth() ||
      (today.getMonth() === b.getMonth() && today.getDate() >= b.getDate());
    if (!hadBirthday) age -= 1;
    if (age < 0) return null;

    const yearAge = today.getFullYear() - b.getFullYear(); // 연 나이

    // 다음 생일까지 D-day
    let nextBirthday = new Date(today.getFullYear(), b.getMonth(), b.getDate());
    if (nextBirthday.getTime() < today.getTime()) {
      nextBirthday = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate());
    }
    const daysToBirthday = Math.round((nextBirthday.getTime() - today.getTime()) / DAY);

    const daysLived = Math.round((today.getTime() - new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()) / DAY);

    return { age, yearAge, daysToBirthday, daysLived };
  }, [birth]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "만 나이 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="만 나이 계산기"
      subtitle="생년월일을 넣으면 오늘 기준 만 나이를 바로 알려드려요."
      intro="2023년 6월부터 법적·행정적으로 만 나이가 기준이 되었습니다. 생일이 지났는지에 따라 만 나이가 달라집니다."
      faqTitle="만 나이 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 만 나이는 어떻게 계산하나요?", a: "A. 태어난 해를 0살로 시작해 생일이 지날 때마다 한 살씩 더합니다. 올해 생일이 아직 안 지났다면 (올해 − 태어난 해)에서 한 살을 뺍니다." },
        { q: "Q. 연 나이와 만 나이는 무엇이 다른가요?", a: "A. 연 나이는 생일과 상관없이 '올해 − 태어난 해'로 계산하고, 만 나이는 생일 경과 여부까지 반영합니다. 병역·청소년보호법 등 일부는 연 나이를 씁니다." },
        { q: "Q. 만 나이 통일법 이후 무엇이 바뀌었나요?", a: "A. 2023년 6월 28일부터 법령·계약·공문서의 나이는 별도 규정이 없으면 모두 만 나이로 해석됩니다." },
        { q: "Q. 빠른 년생도 그대로 계산되나요?", a: "A. 네. 만 나이는 실제 생년월일만으로 계산하므로 이른바 '빠른 년생' 구분 없이 동일하게 산출됩니다." },
      ]}
      result={
        <LifeResult
          label="오늘 기준 만 나이"
          value={result ? `${result.age}세` : "-"}
          desc={result ? `연 나이 ${result.yearAge}세 · 다음 생일까지 D-${result.daysToBirthday}` : undefined}
          note={result ? `태어난 지 약 ${result.daysLived.toLocaleString()}일째입니다.` : "생년월일을 선택하면 만 나이가 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <label className="space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">생년월일</span>
        <input
          type="date"
          value={birth}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setBirth(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
        />
      </label>
    </CalculatorLayout>
  );
}
