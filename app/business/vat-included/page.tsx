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
function round0(n: number) { return Math.round(n); }

export default function VatIncludedPage() {
  const [amountRaw, setAmountRaw] = useState("");

  const result = useMemo(() => {
    const amount = Math.max(0, parseNumber(amountRaw));
    const supply = round0(amount / 1.1);
    const vat = round0(amount - supply);
    return { amount, supply, vat };
  }, [amountRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "부가세 포함/제외 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "공급가액", hint: "부가세 포함 금액 ÷ 1.1", value: `${result.supply.toLocaleString()}원` },
    { label: "부가세", hint: "부가세 포함 금액 − 공급가액", value: `${result.vat.toLocaleString()}원` },
    { label: "부가세 포함 금액", hint: "입력값", value: `${result.amount.toLocaleString()}원` },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "vat-included",
    title: "부가세 포함/제외 계산기",
    inputs: [
      { label: "부가세 포함 금액(입력)", value: `${result.amount.toLocaleString()}원` },
    ],
    lines,
    total: { label: "공급가액", value: `${result.supply.toLocaleString()}원` },
  });

  return (
    <CalculatorLayout tone="business" title="부가세 포함/제외 계산기" subtitle="부가세 포함 금액을 넣으면 공급가액과 부가세를 계산합니다." intro="부가가치세 10%를 기준으로 계산합니다." faqTitle="부가세 포함/제외 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 왜 1.1로 나누나요?", a: "A. 부가세 10%가 포함된 금액은 공급가액 × 1.1 이므로, 공급가액은 부가세 포함 금액 ÷ 1.1 입니다." },
      { q: "Q. 0원을 넣으면 어떻게 되나요?", a: "A. 공급가액과 부가세 모두 0원으로 계산합니다." },
      { q: "Q. 빈칸도 안전하게 처리되나요?", a: "A. 네. 빈값은 0으로 처리합니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력값, 공급가액, 부가세, 부가세 포함 금액이 함께 들어갑니다." },
    ]}
    result={<ResultPanel title="부가세 계산 결과" lines={lines} total={{ label: "공급가액", value: `${result.supply.toLocaleString()}원` }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="부가세 포함 금액 (원)" type="text" inputMode="numeric" value={amountRaw} onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 110,000" />
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
