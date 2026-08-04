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
function pct(n: number) { return `${n.toFixed(1)}%`; }
function grade(ratio: number, hasLiab: boolean) { if (!hasLiab) return "유동부채를 입력하면 판정이 표시됩니다"; if (ratio >= 200) return "양호 (200% 이상)"; if (ratio >= 100) return "보통 (100% 이상)"; return "주의 (100% 미만)"; }

export default function CurrentRatioPage() {
  const [assetRaw, setAssetRaw] = useState("");
  const [liabRaw, setLiabRaw] = useState("");
  const [inventoryRaw, setInventoryRaw] = useState("");

  const result = useMemo(() => {
    const currentAssets = Math.max(0, parseNumber(assetRaw));
    const currentLiabilities = Math.max(0, parseNumber(liabRaw));
    const inventory = Math.max(0, parseNumber(inventoryRaw));
    const quickAssets = Math.max(0, currentAssets - inventory);
    const hasLiab = currentLiabilities > 0;
    const currentRatio = hasLiab ? (currentAssets / currentLiabilities) * 100 : 0;
    const quickRatio = hasLiab ? (quickAssets / currentLiabilities) * 100 : 0;
    return { currentAssets, currentLiabilities, inventory, quickAssets, hasLiab, currentRatio, quickRatio };
  }, [assetRaw, liabRaw, inventoryRaw]);

  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "유동비율 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const currentText = result.hasLiab ? pct(result.currentRatio) : "-";
  const quickText = result.hasLiab ? pct(result.quickRatio) : "-";
  const lines: ResultLine[] = [
    { label: "당좌자산", hint: "유동자산 − 재고자산", value: `${result.quickAssets.toLocaleString()}원` },
    { label: "유동비율", hint: "유동자산 ÷ 유동부채 × 100", value: currentText },
    { label: "당좌비율", hint: "당좌자산 ÷ 유동부채 × 100", value: quickText },
    { label: "단기지급능력 판정", hint: "유동비율 기준", value: grade(result.currentRatio, result.hasLiab) },
  ];
  const onCsvDownload = () => downloadResultCsv({ slug: "current-ratio", title: "유동비율 계산기", inputs: [{ label: "유동자산(입력)", value: `${result.currentAssets.toLocaleString()}원` }, { label: "유동부채(입력)", value: `${result.currentLiabilities.toLocaleString()}원` }, { label: "재고자산(입력)", value: `${result.inventory.toLocaleString()}원` }], lines, total: { label: "유동비율", value: currentText } });

  return <CalculatorLayout tone="business" title="유동비율 계산기" subtitle="유동자산과 유동부채로 유동비율·당좌비율을 계산해 단기 지급능력을 확인합니다." intro="유동비율은 1년 안에 갚아야 할 부채를 1년 안에 현금화할 자산으로 얼마나 감당하는지 보여줍니다." faqTitle="유동비율 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 유동비율은 어떻게 계산하나요?", a: "A. 유동비율(%) = 유동자산 ÷ 유동부채 × 100 입니다. 값이 클수록 단기 지급능력이 좋습니다." }, { q: "Q. 유동비율은 몇 %가 적정한가요?", a: "A. 통상 200% 이상을 양호, 100% 이상을 보통으로 봅니다. 100% 미만이면 단기 부채 상환에 주의가 필요합니다." }, { q: "Q. 당좌비율은 무엇인가요?", a: "A. 재고자산을 뺀 당좌자산(유동자산−재고자산)을 유동부채로 나눈 값으로, 재고를 팔지 않고도 부채를 갚을 수 있는지를 봅니다. 재고자산을 비워두면 당좌비율은 유동비율과 같아집니다." }, { q: "Q. 0원 또는 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리하며, 유동부채가 0이면 나눗셈이 불가능해 비율은 '-'로 표시합니다." }, { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 유동자산·유동부채·재고자산과 당좌자산, 유동비율, 당좌비율, 판정이 모두 들어갑니다." }]} result={<ResultPanel title="유동비율 계산 결과" lines={lines} total={{ label: "유동비율", value: currentText }} />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}><InputBlock label="유동자산 (원)" type="text" inputMode="numeric" value={assetRaw} onChange={(e) => setAssetRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 200,000,000" /><div className="mt-4" /><InputBlock label="유동부채 (원)" type="text" inputMode="numeric" value={liabRaw} onChange={(e) => setLiabRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000,000" /><div className="mt-4" /><InputBlock label="재고자산 (원, 당좌비율용·선택)" type="text" inputMode="numeric" value={inventoryRaw} onChange={(e) => setInventoryRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 50,000,000" /><p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 재고자산은 당좌비율 계산에만 사용됩니다.</p></CalculatorLayout>;
}
