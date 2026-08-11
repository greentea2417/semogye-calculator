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

export default function InterestTaxPage() {
  const [amount, setAmount] = useState("");
  const amountNum = parseNumber(amount);
  const result = useMemo(() => {
    if (amountNum <= 0) return null;
    const incomeTax = Math.round(amountNum * 0.154);
    const net = amountNum - incomeTax;
    return { incomeTax, net };
  }, [amountNum]);

  const lines: ResultLine[] = [
    { label: "원천징수 소득세", hint: "이자소득 × 15.4%", value: `${(result?.incomeTax ?? 0).toLocaleString()}원` },
  ];
  const totalLine: ResultLine = { label: "실수령액", value: `${(result?.net ?? 0).toLocaleString()}원` };
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "interest-tax",
      title: "이자소득세 계산기",
      inputs: [{ label: "이자소득(입력)", value: `${amountNum.toLocaleString()}원` }],
      lines,
      total: totalLine,
      footerNote: "엑셀에서 열 수 있어요 (.csv)",
    });

  return (
    <CalculatorLayout
      tone="business"
      title="이자소득세 계산기"
      subtitle="이자소득을 넣으면 15.4% 원천징수 세액과 실수령액을 계산해 드려요."
      intro="예금·적금·채권 이자에 적용되는 기본 원천징수 세율 15.4%를 사용합니다."
      faqTitle="이자소득세 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 이자소득세는 어떻게 계산하나요?", a: "A. 이자소득 × 15.4%를 원천징수 세액으로 계산하고, 실수령액은 이자소득에서 세액을 뺀 값입니다." },
        { q: "Q. 지방소득세도 포함되나요?", a: "A. 네. 15.4% 안에 소득세 14%와 지방소득세 1.4%가 포함됩니다." },
        { q: "Q. 0원이나 빈값은 계산되나요?", a: "A. 네. 입력값이 없거나 0원일 때는 0원으로 표시합니다." },
        { q: "Q. 모든 이자에 동일한가요?", a: "A. 일반적인 원천징수 기준의 간이 계산이며, 비과세 상품이나 세제혜택 상품은 실제 결과가 다를 수 있습니다." },
      ]}
      result={<ResultPanel title="계산 결과" lines={lines} total={totalLine} note="* 일반적인 이자소득 원천징수 세율 15.4%를 적용합니다." />}
      guide={<BottomActions onShare={async () => { if (navigator.share) await navigator.share({ title: "이자소득세 계산기", url: shareUrl }); else { await copyToClipboardSafe(shareUrl); toast("링크를 복사했어요!"); } }} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="이자소득 (원)" type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(formatComma(parseNumber(e.target.value)))} placeholder="예: 500,000" />
    </CalculatorLayout>
  );
}
