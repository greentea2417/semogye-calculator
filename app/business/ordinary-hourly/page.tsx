"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function OrdinaryHourlyPage() {
  const [monthlyRaw, setMonthlyRaw] = useState("");

  const result = useMemo(() => {
    const monthlyOrdinaryWage = parseNumber(monthlyRaw);
    const divisor = 209;
    const hourly = monthlyOrdinaryWage > 0 ? Math.round((monthlyOrdinaryWage / divisor) * 100) / 100 : 0;
    return { monthlyOrdinaryWage, divisor, hourly };
  }, [monthlyRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "통상시급 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "월 통상임금", value: `${result.monthlyOrdinaryWage.toLocaleString()}원` },
    { label: "산정 기준", value: "209시간" },
    { label: "통상시급", value: `${result.hourly.toLocaleString()}원` },
  ];
  const total: ResultLine = { label: "통상시급", value: `${result.hourly.toLocaleString()}원` };

  const onCsvDownload = () => downloadResultCsv({
    slug: "ordinary-hourly",
    title: "통상시급 계산기",
    inputs: [{ label: "월 통상임금(입력)", value: `${result.monthlyOrdinaryWage.toLocaleString()}원` }],
    lines,
    total,
  });

  return (
    <CalculatorLayout
      tone="business"
      title="통상시급 계산기"
      subtitle="월 통상임금을 209시간 기준 통상시급으로 환산합니다."
      intro="연장·야간·휴일수당의 기준이 되는 통상시급을 빠르게 확인할 수 있어요."
      faqTitle="통상시급 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 왜 209시간으로 나누나요?", a: "A. 주 40시간제에서 유급 주휴시간 8시간을 포함한 월 환산 기준이 209시간이기 때문입니다." },
        { q: "Q. 월 통상임금은 무엇인가요?", a: "A. 정기적·일률적·고정적으로 지급되는 임금을 뜻하며, 수당 계산의 기준이 됩니다." },
        { q: "Q. 0원을 넣으면 어떻게 되나요?", a: "A. 결과는 0원입니다. 빈값도 0원으로 처리합니다." },
        { q: "Q. 실제 급여명세서와 왜 다를 수 있나요?", a: "A. 비과세 수당, 일할 계산, 소수점 반올림 방식에 따라 차이가 날 수 있습니다." },
      ]}
      result={<ResultPanel title="통상시급 리포트" lines={lines} total={total} note="* 주 40시간제의 월 환산 209시간 기준입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="월 통상임금 (원)" type="text" inputMode="numeric" value={monthlyRaw} onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 2,500,000" />
    </CalculatorLayout>
  );
}
