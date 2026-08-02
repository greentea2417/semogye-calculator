"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }
function round0(n: number) { return Math.round(n); }

export default function DividendTaxPage() {
  const [dividendRaw, setDividendRaw] = useState("");

  const result = useMemo(() => {
    const dividend = Math.max(0, parseNumber(dividendRaw));
    const incomeTax = round0(dividend * 0.14);
    const localTax = round0(incomeTax * 0.1);
    const totalTax = incomeTax + localTax;
    const net = Math.max(0, dividend - totalTax);
    const effectiveRate = dividend > 0 ? round0((totalTax / dividend) * 1000) / 10 : 0;
    return { dividend, incomeTax, localTax, totalTax, net, effectiveRate };
  }, [dividendRaw]);

  const lines: ResultLine[] = [
    { label: "원천징수 소득세", hint: "배당금 × 14%", value: `${result.incomeTax.toLocaleString()}원` },
    { label: "지방소득세", hint: "소득세 × 10%", value: `${result.localTax.toLocaleString()}원` },
    { label: "총 세금", hint: "소득세 + 지방소득세", value: `${result.totalTax.toLocaleString()}원` },
    { label: "실수령 배당금", hint: "배당금 − 총 세금", value: `${result.net.toLocaleString()}원` },
    { label: "실효세율", hint: "총 세금 ÷ 배당금", value: `${result.effectiveRate}%` },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "배당소득세 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };
  const onCsvDownload = () => downloadResultCsv({
    slug: "dividend-tax",
    title: "배당소득세 계산기",
    inputs: [{ label: "배당금(입력)", value: `${result.dividend.toLocaleString()}원` }],
    lines,
    total: { label: "실수령 배당금", value: `${result.net.toLocaleString()}원` },
    footerNote: "엑셀에서 열 수 있어요 (.csv)",
  });

  return (
    <CalculatorLayout tone="business" title="배당소득세 계산기" subtitle="국내 상장주식 배당금의 원천징수 세금과 실수령액을 계산합니다." intro="배당소득 원천징수는 소득세 14%와 지방소득세 1.4%를 합쳐 15.4%로 계산합니다." faqTitle="배당소득세 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 배당소득세는 어떻게 계산하나요?", a: "A. 배당금 × 14%로 소득세를 구하고, 그 소득세의 10%를 지방소득세로 더해 총 15.4%를 원천징수합니다." },
      { q: "Q. 실수령액은 어떻게 나오나요?", a: "A. 배당금에서 소득세와 지방소득세를 뺀 금액입니다." },
      { q: "Q. 빈칸이나 0원도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원으로 표시합니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 배당금, 소득세, 지방소득세, 총 세금, 실수령 배당금, 실효세율이 모두 들어갑니다. 엑셀에서 열 수 있어요 (.csv)" },
    ]}
    result={<ResultPanel title="배당소득세 계산 결과" lines={lines} total={{ label: "실수령 배당금", value: `${result.net.toLocaleString()}원` }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="배당금 (원)" type="text" inputMode="numeric" value={dividendRaw} onChange={(e) => setDividendRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
