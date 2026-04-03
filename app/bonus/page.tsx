"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { calculateSalary } from "@/utils/salaryCalculators"; // 기존 함수 재활용
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

/* ================= utils ================= */
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatComma(n: number) {
  return n !== undefined ? n.toLocaleString("ko-KR") : "";
}

function toDigitsOrEmpty(v: unknown) {
  return String(v ?? "").replace(/[^\d]/g, "");
}

function restoreNumericString(value: unknown, fallback: string) {
  if (typeof value === "string") {
    const d = toDigitsOrEmpty(value);
    return d === "" ? "" : String(Number(d));
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
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

/* ================= types ================= */
type BonusInputsShare = {
  salaryRaw: string;
  bonusRaw: string; // 상여금 추가
  insured: "yes" | "no";
  dependents: string;
  child20: string;
  nonTaxRaw: string;
};

type BonusShareState = { v: 1; inputs: BonusInputsShare };

/* ================= main ================= */
export default function BonusClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [salaryRaw, setSalaryRaw] = useState("");
  const [bonusRaw, setBonusRaw] = useState(""); // 1. 상여금 상태 추가
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState("1");
  const [child20, setChild20] = useState("0");
  const [nonTaxRaw, setNonTaxRaw] = useState("200,000");
  const [openDesc, setOpenDesc] = useState(false);

  const shareState = useMemo<BonusShareState>(
    () => ({
      v: 1,
      inputs: { salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw },
    }),
    [salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/bonus?data=${encodeURIComponent(
      encodeShareState(shareState)
    )}`;
  }, [shareState]);

  useEffect(() => {
    const data = sp.get("data");
    if (!data) return;
    const decoded = decodeShareState<BonusShareState>(data);
    if (!decoded?.inputs) return;

    const i = decoded.inputs;
    setSalaryRaw(i.salaryRaw ?? "");
    setBonusRaw(i.bonusRaw ?? ""); // 공유 데이터 복구
    setInsured(i.insured === "no" ? "no" : "yes");
    setDependents(restoreNumericString(i.dependents, "1"));
    setChild20(restoreNumericString(i.child20, "0"));
    setNonTaxRaw(typeof i.nonTaxRaw === "number" ? formatComma(i.nonTaxRaw) : (i.nonTaxRaw ?? "200,000"));

    router.replace("/bonus");
  }, [sp, router]);

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    const bonus = parseNumber(bonusRaw); // 2. 상여금 숫자 파싱
    const nonTax = parseNumber(nonTaxRaw);
    
    // 월급과 상여금을 합쳐서 전체 급여로 계산기에 전달
    return (
      calculateSalary({
        salary: salary + bonus,
        insured,
        dependents: Number(dependents || 0),
        child20: Number(child20 || 0),
        nonTax,
      }) ?? { pension: 0, health: 0, care: 0, employment: 0, incomeTax: 0, residentTax: 0, takeHome: 0 }
    );
  }, [salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold">상여금/성과급 계산기</h1>
        <p className="text-gray-500 text-sm">기본급과 상여금을 합산하여 실수령액을 계산합니다.</p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="기본 월 급여 (세전)"
          type="text"
          value={salaryRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setSalaryRaw(n ? formatComma(n) : "");
          }}
          placeholder="예: 3,000,000"
        />

        {/* 3. 상여금 입력칸 추가 */}
        <InputBlock
          label="상여금/성과급 (세전)"
          type="text"
          value={bonusRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setBonusRaw(n ? formatComma(n) : "");
          }}
          placeholder="예: 5,000,000"
        />

        <select className="w-full border p-3 rounded-lg" value={insured} onChange={(e) => setInsured(e.target.value as any)}>
          <option value="yes">4대보험 가입</option>
          <option value="no">4대보험 미가입</option>
        </select>

        <InputBlock
          label="부양가족 수 (본인 포함)"
          type="text"
          inputMode="numeric"
          value={dependents}
          onChange={(e: any) => setDependents(toDigitsOrEmpty(e.target.value))}
        />

        <InputBlock
          label="20세 이하 자녀 수"
          type="text"
          inputMode="numeric"
          value={child20}
          onChange={(e: any) => setChild20(toDigitsOrEmpty(e.target.value))}
        />

        <InputBlock
          label="비과세 식대"
          type="text"
          value={nonTaxRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setNonTaxRaw(n >= 0 ? formatComma(n) : "");
          }}
          placeholder="0"
        />
      </section>

      <section className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold text-xl mb-4">합산 계산 결과</h2>
        <ResultRow label="국민연금" value={result.pension} />
        <ResultRow label="건강보험" value={result.health} />
        <ResultRow label="장기요양보험" value={result.care} />
        <ResultRow label="고용보험" value={result.employment} />
        <ResultRow label="소득세" value={result.incomeTax} />
        <ResultRow label="지방소득세" value={result.residentTax} />

        <hr className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>최종 실수령액</span>
          <span>{result.takeHome.toLocaleString()}원</span>
        </div>

        <BottomActions
          onCopyLink={async () => { await copyToClipboardSafe(shareUrl); alert("링크가 복사되었습니다."); }}
          onShare={async () => { await copyToClipboardSafe(shareUrl); alert("링크가 복사되었습니다."); }}
        />
      </section>
    </main>
  );
}