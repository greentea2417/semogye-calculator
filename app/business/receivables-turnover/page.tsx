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
function formatNum(n: number) {
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function calcTurnover(salesRaw: number, beginRaw: number, endRaw: number) {
  const sales = Math.max(0, salesRaw);
  const begin = Math.max(0, beginRaw);
  const end = Math.max(0, endRaw);
  const avgAr = (begin + end) / 2; // 평균매출채권 = (기초 + 기말) / 2
  const turnover = avgAr > 0 ? sales / avgAr : 0; // 회전율(회)
  const days = turnover > 0 ? 365 / turnover : 0; // 회전일수(일) = 365 / 회전율
  return { sales, begin, end, avgAr, turnover, days };
}

export default function ReceivablesTurnoverPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [beginRaw, setBeginRaw] = useState("");
  const [endRaw, setEndRaw] = useState("");

  const r = useMemo(
    () => calcTurnover(parseNumber(salesRaw), parseNumber(beginRaw), parseNumber(endRaw)),
    [salesRaw, beginRaw, endRaw],
  );

  const lines: ResultLine[] = [
    { label: "매출액", hint: "입력값", value: `${r.sales.toLocaleString()}원` },
    { label: "평균매출채권", hint: "(기초 + 기말) ÷ 2", value: `${Math.round(r.avgAr).toLocaleString()}원` },
    { label: "매출채권회전율", hint: "매출액 ÷ 평균매출채권", value: `${round2(r.turnover)}회` },
    { label: "회전일수(회수기간)", hint: "365 ÷ 회전율", value: `${round1(r.days)}일` },
  ];

  const total = { label: "매출채권회전율", value: `${round2(r.turnover)}회` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "매출채권회전율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "receivables-turnover",
      title: "매출채권회전율 계산기",
      inputs: [
        { label: "매출액(입력)", value: `${r.sales.toLocaleString()}원` },
        { label: "기초 매출채권(입력)", value: `${r.begin.toLocaleString()}원` },
        { label: "기말 매출채권(입력)", value: `${r.end.toLocaleString()}원` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="매출채권회전율 계산기"
      subtitle="매출액과 기초·기말 매출채권으로 매출채권회전율과 회수기간을 계산합니다."
      intro="매출채권이 1년에 몇 번 현금으로 회수되는지(회전율)와 회수까지 걸리는 평균 일수(회전일수)를 보여줘요. 높을수록 현금 회수가 빠릅니다."
      faqTitle="매출채권회전율 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 매출채권회전율은 어떻게 계산하나요?",
          a: "A. 매출채권회전율 = 매출액 ÷ 평균매출채권 입니다. 평균매출채권은 (기초 매출채권 + 기말 매출채권) ÷ 2로 계산합니다.",
        },
        {
          q: "Q. 회전일수(회수기간)는 무엇인가요?",
          a: "A. 회전일수 = 365 ÷ 매출채권회전율 입니다. 외상매출이 현금으로 회수되기까지 걸리는 평균 일수를 뜻하며, 짧을수록 좋습니다.",
        },
        {
          q: "Q. 회전율이 높으면 좋은 건가요?",
          a: "A. 일반적으로 회전율이 높고 회전일수가 짧을수록 대금 회수가 원활해 현금흐름에 유리합니다. 다만 지나치게 엄격한 회수 정책은 매출을 제약할 수 있어 업종 평균과 함께 봐야 합니다.",
        },
        {
          q: "Q. 기초·기말 값을 모르면 어떻게 하나요?",
          a: "A. 정확한 평균이 어려우면 기초·기말에 같은 금액(기말 잔액)을 넣어 근사치를 볼 수 있습니다. 이 경우 평균매출채권은 그 금액과 같아집니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 매출액·기초·기말 매출채권과 평균매출채권·회전율·회전일수가 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="매출채권회전율 계산 결과"
          lines={lines}
          total={total}
          note="* 평균매출채권이 0이면 나눌 수 없어 회전율·회전일수는 0으로 표시됩니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="연간 매출액 (원)"
          type="text"
          inputMode="numeric"
          value={salesRaw}
          onChange={(e) => setSalesRaw(formatNum(parseNumber(e.target.value)))}
          placeholder="예: 1,000,000,000"
        />
        <InputBlock
          label="기초 매출채권 (원)"
          type="text"
          inputMode="numeric"
          value={beginRaw}
          onChange={(e) => setBeginRaw(formatNum(parseNumber(e.target.value)))}
          placeholder="예: 100,000,000"
        />
        <InputBlock
          label="기말 매출채권 (원)"
          type="text"
          inputMode="numeric"
          value={endRaw}
          onChange={(e) => setEndRaw(formatNum(parseNumber(e.target.value)))}
          placeholder="예: 200,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 매출채권은 외상매출금·받을어음 등 아직 회수하지 못한 판매대금입니다.
      </p>
    </CalculatorLayout>
  );
}
