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

type PurchaseType = "home" | "land";

export default function AcquisitionTaxPage() {
  const [type, setType] = useState<PurchaseType>("home");
  const [priceRaw, setPriceRaw] = useState("");
  const [rateRaw, setRateRaw] = useState(type === "home" ? "1.1" : "4.6");

  const result = useMemo(() => {
    const price = parseNumber(priceRaw);
    const rate = Number(rateRaw || 0);
    const tax = price > 0 ? Math.floor((price * rate) / 100) : 0;
    const localTax = Math.floor(tax * 0.1);
    const total = tax + localTax;
    return { price, rate, tax, localTax, total };
  }, [priceRaw, rateRaw]);

  const lines: ResultLine[] = [
    { label: "취득세", hint: "과세표준 × 세율", value: `${result.tax.toLocaleString()}원` },
    { label: "지방교육세", hint: "취득세 × 10%", value: `${result.localTax.toLocaleString()}원` },
  ];
  const total: ResultLine = { label: "총 납부세액", value: `${result.total.toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "취득세 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };
  const onCsvDownload = () => downloadResultCsv({
    slug: "acquisition-tax",
    title: "취득세 계산기",
    inputs: [
      { label: "구분(입력)", value: type === "home" ? "주택" : "토지/건물" },
      { label: "취득가액(입력)", value: `${result.price.toLocaleString()}원` },
      { label: "세율(입력)", value: `${result.rate}%` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout title="취득세 계산기" subtitle="주택·토지/건물 취득가액과 세율로 취득세와 지방교육세를 계산합니다." intro="취득세는 일반적으로 과세표준 × 세율로 계산하며, 지방교육세는 취득세의 10%를 더합니다. 세율은 물건 종류와 조건에 따라 달라질 수 있습니다." faqTitle="취득세 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 취득세는 어떻게 계산하나요?", a: "A. 기본적으로 과세표준에 세율을 곱해 계산합니다. 이 계산기는 사용자가 입력한 세율을 기준으로 취득세와 지방교육세(취득세의 10%)를 함께 보여줍니다." },
      { q: "Q. 주택과 토지 세율이 다른가요?", a: "A. 네. 주택은 보유 주택 수, 조정대상지역 여부, 면적 등에 따라 달라질 수 있고, 토지·건물도 용도에 따라 세율이 다를 수 있습니다." },
      { q: "Q. 빈칸이나 0원도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원으로 표시합니다. CSV에는 입력값과 결과값이 모두 들어갑니다. 엑셀에서 열 수 있어요 (.csv)" },
      { q: "Q. 세율을 모르면 어떻게 하나요?", a: "A. 정확한 세율은 취득 유형과 지역, 요건에 따라 달라질 수 있으므로 관할 지자체 안내나 세무 전문가 확인이 필요합니다. 이 계산기는 세율 입력형입니다." },
      { q: "Q. 소수 세율도 넣을 수 있나요?", a: "A. 네. 1.1, 4.6처럼 소수 세율을 입력할 수 있습니다." },
    ]} result={<ResultPanel title="취득세 계산 결과" lines={lines} total={total} note="* 취득세는 입력한 세율 기준의 간이 계산입니다. 실제 세액은 물건 종류·면적·주택 수·감면 여부에 따라 달라질 수 있습니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button type="button" onClick={() => { setType("home"); setRateRaw("1.1"); }} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${type === "home" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}>주택</button>
        <button type="button" onClick={() => { setType("land"); setRateRaw("4.6"); }} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${type === "land" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}>토지/건물</button>
      </div>
      <InputBlock label="취득가액 (원)" type="text" inputMode="numeric" value={priceRaw} onChange={(e) => setPriceRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 300,000,000" />
      <div className="mt-4"><InputBlock label="세율 (%)" type="text" inputMode="decimal" value={rateRaw} onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 1.1" /></div>
    </CalculatorLayout>
  );
}
