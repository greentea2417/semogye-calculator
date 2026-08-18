"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import CalculatorArticle from "../../components/CalculatorArticle";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function DailyWagePage() {
  const [dayPay, setDayPay] = useState("");
  const [days, setDays] = useState("");
  const dayPayNum = parseNumber(dayPay);
  const daysNum = parseNumber(days);
  const valid = dayPayNum > 0 && daysNum > 0;
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const result = useMemo(() => {
    if (!valid) return null;
    // 일용직 원천징수: 1일 근로소득공제 15만원, 세율 6%, 근로소득세액공제 55%
    const base = Math.max(dayPayNum - 150000, 0);
    let incomeTaxDay = Math.round(base * 0.06 * 0.45); // = base × 2.7%
    if (incomeTaxDay < 1000) incomeTaxDay = 0; // 소액부징수(1일 1,000원 미만)
    const localTaxDay = Math.round(incomeTaxDay * 0.1);
    const taxDay = incomeTaxDay + localTaxDay;
    const gross = dayPayNum * daysNum;
    const incomeTax = incomeTaxDay * daysNum;
    const localTax = localTaxDay * daysNum;
    const tax = taxDay * daysNum;
    return { gross, incomeTax, localTax, tax, net: gross - tax };
  }, [dayPayNum, daysNum, valid]);

  const resultLines: ResultLine[] = [
    { label: "총 급여(세전)", value: `${(result?.gross ?? 0).toLocaleString()}원` },
    { label: "소득세", value: `${(result?.incomeTax ?? 0).toLocaleString()}원` },
    { label: "지방소득세", value: `${(result?.localTax ?? 0).toLocaleString()}원` },
  ];
  const resultSubTotal: ResultLine = { label: "총 원천징수 세금", value: `${(result?.tax ?? 0).toLocaleString()}원` };
  const resultTotal: ResultLine = { label: "실수령액(예상)", value: `${(result?.net ?? 0).toLocaleString()}원` };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "daily-wage",
      title: "일용직 급여 계산기",
      inputs: [
        { label: "일당(입력)", value: `${dayPayNum.toLocaleString()}원` },
        { label: "근무일수(입력)", value: `${daysNum.toLocaleString()}일` },
      ],
      lines: resultLines,
      subTotal: resultSubTotal,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="일용직 급여 계산기"
      subtitle="일당과 근무일수를 넣으면 일용근로 원천징수 세금과 실수령액을 계산해 드려요."
      intro="일용직 급여를 하루 단위로 빠르게 계산합니다. 1일 15만원 공제와 소액부징수 규칙을 함께 반영해 실수령액을 확인할 수 있습니다."
      faqTitle="일용직 급여 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 일용직 세금은 어떻게 계산하나요?", a: "A. (일당 − 15만원) × 6% × 45% 로 하루 소득세를 구하고, 지방소득세 10%를 더합니다. 일당 15만원 이하는 세금이 없습니다." },
        { q: "Q. 소액부징수가 무엇인가요?", a: "A. 하루 소득세가 1,000원 미만이면 원천징수하지 않습니다. 일당이 약 16만9천원 이하이면 소득세가 0원이 됩니다." },
        { q: "Q. 4대보험은 반영되나요?", a: "A. 이 계산기는 소득세·지방소득세 원천징수만 계산합니다. 일용직도 조건에 따라 고용·산재보험 등이 적용될 수 있어 실제 공제와 다를 수 있습니다." },
        { q: "Q. 15만원 공제는 왜 하나요?", a: "A. 일용근로소득은 1일 15만원의 근로소득공제가 적용되기 때문입니다(소득세법 제47조)." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          subTotal={resultSubTotal}
          total={resultTotal}
          note="* 일용근로소득 원천징수 기준의 추정치이며, 4대보험·회사 규정에 따라 실제 지급액과 차이가 있을 수 있습니다."
        />
      }
      guide={<BottomActions onShare={async () => { if (navigator.share) await navigator.share({ title: "일용직 급여 계산기", url: shareUrl }); else { await copyToClipboardSafe(shareUrl); toast("링크를 복사했어요!"); } }} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "일용직 급여란?",
              body: (
                <p>
                  일용직(일용근로자) 급여는 <strong>하루 단위로 지급되는 임금</strong>으로, 근무한 날마다 정산합니다.
                  일용근로소득은 일반 근로소득과 달리 <strong>하루 단위로 원천징수가 완결</strong>되어, 다음 해 연말정산이나
                  종합소득세 신고 대상에 포함되지 않는 <strong>분리과세 소득</strong>입니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    1일 소득세 = (일당 − 150,000) × 6% × 45%<br />
                    1일 지방소득세 = 소득세 × 10%
                  </p>
                  <p>
                    일용근로소득은 1일 <strong>15만원의 근로소득공제</strong>를 적용하고, 세율 6%로 산출세액을 구한 뒤
                    <strong> 근로소득세액공제 55%</strong>를 빼줍니다. 결과적으로 (일당 − 15만원)의 약 2.7%가 소득세가 됩니다.
                    하루 소득세가 1,000원 미만이면 <strong>소액부징수</strong>로 징수하지 않습니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>일당 200,000원으로 10일 근무한 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>1일 소득세 = (200,000 − 150,000) × 6% × 45% = 1,350원</li>
                    <li>1일 지방소득세 = 1,350 × 10% = 135원</li>
                    <li>10일 총 세금 = (1,350 + 135) × 10 = 14,850원</li>
                    <li>실수령액 = 2,000,000 − 14,850 = <strong>1,985,150원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  본 계산기는 <strong>일용근로소득 원천징수</strong> 기준의 추정치입니다. 3개월(건설업은 1년)을 초과해 계속
                  근로하면 일반 근로자로 분류되어 세금 계산이 달라지며, 4대보험 가입 여부와 사업장 규정에 따라 실제 실수령액은
                  달라질 수 있습니다. 정확한 금액은 회사 급여 담당자나 세무 전문가에게 확인하세요.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <div className="space-y-4">
        <InputBlock label="일당 (원)" type="text" placeholder="200,000" value={dayPay} onChange={(e) => setDayPay(formatComma(parseNumber(e.target.value)))} />
        <InputBlock label="근무일수 (일)" type="text" placeholder="10" value={days} onChange={(e) => setDays(formatComma(parseNumber(e.target.value)))} />
      </div>
    </CalculatorLayout>
  );
}
