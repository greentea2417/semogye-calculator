"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}

export default function DividendTaxPage() {
  const [amount, setAmount] = useState("");
  const amountNum = parseNumber(amount);
  const result = useMemo(() => {
    if (amountNum <= 0) return null;
    const incomeTax = Math.round(amountNum * 0.154);
    const net = amountNum - incomeTax;
    return { incomeTax, net };
  }, [amountNum]);

  const lines: ResultLine[] = [
    { label: "원천징수 소득세", hint: "배당금 × 15.4%", value: `${(result?.incomeTax ?? 0).toLocaleString()}원` },
  ];
  const totalLine: ResultLine = { label: "실수령액", value: `${(result?.net ?? 0).toLocaleString()}원` };
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "dividend-tax",
      title: "배당소득세 계산기",
      inputs: [{ label: "배당금(입력)", value: `${amountNum.toLocaleString()}원` }],
      lines,
      total: totalLine,
      footerNote: "엑셀에서 열 수 있어요 (.csv)",
    });

  return (
    <CalculatorLayout
      tone="business"
      title="배당소득세 계산기"
      subtitle="배당금을 넣으면 15.4% 원천징수 세액과 실수령액을 계산해 드려요."
      intro="배당소득 원천징수 기본세율 14%에 지방소득세 10%를 더한 15.4%를 적용합니다."
      faqTitle="배당소득세 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 배당소득세는 어떻게 계산하나요?", a: "A. 배당금 × 15.4%를 원천징수 소득세로 보고, 실수령액은 배당금에서 이를 뺀 금액으로 계산합니다." },
        { q: "Q. 지방소득세도 포함되나요?", a: "A. 네. 15.4% 안에 소득세 14%와 지방소득세 1.4%가 함께 포함됩니다." },
        { q: "Q. 빈값이나 0원은 어떻게 되나요?", a: "A. 입력이 없거나 0원인 경우 모두 0원으로 계산합니다." },
        { q: "Q. 실제 종합과세와 같나요?", a: "A. 아닙니다. 이 계산기는 일반적인 원천징수 기준의 간이 계산입니다. 금융소득종합과세 대상 여부에 따라 실제 세 부담은 달라질 수 있습니다." },
      ]}
      result={<ResultPanel title="계산 결과" lines={lines} total={totalLine} note="* 금융소득 원천징수 기본세율 14% + 지방소득세 1.4%를 반영합니다." />}
      guide={<BottomActions onShare={async () => { if (navigator.share) await navigator.share({ title: "배당소득세 계산기", url: shareUrl }); else { await copyToClipboardSafe(shareUrl); toast("링크를 복사했어요!"); } }} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="배당금 (원)" type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,000,000" />
    </CalculatorLayout>
  );
}
