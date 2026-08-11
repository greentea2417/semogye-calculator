"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

const WITHHOLD_RATE = 0.033; // 사업소득 원천징수 3.3% = 소득세 3% + 지방소득세 0.3%

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function FreelanceBackcalcPage() {
  const [netRaw, setNetRaw] = useState("");

  const result = useMemo(() => {
    const net = parseNumber(netRaw);
    const gross = net > 0 ? Math.round(net / (1 - WITHHOLD_RATE)) : 0;
    const tax = Math.max(0, gross - net);
    return { net, gross, tax };
  }, [netRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "프리랜서 세후금액 역산 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "목표 실수령액", value: `${result.net.toLocaleString()}원` },
    { label: "예상 원천징수", hint: "(3.3%)", value: `${result.tax.toLocaleString()}원` },
  ];

  const resultTotal: ResultLine = {
    label: "세전 계약금",
    value: `${result.gross.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "freelance-backcalc",
      title: "프리랜서 세후금액 역산 계산기",
      inputs: [{ label: "목표 실수령액(입력)", value: `${result.net.toLocaleString()}원` }],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="프리랜서 3.3% 세전금액 역산 계산기 | 세모계"
      subtitle="원하는 실수령액 기준으로 3.3% 원천징수 전 세전 계약금을 계산합니다."
      intro="프리랜서 계약에서 '실수령액 기준 얼마를 받아야 하나요?'를 빠르게 역산하는 계산기입니다. 3.3% 원천징수만 단순 반영합니다."
      faqTitle="프리랜서 세후금액 역산 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 세전 금액은 어떻게 구하나요?", a: "A. 세후 금액을 0.967로 나눠서 구합니다. 3.3%를 제외한 금액이 실제 받는 돈이기 때문입니다." },
        { q: "Q. 3.3%는 무엇인가요?", a: "A. 사업소득 원천징수 세율로, 소득세 3%와 지방소득세 0.3%를 합한 값입니다." },
        { q: "Q. 실제 종합소득세와 같나요?", a: "A. 아니요. 이 금액은 원천징수만 반영한 추정치이며, 5월 종합소득세 신고 시 필요경비·공제에 따라 최종 세액은 달라질 수 있습니다." },
        { q: "Q. 빈칸이나 0은 어떻게 처리하나요?", a: "A. 빈칸은 0원으로 처리합니다. 목표 실수령액이 0원이면 세전 계약금과 원천징수도 0원으로 표시됩니다." },
      ]}
      result={
        <ResultPanel
          title="역산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 3.3% 원천징수만 반영한 간이 역산이며, 실제 계약 조건·부가세·종합소득세 신고 결과는 별도입니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="목표 실수령액 (원)"
        type="text"
        inputMode="numeric"
        value={netRaw}
        onChange={(e) => setNetRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 1,000,000"
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 세전 계약금이 계산됩니다.</p>
    </CalculatorLayout>
  );
}
