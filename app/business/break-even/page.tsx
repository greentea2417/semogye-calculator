"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function BreakEvenPage() {
  const [fixedRaw, setFixedRaw] = useState(""); // 고정비
  const [priceRaw, setPriceRaw] = useState(""); // 단위 판매가
  const [variableRaw, setVariableRaw] = useState(""); // 단위 변동비

  const result = useMemo(() => {
    const fixed = parseNumber(fixedRaw);
    const price = parseNumber(priceRaw);
    const variable = parseNumber(variableRaw);
    const contribution = price - variable; // 단위당 공헌이익
    const contributionRate = price > 0 ? contribution / price : 0; // 공헌이익률
    const valid = price > 0 && contribution > 0;
    const bepQty = valid ? Math.ceil(fixed / contribution) : 0; // 손익분기 판매량
    const bepRevenue = valid ? Math.round(fixed / contributionRate) : 0; // 손익분기 매출액
    return { fixed, price, variable, contribution, contributionRate, valid, bepQty, bepRevenue };
  }, [fixedRaw, priceRaw, variableRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "손익분기점 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
    { label: "단위당 공헌이익", hint: "(판매가−변동비)", value: `${result.contribution.toLocaleString()}원` },
    {
      label: "공헌이익률",
      value: result.valid ? `${round2(result.contributionRate * 100)}%` : "-",
    },
    {
      label: "손익분기 판매량",
      hint: "(고정비÷공헌이익)",
      value: result.valid ? `${result.bepQty.toLocaleString()}개` : "계산 불가",
    },
  ];
  const resultTotal: ResultLine = {
    label: "손익분기 매출액",
    value: result.valid ? `${result.bepRevenue.toLocaleString()}원` : "계산 불가",
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "break-even",
      title: "손익분기점 계산기",
      inputs: [
        { label: "고정비(입력)", value: `${parseNumber(fixedRaw).toLocaleString()}원` },
        { label: "단위 판매가(입력)", value: `${parseNumber(priceRaw).toLocaleString()}원` },
        { label: "단위 변동비(입력)", value: `${parseNumber(variableRaw).toLocaleString()}원` },
      ],
      lines: resultLines,
      total: resultTotal,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="손익분기점 계산기"
      subtitle="고정비와 단위 판매가·변동비를 넣으면 손익분기 판매량과 매출액을 계산합니다."
      intro="손익분기점(BEP)은 총수익과 총비용이 같아 이익이 0이 되는 지점입니다. 공헌이익률로 목표 매출을 바로 확인하세요."
      faqTitle="손익분기점 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 손익분기점은 어떻게 계산하나요?",
          a: "A. 손익분기 판매량 = 고정비 ÷ 단위당 공헌이익, 손익분기 매출액 = 고정비 ÷ 공헌이익률 입니다. 공헌이익 = 판매가 − 변동비입니다.",
        },
        {
          q: "Q. 공헌이익률이란 무엇인가요?",
          a: "A. 공헌이익률 = 단위당 공헌이익 ÷ 판매가 입니다. 판매가 5,000원, 변동비 3,000원이면 공헌이익 2,000원, 공헌이익률 40%입니다. 매출 1원 중 고정비를 회수하는 비율을 뜻합니다.",
        },
        {
          q: "Q. 고정비와 변동비는 어떻게 구분하나요?",
          a: "A. 고정비는 판매량과 무관하게 드는 비용(임대료·인건비 등), 변동비는 판매량에 비례하는 비용(재료비·포장비 등)입니다. 단위 변동비는 제품 1개당 변동비입니다.",
        },
        {
          q: "Q. 판매가가 변동비보다 낮으면요?",
          a: "A. 공헌이익이 0 이하가 되어 팔수록 손해이므로 손익분기점이 존재하지 않습니다. 이때는 '계산 불가'로 표시됩니다. 가격을 올리거나 변동비를 낮춰야 합니다.",
        },
        {
          q: "Q. 목표 이익을 반영할 수 있나요?",
          a: "A. 목표이익 달성 판매량 = (고정비 + 목표이익) ÷ 단위당 공헌이익 으로 확장할 수 있습니다. 이 계산기는 이익 0(손익분기) 기준의 최소 판매량과 매출액을 보여줍니다.",
        },
      ]}
      result={
        <ResultPanel
          title="손익분기점 계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="* 판매량은 정수로 올림 처리했습니다. 부가세를 제외한 공급가액 기준으로 계산하면 더 정확합니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="고정비 (원)"
          type="text"
          inputMode="numeric"
          value={fixedRaw}
          onChange={(e) => setFixedRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 1,000,000"
        />
        <InputBlock
          label="단위 판매가 (원)"
          type="text"
          inputMode="numeric"
          value={priceRaw}
          onChange={(e) => setPriceRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 5,000"
        />
        <InputBlock
          label="단위 변동비 (원)"
          type="text"
          inputMode="numeric"
          value={variableRaw}
          onChange={(e) => setVariableRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 3,000"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 고정비는 월·연 등 원하는 기간 기준으로 넣으면 됩니다. 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
