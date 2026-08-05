"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";

const WORKER_RATE = 0.009;
const EMPLOYER_RATE = 0.0115;

function parseNumber(raw: string) { const cleaned = raw.replace(/[^\d.-]/g, ""); return cleaned ? Number(cleaned) : 0; }
function formatComma(n: number) { return n === 0 ? "" : Math.round(n).toLocaleString("ko-KR"); }

export default function EmploymentInsuranceCalculatorPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const monthlyIncome = parseNumber(incomeRaw);
  const result = useMemo(() => {
    const base = Math.max(0, monthlyIncome);
    const worker = Math.round(base * WORKER_RATE);
    const employer = Math.round(base * EMPLOYER_RATE);
    return { base, worker, employer, total: worker + employer };
  }, [monthlyIncome]);
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (url) await copyToClipboardSafe(url); };
  const lines: ResultLine[] = [
    { label: "기준보수월액", value: `${result.base.toLocaleString()}원` },
    { label: "근로자 고용보험료", hint: "(0.9%)", value: `${result.worker.toLocaleString()}원` },
    { label: "사업주 고용보험료", hint: "(1.15%)", value: `${result.employer.toLocaleString()}원` },
  ];
  return <CalculatorLayout title="고용보험료 계산기" subtitle="월급으로 고용보험료를 계산합니다." intro="근로자 부담률은 0.9%, 사업주 부담률은 업종에 따라 달라질 수 있어 일반사업장 기준 1.15%를 적용합니다." faqTitle="고용보험료 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 근로자 부담률은 얼마인가요?", a: "A. 일반적으로 0.9%를 적용합니다." }, { q: "Q. 사업주 부담률은 항상 같나요?", a: "A. 아니요. 업종과 고용안정·직업능력개발사업 부담 여부에 따라 달라질 수 있습니다." }, { q: "Q. 0원도 계산되나요?", a: "A. 네. 0원 또는 빈값이면 0원으로 표시됩니다." }, { q: "Q. 정산과 왜 다를 수 있나요?", a: "A. 월별 상한·정산 방식과 사업장 조건에 따라 달라질 수 있습니다." }]} result={<ResultPanel title="계산 결과" lines={lines} total={{ label: "합계", value: `${result.total.toLocaleString()}원` }} note="* 원 단위 반올림 기준입니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={() => downloadResultCsv({ slug: "employment-insurance", title: "고용보험료 계산기", inputs: [{ label: "기준보수월액", value: `${result.base.toLocaleString()}원` }], lines, total: { label: "합계", value: `${result.total.toLocaleString()}원` } })} />}>
    <InputBlock label="기준보수월액 (원)" type="text" inputMode="numeric" placeholder="예: 3,500,000" value={incomeRaw} onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))} />
  </CalculatorLayout>;
}