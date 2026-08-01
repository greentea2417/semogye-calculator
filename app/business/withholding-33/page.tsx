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

export default function Withholding33Page() {
  const [amountRaw, setAmountRaw] = useState("");

  const result = useMemo(() => {
    const amount = Math.max(0, parseNumber(amountRaw));
    const incomeTax = round0(amount * 0.03);
    const localTax = round0(incomeTax * 0.1);
    const totalTax = incomeTax + localTax;
    const net = Math.max(0, amount - totalTax);
    return { amount, incomeTax, localTax, totalTax, net };
  }, [amountRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "원천세 3.3% 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "원천징수 소득세", hint: "지급액 × 3%", value: `${result.incomeTax.toLocaleString()}원` },
    { label: "지방소득세", hint: "소득세 × 10%", value: `${result.localTax.toLocaleString()}원` },
    { label: "총 공제액", hint: "소득세 + 지방소득세", value: `${result.totalTax.toLocaleString()}원` },
    { label: "실수령액", hint: "지급액 − 총 공제액", value: `${result.net.toLocaleString()}원` },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "withholding-33",
    title: "원천세 3.3% 계산기",
    inputs: [
      { label: "지급액(입력)", value: `${result.amount.toLocaleString()}원` },
    ],
    lines,
    total: { label: "실수령액", value: `${result.net.toLocaleString()}원` },
  });

  return (
    <CalculatorLayout tone="business" title="원천세 3.3% 계산기" subtitle="프리랜서·사업소득 지급액에서 3.3%를 공제한 실수령액을 계산합니다." intro="소득세 3% + 지방소득세 0.3%를 기준으로 계산합니다." faqTitle="원천세 3.3% 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 3.3%는 어떻게 구성되나요?", a: "A. 보통 소득세 3%와 지방소득세 0.3%를 합친 값으로 안내합니다." },
      { q: "Q. 소득세와 지방소득세는 어떻게 계산하나요?", a: "A. 소득세는 지급액 × 3%, 지방소득세는 그 소득세의 10%입니다." },
      { q: "Q. 0원 또는 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원으로 계산합니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 지급액, 소득세, 지방소득세, 총 공제액, 실수령액이 모두 들어갑니다." },
    ]}
    result={<ResultPanel title="원천세 계산 결과" lines={lines} total={{ label: "실수령액", value: `${result.net.toLocaleString()}원` }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="지급액 (원)" type="text" inputMode="numeric" value={amountRaw} onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
