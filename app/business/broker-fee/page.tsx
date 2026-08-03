"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { LifeChoice } from "@/components/LifeResult";
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

type Deal = "sale" | "jeonse" | "monthly";

type Band = { max: number; rate: number; cap: number | null };

// 공인중개사법 시행규칙 [별표 1] 주택 중개보수 상한요율 (국토교통부 기준)
const SALE_TABLE: Band[] = [
  { max: 50_000_000, rate: 0.006, cap: 250_000 },
  { max: 200_000_000, rate: 0.005, cap: 800_000 },
  { max: 900_000_000, rate: 0.004, cap: null },
  { max: 1_200_000_000, rate: 0.005, cap: null },
  { max: 1_500_000_000, rate: 0.006, cap: null },
  { max: Infinity, rate: 0.007, cap: null },
];
const RENT_TABLE: Band[] = [
  { max: 50_000_000, rate: 0.005, cap: 200_000 },
  { max: 100_000_000, rate: 0.004, cap: 300_000 },
  { max: 600_000_000, rate: 0.003, cap: null },
  { max: 1_200_000_000, rate: 0.004, cap: null },
  { max: 1_500_000_000, rate: 0.005, cap: null },
  { max: Infinity, rate: 0.006, cap: null },
];

function findBand(table: Band[], amount: number) {
  return table.find((b) => amount < b.max) ?? table[table.length - 1];
}

export default function BrokerFeePage() {
  const [deal, setDeal] = useState<Deal>("sale");
  const [amountRaw, setAmountRaw] = useState(""); // 매매가 / 전세보증금 / 월세보증금
  const [monthlyRaw, setMonthlyRaw] = useState(""); // 월세 (월세 계약에서만)

  const result = useMemo(() => {
    const amount = parseNumber(amountRaw);
    const monthly = parseNumber(monthlyRaw);

    // 월세는 보증금 + 월세×100 으로 환산하되, 5천만원 미만이면 보증금 + 월세×70
    let base = amount;
    if (deal === "monthly") {
      base = amount + monthly * 100;
      if (base < 50_000_000) base = amount + monthly * 70;
    }

    const table = deal === "sale" ? SALE_TABLE : RENT_TABLE;
    const band = findBand(table, base);
    let fee = Math.round(base * band.rate);
    if (band.cap != null) fee = Math.min(fee, band.cap);
    if (base <= 0) fee = 0;

    return { amount, monthly, base, rate: band.rate, cap: band.cap, fee };
  }, [deal, amountRaw, monthlyRaw]);

  const dealLabel = deal === "sale" ? "매매·교환" : deal === "jeonse" ? "전세" : "월세";

  const lines: ResultLine[] = [];
  if (deal === "monthly") {
    lines.push({ label: "환산 거래금액", hint: "보증금 + 월세×100(5천만 미만은 ×70)", value: `${result.base.toLocaleString()}원` });
  }
  lines.push({ label: "적용 상한요율", hint: deal === "sale" ? "매매·교환" : "임대차", value: `${(result.rate * 100).toFixed(1)}%` });
  lines.push({ label: "한도액", hint: "구간 상한", value: result.cap != null ? `${result.cap.toLocaleString()}원` : "없음" });

  const total: ResultLine = { label: "중개보수 상한액", value: `${result.fee.toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "부동산 중개보수 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };
  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "broker-fee",
      title: "부동산 중개보수 계산기",
      inputs: [
        { label: "거래 유형(입력)", value: dealLabel },
        { label: deal === "monthly" ? "보증금(입력)" : "거래금액(입력)", value: `${result.amount.toLocaleString()}원` },
        ...(deal === "monthly" ? [{ label: "월세(입력)", value: `${result.monthly.toLocaleString()}원` }] : []),
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="부동산 중개보수 계산기"
      subtitle="매매·전세·월세 거래금액을 넣으면 주택 중개보수(복비) 상한액을 계산합니다."
      intro="공인중개사법 시행규칙 별표 1의 주택 중개보수 상한요율(국토교통부 기준)로 계산하며, 실제 보수는 상한 안에서 협의로 정합니다."
      faqTitle="부동산 중개보수 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 중개보수는 어떻게 계산하나요?", a: "A. 거래금액 × 상한요율로 계산합니다. 거래금액 구간마다 상한요율과 한도액이 정해져 있으며, 한도액이 있는 구간은 계산액이 한도를 넘으면 한도액이 적용됩니다." },
        { q: "Q. 월세는 거래금액을 어떻게 정하나요?", a: "A. 보증금 + (월세 × 100)으로 환산합니다. 다만 이 금액이 5천만원 미만이면 보증금 + (월세 × 70)으로 다시 계산해 상한요율을 적용합니다." },
        { q: "Q. 상한요율은 지역마다 다른가요?", a: "A. 표시된 요율은 국토교통부 기준 상한요율입니다. 2억~9억(매매), 1억~6억(임대차) 등 일부 구간은 시·도 조례로 상한이 정해질 수 있어 지역별로 차이가 날 수 있습니다." },
        { q: "Q. 부가가치세는 포함인가요?", a: "A. 계산 결과는 부가세 별도의 중개보수 상한액입니다. 일반과세 중개사무소는 여기에 10% 부가세가 더 붙을 수 있습니다." },
        { q: "Q. 빈칸이나 0원도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원으로 표시합니다. CSV에는 입력값과 결과값이 모두 들어갑니다. 엑셀에서 열 수 있어요 (.csv)" },
      ]}
      result={
        <ResultPanel
          title="중개보수 계산 결과"
          lines={lines}
          total={total}
          note="* 국토교통부 기준 상한요율(부가세 별도)이며, 실제 보수는 상한 안에서 협의로 정합니다. 지역 조례에 따라 요율이 다를 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="mb-4 space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">거래 유형</span>
        <div className="grid grid-cols-3 gap-2">
          <LifeChoice active={deal === "sale"} onClick={() => setDeal("sale")}>
            매매·교환
          </LifeChoice>
          <LifeChoice active={deal === "jeonse"} onClick={() => setDeal("jeonse")}>
            전세
          </LifeChoice>
          <LifeChoice active={deal === "monthly"} onClick={() => setDeal("monthly")}>
            월세
          </LifeChoice>
        </div>
      </div>

      <InputBlock
        label={deal === "monthly" ? "보증금 (원)" : deal === "jeonse" ? "전세보증금 (원)" : "매매가 (원)"}
        type="text"
        inputMode="numeric"
        value={amountRaw}
        onChange={(e) => setAmountRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 300,000,000"
      />
      {deal === "monthly" && (
        <div className="mt-4">
          <InputBlock
            label="월세 (원)"
            type="text"
            inputMode="numeric"
            value={monthlyRaw}
            onChange={(e) => setMonthlyRaw(formatComma(parseNumber(e.target.value)))}
            placeholder="예: 500,000"
          />
        </div>
      )}
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
