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

export default function SellingPriceBackcalcPage() {
  const [costRaw, setCostRaw] = useState("");
  const [marginRaw, setMarginRaw] = useState("30");

  const result = useMemo(() => {
    const cost = Math.max(0, parseNumber(costRaw));
    const marginRate = Math.max(0, parseNumber(marginRaw)) / 100;
    const valid = cost > 0 && marginRate < 1;
    const sellingPrice = valid ? Math.round(cost / (1 - marginRate)) : 0;
    const grossProfit = valid ? Math.max(0, sellingPrice - cost) : 0;
    const markup = cost > 0 ? grossProfit / cost : 0;
    return { cost, marginRate, sellingPrice, grossProfit, markup, valid };
  }, [costRaw, marginRaw]);

  const lines: ResultLine[] = [
    { label: "목표 매출총이익률", value: `${round2(result.marginRate * 100)}%` },
    { label: "권장 판매가", hint: "원가 ÷ (1 − 목표이익률)", value: result.valid ? `${result.sellingPrice.toLocaleString()}원` : "계산 불가" },
    { label: "예상 매출총이익", hint: "권장 판매가 − 원가", value: result.valid ? `${result.grossProfit.toLocaleString()}원` : "0원" },
    { label: "마크업률", hint: "매출총이익 ÷ 원가", value: result.valid ? `${round2(result.markup * 100)}%` : "0%" },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "판매가 역산 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "selling-price-backcalc",
      title: "판매가 역산 계산기",
      inputs: [
        { label: "원가(입력)", value: `${result.cost.toLocaleString()}원` },
        { label: "목표 매출총이익률(입력)", value: `${round2(result.marginRate * 100)}%` },
      ],
      lines,
      total: { label: "권장 판매가", value: result.valid ? `${result.sellingPrice.toLocaleString()}원` : "계산 불가" },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="판매가 역산 계산기"
      subtitle="원가와 목표 이익률을 넣으면 권장 판매가를 계산합니다."
      intro="원하는 마진을 확보하려면 얼마에 팔아야 하는지 빠르게 확인할 수 있어요."
      faqTitle="판매가 역산 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 판매가는 어떻게 구하나요?", a: "A. 판매가 = 원가 ÷ (1 − 목표 매출총이익률) 입니다. 예를 들어 원가 10,000원, 목표 이익률 30%면 판매가는 14,286원입니다." },
        { q: "Q. 목표 이익률이 100%면요?", a: "A. 분모가 0이 되어 계산할 수 없습니다. 이 계산기는 100% 이상이면 '계산 불가'로 표시합니다." },
        { q: "Q. 매출총이익률과 마크업률은 같나요?", a: "A. 다릅니다. 매출총이익률은 판매가 기준, 마크업률은 원가 기준입니다. 원가 10,000원과 판매가 13,000원일 때 이익은 3,000원, 매출총이익률은 23.08%, 마크업률은 30%입니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 원가, 목표 매출총이익률, 권장 판매가, 예상 매출총이익, 마크업률이 함께 들어갑니다." },
      ]}
      result={<ResultPanel title="판매가 역산 결과" lines={lines} total={{ label: "권장 판매가", value: result.valid ? `${result.sellingPrice.toLocaleString()}원` : "계산 불가" }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="원가 (원)" type="text" inputMode="numeric" value={costRaw} onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" />
        <InputBlock label="목표 매출총이익률 (%)" type="text" inputMode="decimal" value={marginRaw} onChange={(e) => setMarginRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 30" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 목표 이익률은 0~99.99% 범위를 권장합니다. 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
