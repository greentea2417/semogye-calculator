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

export default function SupplyPricePage() {
  const [supplyRaw, setSupplyRaw] = useState("");

  const result = useMemo(() => {
    const supply = Math.max(0, parseNumber(supplyRaw));
    const vat = round0(supply * 0.1);
    const gross = supply + vat;
    return { supply, vat, gross };
  }, [supplyRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "공급가액 역산 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const lines: ResultLine[] = [
    { label: "부가세", hint: "공급가액 × 10%", value: `${result.vat.toLocaleString()}원` },
    { label: "부가세 포함 금액", hint: "공급가액 + 부가세", value: `${result.gross.toLocaleString()}원` },
    { label: "공급가액", hint: "입력값", value: `${result.supply.toLocaleString()}원` },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "supply-price",
    title: "공급가액 역산 계산기",
    inputs: [
      { label: "공급가액(입력)", value: `${result.supply.toLocaleString()}원` },
    ],
    lines,
    total: { label: "부가세 포함 금액", value: `${result.gross.toLocaleString()}원` },
  });

  return (
    <CalculatorLayout tone="business" title="공급가액 역산 계산기" subtitle="공급가액을 넣으면 부가세와 부가세 포함 금액을 계산합니다." intro="부가가치세 10% 기준의 가장 기본적인 역산 계산기입니다." faqTitle="공급가액 역산 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 부가세는 어떻게 계산하나요?", a: "A. 부가세 = 공급가액 × 10% 입니다." },
      { q: "Q. 0원을 넣으면 어떻게 되나요?", a: "A. 부가세와 부가세 포함 금액도 0원입니다." },
      { q: "Q. 빈칸도 처리되나요?", a: "A. 네. 빈값은 0원으로 처리합니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 공급가액, 부가세, 부가세 포함 금액이 모두 들어갑니다." },
    ]}
    result={<ResultPanel title="공급가액 계산 결과" lines={lines} total={{ label: "부가세 포함 금액", value: `${result.gross.toLocaleString()}원` }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="공급가액 (원)" type="text" inputMode="numeric" value={supplyRaw} onChange={(e) => setSupplyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000" />
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
