"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n !== undefined ? n.toLocaleString("ko-KR") : "";
}

function VatContent() {
  const [salesRaw, setSalesRaw] = useState(""); // 매출 공급가액
  const [purchaseRaw, setPurchaseRaw] = useState(""); // 매입 공급가액 (세액공제 가능분)

  const result = useMemo(() => {
    const sales = parseNumber(salesRaw);
    const purchase = parseNumber(purchaseRaw);

    const salesTax = Math.round(sales * 0.1);
    const purchaseTax = Math.round(purchase * 0.1);
    const payable = salesTax - purchaseTax;

    return { salesTax, purchaseTax, payable };
  }, [salesRaw, purchaseRaw]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/vat`;
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("부가세 계산 링크가 복사되었습니다!");
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">부가세 계산기</h1>
        <p className="text-gray-500 text-sm">이번 분기, 얼마나 내야(돌려받아야) 할까?</p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="매출 공급가액 (부가세 별도)"
          type="text"
          value={salesRaw}
          onChange={(e: any) => setSalesRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 30,000,000"
        />
        <InputBlock
          label="매입 공급가액 (세액공제 가능분)"
          type="text"
          value={purchaseRaw}
          onChange={(e: any) => setPurchaseRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 12,000,000"
        />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">부가세 신고 리포트</h2>
        <ResultRow label="매출세액 (매출×10%)" value={result.salesTax} />
        <ResultRow label="매입세액 (매입×10%)" value={result.purchaseTax} />
        <hr className="my-4" />
        <div className="flex justify-between items-center font-extrabold text-2xl text-blue-600">
          <span>{result.payable >= 0 ? "납부할 세액" : "환급받을 세액"}</span>
          <span>{Math.abs(result.payable).toLocaleString()}원</span>
        </div>

        <p className="mt-6 text-[11px] text-gray-400 leading-relaxed text-center bg-gray-50 p-2 rounded">
          * 간이과세자, 면세 항목, 가산세 등은 반영되지 않은 단순 일반과세자 기준 계산입니다.
        </p>

        <div className="mt-6">
          <BottomActions onCopyLink={handleShare} onShare={handleShare} />
        </div>
      </section>
    </main>
  );
}

export default function VatPage() {
  return <VatContent />;
}
