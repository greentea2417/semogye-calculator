"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function NetSalaryPage() {
  const [gross, setGross] = useState("");
  const value = parseNumber(gross);
  const valid = value > 0;
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const result = useMemo(() => {
    if (!valid) return null;
    const insurance = Math.round(value * 0.097);
    const tax = Math.round(value * 0.03);
    const net = Math.round(value - insurance - tax);
    return { insurance, tax, net };
  }, [value, valid]);

  const resultLines: ResultLine[] = [
            { label: "세전 월급", value: `${value.toLocaleString()}원` },
            { label: "4대보험(추정)", value: `${(result?.insurance ?? 0).toLocaleString()}원` },
            { label: "세금(추정)", value: `${(result?.tax ?? 0).toLocaleString()}원` },
          ];
  const resultSubTotal: ResultLine = {
            label: "총 공제액",
            value: `${((result?.insurance ?? 0) + (result?.tax ?? 0)).toLocaleString()}원`,
          };
  const resultTotal: ResultLine = { label: "실수령액(예상)", value: `${(result?.net ?? 0).toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({ slug: "net-salary", title: "세후 실수령액 간이 계산기", lines: resultLines, subTotal: resultSubTotal, total: resultTotal });

  return (
    <CalculatorLayout
      tone="business"
      title="세후 실수령액 간이 계산기"
      subtitle="월급에서 4대보험·세금을 대략 빼고 실수령액을 확인해보세요."
      intro="회사마다 공제 구조가 다를 수 있어 정확한 급여명세서와는 차이가 있을 수 있습니다."
      faqTitle="세후 실수령액 간이 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 4대보험 가입 여부에 따라 왜 달라지나요?", a: "A. 공제 항목이 달라져 실수령액이 달라집니다." },
        { q: "Q. 이 계산은 정확한 급여명세서인가요?", a: "A. 아니요. 간이 추정치입니다." },
        { q: "Q. 비과세 식대도 반영되나요?", a: "A. 현재는 간단한 추정 기준이라 별도 항목이 없습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          subTotal={resultSubTotal}
          total={resultTotal}
          note="* 간이 추정치이며 회사 공제 구조에 따라 실제 급여명세서와 차이가 있을 수 있습니다."
        />
      }
      guide={<BottomActions onShare={async () => { if (navigator.share) await navigator.share({ title: "세후 실수령액 간이 계산기", url: shareUrl }); else { await copyToClipboardSafe(shareUrl); toast("링크를 복사했어요!"); } }} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="세전 월급 (원)" type="text" placeholder="3,000,000" value={gross} onChange={(e) => setGross(formatComma(parseNumber(e.target.value)))} />
    </CalculatorLayout>
  );
}
