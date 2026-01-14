"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { calculateSalary } from "@/utils/salaryCalculators";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

/* ================= utils ================= */
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
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
type SalaryInputsShare = {
  salaryRaw: string;
  insured: "yes" | "no";
  dependents: string;
  child20: string;
  nonTax: number;
};

type SalaryShareState = { v: 1; inputs: SalaryInputsShare };

/* ================= FAQ / 설명 ================= */
function SalaryWhySection() {
  return (
    <div className="mt-6 space-y-4">
      {/* 설명 */}
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span aria-hidden>🔎</span>
          <p className="font-semibold text-gray-900">왜 이 금액이 나왔나요?</p>
        </div>

        <p className="text-sm leading-6 text-gray-700">
          세모계 월급 실수령액 계산기는{" "}
          <b className="font-medium text-gray-900">세전 월급</b>
          {" "}을 입력하면
          <br />
          <b className="font-medium text-gray-900">현재 적용 중인 4대보험 요율</b>
          {" "}과{" "}
          <b className="font-medium text-gray-900">
            국세청 고시 근로소득 간이세액표(2024. 3. 1 시행 기준)
          </b>
          {" "}을 반영하여
          <br />
          실제로 받는 월급(
          <b className="font-medium text-gray-900">실수령액</b>
          )을 계산합니다.
        </p>

        <ul className="list-disc pl-5 space-y-1">
          <li>국민연금</li>
          <li>건강보험 (장기요양보험 포함)</li>
          <li>고용보험</li>
          <li>근로소득세 및 지방소득세</li>
        </ul>

        <p className="text-xs leading-5 text-gray-500">
          회사별 공제 기준이나 개인 조건(부양가족 수, 비과세 항목 등)에 따라 실제 급여와 차이가 있을 수 있습니다.
        </p>
      </div>

      <hr className="my-2 opacity-30" />

      {/* FAQ */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900">자주 묻는 질문</p>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-900">
            Q. 월급 실수령액은 어떻게 계산되나요?
          </summary>
          <div className="mt-2 text-sm leading-6 text-gray-700">
            A. 세전 월급에서 4대보험과 소득세·지방소득세를 차감해 실수령액을 계산합니다.
          </div>
        </details>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-900">
            Q. 기준이 최신인가요?
          </summary>
          <div className="mt-2 text-sm leading-6 text-gray-700">
            A. 현재 공개된 기준을 반영했으며, 제도 개정 시 계산 기준은 업데이트됩니다.
          </div>
        </details>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-900">
            Q. 4대보험 미가입이면 왜 달라지나요?
          </summary>
          <div className="mt-2 text-sm leading-6 text-gray-700">
            A. 보험 공제 항목이 달라져 실수령액이 다르게 계산될 수 있습니다.
          </div>
        </details>
      </div>
    </div>
  );
}


/* ================= main ================= */
export default function SalaryClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [salaryRaw, setSalaryRaw] = useState("");
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState("1");
  const [child20, setChild20] = useState("0");
  const [nonTax, setNonTax] = useState(200000);
  const [openDesc, setOpenDesc] = useState(false);

  const shareState = useMemo<SalaryShareState>(
    () => ({
      v: 1,
      inputs: { salaryRaw, insured, dependents, child20, nonTax },
    }),
    [salaryRaw, insured, dependents, child20, nonTax]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/salary?data=${encodeURIComponent(
      encodeShareState(shareState)
    )}`;
  }, [shareState]);

  useEffect(() => {
    const data = sp.get("data");
    if (!data) return;
    const decoded = decodeShareState<SalaryShareState>(data);
    if (!decoded?.inputs) return;

    const i = decoded.inputs;
    setSalaryRaw(i.salaryRaw ?? "");
    setInsured(i.insured === "no" ? "no" : "yes");
    setDependents(restoreNumericString(i.dependents, "1"));
    setChild20(restoreNumericString(i.child20, "0"));
    setNonTax(i.nonTax ?? 200000);

    router.replace("/salary");
  }, []);

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    return (
      calculateSalary({
        salary,
        insured,
        dependents: Number(dependents || 0),
        child20: Number(child20 || 0),
        nonTax,
      }) ?? {
        pension: 0,
        health: 0,
        care: 0,
        employment: 0,
        incomeTax: 0,
        residentTax: 0,
        takeHome: 0,
      }
    );
  }, [salaryRaw, insured, dependents, child20, nonTax]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold">월급 실수령액 계산기</h1>
        <p className="text-gray-500 text-sm">
          세전 월급 기준으로 실제 받는 금액을 계산합니다.
        </p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="월 급여 (세전)"
          type="text"
          value={salaryRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setSalaryRaw(n ? formatComma(n) : "");
          }}
          placeholder="예: 3,000,000"
        />

        <select
          className="w-full border p-3 rounded-lg"
          value={insured}
          onChange={(e) => setInsured(e.target.value as any)}
        >
          <option value="yes">4대보험 가입</option>
          <option value="no">4대보험 미가입</option>
        </select>

        <InputBlock
          label="부양가족 수 (본인 포함)"
          type="text"
          inputMode="numeric"
          value={dependents}
          onChange={(e: any) =>
            setDependents(toDigitsOrEmpty(e.target.value))
          }
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
          type="number"
          value={nonTax}
          onChange={(e: any) => setNonTax(Number(e.target.value))}
        />
      </section>

      <section className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold text-xl mb-4">계산 결과</h2>
        <ResultRow label="국민연금" value={result.pension} />
        <ResultRow label="건강보험" value={result.health} />
        <ResultRow label="장기요양보험" value={result.care} />
        <ResultRow label="고용보험" value={result.employment} />
        <ResultRow label="소득세" value={result.incomeTax} />
        <ResultRow label="지방소득세" value={result.residentTax} />

        <hr className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>실수령액</span>
          <span>{result.takeHome.toLocaleString()}원</span>
        </div>

        <BottomActions
          onCopyLink={async () => {
            await copyToClipboardSafe(shareUrl);
            alert("링크가 복사되었습니다.");
          }}
          onShare={async () => {
            await copyToClipboardSafe(shareUrl);
            alert("링크가 복사되었습니다.");
          }}
        />
      </section>

      <section>
        <button
          onClick={() => setOpenDesc(!openDesc)}
          className="text-sm text-gray-600"
        >
          🔍 왜 이 금액이 나왔나요?
        </button>
        {openDesc && <SalaryWhySection />}
      </section>
    </main>
  );
}
