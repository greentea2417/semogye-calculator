"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? Math.round(n).toLocaleString("ko-KR") : "";
}

export default function MarkupMarginPage() {
  const [costRaw, setCostRaw] = useState("");
  const [saleRaw, setSaleRaw] = useState("");

  const result = useMemo(() => {
    const cost = parseNumber(costRaw);
    const sale = parseNumber(saleRaw);
    const profit = sale - cost;
    const marginRate = sale > 0 ? (profit / sale) * 100 : 0;
    const markupRate = cost > 0 ? (profit / cost) * 100 : 0;
    return { cost, sale, profit, marginRate, markupRate };
  }, [costRaw, saleRaw]);

  const status = result.profit >= 0 ? "흑자" : "적자";
  const marginText = `${(Math.round(result.marginRate * 10) / 10).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;
  const markupText = `${(Math.round(result.markupRate * 10) / 10).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;

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
    { label: "원가", value: `${result.cost.toLocaleString()}원` },
    { label: "판매가", value: `${result.sale.toLocaleString()}원` },
    { label: "이익", value: `${result.profit.toLocaleString()}원` },
    { label: "마크업율", value: markupText },
  ];

  return (
    <CalculatorLayout
      tone="business"
      title="마진율 계산기"
      subtitle="원가와 판매가로 마진율과 마크업율을 계산합니다."
      intro="마진율은 판매가 대비 이익 비율이고, 마크업율은 원가 대비 이익 비율입니다. 둘을 함께 보면 가격 전략을 더 쉽게 세울 수 있습니다."
      faqTitle="마진율 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 마진율은 어떻게 계산하나요?", a: "A. (판매가 - 원가) ÷ 판매가 × 100입니다. 예를 들어 원가 1만원, 판매가 2만원이면 마진율은 50%입니다." },
        { q: "Q. 마크업율은 무엇인가요?", a: "A. (판매가 - 원가) ÷ 원가 × 100입니다. 같은 예시에서 마크업율은 100%입니다." },
        { q: "Q. 적자도 계산되나요?", a: "A. 네. 판매가가 원가보다 낮으면 이익이 음수로 표시되고 마진율과 마크업율도 음수로 나타납니다." },
        { q: "Q. 부가세는 포함되나요?", a: "A. 아니요. 이 계산기는 원가와 판매가만 기준으로 계산합니다. 필요하면 공급가액 기준으로 따로 계산하세요." },
      ]}
      result={
        <ResultPanel
          title="마진 리포트"
          lines={resultLines}
          total={{ label: `마진율 (${status})`, value: marginText }}
          note="* 단순 원가·판매가 기준 계산입니다. 수수료, 세금, 물류비 등은 별도로 반영하세요."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">원가 (원)</span>
          <input type="text" inputMode="numeric" value={costRaw} onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-blue-400" />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">판매가 (원)</span>
          <input type="text" inputMode="numeric" value={saleRaw} onChange={(e) => setSaleRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 18,000" className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-blue-400" />
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
