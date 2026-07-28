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
function round2(n: number) { return Math.round(n * 100) / 100; }

export default function FeePage() {
  const [amountRaw, setAmountRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("3.5");

  const result = useMemo(() => {
    const amount = Math.max(0, parseNumber(amountRaw));
    const rate = Math.max(0, parseNumber(rateRaw));
    const fee = round2(amount * (rate / 100));
    const net = round2(amount - fee);
    return { amount, rate, fee, net };
  }, [amountRaw, rateRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "수수료 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "수수료", hint: "금액 × 수수료율", value: `${result.fee.toLocaleString()}원` },
    { label: "수수료율", hint: "입력값", value: `${result.rate}%` },
    { label: "정산금액", hint: "금액 − 수수료", value: `${result.net.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "fee",
      title: "수수료 계산기",
      inputs: [
        { label: "금액(입력)", value: `${result.amount.toLocaleString()}원` },
        { label: "수수료율(입력)", value: `${result.rate}%` },
      ],
      lines,
      total: { label: "정산금액", value: `${result.net.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="수수료 계산기"
      subtitle="금액과 수수료율을 넣으면 수수료와 정산금액을 계산합니다."
      intro="배달앱, PG, 플랫폼, 중개수수료처럼 퍼센트 기반 공제 금액을 빠르게 확인할 수 있어요."
      faqTitle="수수료 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 수수료는 어떻게 계산하나요?", a: "A. 수수료(원) = 금액 × 수수료율 ÷ 100 입니다. 예를 들어 100,000원에 3.5%면 수수료는 3,500원입니다." },
        { q: "Q. 수수료율이 0이면 어떻게 되나요?", a: "A. 수수료는 0원, 정산금액은 입력한 금액과 같습니다." },
        { q: "Q. 금액이 빈칸이면요?", a: "A. 빈값은 0으로 처리해 안전하게 계산합니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 금액, 수수료율, 수수료, 정산금액이 함께 들어갑니다." },
      ]}
      result={<ResultPanel title="수수료 계산 결과" lines={lines} total={{ label: "정산금액", value: `${result.net.toLocaleString()}원` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="금액 (원)" type="text" inputMode="numeric" value={amountRaw} onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000" />
        <InputBlock label="수수료율 (%)" type="text" inputMode="decimal" value={rateRaw} onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 3.5" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
