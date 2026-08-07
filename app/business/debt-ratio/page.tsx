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

function calcDebtRatio(liabilitiesRaw: number, equityRaw: number) {
  const liabilities = Math.max(0, liabilitiesRaw);
  const equity = Math.max(0, equityRaw);
  const ratio = equity > 0 ? (liabilities / equity) * 100 : 0;
  return { liabilities, equity, ratio };
}

export default function DebtRatioPage() {
  const [liabilitiesRaw, setLiabilitiesRaw] = useState("");
  const [equityRaw, setEquityRaw] = useState("");

  const r = useMemo(
    () => calcDebtRatio(parseNumber(liabilitiesRaw), parseNumber(equityRaw)),
    [liabilitiesRaw, equityRaw],
  );

  const lines: ResultLine[] = [
    { label: "부채총계", hint: "입력값", value: `${r.liabilities.toLocaleString()}원` },
    { label: "자기자본", hint: "입력값", value: `${r.equity.toLocaleString()}원` },
    { label: "부채비율", hint: "부채총계 ÷ 자기자본", value: `${round2(r.ratio)}%` },
  ];

  const total = { label: "부채비율", value: `${round2(r.ratio)}%` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "부채비율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "debt-ratio",
      title: "부채비율 계산기",
      inputs: [
        { label: "부채총계(입력)", value: `${r.liabilities.toLocaleString()}원` },
        { label: "자기자본(입력)", value: `${r.equity.toLocaleString()}원` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="부채비율 계산기"
      subtitle="부채총계와 자기자본을 넣으면 부채비율(%)을 계산합니다."
      intro="부채비율은 자기자본 대비 부채가 얼마나 많은지를 보여주는 대표적인 재무건전성 지표예요. 낮을수록 안정적입니다."
      faqTitle="부채비율 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 부채비율은 어떻게 계산하나요?",
          a: "A. 부채비율 = 부채총계 ÷ 자기자본 × 100 입니다. 자기자본으로 부채를 얼마나 감당할 수 있는지를 백분율로 나타냅니다.",
        },
        {
          q: "Q. 부채총계에는 무엇을 넣나요?",
          a: "A. 재무상태표의 부채총계, 즉 유동부채와 비유동부채를 모두 합한 금액을 넣습니다.",
        },
        {
          q: "Q. 자기자본에는 무엇을 넣나요?",
          a: "A. 총자산에서 부채를 뺀 순자산(자본총계)을 넣습니다. 자본금·이익잉여금 등이 포함됩니다.",
        },
        {
          q: "Q. 부채비율은 몇 %가 적정한가요?",
          a: "A. 일반적으로 100% 이하이면 안정적, 200% 이하이면 양호한 편으로 봅니다. 다만 업종에 따라 적정 수준은 다를 수 있습니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 부채총계·자기자본과 계산된 부채비율(%)이 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="부채비율 계산 결과"
          lines={lines}
          total={total}
          note="* 자기자본이 0이면 나눌 수 없어 0%로 표시됩니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="부채총계 (원)"
          type="text"
          inputMode="numeric"
          value={liabilitiesRaw}
          onChange={(e) => setLiabilitiesRaw(formatNum(parseNumber(e.target.value)))}
          placeholder="예: 500,000,000"
        />
        <InputBlock
          label="자기자본 (원)"
          type="text"
          inputMode="numeric"
          value={equityRaw}
          onChange={(e) => setEquityRaw(formatNum(parseNumber(e.target.value)))}
          placeholder="예: 200,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 자기자본은 총자산에서 부채를 뺀 자본총계(순자산)를 넣으세요.
      </p>
    </CalculatorLayout>
  );
}
