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
function round2(n: number) { return Math.round(n * 100) / 100; }

export default function PrepaymentFeePage() {
  const [principalRaw, setPrincipalRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("1.2");
  const [remainDaysRaw, setRemainDaysRaw] = useState("");
  const [totalDaysRaw, setTotalDaysRaw] = useState("1095");

  const result = useMemo(() => {
    const principal = Math.max(0, parseNumber(principalRaw));
    const rate = Math.max(0, parseNumber(rateRaw));
    const totalDays = Math.max(0, Math.floor(parseNumber(totalDaysRaw)));
    // 잔존일수는 0 ~ 총 기간으로 제한
    const remainDays = Math.min(totalDays, Math.max(0, Math.floor(parseNumber(remainDaysRaw))));
    const ratio = totalDays > 0 ? remainDays / totalDays : 0;
    const fee = Math.round(principal * (rate / 100) * ratio);
    return { principal, rate, totalDays, remainDays, ratio: round2(ratio * 100), fee };
  }, [principalRaw, rateRaw, remainDaysRaw, totalDaysRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "중도상환수수료 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "잔존일수 비율", hint: "잔존일수 ÷ 총 대출기간", value: `${result.ratio}%` },
    { label: "적용 대상 원금", hint: "중도상환 원금 × 수수료율", value: `${Math.round(result.principal * (result.rate / 100)).toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "prepayment-fee",
      title: "중도상환수수료 계산기",
      inputs: [
        { label: "중도상환 원금(입력)", value: `${result.principal.toLocaleString()}원` },
        { label: "수수료율(입력)", value: `${result.rate}%` },
        { label: "잔존일수(입력)", value: `${result.remainDays}일` },
        { label: "총 대출기간(입력)", value: `${result.totalDays}일` },
      ],
      lines,
      total: { label: "중도상환수수료", value: `${result.fee.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="중도상환수수료 계산기"
      subtitle="중도상환 원금, 수수료율, 잔존일수로 대출 중도상환수수료를 계산합니다."
      intro="중도상환수수료 = 중도상환 원금 × 수수료율 × (잔존일수 ÷ 총 대출기간)으로 계산합니다. 대부분의 은행은 수수료 부과기간을 3년(1,095일)으로 두며, 이 기간이 지나면 수수료가 면제됩니다."
      faqTitle="중도상환수수료 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 중도상환수수료는 어떻게 계산하나요?", a: "A. 중도상환수수료 = 중도상환 원금 × 수수료율 × (잔존일수 ÷ 총 대출기간)입니다. 남은 기간이 길수록 수수료가 커지고, 시간이 지날수록 줄어듭니다." },
        { q: "Q. 총 대출기간은 무엇을 넣나요?", a: "A. 수수료 부과기간을 넣습니다. 대부분 은행은 실제 만기와 상관없이 3년(1,095일)으로 고정하므로 기본값 1,095일을 사용하고, 약정서 기준이 다르면 그 값을 넣으면 됩니다." },
        { q: "Q. 잔존일수는 어떻게 구하나요?", a: "A. 수수료 부과기간 만료일(보통 대출 실행일 + 3년)에서 상환일까지 남은 날짜입니다. 3년이 지났다면 0일이므로 수수료가 0원입니다." },
        { q: "Q. 수수료율은 보통 얼마인가요?", a: "A. 상품에 따라 다르지만 통상 0.5~1.5% 수준입니다. 정확한 요율은 대출 약정서를 확인하세요." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 원금·잔존일수가 비어 있으면 0으로 처리하며, 잔존일수가 총 기간을 넘으면 총 기간으로 제한합니다." },
      ]}
      result={<ResultPanel title="중도상환수수료 계산 결과" lines={lines} total={{ label: "중도상환수수료", value: `${result.fee.toLocaleString()}원` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="중도상환 원금 (원)" type="text" inputMode="numeric" value={principalRaw} onChange={(e) => setPrincipalRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 50,000,000" />
        <InputBlock label="수수료율 (%)" type="text" inputMode="decimal" value={rateRaw} onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 1.2" />
        <InputBlock label="잔존일수 (일)" type="text" inputMode="numeric" value={remainDaysRaw} onChange={(e) => setRemainDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 730" />
        <InputBlock label="총 대출기간 (일)" type="text" inputMode="numeric" value={totalDaysRaw} onChange={(e) => setTotalDaysRaw(e.target.value.replace(/[^\d]/g, ""))} placeholder="예: 1095" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 실제 수수료는 은행별 산정 방식에 따라 원단위 절사 등 차이가 있을 수 있습니다.</p>
    </CalculatorLayout>
  );
}
