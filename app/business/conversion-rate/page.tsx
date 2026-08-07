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
function formatComma(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function calcConversion(visitsRaw: number, conversionsRaw: number) {
  const visits = Math.max(0, visitsRaw);
  const conversions = Math.max(0, conversionsRaw);
  const rate = visits > 0 ? (conversions / visits) * 100 : 0;
  return { visits, conversions, rate };
}

export default function ConversionRatePage() {
  const [visitsRaw, setVisitsRaw] = useState("");
  const [conversionsRaw, setConversionsRaw] = useState("");

  const result = useMemo(() => calcConversion(parseNumber(visitsRaw), parseNumber(conversionsRaw)), [visitsRaw, conversionsRaw]);
  const lines: ResultLine[] = [
    { label: "방문 수", hint: "입력값", value: `${result.visits.toLocaleString()}회` },
    { label: "전환 수", hint: "입력값", value: `${result.conversions.toLocaleString()}건` },
    { label: "전환율", hint: "전환 수 ÷ 방문 수 × 100", value: `${round2(result.rate)}%` },
  ];
  const total = { label: "전환율", value: `${round2(result.rate)}%` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "전환율 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const onCsvDownload = () => downloadResultCsv({
    slug: "conversion-rate",
    title: "전환율 계산기",
    inputs: [
      { label: "방문 수(입력)", value: `${result.visits.toLocaleString()}회` },
      { label: "전환 수(입력)", value: `${result.conversions.toLocaleString()}건` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout
      tone="business"
      title="전환율 계산기"
      subtitle="방문 수와 전환 수를 넣으면 전환율을 계산합니다."
      intro="랜딩페이지·상세페이지·광고 캠페인의 성과를 빠르게 비교할 때 유용해요."
      faqTitle="전환율 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 전환율은 어떻게 계산하나요?", a: "A. 전환율 = 전환 수 ÷ 방문 수 × 100 입니다. 방문 10,000회에 전환 300건이면 전환율은 3%입니다." },
        { q: "Q. 전환 수에는 무엇을 넣나요?", a: "A. 구매, 문의, 신청, 가입 등 목표로 설정한 행동의 완료 건수를 넣으면 됩니다." },
        { q: "Q. 방문 수가 0이면요?", a: "A. 나눗셈이 불가능하므로 0%로 표시합니다. 방문 데이터가 있어야 전환율을 계산할 수 있습니다." },
        { q: "Q. 전환율이 높으면 무조건 좋은가요?", a: "A. 전환율이 높아도 객단가나 마진이 낮으면 수익은 낮을 수 있습니다. ROAS·객단가와 함께 보세요." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 방문 수·전환 수와 계산된 전환율이 포함됩니다." },
      ]}
      result={<ResultPanel title="전환율 계산 결과" lines={lines} total={total} note="* 전환율은 보통 %로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="방문 수 (회)" type="text" inputMode="numeric" value={visitsRaw} onChange={(e) => setVisitsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" />
        <InputBlock label="전환 수 (건)" type="text" inputMode="numeric" value={conversionsRaw} onChange={(e) => setConversionsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 300" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 전환은 구매·문의·가입 등 목표 행동 완료를 뜻합니다.</p>
    </CalculatorLayout>
  );
}
