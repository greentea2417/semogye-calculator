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
  const cleaned = String(raw ?? "").replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatSigned(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function calcRoe(netIncomeRaw: number, equityRaw: number) {
  const netIncome = netIncomeRaw;
  const equity = Math.max(0, equityRaw);
  const roe = equity > 0 ? (netIncome / equity) * 100 : 0;
  return { netIncome, equity, roe };
}

export default function RoePage() {
  const [netIncomeRaw, setNetIncomeRaw] = useState("");
  const [equityRaw, setEquityRaw] = useState("");

  const result = useMemo(
    () => calcRoe(parseNumber(netIncomeRaw), parseNumber(equityRaw)),
    [netIncomeRaw, equityRaw],
  );

  const lines: ResultLine[] = [
    { label: "당기순이익", hint: "입력값", value: `${result.netIncome.toLocaleString()}원` },
    { label: "자기자본", hint: "입력값", value: `${result.equity.toLocaleString()}원` },
    { label: "자기자본이익률(ROE)", hint: "당기순이익 ÷ 자기자본", value: `${round2(result.roe)}%` },
  ];

  const total = { label: "자기자본이익률(ROE)", value: `${round2(result.roe)}%` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "자기자본이익률(ROE) 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "roe",
      title: "자기자본이익률(ROE) 계산기",
      inputs: [
        { label: "당기순이익(입력)", value: `${result.netIncome.toLocaleString()}원` },
        { label: "자기자본(입력)", value: `${result.equity.toLocaleString()}원` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="자기자본이익률(ROE) 계산기"
      subtitle="당기순이익과 자기자본을 넣으면 자기자본이익률(ROE)을 계산합니다."
      intro="내 자본이 얼마나 효율적으로 이익을 냈는지 보여주는 대표적인 수익성 지표예요."
      faqTitle="자기자본이익률(ROE) 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. ROE는 어떻게 계산하나요?",
          a: "A. ROE(자기자본이익률) = 당기순이익 ÷ 자기자본 × 100 입니다. 자기자본 대비 얼마나 많은 순이익을 냈는지를 나타냅니다.",
        },
        {
          q: "Q. 자기자본에는 무엇을 넣나요?",
          a: "A. 총자산에서 부채를 뺀 순자산, 즉 재무상태표의 자본총계를 넣습니다. 자본금·이익잉여금 등이 포함됩니다.",
        },
        {
          q: "Q. ROE가 높으면 무조건 좋은가요?",
          a: "A. 일반적으로 ROE가 높을수록 자본 효율이 좋다고 봅니다. 다만 부채가 많아 자기자본이 작아도 ROE가 높게 나올 수 있어 부채비율과 함께 보는 것이 좋습니다.",
        },
        {
          q: "Q. 적자일 때도 계산되나요?",
          a: "A. 네. 당기순이익에 마이너스 금액을 넣으면 ROE도 음수로 표시됩니다. 자기자본이 0이면 나눌 수 없어 0%로 표시됩니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 당기순이익·자기자본과 자기자본이익률(ROE)이 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="자기자본이익률(ROE) 계산 결과"
          lines={lines}
          total={total}
          note="* 당기순이익이 음수이면 ROE도 음수로 표시됩니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="당기순이익 (원)"
          type="text"
          inputMode="numeric"
          value={netIncomeRaw}
          onChange={(e) => setNetIncomeRaw(formatSigned(parseNumber(e.target.value)))}
          placeholder="예: 20,000,000"
        />
        <InputBlock
          label="자기자본 (원)"
          type="text"
          inputMode="numeric"
          value={equityRaw}
          onChange={(e) => setEquityRaw(formatSigned(parseNumber(e.target.value)))}
          placeholder="예: 100,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 자기자본은 총자산에서 부채를 뺀 자본총계(순자산)를 넣으세요.
      </p>
    </CalculatorLayout>
  );
}
