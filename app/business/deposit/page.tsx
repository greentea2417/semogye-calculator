"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import CalculatorArticle from "@/components/CalculatorArticle";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

const TAX_RATE = 0.154; // 이자소득세 15.4% (소득세 14% + 지방소득세 1.4%)

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

export default function DepositPage() {
  const [principalRaw, setPrincipalRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");

  const result = useMemo(() => {
    const principal = parseNumber(principalRaw);
    const annualRate = parseDecimal(rateRaw) / 100;
    const months = parseNumber(monthsRaw);

    // 정기예금(단리) 세전 이자 = 원금 × 연이율 × (개월 ÷ 12)
    const pretaxInterest = Math.round(principal * annualRate * (months / 12));
    const tax = Math.round(pretaxInterest * TAX_RATE);
    const afterTaxInterest = pretaxInterest - tax;
    const total = principal + afterTaxInterest;
    return { principal, pretaxInterest, tax, afterTaxInterest, total };
  }, [principalRaw, rateRaw, monthsRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "예금 이자 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "예치 원금", value: `${result.principal.toLocaleString()}원` },
    { label: "세전 이자", value: `${result.pretaxInterest.toLocaleString()}원` },
    { label: "이자소득세", hint: "(15.4%)", value: `${result.tax.toLocaleString()}원` },
    { label: "세후 이자", value: `${result.afterTaxInterest.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "세후 만기 수령액",
    value: `${result.total.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "deposit",
      title: "예금 이자 계산기",
      inputs: [
        { label: "예치 원금(입력)", value: `${result.principal.toLocaleString()}원` },
        { label: "연이율(입력)", value: `${parseDecimal(rateRaw)}%` },
        { label: "예치 기간(입력)", value: `${parseNumber(monthsRaw)}개월` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="예금 이자 계산기 | 세모계"
      subtitle="목돈을 한 번에 맡기는 정기예금(단리)의 세후 만기 수령액을 계산합니다."
      intro="예치 금액과 연이율, 기간을 넣으면 세전 이자와 이자소득세 15.4%를 뗀 세후 수령액을 바로 확인할 수 있어요."
      faqTitle="예금 이자 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 예금 이자는 어떻게 계산되나요?",
          a: "A. 정기예금(단리) 세전 이자 = 예치 원금 × 연이율 × (개월수 ÷ 12)로 계산합니다. 예금은 목돈을 처음부터 전액 예치하므로 원금 전체에 이율이 붙습니다.",
        },
        {
          q: "Q. 이자소득세 15.4%는 무엇인가요?",
          a: "A. 이자에는 소득세 14% + 지방소득세 1.4% = 15.4%가 원천징수됩니다. 세전 이자에서 이 세금을 뗀 금액이 실제로 받는 세후 이자입니다.",
        },
        {
          q: "Q. 적금과 무엇이 다른가요?",
          a: "A. 예금은 목돈을 한 번에 맡기고, 적금은 매달 나눠 납입합니다. 같은 이율이라도 적금은 나중에 넣은 돈의 예치 기간이 짧아 이자가 예금보다 적습니다. 매달 납입이라면 적금 이자 계산기를 이용하세요.",
        },
        {
          q: "Q. 복리 예금은 어떻게 계산하나요?",
          a: "A. 이 계산기는 단리 기준입니다. 이자에 이자가 붙는 복리로 굴리는 경우에는 복리 계산기를 이용하시면 됩니다.",
        },
        {
          q: "Q. 빈칸은 어떻게 처리하나요?",
          a: "A. 빈칸은 0으로 처리하며, 원금·이율·기간 중 하나라도 0이면 이자는 0원으로 계산됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="예금 만기 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 정기예금(단리)·이자소득세 15.4% 기준의 단순 계산이며, 상품의 우대금리·비과세·과세유형에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "정기예금 이자란?",
              body: (
                <p>
                  정기예금은 <strong>목돈을 한 번에 맡기고</strong> 약정 기간 뒤 원금과 이자를 받는 상품입니다. 처음부터
                  원금 전체가 예치되므로 원금 전액에 이율이 붙습니다. 이 계산기는 단리(이자에 이자가 붙지 않는 방식)를
                  기준으로 세전 이자와 세후 수령액을 보여줍니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    세전 이자 = 예치 원금 × 연이율 × (개월수 ÷ 12)
                    <br />
                    이자소득세 = 세전 이자 × 15.4%
                    <br />
                    세후 만기 수령액 = 원금 + (세전 이자 − 이자소득세)
                  </p>
                  <p>
                    이자소득세 15.4%는 소득세 14%와 지방소득세 1.4%를 합한 값으로, 이자에서 원천징수됩니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>3,000만원을 연 4%로 12개월 예치한 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>세전 이자 = 30,000,000 × 4% × (12 ÷ 12) = 1,200,000원</li>
                    <li>이자소득세 = 1,200,000 × 15.4% = 184,800원</li>
                    <li>세후 만기 수령액 = 30,000,000 + (1,200,000 − 184,800) = <strong>31,015,200원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  본 계산은 <strong>단리·이자소득세 15.4%</strong> 기준입니다. 상품의 우대금리, 비과세·세금우대 계좌,
                  복리 적용 여부에 따라 실제 수령액은 달라질 수 있습니다. 매달 나눠 넣는 상품이라면 적금 이자 계산기,
                  이자에 이자가 붙는 방식이라면 복리 계산기를 이용하세요.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock
        label="예치 원금 (원)"
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
          placeholder="예: 4"
        />
        <InputBlock
          label="예치 기간 (개월)"
          type="text"
          inputMode="numeric"
          value={monthsRaw}
          onChange={(e) => setMonthsRaw(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="예: 12"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
