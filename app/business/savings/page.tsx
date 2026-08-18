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

export default function SavingsPage() {
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");

  const result = useMemo(() => {
    const monthly = parseNumber(monthlyRaw);
    const annualRate = parseDecimal(rateRaw) / 100;
    const n = parseNumber(monthsRaw);

    const principal = monthly * n; // 총 납입 원금
    // 정기적금(단리) 세전 이자 = 월납입액 × (연이율/12) × (n(n+1)/2)
    const pretaxInterest = n > 0 ? Math.round(monthly * (annualRate / 12) * ((n * (n + 1)) / 2)) : 0;
    const tax = Math.round(pretaxInterest * TAX_RATE);
    const afterTax = principal + pretaxInterest - tax;
    return { principal, pretaxInterest, tax, afterTax };
  }, [monthlyRaw, rateRaw, monthsRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "적금 이자 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "총 납입 원금", value: `${result.principal.toLocaleString()}원` },
    { label: "세전 이자", value: `${result.pretaxInterest.toLocaleString()}원` },
    { label: "이자소득세", hint: "(15.4%)", value: `${result.tax.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "세후 만기 수령액",
    value: `${result.afterTax.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "savings",
      title: "적금 이자 계산기",
      inputs: [
        { label: "월 납입액(입력)", value: `${parseNumber(monthlyRaw).toLocaleString()}원` },
        { label: "연이율(입력)", value: `${parseDecimal(rateRaw)}%` },
        { label: "가입 기간(입력)", value: `${parseNumber(monthsRaw)}개월` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="적금 이자 계산기 | 세모계"
      subtitle="매달 납입액과 이율, 기간을 넣으면 정기적금 만기 수령액을 계산합니다."
      intro="정기적금(단리) 기준으로 세전 이자와 이자소득세 15.4%를 뗀 세후 만기 수령액을 확인할 수 있어요."
      faqTitle="적금 이자 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 적금 이자는 어떻게 계산되나요?",
          a: "A. 정기적금(단리) 세전 이자 = 월 납입액 × (연이율 ÷ 12) × (개월수 × (개월수 + 1) ÷ 2)로 계산합니다. 먼저 넣은 돈일수록 더 오래 이자가 붙기 때문입니다.",
        },
        {
          q: "Q. 왜 연이율을 그대로 곱하지 않나요?",
          a: "A. 적금은 매달 조금씩 넣기 때문에 전체 원금이 처음부터 예치된 게 아닙니다. 그래서 원금 전체에 연이율을 곱한 값보다 이자가 적습니다.",
        },
        {
          q: "Q. 이자소득세는 얼마인가요?",
          a: "A. 이자에는 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수됩니다. 이 계산기는 세금을 뗀 세후 수령액을 함께 보여줍니다.",
        },
        {
          q: "Q. 예금과는 무엇이 다른가요?",
          a: "A. 예금은 목돈을 한 번에 예치하고, 적금은 매달 나눠 납입합니다. 목돈을 굴리는 복리 계산이 필요하면 복리 계산기를 이용하세요.",
        },
      ]}
      result={
        <ResultPanel
          title="적금 만기 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 정기적금(단리)·이자소득세 15.4% 기준의 단순 계산이며, 상품의 우대금리·비과세·과세유형에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "정기적금 이자란?",
              body: (
                <p>
                  정기적금은 <strong>매달 일정 금액을 나눠 납입</strong>하고 만기에 원금과 이자를 받는 상품입니다. 예금과
                  달리 전체 원금이 처음부터 예치된 게 아니라, 먼저 넣은 돈일수록 이자가 붙는 기간이 길어집니다. 그래서
                  같은 이율이라도 적금 이자는 예금보다 적습니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    세전 이자 = 월 납입액 × (연이율 ÷ 12) × (n × (n+1) ÷ 2)
                    <br />
                    이자소득세 = 세전 이자 × 15.4%
                    <br />
                    세후 만기 수령액 = 총 납입 원금 + (세전 이자 − 이자소득세)
                  </p>
                  <p>
                    여기서 n은 납입 개월수입니다. n(n+1)/2는 각 회차 납입금이 만기까지 예치되는 개월수의 합으로, 먼저
                    넣은 돈에 이자가 더 오래 붙는 구조를 반영합니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>매달 30만원씩 연 3.5%로 12개월 납입한 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>총 납입 원금 = 300,000 × 12 = 3,600,000원</li>
                    <li>세전 이자 = 300,000 × (3.5% ÷ 12) × (12 × 13 ÷ 2) = 68,250원</li>
                    <li>이자소득세 = 68,250 × 15.4% ≈ 10,511원</li>
                    <li>세후 만기 수령액 ≈ <strong>3,657,739원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  본 계산은 <strong>단리·이자소득세 15.4%</strong> 기준입니다. 상품의 우대금리, 비과세·세금우대,
                  자유적립식 여부에 따라 실제 수령액은 달라질 수 있습니다. 목돈을 한 번에 맡기는 경우에는 예금 이자
                  계산기, 이자에 이자가 붙는 방식은 복리 계산기를 이용하세요.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock
        label="월 납입액 (원)"
        type="text"
        inputMode="numeric"
        value={monthlyRaw}
        onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 300,000"
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
          label="가입 기간 (개월)"
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
