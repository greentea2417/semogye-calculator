"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function UnemploymentClient() {
  const [avgWageRaw, setAvgWageRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");
  const [daysRaw, setDaysRaw] = useState("120");

  const result = useMemo(() => {
    const avgWage = parseNumber(avgWageRaw);
    const months = parseNumber(monthsRaw);
    const days = parseNumber(daysRaw);

    const eligible = months >= 6;
    const dailyBenefit = eligible ? Math.min(Math.max(Math.round(avgWage * 0.6), 0), 66666) : 0;
    const totalBenefit = eligible ? dailyBenefit * days : 0;

    return { eligible, dailyBenefit, totalBenefit, days };
  }, [avgWageRaw, monthsRaw, daysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "실업급여 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "수급 자격(가입기간 기준)", value: result.eligible ? "검토 가능" : "요건 부족" },
            { label: "1일 예상 실업급여", value: `${result.dailyBenefit.toLocaleString()}원` },
            { label: "예상 수급일수", value: `${result.days.toLocaleString()}일` },
          ];
  const resultTotal: ResultLine = { label: "총 예상 수급액", value: `${result.totalBenefit.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "unemployment",
      title: "실업급여 계산기",
      inputs: [
        { label: "평균 1일 임금(입력)", value: `${parseNumber(avgWageRaw).toLocaleString()}원` },
        { label: "고용보험 가입기간(입력)", value: `${parseNumber(monthsRaw).toLocaleString()}개월` },
        { label: "예상 수급일수(입력)", value: `${parseNumber(daysRaw).toLocaleString()}일` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="실업급여 계산기"
      subtitle="평균임금과 수급 가능 일수를 바탕으로 예상 실업급여를 계산합니다."
      intro="고용보험 실업급여(구직급여)의 기본 산식인 평균임금의 60%(상한 적용)를 기준으로 한 간이 계산입니다."
      faqTitle="실업급여 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 실업급여는 누구나 받을 수 있나요?", a: "A. 고용보험 가입 이력(보통 180일 이상), 비자발적 이직 사유, 재취업 노력 등 요건을 충족해야 합니다." },
        { q: "Q. 1일 실업급여는 어떻게 계산되나요?", a: "A. 평균 1일 임금의 60%를 기준으로 하되 법정 상한액과 하한액이 적용됩니다." },
        { q: "Q. 수급일수는 어떻게 정해지나요?", a: "A. 고용보험 가입기간과 연령에 따라 120일에서 270일 사이로 결정됩니다." },
        { q: "Q. 왜 실제 지급액과 다를 수 있나요?", a: "A. 상·하한액 변동, 이직 사유, 연령, 가입기간 구간에 따라 실제 금액이 달라질 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 평균임금 60%(상한 적용) 기준의 추정치입니다. 실제 수급 여부·금액은 고용보험 공식 안내를 확인하세요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="평균 1일 임금"
        type="text"
        inputMode="numeric"
        value={avgWageRaw}
        onChange={(e) => setAvgWageRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 100,000"
      />
      <InputBlock
        label="고용보험 가입 개월 수"
        type="text"
        inputMode="numeric"
        value={monthsRaw}
        onChange={(e) => setMonthsRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 18"
      />
      <InputBlock
        label="예상 수급일수"
        type="text"
        inputMode="numeric"
        value={daysRaw}
        onChange={(e) => setDaysRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 150"
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
