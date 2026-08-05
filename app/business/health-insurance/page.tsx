"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";

const HEALTH_RATE = 0.0709;
const CARE_RATE = 0.1295;

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatComma(n: number) { return n === 0 ? "" : Math.round(n).toLocaleString("ko-KR"); }

export default function HealthInsuranceCalculatorPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const monthlyIncome = parseNumber(incomeRaw);
  const result = useMemo(() => {
    const base = Math.max(0, monthlyIncome);
    const premium = Math.round(base * HEALTH_RATE);
    const health = Math.round(premium / 2);
    const employer = premium - health;
    const care = Math.round(premium * CARE_RATE);
    return { base, premium, health, employer, care, total: health + care };
  }, [monthlyIncome]);
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (url) await copyToClipboardSafe(url); };
  const lines: ResultLine[] = [
    { label: "기준보수월액", value: `${result.base.toLocaleString()}원` },
    { label: "건강보험 총 보험료", hint: "(7.09%)", value: `${result.premium.toLocaleString()}원` },
    { label: "건강보험료(근로자)", hint: `(총액 ÷ 2)`, value: `${result.health.toLocaleString()}원` },
    { label: "장기요양보험료", hint: "(건강보험 총액 × 12.95%)", value: `${result.care.toLocaleString()}원` },
    { label: "사업주 부담(건강보험)", hint: `(총액 ÷ 2)`, value: `${result.employer.toLocaleString()}원` },
  ];
  return (
    <CalculatorLayout title="건강보험료 계산기" subtitle="월급으로 건강보험료와 장기요양보험료를 계산합니다." intro="건강보험료율은 7.09%이고, 장기요양보험료는 건강보험료에 장기요양보험료율을 곱해 산정합니다." faqTitle="건강보험료 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 건강보험료는 어떻게 계산하나요?", a: "A. 보수월액 × 건강보험료율을 적용하고 근로자와 사업주가 절반씩 부담합니다." }, { q: "Q. 장기요양보험료는 별도인가요?", a: "A. 네. 건강보험료에 장기요양보험료율을 곱해 추가 계산합니다." }, { q: "Q. 빈값도 되나요?", a: "A. 네. 0원 또는 빈값이면 결과도 0원입니다." }, { q: "Q. 실제 고지액과 다를 수 있나요?", a: "A. 보수월액 산정, 정산, 상하한액에 따라 달라질 수 있습니다." }]} result={<ResultPanel title="계산 결과" lines={lines} total={{ label: "근로자 부담 합계", value: `${result.total.toLocaleString()}원` }} note="* 원 단위 반올림 기준입니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={() => downloadResultCsv({ slug: "health-insurance", title: "건강보험료 계산기", inputs: [{ label: "기준보수월액", value: `${result.base.toLocaleString()}원` }], lines, total: { label: "근로자 부담 합계", value: `${result.total.toLocaleString()}원` } })} />}>
      <InputBlock label="기준보수월액 (원)" type="text" inputMode="numeric" placeholder="예: 4,000,000" value={incomeRaw} onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))} />
    </CalculatorLayout>
  );
}