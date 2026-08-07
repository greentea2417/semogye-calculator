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
  const cleaned = String(raw ?? "").replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatWon(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function won(n: number) {
  return `${Math.floor(n).toLocaleString("ko-KR")}원`;
}

/** 인지세법 제3조 부동산 소유권 이전 등 기재금액별 인지세액. 단위: 원 */
function stampTaxByAmount(amount: number) {
  if (amount <= 10_000_000) return 0; // 1천만원 이하 비과세
  if (amount <= 30_000_000) return 20_000;
  if (amount <= 50_000_000) return 40_000;
  if (amount <= 100_000_000) return 70_000;
  if (amount <= 1_000_000_000) return 150_000;
  return 350_000;
}

function calcStampTax(amount: number, isHouse: boolean) {
  const base = stampTaxByAmount(amount);
  // 주택은 기재금액 1억원 이하이면 비과세 특례
  const stamp = isHouse && amount <= 100_000_000 ? 0 : base;
  const houseExempt = isHouse && amount > 0 && amount <= 100_000_000;
  return { amount, stamp, houseExempt };
}

export default function StampTaxPage() {
  const [amountRaw, setAmountRaw] = useState("");
  const [isHouse, setIsHouse] = useState(false);

  const r = useMemo(
    () => calcStampTax(parseNumber(amountRaw), isHouse),
    [amountRaw, isHouse],
  );

  const lines: ResultLine[] = [
    { label: "기재금액(거래금액)", hint: "입력값", value: won(r.amount) },
    { label: "주택 여부", hint: "1억원 이하 면제 특례", value: isHouse ? "주택" : "일반 부동산" },
  ];
  const total = { label: "인지세", value: won(r.stamp) };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "인지세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "stamp-tax",
      title: "인지세 계산기",
      inputs: [
        { label: "기재금액(입력)", value: won(parseNumber(amountRaw)) },
        { label: "주택 여부(입력)", value: isHouse ? "주택" : "일반 부동산" },
      ],
      lines,
      total,
      footerNote: r.houseExempt ? "주택 1억원 이하 비과세 특례가 적용되었습니다." : undefined,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="인지세 계산기"
      subtitle="부동산 매매 등 계약서의 기재금액을 넣으면 부담할 인지세를 계산합니다."
      intro="인지세법 제3조 기재금액 구간별 정액 인지세를 적용해요."
      faqTitle="인지세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 인지세는 얼마인가요?",
          a: "A. 부동산 소유권 이전 등 문서는 기재금액 구간별 정액입니다. 1천만원 이하 비과세, 1천만~3천만원 2만원, 3천만~5천만원 4만원, 5천만~1억원 7만원, 1억~10억원 15만원, 10억원 초과 35만원입니다.",
        },
        {
          q: "Q. 주택을 사면 인지세가 면제되나요?",
          a: "A. 주택의 매매계약서는 기재금액이 1억원 이하이면 인지세가 비과세됩니다. '주택 거래' 항목을 체크하면 이 특례가 반영됩니다. 다만 주택부수토지 등은 특례 대상이 아닐 수 있습니다.",
        },
        {
          q: "Q. 기재금액은 무엇을 넣나요?",
          a: "A. 계약서에 적힌 거래금액(매매대금 등)을 넣습니다. 부가세 등 별도 기재가 아닌 문서상 기재금액을 기준으로 인지세 구간이 정해집니다.",
        },
        {
          q: "Q. 인지세는 누가, 어떻게 내나요?",
          a: "A. 문서를 작성한 당사자가 연대하여 납부하며, 실무상 매수인·매도인이 나눠 부담하기도 합니다. 전자수입인지(edoc-revenuestamp)로 납부하는 것이 일반적입니다.",
        },
        {
          q: "Q. 금액이 비어 있거나 0원이면요?",
          a: "A. 기재금액이 1천만원 이하이면 인지세가 없어 0원으로 표시됩니다. 값을 입력하지 않으면 0원으로 계산됩니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 기재금액과 주택 여부, 그리고 계산된 인지세가 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="인지세 계산 결과"
          lines={lines}
          total={total}
          note={
            r.houseExempt
              ? "* 주택 기재금액 1억원 이하로 비과세 특례가 적용되었습니다."
              : "* 부동산 소유권 이전 문서 기준 기재금액 구간별 정액 인지세입니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4">
        <InputBlock
          label="기재금액 (원)"
          type="text"
          inputMode="numeric"
          value={amountRaw}
          onChange={(e) => setAmountRaw(formatWon(parseNumber(e.target.value)))}
          placeholder="예: 300,000,000"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isHouse}
            onChange={(e) => setIsHouse(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          주택 거래 (기재금액 1억원 이하 비과세 특례 적용)
        </label>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 계약서에 적힌 기재금액을 넣으세요. 1천만원 이하는 인지세가 없습니다.
      </p>
    </CalculatorLayout>
  );
}
