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

export default function RetirementClient() {
  const [wage3mRaw, setWage3mRaw] = useState("");
  const [days3mRaw, setDays3mRaw] = useState("92");
  const [serviceDaysRaw, setServiceDaysRaw] = useState("");

  const result = useMemo(() => {
    const wage3m = parseNumber(wage3mRaw);
    const days3m = parseNumber(days3mRaw);
    const serviceDays = parseNumber(serviceDaysRaw);

    const eligible = serviceDays >= 365;
    const avgDailyWage = days3m > 0 ? wage3m / days3m : 0;
    const retirementPay = eligible ? Math.round(avgDailyWage * 30 * (serviceDays / 365)) : 0;

    return { eligible, serviceDays, avgDailyWage: Math.round(avgDailyWage), retirementPay };
  }, [wage3mRaw, days3mRaw, serviceDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "퇴직금 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "평균 1일 임금", value: `${result.avgDailyWage.toLocaleString()}원` },
            { label: "총 재직일수", value: `${result.serviceDays.toLocaleString()}일` },
            { label: "지급 대상 여부", value: result.eligible ? "대상" : "대상 아님(1년 미만)" },
          ];
  const resultTotal: ResultLine = { label: "예상 퇴직금", value: `${result.retirementPay.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "retirement",
      title: "퇴직금 계산기",
      inputs: [
        { label: "최근 3개월 임금 총액(입력)", value: `${parseNumber(wage3mRaw).toLocaleString()}원` },
        { label: "3개월 총일수(입력)", value: `${parseNumber(days3mRaw).toLocaleString()}일` },
        { label: "총 재직일수(입력)", value: `${parseNumber(serviceDaysRaw).toLocaleString()}일` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="퇴직금 계산기"
      subtitle="최근 3개월 평균임금과 재직일수를 바탕으로 예상 퇴직금을 계산합니다."
      intro="근로자퇴직급여보장법의 기본 산식(평균임금 × 30일 × 재직일수 ÷ 365)을 기준으로 한 간이 계산입니다."
      faqTitle="퇴직금 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 퇴직금은 누가 받을 수 있나요?", a: "A. 일반적으로 1년(365일) 이상 계속 근로한 뒤 퇴직한 근로자가 지급 대상이 됩니다." },
        { q: "Q. 평균임금은 어떻게 구하나요?", a: "A. 퇴직일 이전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눠 1일 평균임금을 구합니다." },
        { q: "Q. 상여금이나 수당도 포함되나요?", a: "A. 지급 관행과 산정 기준에 따라 일부 수당이 평균임금에 포함될 수 있어, 실제 금액은 회사 규정 확인이 필요합니다." },
        { q: "Q. 왜 실제 지급액과 다를 수 있나요?", a: "A. 통상임금 비교, 휴업·무급 기간, 퇴직 직전 임금 변동 등에 따라 최종 금액이 달라질 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 퇴직금 = 평균임금 × 30일 × (총 재직일수 ÷ 365). 수당 포함 여부와 산정 기간에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="최근 3개월 총임금"
        type="text"
        inputMode="numeric"
        value={wage3mRaw}
        onChange={(e) => setWage3mRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 9,000,000"
      />
      <InputBlock
        label="최근 3개월 총일수"
        type="text"
        inputMode="numeric"
        value={days3mRaw}
        onChange={(e) => setDays3mRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 92"
      />
      <InputBlock
        label="총 재직일수"
        type="text"
        inputMode="numeric"
        value={serviceDaysRaw}
        onChange={(e) => setServiceDaysRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 1,095"
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
