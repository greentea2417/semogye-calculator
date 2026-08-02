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
function round2(n: number) { return Math.round(n * 100) / 100; }

export default function DividendYieldPage() {
  const [purchaseRaw, setPurchaseRaw] = useState("");
  const [dividendRaw, setDividendRaw] = useState("");

  const result = useMemo(() => {
    const purchase = Math.max(0, parseNumber(purchaseRaw));
    const dividend = Math.max(0, parseNumber(dividendRaw));
    const grossYield = purchase > 0 ? round2((dividend / purchase) * 100) : 0;
    const netDividend = Math.max(0, dividend * 0.846);
    const netYield = purchase > 0 ? round2((netDividend / purchase) * 100) : 0;
    return { purchase, dividend, grossYield, netDividend, netYield };
  }, [purchaseRaw, dividendRaw]);

  const lines: ResultLine[] = [
    { label: "배당수익률(세전)", hint: "배당금 ÷ 매입가", value: `${result.grossYield}%` },
    { label: "세후 배당금", hint: "배당금 × 84.6%", value: `${result.netDividend.toLocaleString()}원` },
    { label: "배당수익률(세후)", hint: "세후 배당금 ÷ 매입가", value: `${result.netYield}%` },
    { label: "세후 배당금", hint: "투자금 기준 실수령액", value: `${result.netDividend.toLocaleString()}원` },
  ];

  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "배당수익률 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const onCsvDownload = () => downloadResultCsv({ slug: "dividend-yield", title: "배당수익률 계산기", inputs: [{ label: "매입금액(입력)", value: `${result.purchase.toLocaleString()}원` }, { label: "연간 배당금(입력)", value: `${result.dividend.toLocaleString()}원` }], lines, total: { label: "세후 배당수익률", value: `${result.netYield}%` }, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return (
    <CalculatorLayout tone="business" title="배당수익률 계산기" subtitle="매입금액과 연간 배당금으로 세전·세후 배당수익률을 계산합니다." intro="배당수익률 = 연간 배당금 ÷ 매입금액 × 100 입니다. 세후 수익률은 배당소득세 15.4%를 반영합니다." faqTitle="배당수익률 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 배당수익률은 어떻게 계산하나요?", a: "A. 배당수익률은 연간 배당금 ÷ 주식 매입금액 × 100으로 계산합니다." },
      { q: "Q. 세후 배당수익률은 어떻게 계산하나요?", a: "A. 연간 배당금에 84.6%를 곱해 세후 배당금을 구한 뒤, 이를 매입금액으로 나눠 계산합니다." },
      { q: "Q. 빈칸이나 0원도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 매입금액이 0이면 수익률은 0%로 표시합니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 매입금액, 연간 배당금, 세전 배당수익률, 세후 배당금, 세후 배당수익률이 모두 들어가며 엑셀에서 열 수 있어요 (.csv)" },
    ]}
    result={<ResultPanel title="배당수익률 계산 결과" lines={lines} total={{ label: "세후 배당수익률", value: `${result.netYield}%` }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매입금액 (원)" type="text" inputMode="numeric" value={purchaseRaw} onChange={(e) => setPurchaseRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000,000" />
        <InputBlock label="연간 배당금 (원)" type="text" inputMode="numeric" value={dividendRaw} onChange={(e) => setDividendRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 500,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
