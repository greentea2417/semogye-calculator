"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import CalculatorArticle from "@/components/CalculatorArticle";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function parseDecimal(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function OvertimePayPage() {
  const [wageRaw, setWageRaw] = useState(""); // 통상시급
  const [hoursRaw, setHoursRaw] = useState(""); // 연장근로시간

  const result = useMemo(() => {
    const wage = parseNumber(wageRaw);
    const hours = parseDecimal(hoursRaw);
    const basePay = Math.round(wage * hours); // 100% 기본 근로분
    const premium = Math.round(wage * hours * 0.5); // 50% 가산분
    const total = Math.round(wage * hours * 1.5); // 총 연장근로수당
    return { wage, hours, basePay, premium, total };
  }, [wageRaw, hoursRaw]);

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
    { label: "기본 근로분", hint: "(통상시급×시간)", value: `${result.basePay.toLocaleString()}원` },
    { label: "가산수당", hint: "(50% 가산)", value: `${result.premium.toLocaleString()}원` },
  ];
  const resultTotal: ResultLine = {
    label: "연장근로수당 합계",
    value: `${result.total.toLocaleString()}원`,
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "overtime-pay",
      title: "연장근로수당 계산기",
      inputs: [
        { label: "통상시급(입력)", value: `${parseNumber(wageRaw).toLocaleString()}원` },
        { label: "연장근로시간(입력)", value: `${parseDecimal(hoursRaw)}시간` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="연장근로수당 계산기 | 세모계"
      subtitle="통상시급과 연장근로시간을 넣으면 1.5배 연장근로수당을 계산합니다."
      intro="근로기준법 제56조에 따라 연장근로는 통상임금의 50%를 가산해, 시간당 통상시급의 1.5배로 지급합니다."
      faqTitle="연장근로수당 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 연장근로수당은 어떻게 계산하나요?",
          a: "A. 연장근로수당 = 통상시급 × 연장근로시간 × 1.5 입니다. 통상시급 12,000원으로 10시간 연장근로하면 12,000 × 10 × 1.5 = 180,000원입니다(근로기준법 제56조).",
        },
        {
          q: "Q. 왜 1.5배인가요?",
          a: "A. 실제 일한 시간에 대한 임금 100%에 가산수당 50%가 더해지기 때문입니다. 즉 100% + 50% = 150%(1.5배)를 지급합니다.",
        },
        {
          q: "Q. 연장근로는 어떤 근로를 말하나요?",
          a: "A. 1일 8시간 또는 1주 40시간을 초과한 근로를 말합니다. 이 기준을 넘긴 시간에 대해 가산수당이 발생합니다.",
        },
        {
          q: "Q. 야간·휴일근로가 겹치면요?",
          a: "A. 연장근로가 야간(22시~06시)이나 휴일과 겹치면 각각의 가산수당이 중복 적용됩니다. 이 계산기는 연장근로 단독 기준이며, 야간·휴일수당은 별도 계산기를 이용하세요.",
        },
        {
          q: "Q. 5인 미만 사업장도 적용되나요?",
          a: "A. 상시근로자 5인 미만 사업장은 연장·야간·휴일근로 가산수당(50%) 규정이 적용되지 않습니다. 이 경우 실제 일한 시간분(1배)만 지급됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="연장근로수당 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 상시근로자 5인 이상 사업장 기준(근로기준법 제56조)이며, 통상시급에는 각종 수당이 포함될 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "연장근로수당이란?",
              body: (
                <p>
                  연장근로수당은 법정 근로시간(1일 8시간·1주 40시간)을 <strong>초과해 일한 시간</strong>에 대해
                  통상임금의 50%를 더해 지급하는 가산임금입니다. 실제 일한 시간분(100%)에 가산분(50%)이 더해져
                  <strong> 통상시급의 1.5배</strong>가 되며, 근로기준법 제56조에 근거합니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    연장근로수당 = 통상시급 × 연장근로시간 × 1.5
                    <br />
                    (기본 근로분 100% + 가산수당 50%)
                  </p>
                  <p>
                    통상시급은 기본급뿐 아니라 정기적·일률적으로 지급되는 수당을 포함한 통상임금을 시간당으로
                    환산한 값입니다. 연장근로시간은 1일 8시간 또는 1주 40시간을 넘긴 시간만 셉니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>통상시급 12,000원으로 연장근로 10시간을 한 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>기본 근로분 = 12,000 × 10 = 120,000원</li>
                    <li>가산수당(50%) = 12,000 × 10 × 0.5 = 60,000원</li>
                    <li>연장근로수당 합계 = 12,000 × 10 × 1.5 = <strong>180,000원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  이 가산수당은 <strong>상시근로자 5인 이상 사업장</strong>에 적용됩니다. 5인 미만 사업장은
                  연장·야간·휴일근로 가산(50%)이 적용되지 않아 실제 일한 시간분만 지급됩니다. 연장근로가 야간(22시~06시)이나
                  휴일과 겹치면 각 가산수당이 중복 적용되므로, 해당 시간은 야간·휴일수당 계산기를 함께 이용하세요.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="통상시급 (원)"
          type="text"
          inputMode="numeric"
          value={wageRaw}
          onChange={(e) => setWageRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 12,000"
        />
        <InputBlock
          label="연장근로시간 (시간)"
          type="text"
          inputMode="decimal"
          value={hoursRaw}
          onChange={(e) => setHoursRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 10"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 1일 8시간·주 40시간 초과분이 연장근로입니다. 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
