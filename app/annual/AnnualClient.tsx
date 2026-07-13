"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import CalculatorLayout from "@/components/CalculatorLayout";
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
    >
      <InputBlock label="1일 통상임금(또는 평균임금)" type="text" value={dailyWageRaw} onChange={(e: any) => setDailyWageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000" />
      <InputBlock label="미사용 연차일수" type="text" value={unusedDaysRaw} onChange={(e: any) => setUnusedDaysRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 8" />
    </CalculatorLayout>
  );
}
