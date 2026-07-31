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
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function ProratedSalaryPage() {
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [totalDaysRaw, setTotalDaysRaw] = useState("30");
  const [workedDaysRaw, setWorkedDaysRaw] = useState("");

  const result = useMemo(() => {
    const monthly = Math.max(0, parseNumber(monthlyRaw));
    const totalDays = Math.max(0, parseNumber(totalDaysRaw));
    // 재직일수는 해당 월 총일수를 넘을 수 없다.
    const workedDays = Math.min(Math.max(0, parseNumber(workedDaysRaw)), totalDays || Infinity);
    const dailyPay = totalDays > 0 ? Math.round((monthly * workedDays) / totalDays) : 0;
    const dailyRate = totalDays > 0 ? Math.round(monthly / totalDays) : 0;
    return { monthly, totalDays, workedDays, dailyPay, dailyRate };
  }, [monthlyRaw, totalDaysRaw, workedDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "월급 일할계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "1일 급여", hint: "월급 ÷ 해당 월 총일수", value: `${result.dailyRate.toLocaleString()}원` },
    { label: "재직일수", hint: "일할계산에 적용", value: `${result.workedDays.toLocaleString()}일` },
    { label: "일할 급여", hint: "월급 × 재직일수 ÷ 총일수", value: `${result.dailyPay.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "prorated-salary",
      title: "월급 일할계산기",
      inputs: [
        { label: "월급(입력)", value: `${result.monthly.toLocaleString()}원` },
        { label: "해당 월 총일수(입력)", value: `${result.totalDays.toLocaleString()}일` },
        { label: "재직일수(입력)", value: `${result.workedDays.toLocaleString()}일` },
      ],
      lines,
      total: { label: "일할 급여", value: `${result.dailyPay.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="월급 일할계산기"
      subtitle="중도 입사·퇴사 등으로 한 달을 다 근무하지 않았을 때 받을 월급을 일할계산합니다."
      intro="월급 ÷ 해당 월 총일수 × 재직일수로, 달력일(역일) 기준 일할급여를 계산합니다. 총일수를 30으로 두면 흔히 쓰는 30일 기준으로도 계산할 수 있어요."
      faqTitle="월급 일할계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 일할계산은 어떻게 하나요?", a: "A. 일할 급여 = 월급 × 재직일수 ÷ 해당 월 총일수 입니다. 근로기준법에 법정 방식이 정해져 있지는 않지만, 고용노동부 행정해석상 달력일(역일)수를 기준으로 하는 방식이 널리 쓰입니다." },
        { q: "Q. 총일수는 며칠로 넣나요?", a: "A. 역일 기준이라면 해당 월의 실제 달력일수(28~31일)를, 회사 규정이 30일 고정 방식이라면 30을 넣으세요. 기본값은 30일입니다." },
        { q: "Q. 재직일수는 실제 근무일만 세나요?", a: "A. 역일 기준 일할계산에서는 주휴일·휴무일을 포함한 재직(달력) 일수를 셉니다. 예를 들어 15일에 입사해 말일까지 재직했다면 재직일수는 그 사이의 달력일수입니다." },
        { q: "Q. 재직일수가 총일수보다 크면 어떻게 되나요?", a: "A. 한 달 전체를 재직한 것이므로 재직일수를 총일수로 제한해 월급 전액이 나오도록 처리합니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0으로 처리하며, 총일수가 0이면 계산할 수 없어 0원으로 표시합니다." },
      ]}
      result={<ResultPanel title="월급 일할계산 결과" lines={lines} total={{ label: "일할 급여", value: `${result.dailyPay.toLocaleString()}원` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock label="월급 (원)" type="text" inputMode="numeric" value={monthlyRaw} onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 3,000,000" />
        <InputBlock label="해당 월 총일수 (일)" type="text" inputMode="numeric" value={totalDaysRaw} onChange={(e) => setTotalDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 30" />
        <InputBlock label="재직일수 (일)" type="text" inputMode="numeric" value={workedDaysRaw} onChange={(e) => setWorkedDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 10" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 세전(공제 전) 기준 금액입니다.</p>
    </CalculatorLayout>
  );
}
