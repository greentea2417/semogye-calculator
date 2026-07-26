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

type Method = "equalPayment" | "equalPrincipal";

export default function LoanPage() {
  const [principalRaw, setPrincipalRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");
  const [method, setMethod] = useState<Method>("equalPayment");

  const result = useMemo(() => {
    const principal = parseNumber(principalRaw);
    const annualRate = parseDecimal(rateRaw);
    const r = annualRate / 100 / 12; // 월 이율
    const n = parseNumber(monthsRaw);

    if (principal <= 0 || n <= 0) {
      return { principal, first: 0, last: 0, monthly: 0, interest: 0, total: 0 };
    }

    if (method === "equalPayment") {
      // 원리금균등: 매달 같은 금액 상환
      const monthly =
        r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const monthlyR = Math.round(monthly);
      const total = monthlyR * n;
      const interest = total - principal;
      return { principal, first: monthlyR, last: monthlyR, monthly: monthlyR, interest, total };
    }

    // 원금균등: 매달 원금은 같고 이자는 줄어듦
    const monthlyPrincipal = principal / n;
    const firstPayment = Math.round(monthlyPrincipal + principal * r);
    const lastPayment = Math.round(monthlyPrincipal + monthlyPrincipal * r);
    const interest = Math.round((principal * r * (n + 1)) / 2);
    const total = principal + interest;
    return { principal, first: firstPayment, last: lastPayment, monthly: 0, interest, total };
  }, [principalRaw, rateRaw, monthsRaw, method]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "대출 이자 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] =
    method === "equalPayment"
      ? [
          { label: "월 상환금", hint: "(매달 고정)", value: `${result.monthly.toLocaleString()}원` },
          { label: "총 이자", value: `${result.interest.toLocaleString()}원` },
        ]
      : [
          { label: "첫 달 상환금", value: `${result.first.toLocaleString()}원` },
          { label: "마지막 달 상환금", value: `${result.last.toLocaleString()}원` },
          { label: "총 이자", value: `${result.interest.toLocaleString()}원` },
        ];
  const resultTotal: ResultLine = {
    label: "총 상환액",
    value: `${result.total.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "loan",
      title: "대출 이자 계산기",
      inputs: [
        { label: "대출 원금(입력)", value: `${parseNumber(principalRaw).toLocaleString()}원` },
        { label: "연이율(입력)", value: `${parseDecimal(rateRaw)}%` },
        { label: "대출 기간(입력)", value: `${parseNumber(monthsRaw)}개월` },
        { label: "상환 방식(입력)", value: method === "equalPayment" ? "원리금균등" : "원금균등" },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="대출 이자 계산기"
      subtitle="대출 원금과 이율, 기간을 넣으면 월 상환금과 총 이자를 계산합니다."
      intro="원리금균등·원금균등 두 가지 상환 방식을 지원하며, 총 이자와 총 상환액까지 한 번에 확인할 수 있어요."
      faqTitle="대출 이자 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 원리금균등상환은 어떻게 계산하나요?",
          a: "A. 매달 같은 금액을 갚는 방식으로, 월 상환금 = 원금 × 월이율 × (1+월이율)^개월수 ÷ ((1+월이율)^개월수 − 1)로 계산합니다. 월이율은 연이율 ÷ 12입니다.",
        },
        {
          q: "Q. 원금균등상환은 무엇이 다른가요?",
          a: "A. 매달 원금을 똑같이 나눠 갚고 이자는 남은 원금에만 붙어 점점 줄어듭니다. 초반 상환금이 크고 뒤로 갈수록 줄며, 총 이자는 원리금균등보다 적습니다.",
        },
        {
          q: "Q. 어떤 방식이 이자가 더 적나요?",
          a: "A. 같은 조건이면 원금균등상환이 총 이자가 더 적습니다. 다만 초기 상환 부담이 크므로 자금 사정에 맞게 선택하세요.",
        },
        {
          q: "Q. 실제 대출과 금액이 다를 수 있나요?",
          a: "A. 이 계산기는 고정금리·거치 없음 기준의 단순 계산입니다. 변동금리, 거치기간, 중도상환수수료, 우대금리 등에 따라 실제 금액은 달라질 수 있습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="대출 상환 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 고정금리·거치 없음 기준의 단순 계산이며, 실제 상품 조건에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="대출 원금 (원)"
        type="text"
        inputMode="numeric"
        value={principalRaw}
        onChange={(e) => setPrincipalRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 30,000,000"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InputBlock
          label="연이율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 5.5"
        />
        <InputBlock
          label="대출 기간 (개월)"
          type="text"
          inputMode="numeric"
          value={monthsRaw}
          onChange={(e) => setMonthsRaw(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="예: 36"
        />
      </div>

      <div className="mt-5 space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">상환 방식</span>
        <div className="grid grid-cols-2 gap-2">
          <LifeChoice active={method === "equalPayment"} onClick={() => setMethod("equalPayment")}>
            원리금균등
          </LifeChoice>
          <LifeChoice active={method === "equalPrincipal"} onClick={() => setMethod("equalPrincipal")}>
            원금균등
          </LifeChoice>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
