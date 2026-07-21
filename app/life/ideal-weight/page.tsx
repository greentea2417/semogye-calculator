"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcIdealWeight } from "../../utils/idealWeightCalc";

export default function IdealWeightPage() {
  const [height, setHeight] = useState("");
  const [sex, setSex] = useState<"male" | "female">("female");
  const result = calcIdealWeight(parseFloat(height), sex);
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "표준 체중 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  return (<CalculatorLayout tone="life" title="표준 체중 계산기" subtitle="키로 BMI 22 기준 표준 체중을 확인해보세요." intro="표준 체중과 해당 키에서의 BMI도 함께 보여줍니다." faqTitle="표준 체중 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 어떤 공식을 쓰나요?", a: "A. 키(m)^2 × 22로 계산하는 BMI 22 기준 표준 체중입니다." }, { q: "Q. 표준 체중은 진단 기준인가요?", a: "A. 아니요. 대략적인 참고값이며 근육량과 체형 차이는 반영하지 못합니다." }, { q: "Q. BMI와는 다른가요?", a: "A. 네. BMI는 체중과 키의 비율, 표준 체중은 성별을 반영한 목표 체중입니다." }, { q: "Q. 몇 cm부터 계산되나요?", a: "A. 1cm 이상이면 계산되지만, 일반적으로 성인 키를 기준으로 참고합니다." }]} result={<LifeResult label="표준 체중" value={result ? `${result.idealWeight.toFixed(1)}kg` : "-"} status={result ? `BMI ${result.bmiAtIdeal.toFixed(1)} 기준` : undefined} desc="건강 관리 참고용 수치입니다." note="의학적 진단이 아닌 간단한 참고값입니다." />} guide={<BottomActions onShare={onShare} />}><div className="grid grid-cols-2 gap-4"><label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">키 (cm)</span><input type="number" inputMode="decimal" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label><label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">참고</span><div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center text-sm font-bold text-gray-600">BMI 22 기준 표준 체중</div></label></div></CalculatorLayout>);
}
