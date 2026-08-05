"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatComma(n: number) {
  return n === 0 ? "" : Math.round(n).toLocaleString("ko-KR");
}

export default function PensionCalculatorPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const monthlyIncome = parseNumber(incomeRaw);

  const result = useMemo(() => {
    const base = Math.max(0, monthlyIncome);
    const total = Math.round(base * 0.09);
    const employee = Math.round(total / 2);
    const employer = total - employee;
    return { base, total, employee, employer };
  }, [monthlyIncome]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    await copyToClipboardSafe(url);
  };

  const lines: ResultLine[] = [
    { label: "기준소득월액", value: `${result.base.toLocaleString()}원` },
    { label: "국민연금 총 보험료", hint: "(9%)", value: `${result.total.toLocaleString()}원` },
    { label: "근로자 부담", hint: "(1/2)", value: `${result.employee.toLocaleString()}원` },
    { label: "사업주 부담", hint: "(1/2)", value: `${result.employer.toLocaleString()}원` },
  ];

  return (
    <CalculatorLayout
      title="국민연금 계산기"
      subtitle="기준소득월액을 넣으면 국민연금 보험료를 계산합니다."
      intro="국민연금 보험료율은 소득의 9%이며, 근로자와 사업주가 절반씩 부담합니다."
      faqTitle="국민연금 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 9%는 무엇 기준인가요?", a: "A. 국민연금법상 기준소득월액에 적용되는 보험료율입니다." },
        { q: "Q. 근로자와 사업주 부담은 어떻게 나뉘나요?", a: "A. 법상 보험료는 근로자와 사용자가 각각 절반씩 부담합니다." },
        { q: "Q. 0원이나 빈칸도 계산되나요?", a: "A. 네. 0원 또는 빈값이면 각 보험료가 0원으로 표시됩니다." },
        { q: "Q. 실제 급여명세서와 다를 수 있나요?", a: "A. 기준소득월액 적용 방식과 상·하한 적용 여부에 따라 달라질 수 있습니다." },
      ]}
      result={<ResultPanel title="계산 결과" lines={lines} total={{ label: "총 보험료", value: `${result.total.toLocaleString()}원` }} note="* 원 단위 반올림 기준입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={() => downloadResultCsv({ slug: "pension", title: "국민연금 계산기", inputs: [{ label: "기준소득월액", value: `${result.base.toLocaleString()}원` }], lines, total: { label: "총 보험료", value: `${result.total.toLocaleString()}원` } })} />}
    >
      <InputBlock label="기준소득월액 (원)" type="text" inputMode="numeric" placeholder="예: 3,000,000" value={incomeRaw} onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))} />
    </CalculatorLayout>
  );
}