"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcWaistHeightRatio } from "../../utils/waistRatioCalc";

export default function WaistHeightRatioPage() {
  const [waist, setWaist] = useState("");
  const [height, setHeight] = useState("");
  const result = calcWaistHeightRatio(parseFloat(waist), parseFloat(height));
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "허리-키 비율 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  return (<CalculatorLayout tone="life" title="허리-키 비율 계산기" subtitle="허리둘레와 키로 복부비만 위험을 간단히 확인해보세요." intro="허리둘레를 키로 나눈 WHtR 값을 퍼센트와 함께 보여줍니다." faqTitle="허리-키 비율 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 기준은 어떻게 되나요?", a: "A. 보통 0.5 미만은 낮음, 0.5 이상 0.6 미만은 주의, 0.6 이상은 위험으로 봅니다." }, { q: "Q. 허리둘레는 어디를 재나요?", a: "A. 배꼽 주변의 가장 편안한 지점을 기준으로 재는 것이 일반적입니다." }, { q: "Q. BMI와 함께 보면 좋나요?", a: "A. 네. BMI와 허리-키 비율을 함께 보면 체형과 복부지방을 더 잘 파악할 수 있습니다." }, { q: "Q. 이 계산은 의학적 진단인가요?", a: "A. 아니요. 건강검진을 대체하지 않는 참고용 지표입니다." }]} result={<LifeResult label="WHtR" value={result ? result.ratio.toFixed(3) : "-"} status={result ? `${result.percent.toFixed(1)}% · ${result.category}` : undefined} desc={result ? (result.category === "낮음" ? "좋은 범위입니다." : result.category === "주의" ? "생활습관 점검을 권장합니다." : "검진과 상담을 고려해보세요.") : undefined} note="참고용 지표이며 정확한 진단은 의료진과 상의하세요." />} guide={<BottomActions onShare={onShare} />}><div className="grid grid-cols-2 gap-4"><label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">허리둘레 (cm)</span><input type="number" inputMode="decimal" placeholder="80" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label><label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">키 (cm)</span><input type="number" inputMode="decimal" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" /></label></div></CalculatorLayout>);
}
