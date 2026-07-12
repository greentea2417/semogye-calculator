"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel from "@/components/ResultPanel";
import { encodeShareState } from "../components/lib/shareState";
import { copyToClipboardSafe } from "../components/lib/shareUtils";
import { toast } from "../components/toast";

const PAYMENT_LINK = "https://payment-link-here"; // TODO: 실제 토스 결제 링크로 교체

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

function ProfitContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const [salesRaw, setSalesRaw] = useState("");
  const [costRaw, setCostRaw] = useState("");
  const [rentRaw, setRentRaw] = useState("");
  const [laborRaw, setLaborRaw] = useState("");
  const [utilityRaw, setUtilityRaw] = useState("");
  const [marketingRaw, setMarketingRaw] = useState("");

  const [unlocked, setUnlocked] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [monthsRaw, setMonthsRaw] = useState("");

  useEffect(() => {
    try {
      if (sp.get("unlocked") === "1") {
        localStorage.setItem("semogye_unlocked", "1");
        router.replace("/profit");
      }
      setUnlocked(localStorage.getItem("semogye_unlocked") === "1");
      setFreeUsed(localStorage.getItem("semogye_free_used") === "1");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    return { sales, totalExpense, netProfit, marginRate };
  }, [salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw]);

  const months = parseNumber(monthsRaw);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const state = { v: 1, inputs: { salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw } };
    return `${window.location.origin}/profit?data=${encodeURIComponent(encodeShareState(state))}`;
  }, [salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw]);

  const onShare = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) await navigator.share({ title: "사장님 손익 계산기", url: shareUrl });
      else {
        await copyToClipboardSafe(shareUrl);
        toast("이번 달 손익 리포트 링크를 복사했어요!");
      }
    } catch {}
  };

  const markFreeUsed = () => {
    try {
      localStorage.setItem("semogye_free_used", "1");
      setFreeUsed(true);
    } catch {}
  };

  const downloadCsv = () => {
    const rows = [
      ["항목", "금액"],
      ["총 매출", result.sales],
      ["재료/매입비", parseNumber(costRaw)],
      ["임대료", parseNumber(rentRaw)],
      ["총 인건비", parseNumber(laborRaw)],
      ["공과금/기타", parseNumber(utilityRaw)],
      ["마케팅/광고비", parseNumber(marketingRaw)],
      ["총 지출액", result.totalExpense],
      ["최종 순이익", result.netProfit],
      ["수익률(%)", result.marginRate.toFixed(1)],
    ];
    const csv = "﻿" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "세모계_손익리포트.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (type: "csv" | "pdf") => {
    if (!unlocked && freeUsed) {
      setShowPaywall(true);
      return;
    }
    if (!unlocked) markFreeUsed();
    if (type === "csv") downloadCsv();
    else window.print();
  };

  return (
    <CalculatorLayout
      tone="business"
      title="사장님 손익 계산기"
      subtitle="매출에서 모든 비용을 빼고 이번 달 실제 순이익을 계산합니다."
      intro="재료비·임대료·인건비·공과금·광고비를 한 번에 넣으면 순이익과 수익률을 바로 확인할 수 있어요."
      faqTitle="사장님 손익 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 순이익은 어떻게 계산되나요?", a: "A. 순이익 = 총 매출 − (재료비 + 임대료 + 인건비 + 공과금 + 광고비)입니다. 수익률은 순이익 ÷ 매출 × 100입니다." },
        { q: "Q. 마진율과 수익률은 어떻게 다른가요?", a: "A. 마진율은 판매가에서 원가를 뺀 마진의 비중이고, 수익률은 매출 대비 최종 남은 이익의 비율입니다. 이 계산기는 매출 대비 수익률을 보여줍니다." },
        { q: "Q. 놓치기 쉬운 비용은 무엇인가요?", a: "A. 플랫폼 수수료, 카드·간편결제 수수료(1.5~3.7%), 포장·소모품비가 대표적입니다. 공과금/기타 항목에 함께 넣어보세요." },
        { q: "Q. 세금도 반영되나요?", a: "A. 아니요. 부가세와 종합소득세는 제외한 단순 영업이익 기준입니다. 세금은 부가세 계산기에서 별도로 확인하세요." },
      ]}
      result={
        <ResultPanel
          title="월간 손익 리포트"
          lines={[
            { label: "총 매출", value: `${result.sales.toLocaleString()}원` },
            { label: "총 지출액", value: `${result.totalExpense.toLocaleString()}원` },
            { label: "수익률", value: `${result.marginRate.toFixed(1)}%` },
          ]}
          total={{ label: "최종 순이익", value: `${result.netProfit.toLocaleString()}원` }}
          note="* 부가세 및 종합소득세는 고려되지 않은 단순 영업이익 계산입니다."
        />
      }
      guide={
        <>
          <BottomActions
            onShare={onShare}
            onPdfDownload={() => handleExport("pdf")}
            onExcelDownload={() => handleExport("csv")}
            excelHint={
              unlocked
                ? undefined
                : freeUsed
                ? "무료 다운로드를 모두 사용했어요 · 리포트 팩으로 무제한 이용"
                : "무료 체험 1회 · 이후 리포트 팩으로 무제한 이용"
            }
          />

          <section className="no-print mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-200/30">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">여러 달 합산 계산</h2>
              {!unlocked && (
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white">
                  PRO
                </span>
              )}
            </div>

            {unlocked ? (
              <div className="space-y-3">
                <InputBlock
                  label="합산할 개월 수"
                  type="text"
                  inputMode="numeric"
                  value={monthsRaw}
                  onChange={(e) => setMonthsRaw(formatComma(parseNumber(e.target.value)))}
                  placeholder="예: 3"
                />
                {months > 0 && (
                  <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{months}개월 총 매출</span>
                      <span className="font-semibold tabular-nums">
                        {(result.sales * months).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{months}개월 총 지출</span>
                      <span className="font-semibold tabular-nums">
                        {(result.totalExpense * months).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                      <span>{months}개월 합산 순이익</span>
                      <span className="tabular-nums">{(result.netProfit * months).toLocaleString()}원</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">분기·반기 결산을 한 번에 계산하고 싶다면?</p>
                <p className="mt-1 text-xs text-gray-400">리포트 팩 구매 시 바로 이용 가능</p>
                <button
                  type="button"
                  onClick={() => setShowPaywall(true)}
                  className="mt-4 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm shadow-gray-200/40 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  잠금 해제하기
                </button>
              </div>
            )}
          </section>

          {showPaywall && (
            <div
              className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowPaywall(false)}
            >
              <div
                className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-1 text-xl font-extrabold text-gray-900">리포트 팩 잠금 해제</h3>
                <p className="mb-5 text-sm text-gray-500">
                  무료 다운로드를 이미 사용하셨어요. 아래 기능을 한 번 결제로 평생 이용하세요.
                </p>

                <div className="mb-6 space-y-2.5 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-500">✓</span> 엑셀·PDF 무제한 다운로드
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-500">✓</span> 여러 달 합산 계산 (분기·반기 결산)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-500">✓</span> 평생 이용 (원타임 결제, 구독 아님)
                  </div>
                </div>

                <div className="mb-4 flex items-end justify-between px-1">
                  <span className="text-xs text-gray-400">일회성 결제</span>
                  <span className="text-2xl font-extrabold text-gray-900">3,900원</span>
                </div>

                <a
                  href={PAYMENT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 block rounded-full bg-slate-900 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  지금 잠금 해제하기
                </a>
                <button
                  type="button"
                  onClick={() => setShowPaywall(false)}
                  className="block w-full px-5 py-2 text-center text-sm text-gray-400 transition hover:text-gray-600"
                >
                  나중에 할게요
                </button>
              </div>
            </div>
          )}
        </>
      }
    >
      <InputBlock
        label="이번 달 총 매출"
        type="text"
        inputMode="numeric"
        value={salesRaw}
        onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 20,000,000"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="재료/매입비"
          type="text"
          inputMode="numeric"
          value={costRaw}
          onChange={(e) => setCostRaw(formatComma(parseNumber(e.target.value)))}
        />
        <InputBlock
          label="임대료"
          type="text"
          inputMode="numeric"
          value={rentRaw}
          onChange={(e) => setRentRaw(formatComma(parseNumber(e.target.value)))}
        />
        <InputBlock
          label="총 인건비"
          type="text"
          inputMode="numeric"
          value={laborRaw}
          onChange={(e) => setLaborRaw(formatComma(parseNumber(e.target.value)))}
        />
        <InputBlock
          label="공과금/기타"
          type="text"
          inputMode="numeric"
          value={utilityRaw}
          onChange={(e) => setUtilityRaw(formatComma(parseNumber(e.target.value)))}
        />
      </div>

      <div className="mt-4">
        <InputBlock
          label="마케팅/광고비"
          type="text"
          inputMode="numeric"
          value={marketingRaw}
          onChange={(e) => setMarketingRaw(formatComma(parseNumber(e.target.value)))}
        />
      </div>

      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}

export default function ProfitPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">리포트 생성 중...</div>}>
      <ProfitContent />
    </Suspense>
  );
}
