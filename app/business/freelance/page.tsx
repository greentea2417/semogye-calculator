"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel from "../../components/ResultPanel";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function BusinessFreelancePage() {
  const [amountRaw, setAmountRaw] = useState("");
  const value = parseNumber(amountRaw);

  const result = useMemo(() => {
    const tax = Math.round(value * 0.033);
    const net = Math.max(0, value - tax);
    return { tax, net };
  }, [value]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "프리랜서 실수령액 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="business"
      title="프리랜서 실수령액 계산기"
      subtitle="3.3% 원천징수 기준으로 실제 받는 금액을 계산합니다."
      intro="프리랜서 정산은 세전 금액에서 사업소득 원천징수 3.3%를 먼저 반영해 예상 실수령액을 봅니다."
      faqTitle="프리랜서 실수령액 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 3.3%는 무엇인가요?", a: "A. 사업소득 원천징수 세율로, 소득세 3%와 지방소득세 0.3%를 합친 값입니다." },
        { q: "Q. 실제 신고 결과와 같은가요?", a: "A. 아니요. 5월 종합소득세 신고에서 필요경비·공제를 반영하면 최종 세액이 달라집니다." },
        { q: "Q. 부가세도 반영되나요?", a: "A. 이 계산은 원천징수 기준이며 부가세(10%)는 별도 계약 조건에 따릅니다." },
        { q: "Q. 3.3%를 떼면 세금이 끝인가요?", a: "A. 아니요. 미리 낸 세금이라 종합소득세 신고 때 환급 또는 추가 납부가 생길 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={[
            { label: "세전 금액", value: `${value.toLocaleString()}원` },
            { label: "원천징수", hint: "(3.3%)", value: `${result.tax.toLocaleString()}원` },
          ]}
          total={{ label: "실수령액(예상)", value: `${result.net.toLocaleString()}원` }}
          note="* 간이 계산이며 실제 신고·공제 조건에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <InputBlock
        label="세전 금액 (원)"
        type="text"
        inputMode="numeric"
        placeholder="예: 1,000,000"
        value={amountRaw}
        onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))}
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
