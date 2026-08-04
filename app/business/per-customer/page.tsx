"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) { const cleaned = String(raw ?? "").replace(/[^\d.]/g, ""); return cleaned ? Number(cleaned) : 0; }
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }
function round0(n: number) { return Math.round(n); }

export default function PerCustomerPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [customersRaw, setCustomersRaw] = useState("");
  const [txRaw, setTxRaw] = useState("");

  const result = useMemo(() => {
    const sales = Math.max(0, parseNumber(salesRaw));
    const customers = Math.max(0, parseNumber(customersRaw));
    const transactions = Math.max(0, parseNumber(txRaw));
    const hasCustomers = customers > 0;
    const perCustomer = hasCustomers ? round0(sales / customers) : 0;      // 객단가
    const perTransaction = transactions > 0 ? round0(sales / transactions) : 0; // 건당 결제액
    const txPerCustomer = hasCustomers && transactions > 0 ? transactions / customers : 0; // 인당 결제건수
    return { sales, customers, transactions, hasCustomers, perCustomer, perTransaction, txPerCustomer };
  }, [salesRaw, customersRaw, txRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try { if (navigator.share) await navigator.share({ title: "객단가 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {}
  };

  const perCustomerText = result.hasCustomers ? `${result.perCustomer.toLocaleString()}원` : "-";
  const perTxText = result.transactions > 0 ? `${result.perTransaction.toLocaleString()}원` : "-";
  const txPerCustomerText = result.hasCustomers && result.transactions > 0 ? `${result.txPerCustomer.toFixed(2)}건` : "-";

  const lines: ResultLine[] = [
    { label: "객단가", hint: "총매출 ÷ 고객수", value: perCustomerText },
    { label: "건당 평균 결제액", hint: "총매출 ÷ 결제건수", value: perTxText },
    { label: "인당 결제건수", hint: "결제건수 ÷ 고객수", value: txPerCustomerText },
  ];

  const onCsvDownload = () => downloadResultCsv({
    slug: "per-customer",
    title: "객단가 계산기",
    inputs: [
      { label: "총매출(입력)", value: `${result.sales.toLocaleString()}원` },
      { label: "고객수(입력)", value: `${result.customers.toLocaleString()}명` },
      { label: "결제건수(입력)", value: `${result.transactions.toLocaleString()}건` },
    ],
    lines,
    total: { label: "객단가", value: perCustomerText },
  });

  return (
    <CalculatorLayout tone="business" title="객단가 계산기" subtitle="총매출과 고객수로 객단가(1인당 평균 구매액)를 계산합니다." intro="객단가는 고객 한 명이 평균적으로 얼마를 쓰는지 보여주는 매출 분석의 기본 지표입니다." faqTitle="객단가 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 객단가는 어떻게 계산하나요?", a: "A. 객단가 = 총매출 ÷ 고객수 입니다. 예를 들어 매출 500만 원, 고객 500명이면 객단가는 10,000원입니다." },
      { q: "Q. 객단가와 건당 결제액은 어떻게 다른가요?", a: "A. 객단가는 고객수로, 건당 결제액은 결제건수로 나눕니다. 한 고객이 여러 번 결제하면 두 값이 달라집니다." },
      { q: "Q. 인당 결제건수는 무엇인가요?", a: "A. 결제건수 ÷ 고객수로, 고객 한 명이 평균 몇 번 결제했는지를 나타냅니다." },
      { q: "Q. 0 또는 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리하며, 고객수가 0이면 나눗셈이 불가능해 객단가는 '-'로 표시합니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 총매출·고객수·결제건수와 객단가, 건당 결제액, 인당 결제건수가 모두 들어갑니다." },
    ]}
    result={<ResultPanel title="객단가 계산 결과" lines={lines} total={{ label: "객단가", value: perCustomerText }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="총매출 (원)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 5,000,000" />
      <div className="mt-4" />
      <InputBlock label="고객수 (명)" type="text" inputMode="numeric" value={customersRaw} onChange={(e) => setCustomersRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 500" />
      <div className="mt-4" />
      <InputBlock label="결제건수 (건, 선택)" type="text" inputMode="numeric" value={txRaw} onChange={(e) => setTxRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 600" />
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 결제건수는 건당 결제액·인당 결제건수 계산에만 사용됩니다.</p>
    </CalculatorLayout>
  );
}
