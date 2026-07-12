"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult, { LifeChoice } from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

const GRADE_SCHEMES: Record<string, Record<string, number>> = {
  "4.5": { "A+": 4.5, A0: 4.0, "B+": 3.5, B0: 3.0, "C+": 2.5, C0: 2.0, "D+": 1.5, D0: 1.0, F: 0, P: 0, NP: 0 },
  "4.3": {
    "A+": 4.3, A0: 4.0, "A-": 3.7, "B+": 3.3, B0: 3.0, "B-": 2.7,
    "C+": 2.3, C0: 2.0, "C-": 1.7, "D+": 1.3, D0: 1.0, "D-": 0.7, F: 0, P: 0, NP: 0,
  },
};

type Subject = { id: number; name: string; credit: number; grade: string };

export default function GradePage() {
  const [maxGrade, setMaxGrade] = useState<"4.5" | "4.3">("4.5");
  const [subjects, setSubjects] = useState<Subject[]>([{ id: 1, name: "", credit: 3, grade: "A+" }]);

  const scheme = GRADE_SCHEMES[maxGrade];

  const gpa = (() => {
    let credits = 0;
    let points = 0;
    subjects.forEach((s) => {
      if (s.grade === "P" || s.grade === "NP") return;
      credits += Number(s.credit);
      points += Number(s.credit) * (scheme[s.grade] ?? 0);
    });
    return credits === 0 ? "0.00" : (points / credits).toFixed(2);
  })();

  const totalCredits = subjects
    .filter((s) => s.grade !== "P" && s.grade !== "NP")
    .reduce((sum, s) => sum + Number(s.credit), 0);

  const update = (id: number, patch: Partial<Subject>) =>
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "학점 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="학점 계산기"
      subtitle="과목별 학점과 성적으로 평균 평점(GPA)을 계산합니다."
      intro="4.5 만점과 4.3 만점 기준을 모두 지원합니다."
      faqTitle="학점 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. GPA는 어떻게 계산하나요?", a: "A. (과목 학점 × 성적 평점)을 모두 더한 뒤 총 이수학점으로 나눕니다." },
        { q: "Q. P/NP 과목도 반영되나요?", a: "A. 아니요. Pass/Non-Pass 과목은 일반적으로 평점 산출에서 제외되며 이 계산기도 제외합니다." },
        { q: "Q. 4.5와 4.3 만점은 무엇이 다른가요?", a: "A. 4.3 만점은 A-, B-처럼 마이너스 등급이 있어 등급이 더 세분화됩니다. 학교 학칙을 따르세요." },
        { q: "Q. 재수강한 과목은 어떻게 넣나요?", a: "A. 최종 인정되는 성적 하나만 입력하세요. 대학별로 재수강 성적 상한이 있을 수 있습니다." },
      ]}
      result={
        <LifeResult
          label={`${maxGrade} 만점 기준 평점`}
          value={gpa}
          desc={`총 ${totalCredits}학점 반영 (P/NP 제외)`}
          note="실제 평점 산출 방식은 각 대학 학칙에 따라 차이가 있을 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">만점 기준</span>
        <div className="grid grid-cols-2 gap-2">
          {(["4.5", "4.3"] as const).map((v) => (
            <LifeChoice
              key={v}
              active={maxGrade === v}
              onClick={() => {
                setMaxGrade(v);
                setSubjects((prev) => prev.map((s) => ({ ...s, grade: "A+" })));
              }}
            >
              {v} 만점
            </LifeChoice>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {subjects.map((s, idx) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3"
          >
            <input
              type="text"
              placeholder={`과목 ${idx + 1}`}
              value={s.name}
              onChange={(e) => update(s.id, { name: e.target.value })}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
            <select
              value={s.credit}
              onChange={(e) => update(s.id, { credit: Number(e.target.value) })}
              className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-xs font-bold outline-none"
            >
              {[1, 2, 3, 4].map((c) => (
                <option key={c} value={c}>
                  {c}학점
                </option>
              ))}
            </select>
            <select
              value={s.grade}
              onChange={(e) => update(s.id, { grade: e.target.value })}
              className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-xs font-bold outline-none"
            >
              {Object.keys(scheme).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => subjects.length > 1 && setSubjects((prev) => prev.filter((x) => x.id !== s.id))}
              disabled={subjects.length <= 1}
              className="px-1 text-lg text-gray-300 hover:text-red-400 disabled:opacity-40"
              aria-label="과목 삭제"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSubjects((prev) => [...prev, { id: Date.now(), name: "", credit: 3, grade: "A+" }])}
        className="mt-4 w-full rounded-2xl border border-gray-200 bg-white py-4 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
      >
        + 과목 추가하기
      </button>
    </CalculatorLayout>
  );
}
