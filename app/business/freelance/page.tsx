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
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function BusinessFreelancePage() {
  const [amountRaw, setAmountRaw] = useState("");
  const value = parseNumber(amountRaw);

  const result = useMemo(() => {
    const tax = Math.round(value * 0.033);
    const net = Math.max(0, value - tax);
    return { tax, net };
  }, [value]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "프리랜서 실수령액 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "세전 금액", value: `${value.toLocaleString()}원` },
            { label: "원천징수", hint: "(3.3%)", value: `${result.tax.toLocaleString()}원` },
          ];
  const resultTotal: ResultLine = { label: "실수령액(예상)", value: `${result.net.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "freelance-simple",
      title: "프리랜서 실수령액 계산기",
      inputs: [{ label: "세전 금액(입력)", value: `${value.toLocaleString()}원` }],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="프리랜서 3.3% 실수령액 계산기"
      subtitle="3.3% 원천징수 기준으로 프리랜서 실수령액을 계산합니다."
      intro="세전 금액에서 사업소득 원천징수 3.3%를 반영해 실제 받는 돈을 빠르게 확인할 수 있습니다."
      faqTitle="프리랜서 3.3% 실수령액 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 3.3%는 무엇인가요?", a: "A. 사업소득 원천징수 세율로, 소득세 3%와 지방소득세 0.3%를 합친 값입니다." },
        { q: "Q. 실제 신고 결과와 같은가요?", a: "A. 아니요. 5월 종합소득세 신고에서 필요경비·공제를 반영하면 최종 세액이 달라집니다." },
        { q: "Q. 부가세도 반영되나요?", a: "A. 이 계산은 원천징수 기준이며 부가세(10%)는 별도 계약 조건에 따릅니다." },
        { q: "Q. 3.3%를 떼면 세금이 끝인가요?", a: "A. 아니요. 미리 낸 세금이라 종합소득세 신고 때 환급 또는 추가 납부가 생길 수 있습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 간이 계산이며 실제 신고·공제 조건에 따라 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "프리랜서 3.3% 원천징수란?",
              body: (
                <>
                  <p>
                    프리랜서·인적용역 사업자는 근로자처럼 4대보험을 떼는 대신, 대금을 받을 때 <strong>3.3%가 원천징수</strong>됩니다.
                    이는 소득세 3%와 지방소득세 0.3%를 합한 세율로, 대금을 지급하는 회사가 미리 떼어 세무서에 대신 납부합니다.
                    그래서 통장에는 계약 금액의 96.7%가 입금됩니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    원천징수액 = 세전 금액 × 3.3%
                    <br />
                    실수령액 = 세전 금액 − 원천징수액
                  </p>
                  <p>
                    3.3%는 소득세 3%와 그에 붙는 지방소득세 0.3%(소득세의 10%)를 합친 값입니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>세전 금액 1,000,000원인 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>원천징수 = 1,000,000 × 3.3% = 33,000원</li>
                    <li>실수령액 = 1,000,000 − 33,000 = <strong>967,000원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "종합소득세 신고와 환급",
              body: (
                <>
                  <p>
                    3.3% 원천징수는 <strong>최종 세금이 아니라 미리 낸 세금(선납)</strong>입니다. 매년 5월 종합소득세 신고에서
                    1년치 소득과 필요경비·공제를 정산하며, 이때 다음이 반영됩니다.
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>소득이 적거나 경비·공제가 많으면 <strong>세금을 환급</strong>받을 수 있습니다.</li>
                    <li>소득이 높으면 오히려 추가 납부가 발생할 수 있습니다.</li>
                    <li>부가세(10%)는 원천징수와 별개로 계약 조건에 따릅니다.</li>
                  </ul>
                  <p>본 계산기는 원천징수 3.3% 기준의 참고용 값이며, 최종 세액은 신고 결과에 따라 달라집니다.</p>
                </>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock
        label="세전 금액 (원)"
        type="text"
        inputMode="numeric"
        placeholder="예: 1,000,000"
        value={amountRaw}
        onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))}
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
