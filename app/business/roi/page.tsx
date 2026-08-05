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

function calcRoi(investRaw: number, returnRaw: number) {
  const invest = Math.max(0, investRaw);
  const gross = Math.max(0, returnRaw);
  const netProfit = gross - invest;
  const roi = invest > 0 ? (netProfit / invest) * 100 : 0;
  return { invest, gross, netProfit, roi };
}

export default function RoiPage() {
  const [investRaw, setInvestRaw] = useState("");
  const [returnRaw, setReturnRaw] = useState("");

  const result = useMemo(
    () => calcRoi(parseNumber(investRaw), parseNumber(returnRaw)),
    [investRaw, returnRaw],
  );

  const lines: ResultLine[] = [
    { label: "투자금액", hint: "입력값", value: `${result.invest.toLocaleString()}원` },
    { label: "총 회수금액", hint: "입력값", value: `${result.gross.toLocaleString()}원` },
    { label: "순이익", hint: "회수금액 − 투자금액", value: `${result.netProfit.toLocaleString()}원` },
    { label: "투자수익률(ROI)", hint: "순이익 ÷ 투자금액", value: `${round2(result.roi)}%` },
  ];

  const total = { label: "투자수익률(ROI)", value: `${round2(result.roi)}%` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "투자수익률(ROI) 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "roi",
      title: "투자수익률(ROI) 계산기",
      inputs: [
        { label: "투자금액(입력)", value: `${result.invest.toLocaleString()}원` },
        { label: "총 회수금액(입력)", value: `${result.gross.toLocaleString()}원` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="투자수익률(ROI) 계산기"
      subtitle="투자금액과 총 회수금액을 넣으면 순이익과 투자수익률(ROI)을 계산합니다."
      intro="설비·마케팅·창업 투자 대비 얼마나 남았는지 한 번에 확인할 수 있어요."
      faqTitle="투자수익률(ROI) 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. ROI는 어떻게 계산하나요?",
          a: "A. ROI(투자수익률) = 순이익 ÷ 투자금액 × 100 입니다. 순이익은 총 회수금액에서 투자금액을 뺀 값입니다.",
        },
        {
          q: "Q. 총 회수금액에는 무엇을 넣나요?",
          a: "A. 투자로 최종적으로 돌려받은 금액 전체(원금 회수분 포함)를 넣습니다. 예를 들어 1,000만원을 투자해 1,500만원을 회수했다면 총 회수금액은 1,500만원입니다.",
        },
        {
          q: "Q. 손해를 봤을 때도 계산되나요?",
          a: "A. 네. 회수금액이 투자금액보다 적으면 순이익이 음수가 되고 ROI도 음수(마이너스 수익률)로 표시됩니다.",
        },
        {
          q: "Q. 투자금액이 0이면요?",
          a: "A. 투자금액이 0이면 나눌 수 없어 ROI는 0%로 표시됩니다. 투자금액을 입력해야 정확한 수익률이 계산됩니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 투자금액·총 회수금액과 순이익, 투자수익률(ROI)이 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="투자수익률(ROI) 계산 결과"
          lines={lines}
          total={total}
          note="* 순이익과 ROI는 음수(손실)도 그대로 표시합니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="투자금액 (원)"
          type="text"
          inputMode="numeric"
          value={investRaw}
          onChange={(e) => setInvestRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 10,000,000"
        />
        <InputBlock
          label="총 회수금액 (원)"
          type="text"
          inputMode="numeric"
          value={returnRaw}
          onChange={(e) => setReturnRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 15,000,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 총 회수금액은 원금 회수분을 포함한 최종 수령액을 넣으세요.
      </p>
    </CalculatorLayout>
  );
}
