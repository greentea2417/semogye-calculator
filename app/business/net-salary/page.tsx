"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import CalculatorArticle from "../../components/CalculatorArticle";
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
    downloadResultCsv({
      slug: "net-salary",
      title: "세후 실수령액 간이 계산기",
      inputs: [{ label: "세전 월급(입력)", value: `${value.toLocaleString()}원` }],
      lines: resultLines,
      subTotal: resultSubTotal,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="세후 실수령액 계산기"
      subtitle="세전 월급에서 4대보험과 세금을 빼서 실수령액을 계산합니다."
      intro="월급 실수령액을 빠르게 확인하고 싶을 때 쓰는 간이 계산기입니다. 회사별 공제 구조와 비과세 항목에 따라 실제 금액은 달라질 수 있습니다."
      faqTitle="세후 실수령액 계산기 자주 묻는 질문"
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
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "세후 실수령액이란?",
              body: (
                <p>
                  세후 실수령액은 계약상 <strong>세전 월급에서 4대보험료와 세금을 뺀 뒤 실제 통장에 들어오는 금액</strong>입니다.
                  같은 월급이라도 4대보험 가입 여부, 비과세 항목, 부양가족 수에 따라 실수령액이 달라집니다. 이 계산기는 빠른
                  감을 잡기 위한 <strong>간이 추정</strong> 도구입니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    실수령액 = 세전 월급 − 4대보험(약 9.7%) − 세금(약 3%)
                  </p>
                  <p>
                    4대보험은 국민연금·건강보험·장기요양·고용보험을 합산한 근로자 부담분을, 세금은 근로소득세와 지방소득세를
                    대략적인 비율로 반영합니다. 정확한 항목별 계산이 필요하면 <strong>월급 실수령액 계산기</strong>를 이용하세요.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>세전 월급 3,000,000원인 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>4대보험(추정) ≈ 3,000,000 × 9.7% = 291,000원</li>
                    <li>세금(추정) ≈ 3,000,000 × 3% = 90,000원</li>
                    <li>실수령액(예상) ≈ <strong>2,619,000원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  본 계산기는 단순 비율을 적용한 <strong>간이 추정치</strong>로, 부양가족 수·비과세 식대·회사별 공제 규정이
                  반영되지 않습니다. 실제 급여명세서와 차이가 날 수 있으며, 정확한 금액은 회사 급여 규정과 그해 세법·요율
                  기준을 확인해야 합니다.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock label="세전 월급 (원)" type="text" placeholder="3,000,000" value={gross} onChange={(e) => setGross(formatComma(parseNumber(e.target.value)))} />
    </CalculatorLayout>
  );
}
