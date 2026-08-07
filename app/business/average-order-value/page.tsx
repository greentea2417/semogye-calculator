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
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function calcAov(revenueRaw: number, ordersRaw: number) {
  const revenue = Math.max(0, revenueRaw);
  const orders = Math.max(0, ordersRaw);
  const aov = orders > 0 ? revenue / orders : 0;
  return { revenue, orders, aov };
}

export default function AverageOrderValuePage() {
  const [revenueRaw, setRevenueRaw] = useState("");
  const [ordersRaw, setOrdersRaw] = useState("");

  const result = useMemo(() => calcAov(parseNumber(revenueRaw), parseNumber(ordersRaw)), [revenueRaw, ordersRaw]);
  const lines: ResultLine[] = [
    { label: "매출", hint: "입력값", value: `${result.revenue.toLocaleString()}원` },
    { label: "주문 건수", hint: "입력값", value: `${result.orders.toLocaleString()}건` },
    { label: "객단가", hint: "매출 ÷ 주문 건수", value: `${round2(result.aov).toLocaleString()}원` },
  ];
  const total = { label: "객단가", value: `${round2(result.aov).toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "객단가 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const onCsvDownload = () => downloadResultCsv({
    slug: "average-order-value",
    title: "객단가 계산기",
    inputs: [
      { label: "매출(입력)", value: `${result.revenue.toLocaleString()}원` },
      { label: "주문 건수(입력)", value: `${result.orders.toLocaleString()}건` },
    ],
    lines,
    total,
  });

  return (
    <CalculatorLayout
      tone="business"
      title="객단가 계산기"
      subtitle="매출과 주문 건수를 넣으면 객단가를 계산합니다."
      intro="온라인몰·오프라인 매장·배달 매장의 고객 1건당 평균 매출을 빠르게 확인할 수 있어요."
      faqTitle="객단가 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 객단가는 어떻게 계산하나요?", a: "A. 객단가 = 매출 ÷ 주문 건수 입니다. 예를 들어 매출 300만원, 주문 150건이면 객단가는 2만원입니다." },
        { q: "Q. 주문 건수 대신 방문자 수를 넣어도 되나요?", a: "A. 아니요. 방문자 수를 넣으면 객단가가 아니라 방문자당 매출이 됩니다. 객단가는 실제 주문(거래) 기준으로 계산합니다." },
        { q: "Q. 주문 건수가 0이면요?", a: "A. 나눗셈이 불가능하므로 0원으로 표시합니다. 주문 건수가 있어야 객단가를 계산할 수 있습니다." },
        { q: "Q. 세금 포함 금액으로 계산해야 하나요?", a: "A. 운영 목적에 맞춰 일관되게 넣는 것이 중요합니다. 보통은 실제 매출 기준으로 계산하며, 부가세 포함/제외 기준은 같은 방식으로 맞추면 됩니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 매출·주문 건수와 계산된 객단가가 함께 저장됩니다." },
      ]}
      result={<ResultPanel title="객단가 계산 결과" lines={lines} total={total} note="* 주문 건수는 정수로 입력하세요. 소수 주문 건수는 일반적으로 사용하지 않습니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출 (원)" type="text" inputMode="numeric" value={revenueRaw} onChange={(e) => setRevenueRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 30,000,000" />
        <InputBlock label="주문 건수 (건)" type="text" inputMode="numeric" value={ordersRaw} onChange={(e) => setOrdersRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,500" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 객단가는 판매단가, 평균 주문금액으로도 불립니다.</p>
    </CalculatorLayout>
  );
}
