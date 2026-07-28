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

function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function DiscountPage() {
  const [listPriceRaw, setListPriceRaw] = useState("");
  const [salePriceRaw, setSalePriceRaw] = useState("");

  const result = useMemo(() => {
    const listPrice = Math.max(0, parseNumber(listPriceRaw));
    const salePrice = Math.max(0, parseNumber(salePriceRaw));
    const discountAmount = Math.max(0, listPrice - salePrice);
    const discountRate = listPrice > 0 ? round2((discountAmount / listPrice) * 100) : 0;
    const saleRatio = listPrice > 0 ? round2((salePrice / listPrice) * 100) : 0;
    return { listPrice, salePrice, discountAmount, discountRate, saleRatio };
  }, [listPriceRaw, salePriceRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "할인율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "할인액", hint: "정가 - 판매가", value: `${result.discountAmount.toLocaleString()}원` },
    { label: "할인율", hint: "할인액 ÷ 정가", value: `${result.discountRate}%` },
    { label: "판매가 비율", hint: "판매가 ÷ 정가", value: `${result.saleRatio}%` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "discount",
      title: "할인율 계산기",
      inputs: [
        { label: "정가(입력)", value: `${result.listPrice.toLocaleString()}원` },
        { label: "판매가(입력)", value: `${result.salePrice.toLocaleString()}원` },
      ],
      lines,
      total: { label: "할인율", value: `${result.discountRate}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="할인율 계산기"
      subtitle="정가와 판매가를 넣으면 할인액과 할인율을 바로 계산합니다."
      intro="세일가, 쿠폰 적용가, 프로모션 가격을 빠르게 비교할 때 유용합니다."
      faqTitle="할인율 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 할인율은 어떻게 계산하나요?",
          a: "A. 할인율(%) = (정가 − 판매가) ÷ 정가 × 100 입니다. 정가 10,000원, 판매가 7,500원이면 할인율은 25%입니다.",
        },
        {
          q: "Q. 판매가가 정가보다 높으면 어떻게 되나요?",
          a: "A. 이 계산기는 할인액을 0원 미만으로 내려가지 않게 처리합니다. 판매가가 더 높으면 할인율은 0%로 표시됩니다.",
        },
        {
          q: "Q. 정가가 0원인 경우도 계산되나요?",
          a: "A. 정가가 0원이면 비율 계산이 불가능하므로 할인율과 판매가 비율은 0%로 표시합니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 정가, 판매가, 할인액, 할인율, 판매가 비율이 모두 들어가며 엑셀에서 열 수 있는 CSV로 내려받습니다.",
        },
      ]}
      result={<ResultPanel title="할인 계산 결과" lines={lines} total={{ label: "할인율", value: `${result.discountRate}%` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="정가 (원)" type="text" inputMode="numeric" value={listPriceRaw} onChange={(e) => setListPriceRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000" />
        <InputBlock label="판매가 (원)" type="text" inputMode="numeric" value={salePriceRaw} onChange={(e) => setSalePriceRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 7,500" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
