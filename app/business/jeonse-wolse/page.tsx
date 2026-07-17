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
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function parseDecimal(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  return firstDot === -1
    ? cleaned
    : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function JeonseWolsePage() {
  const [jeonseRaw, setJeonseRaw] = useState("");
  const [depositRaw, setDepositRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("5.5");

  const result = useMemo(() => {
    const jeonse = parseNumber(jeonseRaw);
    const deposit = parseNumber(depositRaw);
    const rate = Number(parseDecimal(rateRaw)) || 0;
    const convert = Math.max(0, jeonse - deposit); // 월세로 전환할 금액
    const yearly = convert * (rate / 100);
    const monthly = Math.round(yearly / 12);
    return { jeonse, deposit, rate, convert, monthly };
  }, [jeonseRaw, depositRaw, rateRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "전월세 전환 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "전세보증금", value: `${result.jeonse.toLocaleString()}원` },
    { label: "전환 후 보증금", value: `${result.deposit.toLocaleString()}원` },
    { label: "전월세 전환율", value: `${parseDecimal(rateRaw) || 0}%` },
    { label: "월세 전환 대상 금액", value: `${result.convert.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "예상 월세",
    value: `${result.monthly.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "jeonse-wolse",
      title: "전월세 전환 계산기",
      inputs: [
        { label: "전세보증금(입력)", value: `${result.jeonse.toLocaleString()}원` },
        { label: "전환 후 보증금(입력)", value: `${result.deposit.toLocaleString()}원` },
        { label: "전월세 전환율(입력)", value: `${parseDecimal(rateRaw) || 0}%` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="전월세 전환 계산기"
      subtitle="전세보증금 일부를 월세로 돌릴 때 예상 월세를 계산합니다."
      intro="전세보증금에서 남길 보증금을 뺀 금액에 전월세 전환율을 적용해 월세를 계산합니다. 전환율은 법정 상한(한국은행 기준금리 + 2%) 이내여야 합니다."
      faqTitle="전월세 전환 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 월세는 어떻게 계산하나요?", a: "A. (전세보증금 − 전환 후 보증금) × 전월세 전환율 ÷ 12로 계산합니다. 예를 들어 전세 3억에서 보증금 1억을 남기고 전환율 5.5%면 (3억−1억) × 5.5% ÷ 12 = 약 916,667원입니다." },
        { q: "Q. 전월세 전환율은 얼마인가요?", a: "A. 주택임대차보호법상 법정 전환율 상한은 '한국은행 기준금리 + 2%'와 '연 10%' 중 낮은 값입니다. 기본값 5.5%는 예시이며, 실제 계약 시점의 기준금리로 확인하세요." },
        { q: "Q. 반대로 월세를 전세로 바꾸려면요?", a: "A. 월세를 보증금으로 환산하려면 (월세 × 12) ÷ 전환율로 계산합니다. 이 계산기는 전세 → 월세 전환을 기준으로 합니다." },
        { q: "Q. 관리비나 세금도 포함되나요?", a: "A. 아니요. 순수 월세 환산액만 보여줍니다. 관리비·부동산 중개보수·세금 등은 별도로 고려해야 합니다." },
      ]}
      result={
        <ResultPanel
          title="전월세 전환 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 전세 → 월세 전환 기준의 단순 계산입니다. 법정 전환율 상한(기준금리 + 2%)을 초과하는 월세 요구는 무효일 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="전세보증금 (원)"
        type="text"
        inputMode="numeric"
        value={jeonseRaw}
        onChange={(e) => setJeonseRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 300,000,000"
      />
      <div className="mt-4">
        <InputBlock
          label="전환 후 남길 보증금 (원)"
          type="text"
          inputMode="numeric"
          value={depositRaw}
          onChange={(e) => setDepositRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 100,000,000"
        />
      </div>
      <div className="mt-4">
        <InputBlock
          label="전월세 전환율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(parseDecimal(e.target.value))}
          placeholder="예: 5.5"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
