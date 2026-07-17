"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function OvertimePayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [hoursRaw, setHoursRaw] = useState("0");
  const [over5, setOver5] = useState(true); // true: 5인 이상, false: 5인 미만

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const hours = parseNumber(hoursRaw);
    const mult = over5 ? 1.5 : 1.0;
    const base = Math.round(hourly * hours); // 가산 전 임금
    const total = Math.round(hourly * hours * mult); // 총 연장수당
    const premium = over5 ? total - base : 0; // 가산분(50%)
    return { hourly, hours, base, premium, total, mult };
  }, [hourlyRaw, hoursRaw, over5]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연장근로수당 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "통상시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "연장근로시간", value: `${result.hours.toFixed(1)}시간` },
    { label: "가산율", value: over5 ? "50% 가산" : "가산 없음(5인 미만)" },
    { label: "가산 전 임금", value: `${result.base.toLocaleString()}원` },
    { label: "가산 수당", value: `${result.premium.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "연장근로수당 총액",
    value: `${result.total.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "overtime-pay",
      title: "연장근로수당 계산기",
      inputs: [
        { label: "통상시급(입력)", value: `${result.hourly.toLocaleString()}원` },
        { label: "연장근로시간(입력)", value: `${result.hours.toFixed(1)}시간` },
        { label: "사업장 규모(입력)", value: over5 ? "5인 이상" : "5인 미만" },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="연장근로수당 계산기"
      subtitle="통상시급과 연장근로시간을 넣으면 가산수당과 총액을 계산합니다."
      intro="법정 근로시간을 넘긴 연장근로에는 통상임금의 50%가 가산됩니다. 5인 미만 사업장은 가산 의무가 없어 통상임금만 지급됩니다."
      faqTitle="연장근로수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 연장근로수당은 어떻게 계산하나요?", a: "A. 통상시급 × 연장근로시간 × 1.5로 계산합니다. 예를 들어 통상시급 12,000원으로 20시간 연장근로하면 12,000 × 20 × 1.5 = 360,000원입니다." },
        { q: "Q. 왜 1.5배인가요?", a: "A. 근로기준법상 연장근로는 통상임금의 50%를 가산하기 때문에, 기본 임금(1배)에 가산분(0.5배)을 더해 1.5배가 됩니다." },
        { q: "Q. 5인 미만 사업장도 가산되나요?", a: "A. 상시근로자 5인 미만 사업장은 연장·야간·휴일근로 가산수당 지급 의무가 없어 통상임금(1배)만 지급됩니다. 이 계산기는 사업장 규모를 선택할 수 있습니다." },
        { q: "Q. 야간·휴일근로와 중복되면요?", a: "A. 같은 시간이 연장이면서 야간(밤 10시~오전 6시)이거나 휴일이면 가산이 중복 적용될 수 있습니다. 이 계산기는 연장 가산만 반영하므로, 중복 시에는 야간·휴일 계산기를 함께 참고하세요." },
      ]}
      result={
        <ResultPanel
          title="연장근로수당 리포트"
          lines={resultLines}
          total={resultTotal}
          note="* 통상시급 기준 세전 금액입니다. 상시근로자 5인 이상 사업장은 50% 가산, 5인 미만은 가산 없이 통상임금만 계산합니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="통상시급 (원)"
        type="text"
        inputMode="numeric"
        value={hourlyRaw}
        onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 12,000"
      />
      <div className="mt-4">
        <InputBlock
          label="연장근로시간 (시간)"
          type="text"
          inputMode="decimal"
          value={hoursRaw}
          onChange={(e) => setHoursRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 20"
        />
      </div>
      <div className="mt-4">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">사업장 규모</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOver5(true)}
            className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
              over5 ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            5인 이상 (50% 가산)
          </button>
          <button
            type="button"
            onClick={() => setOver5(false)}
            className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
              !over5 ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            5인 미만 (가산 없음)
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
