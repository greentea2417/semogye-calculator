"use client";

import { useMemo, useState } from "react";
import InputBlock from "../components/InputBlock";
import BottomActions from "../components/BottomActions";
import CalculatorLayout from "../components/CalculatorLayout";
import CalculatorArticle from "../components/CalculatorArticle";
import ResultPanel, { type ResultLine } from "../components/ResultPanel";
import { downloadResultCsv } from "../components/lib/resultCsv";
import { copyToClipboardSafe } from "../components/lib/shareUtils";
import { toast } from "../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function SalaryClient() {
  const [salaryRaw, setSalaryRaw] = useState("");
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState("1");
  const [child20, setChild20] = useState("0");
  const [nonTaxRaw, setNonTaxRaw] = useState("");

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    const nonTax = parseNumber(nonTaxRaw);
    const base = Math.max(0, salary - nonTax);
    const pension = insured === "yes" ? Math.round(base * 0.045) : 0;
    const health = insured === "yes" ? Math.round(base * 0.03545) : 0;
    const care = insured === "yes" ? Math.round(health * 0.1295) : 0;
    const employment = insured === "yes" ? Math.round(base * 0.009) : 0;
    const incomeTax = Math.round(base * 0.025);
    const residentTax = Math.round(incomeTax * 0.1);
    const totalDeduction = pension + health + care + employment + incomeTax + residentTax;
    const takeHome = Math.max(0, base - totalDeduction);
    return { pension, health, care, employment, incomeTax, residentTax, totalDeduction, takeHome };
  }, [salaryRaw, insured, nonTaxRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "월급 실수령액 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "국민연금", value: `${result.pension.toLocaleString()}원` },
            { label: "건강보험", value: `${result.health.toLocaleString()}원` },
            { label: "장기요양보험", value: `${result.care.toLocaleString()}원` },
            { label: "고용보험", value: `${result.employment.toLocaleString()}원` },
            { label: "소득세", value: `${result.incomeTax.toLocaleString()}원` },
            { label: "지방소득세", value: `${result.residentTax.toLocaleString()}원` },
          ];
  const resultSubTotal: ResultLine = { label: "총 공제액", value: `${result.totalDeduction.toLocaleString()}원` };
  const resultTotal: ResultLine = { label: "월 실수령액", value: `${result.takeHome.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "salary",
      title: "월급 실수령액 계산기",
      inputs: [
        { label: "세전 월급(입력)", value: `${parseNumber(salaryRaw).toLocaleString()}원` },
        { label: "4대보험 가입(입력)", value: insured === "yes" ? "가입" : "미가입" },
        { label: "부양가족 수(입력)", value: `${dependents}명` },
        { label: "20세 이하 자녀 수(입력)", value: `${child20}명` },
        { label: "비과세액(입력)", value: `${parseNumber(nonTaxRaw).toLocaleString()}원` },
      ],
      lines: resultLines,
      subTotal: resultSubTotal,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="월급 실수령액 계산기"
      subtitle="세전 월급 기준으로 실제 받는 금액을 계산합니다."
      intro="4대보험 가입 여부와 비과세 식대 등을 반영해 월 실수령액을 빠르게 확인해보세요."
      faqTitle="월급 실수령액 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 4대보험 가입 여부에 따라 왜 금액이 달라지나요?", a: "A. 국민연금·건강보험·장기요양·고용보험 공제가 빠지거나 붙기 때문에 실수령액이 달라집니다." },
        { q: "Q. 비과세 식대는 무엇인가요?", a: "A. 급여 중 세금과 보험료가 붙지 않는 식대 항목입니다. 비과세 금액을 뺀 나머지가 공제 기준이 됩니다." },
        { q: "Q. 이 결과를 그대로 급여명세서로 써도 되나요?", a: "A. 참고용 계산이며 실제 명세서는 회사 규정과 그해 세법·요율 기준을 따릅니다." },
        { q: "Q. 부양가족 수는 왜 입력하나요?", a: "A. 실제 근로소득 간이세액표에서는 부양가족 수에 따라 소득세가 달라집니다. 이 계산기는 간이 추정 기준입니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          subTotal={resultSubTotal}
          total={resultTotal}
          note="* 간이 추정치이며, 부양가족 수·비과세 항목·회사 규정에 따라 실제 명세서와 차이가 날 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "실수령액이란?",
              body: (
                <>
                  <p>
                    실수령액은 세전 월급(계약상 급여)에서 <strong>4대보험료와 근로소득세·지방소득세를 공제한 뒤 실제 통장에
                    입금되는 금액</strong>입니다. 흔히 말하는 "세후 월급"이 바로 이 실수령액으로, 같은 연봉이라도 부양가족 수와
                    비과세 항목에 따라 실수령액이 달라집니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p>이 계산기는 다음 순서로 계산합니다.</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>세전 월급에서 <strong>비과세 식대</strong> 등을 빼 과세 기준액을 구합니다.</li>
                    <li>과세 기준액에 4대보험 요율(국민연금 4.5%, 건강보험 3.545%, 장기요양 = 건강보험 × 12.95%, 고용보험 0.9%)을 적용합니다.</li>
                    <li>근로소득세와 지방소득세(소득세의 10%)를 공제합니다.</li>
                    <li>세전 월급에서 위 공제액 합계를 빼면 <strong>월 실수령액</strong>이 됩니다.</li>
                  </ol>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>세전 월급 3,000,000원, 4대보험 가입, 비과세 없음인 경우 대략:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>국민연금 135,000 + 건강 106,350 + 장기요양 약 13,772 + 고용 27,000원</li>
                    <li>소득세·지방소득세 약간 공제</li>
                    <li>총 공제 약 30만 원대 → 실수령액 약 <strong>265만~270만 원</strong> 수준</li>
                  </ul>
                  <p>비과세 식대 20만 원을 반영하면 공제 기준이 낮아져 실수령액이 조금 더 올라갑니다.</p>
                </>
              ),
            },
            {
              heading: "법적 근거와 주의사항",
              body: (
                <>
                  <p>
                    4대보험 공제는 국민연금법·국민건강보험법·고용보험법에, 근로소득세는 <strong>소득세법의 근로소득 간이세액표</strong>에
                    근거합니다. 다만 아래 이유로 실제 급여명세서와 차이가 날 수 있습니다.
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>간이세액표의 소득세는 <strong>부양가족 수·자녀 수</strong>에 따라 달라지며, 이 계산기는 간이 추정값을 사용합니다.</li>
                    <li>연말정산에서 1년치 세액이 다시 정산됩니다.</li>
                    <li>보수월액 상·하한, 회사별 수당·공제 규정에 따라 금액이 달라질 수 있습니다.</li>
                  </ul>
                  <p>정확한 금액은 회사 급여 규정과 그해 세법·요율 기준을 확인해 주세요.</p>
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

      <div className="mt-4">
        <label className="input-label">4대보험 가입 여부</label>
        <select
          className="input-field mt-1 w-full"
          value={insured}
          onChange={(e) => setInsured(e.target.value as "yes" | "no")}
        >
          <option value="yes">4대보험 가입</option>
          <option value="no">4대보험 미가입</option>
        </select>
      </div>

      <div className="mt-4 space-y-4">
        <InputBlock
          label="부양가족 수 (본인 포함)"
          type="text"
          inputMode="numeric"
          value={dependents}
          onChange={(e) => setDependents(e.target.value.replace(/[^\d]/g, ""))}
        />
        <InputBlock
          label="20세 이하 자녀 수"
          type="text"
          inputMode="numeric"
          value={child20}
          onChange={(e) => setChild20(e.target.value.replace(/[^\d]/g, ""))}
        />
        <InputBlock
          label="비과세 식대"
          type="text"
          inputMode="numeric"
          value={nonTaxRaw}
          onChange={(e) => setNonTaxRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="0"
        />
      </div>

      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
