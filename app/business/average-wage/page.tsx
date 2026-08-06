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

export default function AverageWagePage() {
  const [total, setTotal] = useState("");
  const [days, setDays] = useState("");
  const totalNum = parseNumber(total);
  const daysNum = parseNumber(days);
  const valid = totalNum > 0 && daysNum > 0;
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const result = useMemo(() => {
    if (!valid) return null;
    // 1일 평균임금 = 3개월간 임금총액 ÷ 그 기간의 총 일수(달력일)
    const daily = Math.round(totalNum / daysNum);
    return { daily, monthly: daily * 30 };
  }, [totalNum, daysNum, valid]);

  const resultLines: ResultLine[] = [
    { label: "3개월 임금총액", value: `${totalNum.toLocaleString()}원` },
    { label: "기간 총일수", value: `${daysNum.toLocaleString()}일` },
    { label: "1개월 평균임금(30일)", value: `${(result?.monthly ?? 0).toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = { label: "1일 평균임금", value: `${(result?.daily ?? 0).toLocaleString()}원` };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "average-wage",
      title: "평균임금 계산기",
      inputs: [
        { label: "3개월 임금총액(입력)", value: `${totalNum.toLocaleString()}원` },
        { label: "기간 총일수(입력)", value: `${daysNum.toLocaleString()}일` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="평균임금 계산기"
      subtitle="최근 3개월 임금총액과 기간 일수를 넣으면 1일 평균임금을 계산해 드려요."
      intro="평균임금은 퇴직금·휴업수당·재해보상 등의 기준이 되는 금액입니다."
      faqTitle="평균임금 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 평균임금은 어떻게 계산하나요?", a: "A. 사유 발생일 이전 3개월간 지급된 임금총액을 그 기간의 총 달력일수로 나눕니다. 보통 89~92일이 됩니다." },
        { q: "Q. 임금총액에는 무엇이 들어가나요?", a: "A. 기본급뿐 아니라 정기적으로 지급된 각종 수당, 상여금(3개월분 안분) 등 근로의 대가로 받은 모든 임금이 포함됩니다." },
        { q: "Q. 통상임금과 어떻게 다른가요?", a: "A. 평균임금이 통상임금보다 낮으면 통상임금을 평균임금으로 봅니다(근로기준법 제2조). 평균임금은 실제 받은 금액 기준, 통상임금은 정기·일률적으로 정해진 금액 기준입니다." },
        { q: "Q. 총일수는 며칠로 넣나요?", a: "A. 사유 발생일 직전 3개월의 실제 달력일수를 넣습니다. 예를 들어 90일, 91일, 92일 등 월 구성에 따라 다릅니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 평균임금이 통상임금보다 낮은 경우 통상임금을 평균임금으로 합니다(근로기준법 제2조)."
        />
      }
      guide={<BottomActions onShare={async () => { if (navigator.share) await navigator.share({ title: "평균임금 계산기", url: shareUrl }); else { await copyToClipboardSafe(shareUrl); toast("링크를 복사했어요!"); } }} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "평균임금이란?",
              body: (
                <p>
                  평균임금은 <strong>퇴직금, 휴업수당, 재해보상금, 감급의 제한</strong> 등을 산정할 때 기준이 되는 임금입니다.
                  근로기준법 제2조에 따라 <strong>산정 사유가 발생한 날 이전 3개월 동안 근로자에게 지급된 임금총액</strong>을
                  그 기간의 총 일수로 나누어 1일 평균임금을 구합니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    1일 평균임금 = 3개월간 임금총액 ÷ 그 기간의 총 일수
                  </p>
                  <p>
                    총 일수는 <strong>실제 달력상 일수</strong>로, 월 구성에 따라 보통 89~92일입니다. 임금총액에는 기본급과
                    정기적으로 지급된 수당이 포함되며, 상여금은 <strong>연간 지급액의 3개월분(3/12)</strong>을 더해 계산합니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>이전 3개월 임금총액이 12,000,000원이고 그 기간이 92일인 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>1일 평균임금 = 12,000,000 ÷ 92 = <strong>130,435원</strong></li>
                    <li>예) 퇴직금(1년) = 1일 평균임금 × 30일 × (재직일수 ÷ 365)</li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  출산전후휴가·육아휴직·업무상 부상 등으로 임금이 줄어든 기간은 평균임금 산정 기간에서 <strong>제외</strong>할 수
                  있습니다. 또한 평균임금이 통상임금보다 낮으면 <strong>통상임금을 평균임금으로</strong> 봅니다. 정확한 산정은
                  회사 급여 규정과 고용노동부 기준을 확인하세요.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <div className="space-y-4">
        <InputBlock label="3개월 임금총액 (원)" type="text" placeholder="12,000,000" value={total} onChange={(e) => setTotal(formatComma(parseNumber(e.target.value)))} />
        <InputBlock label="기간 총일수 (일)" type="text" placeholder="92" value={days} onChange={(e) => setDays(formatComma(parseNumber(e.target.value)))} />
      </div>
    </CalculatorLayout>
  );
}
