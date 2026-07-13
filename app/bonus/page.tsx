"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { calculateSalary } from "@/utils/salaryCalculators";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";
import { copyToClipboardSafe } from "../components/lib/shareUtils";
import { toast } from "../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}
function toDigitsOrEmpty(v: unknown) {
  return String(v ?? "").replace(/[^\d]/g, "");
}
function restoreNumericString(value: unknown, fallback: string) {
  const d = toDigitsOrEmpty(value);
  return d === "" ? fallback : String(Number(d));
}

function BonusContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const [salaryRaw, setSalaryRaw] = useState("");
  const [bonusRaw, setBonusRaw] = useState("");
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState("1");
  const [child20, setChild20] = useState("0");
  const [nonTaxRaw, setNonTaxRaw] = useState("200,000");

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    const bonus = parseNumber(bonusRaw);
    return (
      calculateSalary({
        salary: salary + bonus,
        insured,
        dependents: Number(dependents || 0),
        child20: Number(child20 || 0),
        nonTax: parseNumber(nonTaxRaw),
      }) || {
        pension: 0,
        health: 0,
        care: 0,
        employment: 0,
        incomeTax: 0,
        residentTax: 0,
        takeHome: 0,
      }
    );
  }, [salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw]);

  const totalDeduction =
    result.pension + result.health + result.care + result.employment + result.incomeTax + result.residentTax;

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const state = { v: 1, inputs: { salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw } };
    return `${window.location.origin}/bonus?data=${encodeURIComponent(encodeShareState(state))}`;
  }, [salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw]);

  useEffect(() => {
    const data = sp.get("data");
    if (!data) return;
    const decoded = decodeShareState<any>(data);
    if (decoded?.inputs) {
      const i = decoded.inputs;
      setSalaryRaw(i.salaryRaw ?? "");
      setBonusRaw(i.bonusRaw ?? "");
      setInsured(i.insured === "no" ? "no" : "yes");
      setDependents(restoreNumericString(i.dependents, "1"));
      setChild20(restoreNumericString(i.child20, "0"));
      setNonTaxRaw(typeof i.nonTaxRaw === "number" ? formatComma(i.nonTaxRaw) : (i.nonTaxRaw ?? "200,000"));
      router.replace("/bonus");
    }
  }, [sp, router]);

  const onShare = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) await navigator.share({ title: "상여금/성과급 계산기", url: shareUrl });
      else {
        await copyToClipboardSafe(shareUrl);
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
  const resultSubTotal: ResultLine = { label: "총 공제액", value: `${totalDeduction.toLocaleString()}원` };
  const resultTotal: ResultLine = { label: "최종 실수령액", value: `${result.takeHome.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "bonus",
      title: "상여금 계산기",
      inputs: [
        { label: "기본급(입력, 세전)", value: `${parseNumber(salaryRaw).toLocaleString()}원` },
        { label: "상여금/성과급(입력)", value: `${parseNumber(bonusRaw).toLocaleString()}원` },
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
      title="상여금/성과급 계산기"
      subtitle="기본급과 상여금을 합산해 실수령액을 계산합니다."
      intro="상여금은 당월 급여와 합산해 세금이 매겨지기 때문에 체감 세율이 높아질 수 있어요. 합산 기준 실수령액을 미리 확인해보세요."
      faqTitle="상여금/성과급 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 보너스가 왜 생각보다 적게 들어오나요?", a: "A. 상여금은 당월 급여와 합산해 소득세 구간이 결정되기 때문에, 평소보다 높은 세율이 적용될 수 있습니다." },
        { q: "Q. 상여금에도 4대보험이 붙나요?", a: "A. 네. 상여금도 보수에 포함되어 국민연금·건강보험·고용보험 등이 함께 부과됩니다." },
        { q: "Q. 성과급과 상여금은 세금이 다른가요?", a: "A. 근로의 대가로 받는 성과급·상여금은 모두 근로소득으로 과세됩니다. 지급 방식에 따라 원천징수 시점만 달라질 수 있습니다." },
        { q: "Q. 연말정산에서 다시 정산되나요?", a: "A. 네. 매달 원천징수한 세액은 예납이며, 연말정산에서 최종 세액이 확정되어 환급 또는 추가 납부가 발생합니다." },
      ]}
      result={
        <ResultPanel
          title="합산 계산 결과"
          lines={resultLines}
          subTotal={resultSubTotal}
          total={resultTotal}
          note="* 국세청 간이세액표를 기준으로 한 모의 계산이며, 실제 홈택스 결과 및 급여명세서와는 차이가 있을 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="기본 월 급여 (세전)"
        type="text"
        inputMode="numeric"
        value={salaryRaw}
        onChange={(e) => setSalaryRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 3,000,000"
      />

      <div className="mt-4">
        <InputBlock
          label="상여금/성과급 (세전)"
          type="text"
          inputMode="numeric"
          value={bonusRaw}
          onChange={(e) => setBonusRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 5,000,000"
        />
      </div>

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
          onChange={(e) => setDependents(toDigitsOrEmpty(e.target.value))}
        />
        <InputBlock
          label="20세 이하 자녀 수"
          type="text"
          inputMode="numeric"
          value={child20}
          onChange={(e) => setChild20(toDigitsOrEmpty(e.target.value))}
        />
        <InputBlock
          label="비과세 식대"
          type="text"
          inputMode="numeric"
          value={nonTaxRaw}
          onChange={(e) => setNonTaxRaw(formatComma(parseNumber(e.target.value)))}
        />
      </div>

      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}

export default function BonusPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">계산기 불러오는 중...</div>}>
      <BonusContent />
    </Suspense>
  );
}
