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
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function VatRefundPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [vatRaw, setVatRaw] = useState("10");
  const [personalRateRaw, setPersonalRateRaw] = useState("20");

  const result = useMemo(() => {
    const sales = parseNumber(salesRaw);
    const vatRate = parseNumber(vatRaw);
    const personalRate = parseNumber(personalRateRaw);
    const vat = Math.round(sales * (vatRate / 100));
    const deductible = Math.round(vat * (personalRate / 100));
    const refund = Math.max(0, vat - deductible);
    return { sales, vatRate, personalRate, vat, deductible, refund };
  }, [salesRaw, vatRaw, personalRateRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "부가세 환급 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "공급가액", value: `${result.sales.toLocaleString()}원` },
    { label: "부가세율", value: `${result.vatRate}%` },
    { label: "예상 부가세", value: `${result.vat.toLocaleString()}원` },
    { label: "공제 비율", value: `${result.personalRate}%` },
    { label: "공제 후 금액", value: `${result.deductible.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "예상 환급액",
    value: `${result.refund.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "vat-refund",
      title: "부가세 환급 계산기",
      inputs: [
        { label: "공급가액(입력)", value: `${result.sales.toLocaleString()}원` },
        { label: "부가세율(입력)", value: `${result.vatRate}%` },
        { label: "공제 비율(입력)", value: `${result.personalRate}%` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="부가세 환급 계산기"
      subtitle="공급가액과 부가세율, 공제 비율을 넣으면 예상 환급액을 계산합니다."
      intro="매출에 포함된 부가세에서 공제 가능한 비율을 제외해, 실제 환급 또는 부담 금액을 가늠할 수 있어요."
      faqTitle="부가세 환급 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 계산 방식은 무엇인가요?", a: "A. 공급가액 × 부가세율로 부가세를 구한 뒤, 그중 공제 가능한 비율을 제외해 예상 환급액을 계산합니다. 간단한 참고용 계산기입니다." },
        { q: "Q. 공제 비율은 어떻게 정하나요?", a: "A. 업종, 매입세액 공제 가능 여부, 면세 비율 등에 따라 달라집니다. 이 계산기에서는 참고용으로 퍼센트 값을 직접 입력합니다." },
        { q: "Q. 환급액이 실제와 다를 수 있나요?", a: "A. 네. 신고 시기, 가산세, 공제 제한, 세무조정 항목에 따라 달라질 수 있습니다." },
        { q: "Q. 소수점 입력이 가능한가요?", a: "A. 네. 부가세율과 공제 비율은 소수점 입력을 허용합니다." },
      ]}
      result={
        <ResultPanel
          title="부가세 환급 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 세무 신고용이 아닌 참고용 추정치입니다. 실제 환급액은 세법과 신고 내용에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="공급가액 (원)"
        type="text"
        inputMode="numeric"
        value={salesRaw}
        onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 50,000,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="부가세율 (%)"
          type="text"
          inputMode="decimal"
          value={vatRaw}
          onChange={(e) => setVatRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 10"
        />
        <InputBlock
          label="공제 비율 (%)"
          type="text"
          inputMode="decimal"
          value={personalRateRaw}
          onChange={(e) => setPersonalRateRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 20"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
