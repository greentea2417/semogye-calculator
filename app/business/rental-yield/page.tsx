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

export default function RentalYieldPage() {
  const [priceRaw, setPriceRaw] = useState(""); // 매매가(취득가)
  const [depositRaw, setDepositRaw] = useState(""); // 임대보증금
  const [monthlyRaw, setMonthlyRaw] = useState(""); // 월세
  const [costRaw, setCostRaw] = useState(""); // 연간 기타비용

  const result = useMemo(() => {
    const price = Math.max(0, parseNumber(priceRaw));
    const deposit = Math.max(0, parseNumber(depositRaw));
    const monthly = Math.max(0, parseNumber(monthlyRaw));
    const cost = Math.max(0, parseNumber(costRaw));
    const annualIncome = monthly * 12; // 연 임대수입
    const netIncome = annualIncome - cost; // 순 연수입
    const invested = Math.max(0, price - deposit); // 실투자금 = 매매가 − 보증금
    const grossYield = price > 0 ? round2((annualIncome / price) * 100) : 0; // 표면수익률
    const netYield = invested > 0 ? round2((netIncome / invested) * 100) : 0; // 실질수익률
    return { price, deposit, monthly, cost, annualIncome, netIncome, invested, grossYield, netYield };
  }, [priceRaw, depositRaw, monthlyRaw, costRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "임대수익률 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "연 임대수입", hint: "월세 × 12", value: `${result.annualIncome.toLocaleString()}원` },
    { label: "순 연수입", hint: "연 임대수입 − 연간 기타비용", value: `${result.netIncome.toLocaleString()}원` },
    { label: "실투자금", hint: "매매가 − 보증금", value: `${result.invested.toLocaleString()}원` },
    { label: "표면수익률", hint: "연 임대수입 ÷ 매매가", value: `${result.grossYield}%` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "rental-yield",
      title: "임대수익률 계산기",
      inputs: [
        { label: "매매가(입력)", value: `${result.price.toLocaleString()}원` },
        { label: "임대보증금(입력)", value: `${result.deposit.toLocaleString()}원` },
        { label: "월세(입력)", value: `${result.monthly.toLocaleString()}원` },
        { label: "연간 기타비용(입력)", value: `${result.cost.toLocaleString()}원` },
      ],
      lines,
      total: { label: "실질(순)수익률", value: `${result.netYield}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="임대수익률 계산기"
      subtitle="매매가·보증금·월세를 넣으면 표면수익률과 실투자금 기준 실질수익률을 바로 계산합니다."
      intro="부동산 임대수익률을 표면수익률(연 임대수입÷매매가)과 실질수익률(순 연수입÷실투자금)로 나눠 계산하는 간이 계산기입니다. 실투자금은 매매가에서 임대보증금을 뺀 자기자본을 기준으로 합니다."
      faqTitle="임대수익률 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 임대수익률은 어떻게 계산하나요?",
          a: "A. 표면수익률 = 연 임대수입(월세×12) ÷ 매매가 × 100 이고, 실질수익률 = 순 연수입(연 임대수입 − 연간 비용) ÷ 실투자금(매매가 − 보증금) × 100 입니다. 예를 들어 매매가 3억원, 보증금 3천만원, 월세 100만원이면 표면 4.0%, 실질 약 4.44%입니다.",
        },
        {
          q: "Q. 표면수익률과 실질수익률은 무엇이 다른가요?",
          a: "A. 표면수익률은 매매가 전액을 기준으로 한 단순 수익률이고, 실질수익률은 보증금을 뺀 실제 투입 자금과 관리비·재산세 등 연간 비용을 반영해 체감 수익률에 더 가깝습니다.",
        },
        {
          q: "Q. 연간 기타비용에는 무엇을 넣나요?",
          a: "A. 재산세·종합부동산세, 건물 관리비, 화재보험료, 수선비 등 임대인이 실제 부담하는 연간 비용을 합산해 입력합니다. 비우면 비용 0원 기준으로 계산됩니다.",
        },
        {
          q: "Q. 대출을 낀 경우에는 어떻게 하나요?",
          a: "A. 이 계산기는 대출을 반영하지 않은 자기자본 기준입니다. 대출 레버리지를 반영하려면 연간 기타비용에 대출이자를 더하고, 실투자금은 매매가에서 보증금과 대출금을 뺀 금액으로 별도 계산해 비교해 보세요.",
        },
        {
          q: "Q. 매매가가 0이거나 비어 있으면 어떻게 되나요?",
          a: "A. 매매가가 0원이면 수익률은 0%로 표시됩니다. CSV에는 매매가·보증금·월세·연간 비용 등 입력값과 연 임대수입·순 연수입·실투자금·표면·실질수익률이 모두 담겨 엑셀에서 바로 열 수 있습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="임대수익률 계산 결과"
          lines={lines}
          total={{ label: "실질(순)수익률", value: `${result.netYield}%` }}
          note="※ 취득세·중개보수 등 초기비용과 대출·공실률은 반영하지 않은 간이 계산입니다. 투자 판단은 실제 조건으로 다시 확인하세요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="매매가 (원)"
          type="text"
          inputMode="numeric"
          value={priceRaw}
          onChange={(e) => setPriceRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 300,000,000"
        />
        <InputBlock
          label="임대보증금 (원)"
          type="text"
          inputMode="numeric"
          value={depositRaw}
          onChange={(e) => setDepositRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 30,000,000"
        />
        <InputBlock
          label="월세 (원)"
          type="text"
          inputMode="numeric"
          value={monthlyRaw}
          onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 1,000,000"
        />
        <InputBlock
          label="연간 기타비용 (원)"
          type="text"
          inputMode="numeric"
          value={costRaw}
          onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 0"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 실투자금은 매매가에서 임대보증금을 뺀 자기자본 기준입니다. 연간 기타비용을 비우면 비용 0원으로 계산됩니다.
      </p>
    </CalculatorLayout>
  );
}
