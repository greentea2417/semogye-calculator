"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcProteinIntake } from "../../utils/proteinIntakeCalc";

export default function ProteinPage() {
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState<"general" | "strength" | "cut">("general");
  const result = calcProteinIntake(parseFloat(weight), goal);
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "단백질 섭취량 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  return (<CalculatorLayout tone="life" title="단백질 섭취량 계산기" subtitle="목표에 맞는 하루 단백질 섭취량을 확인해보세요." intro="체중과 운동 목표에 따라 하루 권장 단백질 g 수를 계산합니다." faqTitle="단백질 섭취량 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 일반 권장량은 얼마인가요?", a: "A. 보통 체중 1kg당 0.8g을 기준으로 합니다." }, { q: "Q. 근력 운동을 하면 얼마나 늘리나요?", a: "A. 대체로 1.2g/kg 수준을 참고합니다." }, { q: "Q. 감량 중에는 왜 더 필요하나요?", a: "A. 근손실을 줄이고 포만감을 유지하는 데 도움이 되기 때문입니다." }, { q: "Q. 한 끼로 나누면 얼마인가요?", a: "A. 이 계산기는 하루 권장량을 3끼 기준으로 나눈 값을 함께 보여줍니다." }]} result={<LifeResult label="하루 단백질 권장량" value={result ? `${result.gramsPerDay.toFixed(1)}g` : "-"} status={result ? `한 끼 ${result.gramsPerMeal.toFixed(1)}g` : undefined} desc="식단 구성의 출발점으로 활용하세요." note="개인 건강 상태에 따라 달라질 수 있습니다." />} guide={<BottomActions onShare={onShare} />}><div className="space-y-4"><label className="block space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">몸무게 (kg)</span><input type="number" inputMode="decimal" placeholder="60" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label><div className="grid grid-cols-3 gap-2">{([ ["general", "일반"], ["strength", "근력"], ["cut", "감량"] ] as const).map(([k, label]) => (<button key={k} type="button" onClick={() => setGoal(k)} className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${goal === k ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>{label}</button>))}</div></div></CalculatorLayout>);
}
