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

export default function ComprehensiveTaxInterimPage() {
  const [taxRaw, setTaxRaw] = useState("");
  const result = useMemo(() => { const priorTax = Math.max(0, parseNumber(taxRaw)); const interim = priorTax < 100000 ? 0 : Math.floor(priorTax / 2); return { priorTax, interim }; }, [taxRaw]);
  const lines: ResultLine[] = [{ label: "중간예납세액", hint: "직전 귀속 종합소득세 × 50%", value: `${result.interim.toLocaleString()}원` }];
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "종합소득세 중간예납 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const onCsvDownload = () => downloadResultCsv({ slug: "comprehensive-tax-interim", title: "종합소득세 중간예납 계산기", inputs: [{ label: "직전 귀속 종합소득세(입력)", value: `${result.priorTax.toLocaleString()}원` }], lines, total: { label: "중간예납세액", value: `${result.interim.toLocaleString()}원` }, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return <CalculatorLayout title="종합소득세 중간예납 계산기" subtitle="직전 귀속 종합소득세를 기준으로 중간예납세액을 계산합니다." intro="종합소득세 중간예납은 보통 직전 귀속 종합소득세의 1/2로 계산합니다. 10만원 미만은 0원으로 처리했습니다." faqTitle="종합소득세 중간예납 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 계산식은 무엇인가요?", a: "A. 중간예납세액 = 직전 귀속 종합소득세 × 1/2 입니다." }, { q: "Q. 10만원 미만이면 어떻게 되나요?", a: "A. 중간예납세액이 10만원 미만인 경우 0원으로 처리했습니다." }, { q: "Q. 0원이나 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리합니다." }, { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 직전 귀속 종합소득세와 계산된 중간예납세액이 들어갑니다." }]} result={<ResultPanel title="종합소득세 중간예납 계산 결과" lines={lines} total={{ label: "중간예납세액", value: `${result.interim.toLocaleString()}원` }} note="* 신고대상 여부와 감면·징수유예는 별도 확인이 필요합니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}><InputBlock label="직전 귀속 종합소득세 (원)" type="text" inputMode="numeric" value={taxRaw} onChange={(e) => setTaxRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,500,000" /></CalculatorLayout>;
}