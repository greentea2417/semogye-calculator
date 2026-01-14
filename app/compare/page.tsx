"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import { useUrlQuerySync, codecs } from "@/utils/useUrlQuerySync";
import { copyToClipboardSafe, shareOrCopy } from "../components/lib/shareUtils";

// 숫자 파싱/포맷
function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

const DIFF_THRESHOLD = 50_000; // ±5만원 이하면 "차이 거의 없음"

export default function ComparePage() {
  const [partHourlyRaw, setPartHourlyRaw] = useState("");
  const [partMonthlyHoursRaw, setPartMonthlyHoursRaw] = useState("");
  const [freelanceMonthlyRaw, setFreelanceMonthlyRaw] = useState("");

  // URL ↔ state 동기화
  useUrlQuerySync([
    { key: "w", value: partHourlyRaw, setValue: setPartHourlyRaw, codec: codecs.numberCommaString },
    { key: "h", value: partMonthlyHoursRaw, setValue: setPartMonthlyHoursRaw, codec: codecs.numberPlainString },
    { key: "f", value: freelanceMonthlyRaw, setValue: setFreelanceMonthlyRaw, codec: codecs.numberCommaString },
  ]);

  // 계산
  const calc = useMemo(() => {
    const hourly = parseNumber(partHourlyRaw);
    const monthlyHours = parseNumber(partMonthlyHoursRaw);
    const freelanceGross = parseNumber(freelanceMonthlyRaw);

    const partGross = hourly * monthlyHours;
    const freelanceWithholding = Math.floor(freelanceGross * 0.033);
    const freelanceNet = freelanceGross - freelanceWithholding;
    const diff = freelanceNet - partGross;

    return {
      partGross,
      freelanceWithholding,
      freelanceNet,
      diff,
    };
  }, [partHourlyRaw, partMonthlyHoursRaw, freelanceMonthlyRaw]);

  // 차이 라벨
  const diffLabel =
    Math.abs(calc.diff) <= DIFF_THRESHOLD
      ? "차이 거의 없음"
      : calc.diff > 0
      ? `프리랜서가 더 많음 (+${calc.diff.toLocaleString("ko-KR")}원)`
      : `알바가 더 많음 (${Math.abs(calc.diff).toLocaleString("ko-KR")}원)`;

  // ✅ 상태 문구 (굵게 표시)
  const statusText = useMemo(() => {
    if (Math.abs(calc.diff) <= DIFF_THRESHOLD) {
      return "현재 입력 조건에서는 알바와 프리랜서의 실수령 차이가 거의 없습니다.";
    }
    if (calc.diff > 0) {
      return "현재 입력 조건에서는 프리랜서 소득 구조가 알바보다 실수령 기준에서 더 유리합니다.";
    }
    return "현재 입력 조건에서는 알바 소득 구조가 프리랜서보다 실수령 기준에서 더 유리합니다.";
  }, [calc.diff]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      {/* 타이틀 */}
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">
          알바 vs 프리랜서 비교 계산기
        </h1>
        <p className="text-gray-500 text-sm">
          시급 알바(세전)와 프리랜서 3.3%(실수령 예상)를 비교합니다.
        </p>
      </section>

      {/* 입력 */}
      <section className="bg-white p-6 rounded-xl border space-y-6">
        <h2 className="font-bold text-lg">알바 정보</h2>

        <InputBlock
          label="알바 시급"
          type="text"
          value={partHourlyRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setPartHourlyRaw(n ? formatComma(n) : "");
          }}
          placeholder="예: 11,000"
        />

        <InputBlock
          label="월 근로시간 (총 시간)"
          type="text"
          value={partMonthlyHoursRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setPartMonthlyHoursRaw(n ? String(n) : "");
          }}
          placeholder="예: 160 (하루 8시간 × 20일)"
        />

        <hr />

        <h2 className="font-bold text-lg">프리랜서 정보</h2>

        <InputBlock
          label="프리랜서 월 수입 (세전)"
          type="text"
          value={freelanceMonthlyRaw}
          onChange={(e: any) => {
            const n = parseNumber(e.target.value);
            setFreelanceMonthlyRaw(n ? formatComma(n) : "");
          }}
          placeholder="예: 2,500,000"
        />

        <p className="text-xs text-gray-500">
          * 알바는 단순 세전, 프리랜서는 3.3% 원천징수 기준으로 계산됩니다.
        </p>
      </section>

      {/* 결과 */}
      <section className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold text-xl mb-4">비교 결과</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">알바 월 수입(세전)</span>
            <span className="font-semibold">{calc.partGross.toLocaleString("ko-KR")}원</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">프리랜서 원천징수(3.3%)</span>
            <span className="font-semibold">{calc.freelanceWithholding.toLocaleString("ko-KR")}원</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">프리랜서 실수령(예상)</span>
            <span className="font-semibold">{calc.freelanceNet.toLocaleString("ko-KR")}원</span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold">차이</span>
          <span className="text-base font-bold">{diffLabel}</span>
        </div>

        {/* ✅ 상태 요약 (굵게) */}
        <p className="mt-2 text-sm font-semibold text-gray-800">
          {statusText}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          ※ 본 비교는 입력값 기준의 단순 계산 결과이며, 실제 세금·보험·근로조건에 따라 달라질 수 있습니다.
        </p>

        <BottomActions
          copyLabel="링크 복사"
          onCopyLink={async () => {
            await copyToClipboardSafe(shareUrl);
            alert("현재 입력값이 포함된 링크가 복사되었습니다.");
          }}
          onShare={async () => {
            const r = await shareOrCopy("세모계 알바 vs 프리랜서 비교", shareUrl);
            if (r.method === "copy") alert("현재 입력값이 포함된 링크가 복사되었습니다.");
          }}
        />
      </section>
    </main>
  );
}
