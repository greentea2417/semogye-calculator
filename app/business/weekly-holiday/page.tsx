"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorArticle from "@/components/CalculatorArticle";
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

export default function WeeklyHolidayPage() {
  const [hourlyRaw, setHourlyRaw] = useState("");
  const [weeklyHoursRaw, setWeeklyHoursRaw] = useState("40");
  const [workDaysRaw, setWorkDaysRaw] = useState("5");

  const result = useMemo(() => {
    const hourly = parseNumber(hourlyRaw);
    const weeklyHours = parseNumber(weeklyHoursRaw);
    const workDays = Math.max(1, Math.min(7, parseNumber(workDaysRaw) || 5));
    const eligible = weeklyHours >= 15;
    const dailyHours = weeklyHours / workDays;
    const weeklyHolidayHours = eligible ? Math.min(8, dailyHours) : 0;
    const monthlyHolidayPay = Math.round(hourly * weeklyHolidayHours * (52 / 12));
    return { hourly, weeklyHours, workDays, eligible, dailyHours, weeklyHolidayHours, monthlyHolidayPay };
  }, [hourlyRaw, weeklyHoursRaw, workDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "주휴수당 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "시급", value: `${result.hourly.toLocaleString()}원` },
    { label: "주간 실근로시간", value: `${result.weeklyHours.toFixed(1)}시간` },
    { label: "주휴수당 대상 여부", value: result.eligible ? "대상" : "미달" },
  ];
  const total: ResultLine = { label: "월 예상 주휴수당", value: `${result.monthlyHolidayPay.toLocaleString()}원` };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "weekly-holiday",
      title: "주휴수당 계산기",
      inputs: [
        { label: "시급(입력)", value: `${result.hourly.toLocaleString()}원` },
        { label: "주간 실근로시간(입력)", value: `${result.weeklyHours.toFixed(1)}시간` },
        { label: "주당 평균 근무일수(입력)", value: `${result.workDays}일` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="주휴수당 계산기 | 세모계"
      subtitle="주 15시간 이상 근무 시 발생할 수 있는 주휴수당을 계산합니다."
      intro="주간 실근로시간과 근무일수를 기준으로 월 예상 주휴수당을 바로 확인해보세요."
      faqTitle="주휴수당 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 주휴수당은 언제 생기나요?", a: "A. 일반적으로 1주 소정근로시간이 15시간 이상이고, 개근 요건을 충족할 때 발생합니다." },
        { q: "Q. 하루 8시간을 넘게 받을 수 있나요?", a: "A. 보통 1일 소정근로시간을 한도로 보며, 이 계산기는 8시간 상한을 적용합니다." },
        { q: "Q. 아르바이트도 받을 수 있나요?", a: "A. 네. 주 15시간 이상이고 요건을 충족하면 아르바이트도 대상이 될 수 있습니다." },
        { q: "Q. 사업장마다 다를 수 있나요?", a: "A. 근로계약과 실제 근로형태에 따라 달라질 수 있으니 최종 판단은 계약서와 노무 기준을 확인하세요." },
      ]}
      result={<ResultPanel title="주휴수당 리포트" lines={lines} total={total} note="* 근로계약, 개근 여부, 실제 소정근로시간에 따라 달라질 수 있는 참고용 계산입니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "주휴수당이란?",
              body: (
                <>
                  <p>
                    주휴수당은 1주 동안 정해진 근무일을 개근한 근로자에게 유급으로 부여되는 <strong>주휴일(보통 일요일)</strong>에 대해
                    지급하는 임금입니다. 즉, 실제로 일하지 않은 하루치 임금을 추가로 받는 제도로, 주 15시간 이상 일하는
                    아르바이트생과 단시간 근로자에게도 똑같이 적용됩니다.
                  </p>
                  <p>
                    상시 근로자 수와 관계없이 <strong>5인 미만 사업장에도 적용</strong>되기 때문에, 소규모 매장의 사장님과 직원 모두
                    반드시 알아두어야 하는 항목입니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p>
                    이 계산기는 다음 공식을 사용합니다.
                  </p>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    주휴시간 = min(1일 소정근로시간, 8시간)
                    <br />
                    월 주휴수당 = 시급 × 주휴시간 × (52주 ÷ 12개월)
                  </p>
                  <p>
                    1일 소정근로시간은 <strong>주간 실근로시간 ÷ 주당 근무일수</strong>로 구하며, 하루 8시간을 넘는 부분은
                    주휴수당 산정에서 제외합니다. 1주 소정근로시간이 15시간 미만이면 주휴수당이 발생하지 않습니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>
                    시급 10,030원, 주 40시간(주 5일 근무)인 경우:
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>1일 소정근로시간 = 40 ÷ 5 = 8시간</li>
                    <li>주휴시간 = min(8, 8) = 8시간</li>
                    <li>1주 주휴수당 = 10,030 × 8 = 80,240원</li>
                    <li>월 환산 = 80,240 × (52 ÷ 12) ≈ <strong>347,707원</strong></li>
                  </ul>
                  <p>
                    주 15시간(주 3일, 하루 5시간)만 일하는 아르바이트라면 주휴시간은 5시간이 되어 그만큼 주휴수당도 줄어듭니다.
                  </p>
                </>
              ),
            },
            {
              heading: "법적 근거와 주의사항",
              body: (
                <>
                  <p>
                    주휴수당은 <strong>근로기준법 제55조(휴일)</strong>와 시행령 제30조에 근거합니다. 다만 아래의 경우에는
                    지급되지 않거나 달라질 수 있습니다.
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>1주 소정근로시간이 15시간 미만인 경우</li>
                    <li>정해진 근무일에 결근이 있어 개근 요건을 채우지 못한 경우</li>
                    <li>주 단위가 아닌 특수한 근로형태(교대·격일제 등)라 별도 산정이 필요한 경우</li>
                  </ul>
                  <p>
                    본 계산기는 통상적인 기준을 적용한 <strong>참고용 추정치</strong>이며, 실제 지급액은 근로계약서와 취업규칙,
                    노무 판단에 따라 달라질 수 있습니다.
                  </p>
                </>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock label="시급 (원)" type="text" inputMode="numeric" value={hourlyRaw} onChange={(e) => setHourlyRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" />
      <div className="mt-4"><InputBlock label="주간 실근로시간 (시간)" type="text" inputMode="decimal" value={weeklyHoursRaw} onChange={(e) => setWeeklyHoursRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 40" /></div>
      <div className="mt-4"><InputBlock label="주당 평균 근무일수 (일)" type="text" inputMode="numeric" value={workDaysRaw} onChange={(e) => setWorkDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 5" /></div>
    </CalculatorLayout>
  );
}
