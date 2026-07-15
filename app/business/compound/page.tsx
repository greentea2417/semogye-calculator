"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { LifeChoice } from "@/components/LifeResult";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

const TAX_RATE = 0.154; // 이자소득세 15.4%

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function parseDecimal(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  const normalized =
    firstDot === -1 ? cleaned : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return normalized ? Number(normalized) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function CompoundPage() {
  const [principalRaw, setPrincipalRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("");
  const [yearsRaw, setYearsRaw] = useState("");
  const [freq, setFreq] = useState<"yearly" | "monthly">("monthly");

  const result = useMemo(() => {
    const principal = parseNumber(principalRaw);
    const rate = parseDecimal(rateRaw) / 100;
    const years = parseNumber(yearsRaw);
    const n = freq === "monthly" ? 12 : 1;
    const maturity = years > 0 ? Math.round(principal * Math.pow(1 + rate / n, n * years)) : principal;
    const interest = Math.max(0, maturity - principal);
    const tax = Math.round(interest * TAX_RATE);
    const afterTax = maturity - tax;
    return { principal, interest, tax, afterTax };
  }, [principalRaw, rateRaw, yearsRaw, freq]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "복리 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "원금", value: `${result.principal.toLocaleString()}원` },
    { label: "세전 이자", value: `${result.interest.toLocaleString()}원` },
    { label: "이자소득세", hint: "(15.4%)", value: `${result.tax.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "세후 만기 수령액",
    value: `${result.afterTax.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "compound",
      title: "복리 계산기",
      inputs: [
        { label: "원금(입력)", value: `${result.principal.toLocaleString()}원` },
        { label: "연이율(입력)", value: `${parseDecimal(rateRaw)}%` },
        { label: "기간(입력)", value: `${parseNumber(yearsRaw)}년` },
        { label: "복리 방식(입력)", value: freq === "monthly" ? "월 복리" : "연 복리" },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="복리 계산기"
      subtitle="원금과 이율, 기간을 넣으면 복리로 불어난 만기 금액을 계산합니다."
      intro="연 복리와 월 복리를 모두 지원하며, 이자소득세 15.4%를 뗀 세후 수령액까지 확인할 수 있어요."
      faqTitle="복리 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 복리는 어떻게 계산되나요?", a: "A. 만기금액 = 원금 × (1 + 연이율 ÷ 복리횟수)^(복리횟수 × 기간)으로 계산합니다. 월 복리는 복리횟수 12, 연 복리는 1을 사용합니다." },
        { q: "Q. 단리와 무엇이 다른가요?", a: "A. 단리는 원금에만 이자가 붙지만, 복리는 이자에 다시 이자가 붙어 기간이 길수록 차이가 커집니다." },
        { q: "Q. 이자소득세는 왜 떼나요?", a: "A. 예·적금 이자에는 15.4%(소득세 14% + 지방소득세 1.4%)의 이자소득세가 원천징수됩니다. 이 계산기는 세후 수령액도 함께 보여줍니다." },
        { q: "Q. 매달 넣는 적금도 계산되나요?", a: "A. 이 계산기는 처음 한 번 넣는 목돈(예금)의 복리를 계산합니다. 매달 납입하는 적금은 계산 방식이 달라 결과가 다를 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="복리 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 이자소득세 15.4%를 반영한 단순 계산이며, 실제 상품의 우대금리·중도해지·비과세 여부에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="원금 (원)"
        type="text"
        inputMode="numeric"
        value={principalRaw}
        onChange={(e) => setPrincipalRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 10,000,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="연이율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 3.5"
        />
        <InputBlock
          label="기간 (년)"
          type="text"
          inputMode="numeric"
          value={yearsRaw}
          onChange={(e) => setYearsRaw(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="예: 3"
        />
      </div>

      <div className="mt-5 space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">복리 방식</span>
        <div className="grid grid-cols-2 gap-2">
          <LifeChoice active={freq === "monthly"} onClick={() => setFreq("monthly")}>
            월 복리
          </LifeChoice>
          <LifeChoice active={freq === "yearly"} onClick={() => setFreq("yearly")}>
            연 복리
          </LifeChoice>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
