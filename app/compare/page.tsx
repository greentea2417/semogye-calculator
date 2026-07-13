"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { useUrlQuerySync, codecs } from "@/utils/useUrlQuerySync";
import { shareOrCopy } from "../components/lib/shareUtils";
import { toast } from "../components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

const DIFF_THRESHOLD = 50_000;

export default function ComparePage() {
  const [partHourlyRaw, setPartHourlyRaw] = useState("");
  const [partMonthlyHoursRaw, setPartMonthlyHoursRaw] = useState("");
  const [freelanceMonthlyRaw, setFreelanceMonthlyRaw] = useState("");

  useUrlQuerySync([
    { key: "w", value: partHourlyRaw, setValue: setPartHourlyRaw, codec: codecs.numberCommaString },
    { key: "h", value: partMonthlyHoursRaw, setValue: setPartMonthlyHoursRaw, codec: codecs.numberPlainString },
    { key: "f", value: freelanceMonthlyRaw, setValue: setFreelanceMonthlyRaw, codec: codecs.numberCommaString },
  ]);

  const calc = useMemo(() => {
    const hourly = parseNumber(partHourlyRaw);
    const monthlyHours = parseNumber(partMonthlyHoursRaw);
    const freelanceGross = parseNumber(freelanceMonthlyRaw);

    const partGross = hourly * monthlyHours;
    const freelanceWithholding = Math.floor(freelanceGross * 0.033);
    const freelanceNet = freelanceGross - freelanceWithholding;
    const diff = freelanceNet - partGross;

    return { partGross, freelanceWithholding, freelanceNet, diff };
  }, [partHourlyRaw, partMonthlyHoursRaw, freelanceMonthlyRaw]);

  const diffLabel =
    Math.abs(calc.diff) <= DIFF_THRESHOLD
      ? "차이 거의 없음"
      : calc.diff > 0
      ? `프리랜서 +${calc.diff.toLocaleString("ko-KR")}원`
      : `알바 +${Math.abs(calc.diff).toLocaleString("ko-KR")}원`;

  const statusText = useMemo(() => {
    if (Math.abs(calc.diff) <= DIFF_THRESHOLD) {
      return "현재 입력 조건에서는 알바와 프리랜서의 실수령 차이가 거의 없습니다.";
    }
    if (calc.diff > 0) {
      return "현재 입력 조건에서는 프리랜서 소득 구조가 알바보다 실수령 기준에서 더 유리합니다.";
    }
    return "현재 입력 조건에서는 알바 소득 구조가 프리랜서보다 실수령 기준에서 더 유리합니다.";
  }, [calc.diff]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    const r = await shareOrCopy("세모계 알바 vs 프리랜서 비교", url);
    if (r.method === "copy") toast("현재 입력값이 포함된 링크를 복사했어요!");
  };

  const resultLines: ResultLine[] = [
            { label: "알바 월 수입", hint: "(세전)", value: `${calc.partGross.toLocaleString("ko-KR")}원` },
            { label: "프리랜서 원천징수", hint: "(3.3%)", value: `${calc.freelanceWithholding.toLocaleString("ko-KR")}원` },
            { label: "프리랜서 실수령", hint: "(예상)", value: `${calc.freelanceNet.toLocaleString("ko-KR")}원` },
          ];
  const resultTotal: ResultLine = { label: "실수령 차이", value: diffLabel };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "compare",
      title: "알바 vs 프리랜서 비교",
      inputs: [
        { label: "알바 시급(입력)", value: `${parseNumber(partHourlyRaw).toLocaleString("ko-KR")}원` },
        { label: "알바 월 근로시간(입력)", value: `${parseNumber(partMonthlyHoursRaw).toLocaleString("ko-KR")}시간` },
        { label: "프리랜서 월 수입(입력, 세전)", value: `${parseNumber(freelanceMonthlyRaw).toLocaleString("ko-KR")}원` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="알바 vs 프리랜서 비교 계산기"
      subtitle="시급 알바(세전)와 프리랜서 3.3%(실수령 예상)를 비교합니다."
      intro="단순 세전 금액뿐 아니라 3.3% 원천징수와 월 근로시간까지 반영해 실수령 차이를 한 번에 확인할 수 있어요."
      faqTitle="알바 vs 프리랜서 비교 자주 묻는 질문"
      faqItems={[
        { q: "Q. 알바와 프리랜서 중 뭐가 더 유리한가요?", a: "A. 단순 금액만으로는 판단할 수 없습니다. 프리랜서는 3.3%만 떼지만 건강보험·국민연금을 지역가입자로 직접 부담하고 퇴직금·유급휴가가 없습니다." },
        { q: "Q. 프리랜서 수입이 얼마나 더 높아야 비슷해지나요?", a: "A. 일반적으로 4대보험 본인부담과 퇴직금 부재를 감안해 월급의 1.3~1.5배 이상은 되어야 실질 소득이 비슷하다고 봅니다." },
        { q: "Q. 3.3%가 프리랜서의 최종 세금인가요?", a: "A. 아니요. 미리 낸 세금이며 매년 5월 종합소득세 신고로 최종 정산됩니다. 필요경비를 인정받으면 환급받을 수도 있습니다." },
        { q: "Q. 알바도 4대보험에 가입되나요?", a: "A. 주 15시간 이상 근무하면 원칙적으로 4대보험 가입 대상이며, 주휴수당도 발생할 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="비교 결과"
          lines={resultLines}
          total={resultTotal}
          note="※ 본 비교는 입력값 기준의 단순 계산 결과이며, 실제 세금·보험·근로조건에 따라 달라질 수 있습니다."
        >
          <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm font-semibold leading-6 text-gray-800">
            {statusText}
          </p>
        </ResultPanel>
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <h2 className="text-base font-bold text-gray-900">알바 정보</h2>
      <div className="mt-3 space-y-4">
        <InputBlock
          label="알바 시급"
          type="text"
          inputMode="numeric"
          value={partHourlyRaw}
          onChange={(e) => setPartHourlyRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 11,000"
        />
        <InputBlock
          label="월 근로시간 (총 시간)"
          type="text"
          inputMode="numeric"
          value={partMonthlyHoursRaw}
          onChange={(e) => {
            const n = parseNumber(e.target.value);
            setPartMonthlyHoursRaw(n ? String(n) : "");
          }}
          placeholder="예: 160 (하루 8시간 × 20일)"
        />
      </div>

      <h2 className="mt-6 border-t border-gray-100 pt-6 text-base font-bold text-gray-900">프리랜서 정보</h2>
      <div className="mt-3">
        <InputBlock
          label="프리랜서 월 수입 (세전)"
          type="text"
          inputMode="numeric"
          value={freelanceMonthlyRaw}
          onChange={(e) => setFreelanceMonthlyRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 2,500,000"
        />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        * 알바는 단순 세전, 프리랜서는 3.3% 원천징수 기준으로 계산됩니다.
      </p>
    </CalculatorLayout>
  );
}
