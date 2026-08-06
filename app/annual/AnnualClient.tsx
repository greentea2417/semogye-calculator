"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorArticle from "@/components/CalculatorArticle";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import BottomActions from "@/components/BottomActions";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function AnnualClient() {
  const [dailyWageRaw, setDailyWageRaw] = useState("");
  const [unusedDaysRaw, setUnusedDaysRaw] = useState("");

  const result = useMemo(() => {
    const dailyWage = parseNumber(dailyWageRaw);
    const unusedDays = parseNumber(unusedDaysRaw);
    const allowance = Math.round(dailyWage * unusedDays);
    return { dailyWage, unusedDays, allowance };
  }, [dailyWageRaw, unusedDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연차수당 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "1일 임금", value: `${result.dailyWage.toLocaleString()}원` },
            { label: "미사용 연차일수", value: `${result.unusedDays.toLocaleString()}일` },
          ];
  const resultTotal: ResultLine = { label: "예상 연차수당", value: `${result.allowance.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "annual",
      title: "연차수당 계산기",
      inputs: [
        { label: "1일 임금(입력)", value: `${result.dailyWage.toLocaleString()}원` },
        { label: "미사용 연차일수(입력)", value: `${result.unusedDays.toLocaleString()}일` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="연차수당 계산기"
      subtitle="미사용 연차일수와 1일 임금을 바탕으로 예상 연차수당을 계산합니다."
      intro="근로기준법 기준을 참고한 간이 계산입니다."
      faqTitle="연차수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 통상임금과 평균임금 중 무엇을 쓰나요?", a: "A. 회사 규정과 근로조건에 따라 다를 수 있지만, 연차수당은 통상임금 기준으로 보는 경우가 많습니다." },
        { q: "Q. 미사용 연차는 어떻게 계산하나요?", a: "A. 발생한 연차에서 사용한 연차를 뺀 나머지 일수입니다." },
        { q: "Q. 실제 지급액과 차이가 날 수 있나요?", a: "A. 네. 회사 규정, 임금 산정 방식, 연차 소멸·이월 기준 등에 따라 달라질 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 연차수당 = 1일 임금 × 미사용 연차일수. 회사 규정·통상임금 산정 방식에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "연차수당이란?",
              body: (
                <p>
                  연차수당은 <strong>발생한 연차유급휴가를 사용하지 못하고 남겼을 때</strong>, 그 미사용 일수만큼 임금으로
                  보상받는 수당입니다. 연차는 근로자의 휴식권을 위해 부여되는 유급휴가이므로, 쓰지 못한 연차는 금전으로
                  청구할 수 있습니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    연차수당 = 1일 통상임금 × 미사용 연차일수
                  </p>
                  <p>
                    1일 통상임금은 보통 <strong>월 통상임금 ÷ 월 소정근로시간(약 209시간) × 1일 소정근로시간(8시간)</strong>으로
                    구합니다. 미사용 연차일수는 발생한 연차에서 실제 사용한 연차를 뺀 값입니다.
                  </p>
                </>
              ),
            },
            {
              heading: "연차 발생 기준 (근로기준법 제60조)",
              body: (
                <>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>입사 1년 미만: 1개월 개근 시 1일씩, 최대 11일 발생</li>
                    <li>1년 이상 근속(80% 이상 출근): 15일 발생</li>
                    <li>3년 이상부터 2년마다 1일씩 가산, 최대 25일 한도</li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  연차수당은 통상임금 기준으로 계산하는 경우가 많지만, 회사 규정과 임금 산정 방식에 따라 달라질 수 있습니다.
                  또한 연차 소멸·이월 기준, 회계연도 기준 부여 여부에 따라 실제 지급액이 달라지므로 취업규칙과 근로계약을
                  함께 확인하세요. 본 계산기는 참고용 추정치입니다.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock label="1일 통상임금(또는 평균임금)" type="text" value={dailyWageRaw} onChange={(e: any) => setDailyWageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000" />
      <InputBlock label="미사용 연차일수" type="text" value={unusedDaysRaw} onChange={(e: any) => setUnusedDaysRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 8" />
    </CalculatorLayout>
  );
}
