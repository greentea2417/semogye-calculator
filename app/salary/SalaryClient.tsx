"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { calculateSalary } from "@/utils/salaryCalculators";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

// 숫자 파싱/포맷
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

// CSV 다운로드 (BOM 포함)
function csvEscape(value: string) {
  const v = String(value ?? "");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
function downloadCSV(filename: string, csvText: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type SalaryInputsShare = {
  salaryRaw: string;
  insured: "yes" | "no";
  dependents: string; // ✅ 모바일 숫자 입력 버그 방지: 입력은 string
  child20: string; // ✅ 모바일 숫자 입력 버그 방지: 입력은 string
  nonTax: number;
};

type SalaryShareState = { v: 1; inputs: SalaryInputsShare };

async function copyToClipboardSafe(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

// ✅ 숫자 입력(문자열) 공통 정리: 숫자만 남기고, 빈값 허용
function toDigitsOrEmpty(v: unknown) {
  const s = String(v ?? "");
  const digits = s.replace(/[^\d]/g, "");
  return digits; // "" 가능
}

// ✅ 과거 공유 링크(숫자였던 경우)까지 안전 복원
function restoreNumericString(value: unknown, fallback: string) {
  if (typeof value === "string") {
    const digits = toDigitsOrEmpty(value);
    return digits === "" ? "" : String(Number(digits)); // "01" -> "1"
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

/** ✅ 설명 + FAQ 컴포넌트 (SalaryPage 밖에 선언해야 JSX가 안 꼬임) */
function SalaryWhySection() {
  return (
    <div className="mt-4 space-y-3 text-sm text-gray-700">
      <p>
        <b>세모계 월급 실수령액 계산기</b>는 <b>세전 월급</b>을 입력하면 <b>2025년 기준</b>{" "}
        <b>4대보험</b>과 <b>세금</b>을 반영해 실제로 받는 월급(<b>실수령액</b>)을 계산합니다.
      </p>

      <p>
        이 계산 결과는 <b>국민연금</b>, <b>건강보험(장기요양보험 포함)</b>, <b>고용보험</b>,{" "}
        <b>근로소득세 및 지방소득세</b>를 기준으로 산출됩니다.
      </p>

      <ul className="list-disc pl-5 space-y-1">
        <li>국민연금</li>
        <li>건강보험 (장기요양보험 포함)</li>
        <li>고용보험</li>
        <li>근로소득세 및 지방소득세</li>
      </ul>

      <p className="text-gray-600">
        회사별 공제 기준이나 개인의 소득 조건(부양가족 수 등), 급여 구성(수당/비과세 등)에 따라 실제 급여와 계산 결과에는
        차이가 있을 수 있습니다.
      </p>

      <hr className="my-2 opacity-30" />

      <div className="space-y-2">
        <p className="font-semibold text-gray-800">자주 묻는 질문</p>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium">Q. 월급 실수령액은 어떻게 계산되나요?</summary>
          <div className="mt-2 text-gray-700">
            A. 기본적으로 <b>세전 월급</b>에서 <b>4대보험</b>과 <b>세금</b>을 차감해 <b>실제 수령액(실수령액)</b>을 계산합니다.
          </div>
        </details>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium">Q. 2025년 기준 계산이 맞나요?</summary>
          <div className="mt-2 text-gray-700">
            A. 네. 현재 공개된 기준 자료를 바탕으로 계산하며, 제도/기준이 개정되면 계산 방식이 변경될 수 있습니다.
          </div>
        </details>

        <details className="rounded-lg border bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium">Q. 실제 급여와 계산 결과가 다른 이유는 무엇인가요?</summary>
          <div className="mt-2 text-gray-700">
            A. 회사별 공제 항목/기준, 개인의 공제 조건(부양가족 수 등), 기타 급여 구성(수당/비과세 등)에 따라 차이가 발생할 수 있습니다.
          </div>
        </details>
      </div>
    </div>
  );
}

export default function SalaryPage() {
  const sp = useSearchParams();
  const router = useRouter();

  // ✅ 입력은 "표시용 문자열"로 관리(콤마 유지)
  const [salaryRaw, setSalaryRaw] = useState(""); // 세전 월급
  const [insured, setInsured] = useState<"yes" | "no">("yes");

  // ✅ FIX: dependents / child20 모두 string으로 관리
  const [dependents, setDependents] = useState<string>("1");
  const [child20, setChild20] = useState<string>("0");

  const [nonTax, setNonTax] = useState(200000);
  const [openDesc, setOpenDesc] = useState(false);

  // ✅ 공유 state (입력만)
  const shareState = useMemo<SalaryShareState>(
    () => ({
      v: 1,
      inputs: { salaryRaw, insured, dependents, child20, nonTax },
    }),
    [salaryRaw, insured, dependents, child20, nonTax]
  );

  // ✅ 공유 URL: 무조건 /salary 로 고정 (홈으로 새는 문제 완전 차단)
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const data = encodeShareState(shareState);
    return `${window.location.origin}/salary?data=${encodeURIComponent(data)}`;
  }, [shareState]);

  // ✅ 공유 링크로 들어오면 입력 복원 + URL에서 data 제거
  useEffect(() => {
    const dataParam = sp.get("data");
    if (!dataParam) return;

    const decoded = decodeShareState<SalaryShareState>(dataParam);
    const restored = decoded?.inputs;
    if (!restored) return;

    setSalaryRaw(restored.salaryRaw ?? "");
    setInsured(restored.insured === "no" ? "no" : "yes");

    // ✅ dependents/child20: 과거(number) 공유까지 방어 + 문자열 표준화
    setDependents(restoreNumericString((restored as any)?.dependents, "1"));
    setChild20(restoreNumericString((restored as any)?.child20, "0"));

    setNonTax(Number.isFinite(restored.nonTax) ? restored.nonTax : 200000);

    // URL 정리
    const url = new URL(window.location.href);
    url.searchParams.delete("data");
    router.replace(url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 자동 계산 (버튼 제거)
  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);

    // ✅ 계산 시점에만 숫자로 변환
    const dependentsCount = Number(dependents || 0);
    const child20Count = Number(child20 || 0);

    const res = calculateSalary({
      salary,
      insured,
      dependents: dependentsCount,
      child20: child20Count,
      nonTax,
    });

    if (!res) {
      return {
        pension: 0,
        health: 0,
        care: 0,
        employment: 0,
        incomeTax: 0,
        residentTax: 0,
        takeHome: 0,
      };
    }
    return res;
  }, [salaryRaw, insured, dependents, child20, nonTax]);

  const takeHomeText = (result?.takeHome ?? 0).toLocaleString("ko-KR");

  function handleDownloadSalaryCSV() {
    const salary = parseNumber(salaryRaw);
    const dependentsCount = Number(dependents || 0);
    const child20Count = Number(child20 || 0);

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    const header = ["항목", "값"];
    const lines: string[] = [];
    lines.push(header.map(csvEscape).join(","));

    // 입력값
    lines.push([csvEscape("월 급여(세전)"), csvEscape(String(salary))].join(","));
    lines.push([csvEscape("4대보험 가입"), csvEscape(insured === "yes" ? "예" : "아니오")].join(","));
    lines.push([csvEscape("부양가족 수(본인 포함)"), csvEscape(String(dependentsCount))].join(","));
    lines.push([csvEscape("20세 이하 자녀 수"), csvEscape(String(child20Count))].join(","));
    lines.push([csvEscape("비과세 식대"), csvEscape(String(nonTax))].join(","));

    lines.push(""); // 구분

    // 결과값
    lines.push([csvEscape("국민연금"), csvEscape(String(result?.pension ?? 0))].join(","));
    lines.push([csvEscape("건강보험"), csvEscape(String(result?.health ?? 0))].join(","));
    lines.push([csvEscape("장기요양보험"), csvEscape(String(result?.care ?? 0))].join(","));
    lines.push([csvEscape("고용보험"), csvEscape(String(result?.employment ?? 0))].join(","));
    lines.push([csvEscape("소득세"), csvEscape(String(result?.incomeTax ?? 0))].join(","));
    lines.push([csvEscape("지방소득세"), csvEscape(String(result?.residentTax ?? 0))].join(","));
    lines.push([csvEscape("실수령액"), csvEscape(String(result?.takeHome ?? 0))].join(","));

    downloadCSV(`semogye-salary-${y}${m}${d}.csv`, lines.join("\n"));
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      {/* 타이틀 */}
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">월급 실수령액 계산기</h1>
        <p className="text-gray-500 text-sm">세전 월급 기준으로 실제 받는 금액을 자동 계산합니다.</p>
      </section>

      {/* 입력 카드 */}
      <section className="bg-white p-6 rounded-xl border space-y-6">
        <InputBlock
          label="월 급여 (세전)"
          type="text"
          value={salaryRaw}
          onChange={(e: any) => {
            const next = String(e.target.value ?? "");
            const n = parseNumber(next);
            setSalaryRaw(n ? formatComma(n) : "");
          }}
          placeholder="예: 3,000,000"
        />

        {/* 4대보험 */}
        <div>
          <label className="block text-sm font-medium mb-1">4대보험 가입 여부</label>
          <select
            value={insured}
            onChange={(e) => setInsured(e.target.value as "yes" | "no")}
            className="w-full border p-3 rounded-lg bg-white"
          >
            <option value="yes">예 (정규직·계약직)</option>
            <option value="no">아니오</option>
          </select>
        </div>

        {/* ✅ FIX: dependents는 text+numeric 키패드 + string */}
        <InputBlock
          label="부양가족 수 (본인 포함)"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={dependents}
          onChange={(e: any) => {
            const digits = toDigitsOrEmpty(e.target.value);
            setDependents(digits === "" ? "" : String(Number(digits)));
          }}
        />

        {/* ✅ FIX: child20도 type=number 금지! text+numeric로 통일 */}
        <InputBlock
          label="20세 이하 자녀 수"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={child20}
          onChange={(e: any) => {
            const digits = toDigitsOrEmpty(e.target.value);
            setChild20(digits === "" ? "" : String(Number(digits)));
          }}
        />

        <InputBlock
          label="비과세 식대 (기본 200,000원)"
          type="number"
          value={nonTax}
          onChange={(e: any) => setNonTax(Number(e.target.value))}
        />

        <p className="text-xs text-gray-500">
          * 본 계산기는 <b>세전 기준</b>이며, 입력 즉시 결과가 갱신됩니다.
        </p>
      </section>

      {/* 결과 카드 */}
      <section className="bg-white p-6 rounded-xl border animate-fadeIn">
        <h2 className="font-bold text-xl mb-4">계산 결과</h2>

        <div className="space-y-2 text-sm">
          <ResultRow label="국민연금" value={result?.pension ?? 0} />
          <ResultRow label="건강보험" value={result?.health ?? 0} />
          <ResultRow label="장기요양보험" value={result?.care ?? 0} />
          <ResultRow label="고용보험" value={result?.employment ?? 0} />
          <ResultRow label="소득세" value={result?.incomeTax ?? 0} />
          <ResultRow label="지방소득세" value={result?.residentTax ?? 0} />
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-bold">
          <span>실수령액</span>
          <span>{takeHomeText}원</span>
        </div>

        {/* ✅ 하단 액션(엑셀/링크복사) - 링크는 "공유 링크"로 복사 */}
        <BottomActions
          excelLabel="엑셀 다운로드"
          excelHint="엑셀에서 바로 열 수 있어요 (.csv)"
          onExcelDownload={handleDownloadSalaryCSV}
          onCopyLink={async () => {
            await copyToClipboardSafe(shareUrl);
            alert("링크가 복사되었습니다.");
          }}
          onShare={async () => {
            if (navigator.share) {
              await navigator.share({
                title: "세모계 월급 실수령액 계산기",
                url: shareUrl,
              });
            } else {
              await copyToClipboardSafe(shareUrl);
              alert("링크가 복사되었습니다.");
            }
          }}
        />
      </section>

      {/* ✅ 설명 영역 (openDesc 버튼으로 토글, 내부 FAQ만 details로 접힘) */}
      <section className="pt-2">
        <button
          type="button"
          onClick={() => setOpenDesc((v) => !v)}
          className="text-sm text-gray-600 hover:text-gray-800"
          aria-expanded={openDesc}
          aria-controls="salary-why"
        >
          🔍 왜 이 금액이 나왔나요?
        </button>

        {openDesc && (
          <div id="salary-why" className="mt-2">
            <SalaryWhySection />
          </div>
        )}
      </section>
    </main>
  );
}
