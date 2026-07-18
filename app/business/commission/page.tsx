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

export default function CommissionPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("3");
  const [bonusRaw, setBonusRaw] = useState("0");

  const result = useMemo(() => {
    const sales = parseNumber(salesRaw);
    const rate = parseNumber(rateRaw);
    const bonus = parseNumber(bonusRaw);
    const commission = Math.round(sales * (rate / 100));
    const total = commission + Math.round(bonus);
    return { sales, rate, bonus, commission, total };
  }, [salesRaw, rateRaw, bonusRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "판매 수수료 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "매출액", value: `${result.sales.toLocaleString()}원` },
    { label: "수수료율", value: `${result.rate}%` },
    { label: "기본 수수료", value: `${result.commission.toLocaleString()}원` },
    { label: "추가 보너스", value: `${Math.round(result.bonus).toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "총 수수료",
    value: `${result.total.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "commission",
      title: "판매 수수료 계산기",
      inputs: [
        { label: "매출액(입력)", value: `${result.sales.toLocaleString()}원` },
        { label: "수수료율(입력)", value: `${result.rate}%` },
        { label: "보너스(입력)", value: `${Math.round(result.bonus).toLocaleString()}원` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="판매 수수료 계산기"
      subtitle="매출액과 수수료율, 보너스를 넣으면 총 수수료를 계산합니다."
      intro="매출에 비례해 수수료를 계산하고, 고정 보너스가 있으면 함께 더해 총 지급액을 확인할 수 있어요."
      faqTitle="판매 수수료 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 수수료는 어떻게 계산하나요?", a: "A. 매출액 × 수수료율 ÷ 100으로 기본 수수료를 구한 뒤, 보너스가 있으면 더해 총 수수료를 계산합니다. 예를 들어 1,000만원 × 3%면 30만원입니다." },
        { q: "Q. 보너스는 무엇인가요?", a: "A. 기본 수수료 외에 추가로 지급되는 고정 금액입니다. 성과급, 인센티브, 건당 보너스 같은 항목을 입력할 수 있습니다." },
        { q: "Q. 세금은 반영되나요?", a: "A. 아니요. 세전 기준의 계산이며, 소득세·부가세·원천징수 등은 제외됩니다." },
        { q: "Q. 입력 금액이 커도 괜찮나요?", a: "A. 네. 원 단위 숫자를 그대로 입력하면 됩니다. 쉼표는 자동으로 정리됩니다." },
      ]}
      result={
        <ResultPanel
          title="수수료 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 세전 기준의 단순 계산입니다. 계약 조건에 따른 정산 방식이 다를 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="매출액 (원)"
        type="text"
        inputMode="numeric"
        value={salesRaw}
        onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 10,000,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="수수료율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 3"
        />
        <InputBlock
          label="보너스 (원)"
          type="text"
          inputMode="numeric"
          value={bonusRaw}
          onChange={(e) => setBonusRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 500,000"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
