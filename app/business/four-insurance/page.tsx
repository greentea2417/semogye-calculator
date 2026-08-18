"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorArticle from "@/components/CalculatorArticle";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

/* 2025년 근로자 부담 요율 */
const RATE_PENSION = 0.045; // 국민연금 4.5%
const RATE_HEALTH = 0.03545; // 건강보험 3.545%
const RATE_CARE = 0.1295; // 장기요양 = 건강보험료 × 12.95%
const RATE_EMPLOYMENT = 0.009; // 고용보험 0.9%

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function FourInsurancePage() {
  const [salaryRaw, setSalaryRaw] = useState("");

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    const pension = Math.round(salary * RATE_PENSION);
    const health = Math.round(salary * RATE_HEALTH);
    const care = Math.round(health * RATE_CARE);
    const employment = Math.round(salary * RATE_EMPLOYMENT);
    const total = pension + health + care + employment;
    const afterInsurance = Math.max(0, salary - total);
    return { salary, pension, health, care, employment, total, afterInsurance };
  }, [salaryRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "4대보험 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "국민연금", hint: "(4.5%)", value: `${result.pension.toLocaleString()}원` },
    { label: "건강보험", hint: "(3.545%)", value: `${result.health.toLocaleString()}원` },
    { label: "장기요양보험", hint: "(건강보험 × 12.95%)", value: `${result.care.toLocaleString()}원` },
    { label: "고용보험", hint: "(0.9%)", value: `${result.employment.toLocaleString()}원` },
  ];
  const resultSubTotal: ResultLine = {
    label: "4대보험 합계 (근로자 부담)",
    value: `${result.total.toLocaleString()}원`,
  };
  const resultTotal: ResultLine = {
    label: "보험 공제 후 급여",
    value: `${result.afterInsurance.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "four-insurance",
      title: "4대보험 계산기",
      inputs: [{ label: "월 급여(세전, 입력)", value: `${result.salary.toLocaleString()}원` }],
      lines: resultLines,
      subTotal: resultSubTotal,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="4대보험 계산기"
      subtitle="월 급여를 넣으면 국민연금·건강·장기요양·고용보험 공제액을 자동으로 나눠줍니다."
      intro="2025년 근로자 부담 요율 기준으로 4대보험료를 항목별로 확인할 수 있어요. 산재보험은 전액 회사 부담이라 근로자 공제에는 포함되지 않으며, 비과세 항목과 보수월액 차이도 함께 이해할 수 있습니다."
      faqTitle="4대보험 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 4대보험 요율은 어떻게 되나요?", a: "A. 근로자 부담 기준으로 국민연금 4.5%, 건강보험 3.545%, 장기요양보험은 건강보험료의 12.95%, 고용보험 0.9%입니다. 건강보험·국민연금은 회사가 같은 금액을 함께 부담합니다." },
        { q: "Q. 산재보험은 왜 빠졌나요?", a: "A. 산재보험은 전액 사업주가 부담하므로 근로자 급여에서 공제되지 않아 이 계산기의 공제 합계에는 포함하지 않았습니다." },
        { q: "Q. 실제 급여명세서와 왜 다를 수 있나요?", a: "A. 비과세 항목(식대 등) 제외 여부, 보수월액 상·하한, 정산분에 따라 실제 공제액은 달라질 수 있습니다. 참고용으로 확인해 주세요." },
        { q: "Q. 소득세도 포함된 금액인가요?", a: "A. 아니요. 이 계산기는 4대보험 공제만 다룹니다. 근로소득세·지방소득세까지 반영한 실수령액은 월급 실수령액 계산기를 이용하세요." },
      ]}
      result={
        <ResultPanel
          title="4대보험 공제 내역"
          lines={resultLines}
          subTotal={resultSubTotal}
          total={resultTotal}
          note="* 2025년 근로자 부담 요율 기준의 단순 계산이며, 비과세 항목·보수월액 상하한·연말정산은 반영되지 않았습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "4대보험이란?",
              body: (
                <>
                  <p>
                    4대보험은 <strong>국민연금·건강보험·고용보험·산재보험</strong>을 말하는, 법으로 가입이 의무화된 사회보험입니다.
                    이 중 근로자 급여에서 매달 공제되는 것은 국민연금·건강보험(+장기요양)·고용보험이며,
                    산재보험은 전액 회사(사업주)가 부담해 근로자 급여에서는 빠지지 않습니다.
                  </p>
                </>
              ),
            },
            {
              heading: "2025년 근로자 부담 요율",
              body: (
                <>
                  <ul className="list-disc space-y-1 pl-5">
                    <li><strong>국민연금</strong> — 보수월액의 4.5% (회사도 4.5% 부담)</li>
                    <li><strong>건강보험</strong> — 보수월액의 3.545% (회사도 동일 부담)</li>
                    <li><strong>장기요양보험</strong> — 건강보험료의 12.95%</li>
                    <li><strong>고용보험</strong> — 보수월액의 0.9%</li>
                  </ul>
                  <p>
                    국민연금과 건강보험은 근로자와 회사가 <strong>절반씩(노사 반반)</strong> 부담하는 구조여서, 실제 보험 재정에는
                    표시된 요율의 2배가 들어갑니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>월 급여(세전) 3,000,000원인 경우 근로자 부담:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>국민연금 = 3,000,000 × 4.5% = 135,000원</li>
                    <li>건강보험 = 3,000,000 × 3.545% = 106,350원</li>
                    <li>장기요양 = 106,350 × 12.95% ≈ 13,772원</li>
                    <li>고용보험 = 3,000,000 × 0.9% = 27,000원</li>
                    <li>합계 ≈ <strong>282,122원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "실제 명세서와 다를 수 있는 이유",
              body: (
                <>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>식대 등 <strong>비과세 항목</strong>은 보수월액에서 제외되어 실제 공제 기준이 낮아질 수 있습니다.</li>
                    <li>국민연금·건강보험에는 <strong>보수월액 상·하한선</strong>이 있어 고소득/저소득 구간에서 달라집니다.</li>
                    <li>매년 요율이 조정되고, 건강보험은 연말·연초에 <strong>정산분</strong>이 추가로 반영됩니다.</li>
                  </ul>
                  <p>
                    소득세·지방소득세까지 반영한 최종 실수령액이 궁금하다면 <strong>월급 실수령액 계산기</strong>를 함께 이용하세요.
                  </p>
                </>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock
        label="월 급여 (세전)"
        type="text"
        inputMode="numeric"
        value={salaryRaw}
        onChange={(e) => setSalaryRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 3,000,000"
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
