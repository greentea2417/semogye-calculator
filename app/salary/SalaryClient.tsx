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
  dependents: number;
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

export default function SalaryPage() {
  const sp = useSearchParams();
  const router = useRouter();

  // ✅ 입력은 "표시용 문자열"로 관리(콤마 유지)
  const [salaryRaw, setSalaryRaw] = useState(""); // 세전 월급
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState(1);
  const [child20, setChild20] = useState<string>("0"); // ✅ FIX: number -> string
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
    setDependents(Number.isFinite(restored.dependents) ? restored.dependents : 1);

    // ✅ 과거 링크가 number로 들어왔을 가능성까지 방어
    const restoredChild = (restored as any)?.child20;
    if (typeof restoredChild === "string") {
      setChild20(restoredChild === "" ? "" : String(parseNumber(restoredChild)));
    } else if (typeof restoredChild === "number" && Number.isFinite(restoredChild)) {
      setChild20(String(restoredChild));
    } else {
      setChild20("0");
    }

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
    const child20Count = Number(child20 || 0); // ✅ 계산 시점에만 숫자로 변환

    const res = calculateSalary({
      salary,
      insured,
      dependents,
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
    lines.push([csvEscape("부양가족 수(본인 포함)"), csvEscape(String(dependents))].join(","));
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

  // ✅ 모바일에서 0이 안 지워지는 문제 해결용 onChange
  const handleChild20Change = (e: any) => {
    const v = String(e?.target?.value ?? "");

    // 지우기 허용
    if (v === "") {
      setChild20("");
      return;
    }

    // 숫자만 허용(정수)
    if (/^\d+$/.test(v)) {
      // 선행 0 정리: "00" -> "0", "01" -> "1"
      setChild20(String(Number(v)));
    }
  };

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

        <InputBlock
          label="부양가족 수 (본인 포함)"
          type="number"
          value={dependents}
          onChange={(e: any) => setDependents(Number(e.target.value))}
        />

        {/* ✅ FIX: child20은 string으로 관리 */}
        <InputBlock
          label="20세 이하 자녀 수"
          type="number"
          value={child20}
          onChange={handleChild20Change}
          // InputBlock이 props를 그대로 input에 전달한다면 아래 두 개도 UX에 도움됨
          // inputMode="numeric"
          // pattern="[0-9]*"
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
                title: "세모계 월급 계산기",
                url: shareUrl,
              });
            } else {
              await copyToClipboardSafe(shareUrl);
              alert("링크가 복사되었습니다.");
            }
          }}
        />
      </section>

      {/* 설명 영역 */}
      <section className="pt-2">
        <button onClick={() => setOpenDesc(!openDesc)} className="text-sm text-gray-600 hover:text-gray-800">
          🔍 왜 이 금액이 나왔나요?
        </button>

        {openDesc && (
          <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm text-gray-700 space-y-3">
            <p>
              세모계 월급 계산기는 <strong>2025년 기준</strong>으로 국민연금, 건강보험, 고용보험, 소득세를 반영해 실수령액을
              계산합니다.
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>국민연금</li>
              <li>건강보험 (장기요양보험 포함)</li>
              <li>고용보험</li>
              <li>소득세 및 지방소득세</li>
            </ul>

            <p className="text-gray-500">회사별 공제 기준이나 개인 상황에 따라 실제 급여와 차이가 있을 수 있습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
