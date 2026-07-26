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
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function MarginPage() {
  const [costRaw, setCostRaw] = useState("");
  const [priceRaw, setPriceRaw] = useState("");

  const result = useMemo(() => {
    const cost = parseNumber(costRaw);
    const price = parseNumber(priceRaw);
    const profit = price - cost;
    const marginRate = price > 0 ? round2((profit / price) * 100) : 0; // 판매가 대비
    const markupRate = cost > 0 ? round2((profit / cost) * 100) : 0; // 원가 대비
    return { cost, price, profit, marginRate, markupRate };
  }, [costRaw, priceRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "마진율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "마진액", hint: "(판매가 − 원가)", value: `${result.profit.toLocaleString()}원` },
    { label: "마진율", hint: "(판매가 대비)", value: `${result.marginRate}%` },
    { label: "마크업률", hint: "(원가 대비)", value: `${result.markupRate}%` },
  ];
  const resultTotal: ResultLine = {
    label: "마진율",
    value: `${result.marginRate}%`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "margin",
      title: "마진율 계산기",
      inputs: [
        { label: "원가(입력)", value: `${parseNumber(costRaw).toLocaleString()}원` },
        { label: "판매가(입력)", value: `${parseNumber(priceRaw).toLocaleString()}원` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="마진율 계산기"
      subtitle="원가와 판매가를 넣으면 마진액과 마진율, 마크업률을 계산합니다."
      intro="판매가 대비 마진율과 원가 대비 마크업률을 함께 보여줘, 가격 책정과 수익 분석에 바로 쓸 수 있어요."
      faqTitle="마진율 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 마진율은 어떻게 계산하나요?",
          a: "A. 마진율(%) = (판매가 − 원가) ÷ 판매가 × 100 입니다. 예를 들어 원가 7,000원, 판매가 10,000원이면 마진율은 30%입니다.",
        },
        {
          q: "Q. 마진율과 마크업률은 무엇이 다른가요?",
          a: "A. 마진율은 '판매가' 기준, 마크업률은 '원가' 기준입니다. 마크업률(%) = (판매가 − 원가) ÷ 원가 × 100. 같은 상품이라도 기준이 달라 수치가 다릅니다.",
        },
        {
          q: "Q. 왜 두 가지를 같이 보여주나요?",
          a: "A. 실무에서 '마진'을 원가 대비로 말하는 경우와 판매가 대비로 말하는 경우가 섞여 있어, 혼동을 줄이려 두 값을 함께 제공합니다.",
        },
        {
          q: "Q. 부가세도 포함되나요?",
          a: "A. 이 계산기는 부가세를 제외한 공급가액 기준으로 보는 것이 정확합니다. 부가세 분리가 필요하면 부가세 계산기를 함께 이용하세요.",
        },
      ]}
      result={
        <ResultPanel
          title="마진 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 부가세를 제외한 공급가액 기준으로 계산하면 더 정확합니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="원가 (원)"
          type="text"
          inputMode="numeric"
          value={costRaw}
          onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 7,000"
        />
        <InputBlock
          label="판매가 (원)"
          type="text"
          inputMode="numeric"
          value={priceRaw}
          onChange={(e) => setPriceRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 10,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
