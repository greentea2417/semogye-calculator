"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

/* ================= utils ================= */
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n !== undefined ? n.toLocaleString("ko-KR") : "";
}

/* ================= 메인 콘텐츠 ================= */
function ProfitContent() {
  const sp = useSearchParams();
  const router = useRouter();

  // 입력 항목 (사장님용)
  const [salesRaw, setSalesRaw] = useState("");      // 총 매출
  const [costRaw, setCostRaw] = useState("");       // 원재료/매입비
  const [rentRaw, setRentRaw] = useState("");       // 임대료
  const [laborRaw, setLaborRaw] = useState("");      // 인건비
  const [utilityRaw, setUtilityRaw] = useState("");    // 공과금/기타
  const [marketingRaw, setMarketingRaw] = useState(""); // 광고비

  const result = useMemo(() => {
    const sales = parseNumber(salesRaw);
    const cost = parseNumber(costRaw);
    const rent = parseNumber(rentRaw);
    const labor = parseNumber(laborRaw);
    const utility = parseNumber(utilityRaw);
    const marketing = parseNumber(marketingRaw);

    const totalExpense = cost + rent + labor + utility + marketing;
    const netProfit = sales - totalExpense;
    const marginRate = sales > 0 ? (netProfit / sales) * 100 : 0;

    return { totalExpense, netProfit, marginRate };
  }, [salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw]);

  // 공유 기능 (남편분께 카톡 보낼 때 사용)
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const state = { v: 1, inputs: { salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw } };
    return `${window.location.origin}/profit?data=${encodeURIComponent(encodeShareState(state))}`;
  }, [salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw]);

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("이번 달 손익 리포트 링크가 복사되었습니다!");
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">사장님 손익 계산기</h1>
        <p className="text-gray-500 text-sm">이번 달 우리 가게, 진짜 얼마나 남았을까?</p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock label="이번 달 총 매출" type="text" value={salesRaw} onChange={(e: any) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 20,000,000" />
        <div className="grid grid-cols-2 gap-4">
          <InputBlock label="재료/매입비" type="text" value={costRaw} onChange={(e: any) => setCostRaw(formatComma(parseNumber(e.target.value)))} />
          <InputBlock label="임대료" type="text" value={rentRaw} onChange={(e: any) => setRentRaw(formatComma(parseNumber(e.target.value)))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputBlock label="총 인건비" type="text" value={laborRaw} onChange={(e: any) => setLaborRaw(formatComma(parseNumber(e.target.value)))} />
          <InputBlock label="공과금/기타" type="text" value={utilityRaw} onChange={(e: any) => setUtilityRaw(formatComma(parseNumber(e.target.value)))} />
        </div>
        <InputBlock label="마케팅/광고비" type="text" value={marketingRaw} onChange={(e: any) => setMarketingRaw(formatComma(parseNumber(e.target.value)))} />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">월간 손익 리포트</h2>
        <ResultRow label="총 지출액" value={result.totalExpense} />
        <hr className="my-4" />
        <div className="flex justify-between items-center font-extrabold text-2xl text-blue-600">
          <span>최종 순이익</span>
          <span>{result.netProfit.toLocaleString()}원</span>
        </div>
        <div className="text-right mt-1 text-sm text-gray-500">
          수익률: <span className="font-bold text-orange-500">{result.marginRate.toFixed(1)}%</span>
        </div>
        
        <p className="mt-6 text-[11px] text-gray-400 leading-relaxed text-center bg-gray-50 p-2 rounded">
          * 부가세 및 종합소득세는 별도로 고려되지 않은 단순 영업이익 계산입니다.
        </p>

        <div className="mt-6">
          <BottomActions onCopyLink={handleShare} onShare={handleShare} />
        </div>
      </section>
    </main>
  );
}

export default function ProfitPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">리포트 생성 중...</div>}>
      <ProfitContent />
    </Suspense>
  );
}