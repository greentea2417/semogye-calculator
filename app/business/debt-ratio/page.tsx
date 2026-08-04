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
function grade(ratio: number, hasEquity: boolean) { if (!hasEquity) return "자기자본을 입력하면 판정이 표시됩니다"; if (ratio <= 100) return "우량 (100% 이하)"; if (ratio <= 200) return "보통 (200% 이하)"; return "주의 (200% 초과)"; }

export default function DebtRatioPage() {
  const [liabRaw, setLiabRaw] = useState("");
  const [equityRaw, setEquityRaw] = useState("");

  const result = useMemo(() => {
    const liabilities = Math.max(0, parseNumber(liabRaw));
    const equity = Math.max(0, parseNumber(equityRaw));
    const totalCapital = liabilities + equity;
    const hasEquity = equity > 0;
    const debtRatio = hasEquity ? (liabilities / equity) * 100 : 0;
    const equityRatio = totalCapital > 0 ? (equity / totalCapital) * 100 : 0;
    return { liabilities, equity, totalCapital, hasEquity, debtRatio, equityRatio };
  }, [liabRaw, equityRaw]);

  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "부채비율 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const ratioText = result.hasEquity ? pct(result.debtRatio) : "-";
  const lines: ResultLine[] = [
    { label: "총자본(부채+자본)", hint: "부채총계 + 자기자본", value: `${result.totalCapital.toLocaleString()}원` },
    { label: "부채비율", hint: "부채총계 ÷ 자기자본 × 100", value: ratioText },
    { label: "자기자본비율", hint: "자기자본 ÷ 총자본 × 100", value: pct(result.equityRatio) },
    { label: "안정성 판정", hint: "부채비율 기준", value: grade(result.debtRatio, result.hasEquity) },
  ];
  const onCsvDownload = () => downloadResultCsv({ slug: "debt-ratio", title: "부채비율 계산기", inputs: [{ label: "부채총계(입력)", value: `${result.liabilities.toLocaleString()}원` }, { label: "자기자본(입력)", value: `${result.equity.toLocaleString()}원` }], lines, total: { label: "부채비율", value: ratioText } });

  return <CalculatorLayout tone="business" title="부채비율 계산기" subtitle="부채총계와 자기자본으로 부채비율·자기자본비율을 계산해 재무 안정성을 확인합니다." intro="부채비율은 부채총계를 자기자본으로 나눈 값으로, 낮을수록 재무구조가 안정적입니다." faqTitle="부채비율 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 부채비율은 어떻게 계산하나요?", a: "A. 부채비율(%) = 부채총계 ÷ 자기자본 × 100 입니다. 재무제표의 부채총계와 자본총계(자기자본)를 넣으면 됩니다." }, { q: "Q. 부채비율은 몇 %가 적정한가요?", a: "A. 일반적으로 100% 이하를 우량, 200% 이하를 보통으로 봅니다. 업종에 따라 기준은 달라질 수 있습니다." }, { q: "Q. 자기자본비율은 무엇인가요?", a: "A. 자기자본 ÷ 총자본(부채+자본) × 100으로, 총자본 중 내 돈의 비중을 나타냅니다." }, { q: "Q. 0원 또는 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리하며, 자기자본이 0이면 나눗셈이 불가능해 부채비율은 '-'로 표시합니다." }, { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 부채총계·자기자본과 총자본, 부채비율, 자기자본비율, 판정이 모두 들어갑니다." }]} result={<ResultPanel title="부채비율 계산 결과" lines={lines} total={{ label: "부채비율", value: ratioText }} />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}><InputBlock label="부채총계 (원)" type="text" inputMode="numeric" value={liabRaw} onChange={(e) => setLiabRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 60,000,000" /><div className="mt-4" /><InputBlock label="자기자본 (원)" type="text" inputMode="numeric" value={equityRaw} onChange={(e) => setEquityRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 40,000,000" /><p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 자기자본 = 자산총계 − 부채총계 입니다.</p></CalculatorLayout>;
}
