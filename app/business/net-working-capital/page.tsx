"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) { const cleaned = String(raw ?? "").replace(/[^\d.]/g, ""); return cleaned ? Number(cleaned) : 0; }
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }
function signText(n: number) { return n > 0 ? `+${n.toLocaleString()}원` : `${n.toLocaleString()}원`; }

export default function NetWorkingCapitalPage() {
  const [currentAssetRaw, setCurrentAssetRaw] = useState("");
  const [currentLiabRaw, setCurrentLiabRaw] = useState("");

  const result = useMemo(() => {
    const currentAssets = Math.max(0, parseNumber(currentAssetRaw));
    const currentLiabilities = Math.max(0, parseNumber(currentLiabRaw));
    const workingCapital = currentAssets - currentLiabilities;
    const hasInput = currentAssets > 0 || currentLiabilities > 0;
    return { currentAssets, currentLiabilities, workingCapital, hasInput };
  }, [currentAssetRaw, currentLiabRaw]);

  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "순운전자본 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const lines: ResultLine[] = [
    { label: "순운전자본", hint: "유동자산 − 유동부채", value: signText(result.workingCapital) },
    { label: "판정", hint: "양수/음수 기준", value: result.workingCapital > 0 ? "양수: 단기 운영자금 여유" : result.workingCapital < 0 ? "음수: 단기 자금 부족 가능" : result.hasInput ? "0원: 유동자산과 유동부채가 같습니다" : "입력 대기" },
  ];
  const onCsvDownload = () => downloadResultCsv({ slug: "net-working-capital", title: "순운전자본 계산기", inputs: [{ label: "유동자산(입력)", value: `${result.currentAssets.toLocaleString()}원` }, { label: "유동부채(입력)", value: `${result.currentLiabilities.toLocaleString()}원` }], lines, total: { label: "순운전자본", value: signText(result.workingCapital) } });

  return <CalculatorLayout tone="business" title="순운전자본 계산기" subtitle="유동자산과 유동부채로 순운전자본을 계산해 단기 운영자금 여유를 확인합니다." intro="순운전자본은 유동자산에서 유동부채를 뺀 값입니다. 양수면 단기 유동성 여유, 음수면 단기 자금 압박 가능성을 뜻합니다." faqTitle="순운전자본 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 순운전자본은 어떻게 계산하나요?", a: "A. 순운전자본 = 유동자산 − 유동부채 입니다." }, { q: "Q. 0원이나 빈칸이면 어떻게 되나요?", a: "A. 빈칸은 0원으로 처리하며, 두 값이 같으면 결과는 0원입니다." }, { q: "Q. 양수와 음수는 무엇을 뜻하나요?", a: "A. 양수면 단기 운영자금이 남는 상태, 음수면 단기 부채를 감당할 유동자산이 부족할 수 있음을 뜻합니다." }, { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 유동자산·유동부채와 순운전자본, 판정이 함께 들어갑니다." }]} result={<ResultPanel title="순운전자본 계산 결과" lines={lines} total={{ label: "순운전자본", value: signText(result.workingCapital) }} />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}><InputBlock label="유동자산 (원)" type="text" inputMode="numeric" value={currentAssetRaw} onChange={(e) => setCurrentAssetRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 150,000,000" /><div className="mt-4" /><InputBlock label="유동부채 (원)" type="text" inputMode="numeric" value={currentLiabRaw} onChange={(e) => setCurrentLiabRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 90,000,000" /><p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p></CalculatorLayout>;
}
