"use client";

import { useEffect, useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

/** "YYYY-MM-DD" 문자열을 연/월/일로 파싱한다. 유효하지 않으면 null. */
function parseDate(raw: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw ?? "").trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** 입사일부터 기준일까지 만(완전히 지난) 개월 수. */
function completedMonths(hire: { y: number; m: number; d: number }, base: { y: number; m: number; d: number }) {
  let months = (base.y - hire.y) * 12 + (base.m - hire.m);
  if (base.d < hire.d) months -= 1;
  return Math.max(0, months);
}

export default function AnnualDaysPage() {
  const [hireRaw, setHireRaw] = useState("");
  const [baseRaw, setBaseRaw] = useState("");

  // 기준일 기본값을 오늘로(하이드레이션 불일치를 피하려고 마운트 후 설정).
  useEffect(() => {
    if (!baseRaw) {
      const now = new Date();
      const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      setBaseRaw(iso);
    }
  }, [baseRaw]);

  const result = useMemo(() => {
    const hire = parseDate(hireRaw);
    const base = parseDate(baseRaw);
    if (!hire || !base) return { valid: false, months: 0, years: 0, days: 0, extra: 0 };
    const months = completedMonths(hire, base);
    if (months <= 0) return { valid: true, months: 0, years: 0, days: 0, extra: 0 };
    if (months < 12) {
      // 근속 1년 미만: 1개월 개근 시 1일, 최대 11일
      return { valid: true, months, years: 0, days: Math.min(11, months), extra: 0 };
    }
    // 근속 1년 이상: 기본 15일 + 3년 이상부터 매 2년 1일 가산, 한도 25일
    const years = Math.floor(months / 12);
    const extra = Math.floor((years - 1) / 2);
    const days = Math.min(25, 15 + extra);
    return { valid: true, months, years, days, extra };
  }, [hireRaw, baseRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연차 개수 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const serviceLabel = result.years >= 1
    ? `${result.years}년 ${result.months % 12}개월`
    : `${result.months}개월`;

  const lines: ResultLine[] = [
    { label: "계속근로기간", hint: "입사일 ~ 기준일", value: result.valid ? serviceLabel : "-" },
    { label: "기본 연차", hint: result.years >= 1 ? "1년 이상 15일" : "1개월 개근 1일", value: `${result.years >= 1 ? 15 : result.days}일` },
    { label: "가산 연차", hint: "3년 이상 2년마다 1일", value: `${result.extra}일` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "annual-days",
      title: "연차 개수 계산기",
      inputs: [
        { label: "입사일(입력)", value: hireRaw || "-" },
        { label: "기준일(입력)", value: baseRaw || "-" },
      ],
      lines,
      total: { label: "발생 연차", value: `${result.days}일` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="연차 개수 계산기"
      subtitle="입사일과 기준일로 근로기준법에 따라 발생하는 연차 유급휴가 일수를 계산합니다."
      intro="근로기준법 제60조 기준, 입사일 기준(연 80% 이상 출근 가정)으로 발생 연차 일수를 계산합니다. 연차수당 금액이 아닌 '개수'를 계산하는 도구예요."
      faqTitle="연차 개수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 연차는 어떻게 발생하나요?", a: "A. 근로기준법 제60조에 따라 입사 후 1년 미만이면 1개월 개근 시 1일씩(최대 11일), 1년간 80% 이상 출근하면 15일이 발생합니다." },
        { q: "Q. 오래 다니면 연차가 늘어나나요?", a: "A. 네. 3년 이상 계속 근로하면 최초 1년을 초과하는 매 2년마다 1일이 가산되며, 가산을 포함한 총 연차는 최대 25일까지입니다." },
        { q: "Q. 근속연수별 연차는 몇 일인가요?", a: "A. 1~2년 15일, 3~4년 16일, 5~6년 17일처럼 2년마다 1일씩 늘어 21년 이상이면 상한인 25일이 됩니다." },
        { q: "Q. 회계연도 기준과 다른가요?", a: "A. 이 계산기는 입사일 기준으로 계산합니다. 회사가 회계연도(1월 1일) 기준으로 운영하면 첫해 비례 부여 등으로 결과가 달라질 수 있습니다." },
        { q: "Q. 빈칸이면 어떻게 되나요?", a: "A. 입사일이 비어 있으면 계산할 수 없어 0일로 표시합니다. 기준일은 기본값이 오늘 날짜입니다." },
      ]}
      result={<ResultPanel title="연차 개수 계산 결과" lines={lines} total={{ label: "발생 연차", value: `${result.days}일` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="입사일" type="date" value={hireRaw} onChange={(e) => setHireRaw(e.target.value)} />
        <InputBlock label="기준일" type="date" value={baseRaw} onChange={(e) => setBaseRaw(e.target.value)} />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 연 80% 이상 출근을 가정한 입사일 기준 계산입니다.</p>
    </CalculatorLayout>
  );
}
