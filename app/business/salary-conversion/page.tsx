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

export default function SalaryConversionPage() {
  const [annualRaw, setAnnualRaw] = useState("");
  const annual = parseNumber(annualRaw);

  const result = useMemo(() => {
    const monthly = annual > 0 ? Math.round(annual / 12) : 0;
    const weekly = annual > 0 ? Math.round(annual / 52) : 0;
    return { monthly, weekly };
  }, [annual]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "연봉 → 월급 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "연봉(세전)", value: `${annual.toLocaleString()}원` },
            { label: "주급 환산", hint: "(52주)", value: `${result.weekly.toLocaleString()}원` },
          ];
  const resultTotal: ResultLine = { label: "월급(세전, 12개월)", value: `${result.monthly.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "salary-conversion",
      title: "연봉 월급 환산 계산기",
      inputs: [{ label: "연봉(입력, 세전)", value: `${annual.toLocaleString()}원` }],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="연봉 → 월급 계산기"
      subtitle="연봉을 12개월 기준으로 간단히 월급으로 환산합니다."
      intro="채용 공고나 계약서에서 본 연봉을 월 단위로 빠르게 바꿔볼 때 사용하세요."
      faqTitle="연봉 → 월급 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 연봉을 월급으로 어떻게 환산하나요?", a: "A. 가장 기본적인 방식은 연봉을 12로 나누는 것입니다. 이 계산기는 세전 연봉 ÷ 12를 기준으로 보여줍니다." },
        { q: "Q. 여기 나온 월급이 통장에 들어오는 금액인가요?", a: "A. 아니요. 세전 환산값입니다. 4대보험과 세금이 빠진 실수령액은 ‘세후 실수령액 간이 계산기’에서 확인하세요." },
        { q: "Q. 상여금·성과급이 있으면 어떻게 되나요?", a: "A. 상여금이 연봉에 포함된 계약이면 월 환산액이 실제 매달 받는 금액보다 커 보일 수 있습니다. 계약서의 지급 방식을 확인하세요." },
        { q: "Q. 퇴직금이 연봉에 포함되기도 하나요?", a: "A. 일부 계약은 퇴직금을 연봉에 포함(13분할)합니다. 이 경우 실제 월급은 연봉 ÷ 13에 가깝습니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 세전 기준 단순 환산 값이며, 상여·성과급·퇴직금 포함 여부에 따라 체감 월급은 달라질 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "연봉과 월급, 무엇이 다를까?",
              body: (
                <p>
                  연봉은 <strong>1년 동안 받기로 한 임금 총액</strong>이고, 월급은 이를 매달 나눠 받는 금액입니다. 채용 공고나
                  근로계약서에는 보통 연봉으로 표기되기 때문에, 매달 실제로 받는 금액을 가늠하려면 월 단위로 환산해 볼 필요가
                  있습니다.
                </p>
              ),
            },
            {
              heading: "계산 방법",
              body: (
                <>
                  <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                    월급(세전) = 연봉 ÷ 12
                    <br />
                    주급(세전) = 연봉 ÷ 52
                  </p>
                  <p>
                    가장 일반적인 방식은 연봉을 <strong>12개월</strong>로 나누는 것입니다. 다만 퇴직금을 연봉에 포함(13분할)하는
                    계약이라면 실제 월급은 연봉 ÷ 13에 가까워집니다.
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>연봉 3,600만원인 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>월급(세전) = 36,000,000 ÷ 12 = <strong>3,000,000원</strong></li>
                    <li>주급(세전) = 36,000,000 ÷ 52 ≈ 692,308원</li>
                  </ul>
                </>
              ),
            },
            {
              heading: "주의사항",
              body: (
                <p>
                  여기서 나오는 값은 <strong>세전 환산액</strong>입니다. 4대보험과 소득세가 빠진 실수령액은 세전 월급보다 낮으며,
                  정확한 실수령액은 ‘세후 실수령액 간이 계산기’에서 확인할 수 있습니다. 상여금·성과급이 연봉에 포함된 계약이면
                  매달 받는 금액이 환산액과 다를 수 있습니다.
                </p>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock
        label="연봉 (세전)"
        type="text"
        inputMode="numeric"
        placeholder="예: 36,000,000"
        value={annualRaw}
        onChange={(e) => setAnnualRaw(formatComma(parseNumber(e.target.value)))}
      />
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
