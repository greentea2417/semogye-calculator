"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { calculateSalary } from "@/utils/salaryCalculators";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

/* ================= utils ================= */
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatComma(n: number) {
  return n !== undefined ? n.toLocaleString("ko-KR") : "";
}

function toDigitsOrEmpty(v: unknown) {
  return String(v ?? "").replace(/[^\d]/g, "");
}

function restoreNumericString(value: unknown, fallback: string) {
  const d = toDigitsOrEmpty(value);
  return d === "" ? fallback : String(Number(d));
}

async function copyToClipboardSafe(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/* ================= 메인 콘텐츠 ================= */
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
    return calculateSalary({
      salary: salary + bonus,
      insured,
      dependents: Number(dependents || 0),
      child20: Number(child20 || 0),
      nonTax: parseNumber(nonTaxRaw),
    }) || { pension: 0, health: 0, care: 0, employment: 0, incomeTax: 0, residentTax: 0, takeHome: 0 };
  }, [salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw]);

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

  const handleShare = async () => {
    await copyToClipboardSafe(shareUrl);
    alert("링크가 복사되었습니다. 카톡 등에 붙여넣어 보세요!");
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">상여금/성과급 계산기</h1>
        <p className="text-gray-500 text-sm">기본급과 합산하여 세금 폭탄 피하는 실수령액 확인</p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="기본 월 급여 (세전)"
          type="text"
          value={salaryRaw}
          onChange={(e: any) => setSalaryRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 3,000,000"
        />
        <InputBlock
          label="상여금/성과급 (세전)"
          type="text"
          value={bonusRaw}
          onChange={(e: any) => setBonusRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 5,000,000"
        />
        <select 
          className="w-full border p-3 rounded-lg bg-white text-gray-900" 
          value={insured} 
          onChange={(e) => setInsured(e.target.value as any)}
        >
          <option value="yes">4대보험 가입</option>
          <option value="no">4대보험 미가입</option>
        </select>
        <InputBlock label="부양가족 수 (본인 포함)" type="text" inputMode="numeric" value={dependents} onChange={(e: any) => setDependents(toDigitsOrEmpty(e.target.value))} />
        <InputBlock label="20세 이하 자녀 수" type="text" inputMode="numeric" value={child20} onChange={(e: any) => setChild20(toDigitsOrEmpty(e.target.value))} />
        <InputBlock label="비과세 식대" type="text" value={nonTaxRaw} onChange={(e: any) => setNonTaxRaw(formatComma(parseNumber(e.target.value)))} />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">합산 계산 결과</h2>
        <ResultRow label="국민연금" value={result.pension} />
        <ResultRow label="건강보험" value={result.health} />
        <ResultRow label="장기요양보험" value={result.care} />
        <ResultRow label="고용보험" value={result.employment} />
        <ResultRow label="소득세" value={result.incomeTax} />
        <ResultRow label="지방소득세" value={result.residentTax} />
        <hr className="my-4" />
        <div className="flex justify-between font-extrabold text-xl text-blue-600">
          <span>최종 실수령액</span>
          <span>{result.takeHome.toLocaleString()}원</span>
        </div>
        
        {/* ✅ 안전 문구 배치 완료 */}
        <p className="mt-6 text-[11px] text-gray-400 leading-relaxed text-center bg-gray-50 p-2 rounded">
          * 본 계산기는 국세청 간이세액표를 기준으로 한 모의 계산 결과이며, 
          <br />
          실제 홈택스 결과 및 급여 명세서와는 차이가 있을 수 있습니다.
        </p>

        <div className="mt-6">
          <BottomActions onCopyLink={handleShare} onShare={handleShare} />
        </div>
      </section>
    </main>
  );
}

export default function BonusPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">계산기 불러오는 중...</div>}>
      <BonusContent />
    </Suspense>
  );
}