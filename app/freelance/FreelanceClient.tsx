"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InputBlock from "../components/InputBlock";
import BottomActions from "../components/BottomActions";
import CalculatorLayout from "../components/CalculatorLayout";
import CalculatorArticle from "../components/CalculatorArticle";
import ResultPanel, { type ResultLine } from "../components/ResultPanel";
import { downloadResultCsv } from "../components/lib/resultCsv";
import { toast } from "../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function FreelancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState("");
  const amountNum = useMemo(() => parseNumber(amount), [amount]);

  useEffect(() => {
    const q = searchParams.get("amount");
    if (!q) return;
    const n = parseNumber(q);
    const current = parseNumber(amount);
    if (n === current) return;
    setAmount(n ? formatComma(n) : "");
  }, [searchParams, amount]);

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseNumber(e.target.value);
    setAmount(n ? formatComma(n) : "");
    if (!pathname) return;
    router.replace(n > 0 ? `${pathname}?amount=${n}` : pathname, { scroll: false });
  };

  const result = useMemo(() => {
    const tax = Math.round(amountNum * 0.03);
    const localTax = Math.round(tax * 0.1);
    const totalTax = tax + localTax;
    const takeHome = Math.max(0, amountNum - totalTax);
    return { tax, localTax, totalTax, takeHome };
  }, [amountNum]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${pathname || "/freelance"}`;
    return amountNum > 0 ? `${base}?amount=${amountNum}` : base;
  }, [amountNum, pathname]);

  const onShare = async () => {
    try {
      if (!shareUrl) return;
      if (navigator.share) await navigator.share({ title: "프리랜서 실수령액 계산기", text: "3.3% 원천징수 기준으로 실수령액을 계산해 보세요.", url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "세전 수입", value: `${amountNum.toLocaleString()}원` },
            { label: "소득세", hint: "(3%)", value: `${result.tax.toLocaleString()}원` },
            { label: "지방소득세", hint: "(0.3%)", value: `${result.localTax.toLocaleString()}원` },
          ];
  const resultSubTotal: ResultLine = { label: "총 공제액", value: `${result.totalTax.toLocaleString()}원` };
  const resultTotal: ResultLine = { label: "실수령액(예상)", value: `${result.takeHome.toLocaleString()}원` };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "freelance",
      title: "프리랜서 실수령액 계산기",
      inputs: [{ label: "프리랜서 월 수입(입력, 세전)", value: `${amountNum.toLocaleString()}원` }],
      lines: resultLines,
      subTotal: resultSubTotal,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="프리랜서 실수령액 계산기"
      subtitle="3.3% 원천징수 기준으로 실제 받는 금액을 계산합니다."
      intro="원천징수 소득세와 지방소득세를 반영해 실수령액을 빠르게 확인해보세요."
      faqTitle="프리랜서 실수령액 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 3.3%는 정확히 무엇인가요?", a: "A. 원천징수 세율로 소득세 3%와 지방소득세 0.3%를 합친 값입니다." },
        { q: "Q. 이 금액이 최종 세금인가요?", a: "A. 아니요. 5월 종합소득세 신고 시 최종 세액은 달라질 수 있습니다." },
        { q: "Q. 부가세가 포함된 계약도 계산되나요?", a: "A. 이 계산기는 원천징수 3.3% 기준이며, 부가세 포함 여부는 별도입니다." },
      ]}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          subTotal={resultSubTotal}
          total={resultTotal}
          note="* 원천징수 3.3% 기준이며, 5월 종합소득세 신고 결과에 따라 최종 세액은 달라질 수 있습니다."
        />
      }
      article={
        <CalculatorArticle
          sections={[
            {
              heading: "프리랜서 3.3% 원천징수란?",
              body: (
                <>
                  <p>
                    프리랜서·인적용역 사업자는 근로자처럼 4대보험을 떼는 대신, 대금을 받을 때 <strong>3.3%가 원천징수</strong>됩니다.
                    이는 소득세 3%와 지방소득세 0.3%를 합한 세율로, 지급하는 회사가 미리 떼어 세무서에 대신 납부합니다.
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
                    소득세 = 세전 금액 × 3%
                    <br />
                    지방소득세 = 소득세 × 10% (= 세전 금액 × 0.3%)
                    <br />
                    실수령액 = 세전 금액 − (소득세 + 지방소득세)
                  </p>
                </>
              ),
            },
            {
              heading: "계산 예시",
              body: (
                <>
                  <p>세전 수입 2,500,000원인 경우:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>소득세 = 2,500,000 × 3% = 75,000원</li>
                    <li>지방소득세 = 75,000 × 10% = 7,500원</li>
                    <li>총 공제 = 82,500원 → 실수령액 = <strong>2,417,500원</strong></li>
                  </ul>
                </>
              ),
            },
            {
              heading: "종합소득세 신고와 환급",
              body: (
                <>
                  <p>
                    3.3% 원천징수는 <strong>최종 세금이 아니라 미리 낸 세금(선납)</strong>입니다. 매년 5월 종합소득세 신고를 통해
                    1년치 소득과 경비를 정산하며, 이때 다음이 반영됩니다.
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>소득이 적거나 경비·공제가 많으면 <strong>세금을 환급</strong>받을 수 있습니다.</li>
                    <li>소득이 높으면 오히려 추가 납부가 발생할 수 있습니다.</li>
                    <li>연 소득 규모에 따라 건강보험 지역가입자 전환 등도 고려해야 합니다.</li>
                  </ul>
                  <p>본 계산기는 원천징수 3.3% 기준의 참고용 값이며, 최종 세액은 신고 결과에 따라 달라집니다.</p>
                </>
              ),
            },
          ]}
        />
      }
    >
      <InputBlock label="프리랜서 월 수입 (세전)" type="text" inputMode="numeric" placeholder="예: 2,500,000" value={amount} onChange={onChangeAmount} />
      <p className="text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
