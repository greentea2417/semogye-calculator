"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

/* ================= 결제/잠금 관련 상수 ================= */
const PAYMENT_LINK = "https://payment-link-here"; // TODO: 실제 토스 결제 링크로 교체
const FREE_DOWNLOAD_LIMIT = 1;

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
  const [salesRaw, setSalesRaw] = useState(""); // 총 매출
  const [costRaw, setCostRaw] = useState(""); // 원재료/매입비
  const [rentRaw, setRentRaw] = useState(""); // 임대료
  const [laborRaw, setLaborRaw] = useState(""); // 인건비
  const [utilityRaw, setUtilityRaw] = useState(""); // 공과금/기타
  const [marketingRaw, setMarketingRaw] = useState(""); // 광고비

  // 유료 기능 상태
  const [unlocked, setUnlocked] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [monthsRaw, setMonthsRaw] = useState("");

  // 결제 완료 후 ?unlocked=1 로 돌아오면 잠금 해제 처리
  useEffect(() => {
    try {
      if (sp.get("unlocked") === "1") {
        localStorage.setItem("semogye_unlocked", "1");
        router.replace("/profit");
      }
      setUnlocked(localStorage.getItem("semogye_unlocked") === "1");
      setFreeUsed(localStorage.getItem("semogye_free_used") === "1");
    } catch (e) {}
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

    return { totalExpense, netProfit, marginRate };
  }, [salesRaw, costRaw, rentRaw, laborRaw, utilityRaw, marketingRaw]);

  const months = parseNumber(monthsRaw);

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

  const canDownloadFree = () => !unlocked && !freeUsed;

  const markFreeUsed = () => {
    try {
      localStorage.setItem("semogye_free_used", "1");
      setFreeUsed(true);
    } catch (e) {}
  };

  const downloadCsv = () => {
    const rows = [
      ["항목", "금액"],
      ["총 매출", parseNumber(salesRaw)],
      ["재료/매입비", parseNumber(costRaw)],
      ["임대료", parseNumber(rentRaw)],
      ["총 인건비", parseNumber(laborRaw)],
      ["공과금/기타", parseNumber(utilityRaw)],
      ["마케팅/광고비", parseNumber(marketingRaw)],
      ["총 지출액", result.totalExpense],
      ["최종 순이익", result.netProfit],
      ["수익률(%)", result.marginRate.toFixed(1)],
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
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

      <section className="bg-white p-6 rounded-xl border shadow-sm print-report">
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

      {/* 여러 달 합산 계산 (유료) */}
      <section className="bg-white p-6 rounded-xl border shadow-sm no-print">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">여러 달 합산 계산</h2>
          {!unlocked && (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">🔒 유료</span>
          )}
        </div>
        {unlocked ? (
          <div className="space-y-3">
            <InputBlock
              label="합산할 개월 수"
              type="text"
              value={monthsRaw}
              onChange={(e: any) => setMonthsRaw(formatComma(parseNumber(e.target.value)))}
              placeholder="예: 3"
            />
            {months > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">{months}개월 총 매출</span>
                  <span className="font-semibold">{(parseNumber(salesRaw) * months).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{months}개월 총 지출</span>
                  <span className="font-semibold">{(result.totalExpense * months).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600">
                  <span>{months}개월 합산 순이익</span>
                  <span>{(result.netProfit * months).toLocaleString()}원</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">분기·반기 결산을 한번에 계산하고 싶다면?</p>
            <button
              onClick={() => setShowPaywall(true)}
              className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold"
            >
              잠금 해제하기
            </button>
          </div>
        )}
      </section>

      {/* 다운로드 */}
      <section className="no-print space-y-2">
        <div className="flex gap-3">
          <button
            onClick={() => handleExport("csv")}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📊 엑셀 다운로드
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📄 PDF 리포트
          </button>
        </div>
        {!unlocked && (
          <p className="text-[11px] text-gray-400 text-center">
            {freeUsed ? "무료 다운로드를 이미 사용했어요" : "무료로 1회 다운로드 가능해요"}
          </p>
        )}
      </section>

      {showPaywall && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 no-print"
          onClick={() => setShowPaywall(false)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900 mb-2">무료 다운로드를 사용하셨어요</h3>
            <p className="text-sm text-gray-500 mb-5">
              엑셀·PDF 무제한 다운로드 + 여러 달 합산 계산을 잠금 해제하세요.
            </p>
            <a
              href={PAYMENT_LINK}
              target="_blank"
              rel="noreferrer"
              className="block text-center px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold mb-2"
            >
              3,900원으로 잠금 해제
            </a>
            <button
              onClick={() => setShowPaywall(false)}
              className="block w-full text-center px-5 py-2 text-sm text-gray-400"
            >
              나중에 할게요
            </button>
          </div>
        </div>
      )}
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

<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
<details className="group">
<summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
<span className="tracking-tight">💡 마진율과 순이익, 정확하게 계산하고 계신가요?</span>
<span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
</summary>
<div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">

<section>
<h4 className="font-bold text-gray-800 mb-2">1. 마진율과 수익률, 차이를 정확히 아시나요?</h4>
<p>마진율은 판매가에서 원가를 뺀 마진이 판매가에서 차지하는 비중을 말하며, 수익률은 원가 대비 이익을 뜻합니다. 장사를 지속하려면 정확한 마진율을 파악하여 적정 판매가를 설정하는 것이 무엇보다 중요합니다.</p>
</section>

<section>
<h4 className="font-bold text-gray-800 mb-2">2. 놓치기 쉬운 '숨은 비용' 체크리스트</h4>
<div className="bg-rose-50 p-5 rounded-2xl space-y-3 border border-rose-100 text-xs text-rose-800">
<p>• <strong>플랫폼 수수료:</strong> 스마트스토어, 쿠팡 등 매체별 수수료율</p>
<p>• <strong>결제 수수료:</strong> 카드 결제 및 각종 페이 수수료(1.5%~3.7%)</p>
<p>• <strong>소모품비:</strong> 포장 박스, 테이프, 완충재 비용 등</p>
</div>
</section>

<section>
<h4 className="font-bold text-gray-800 mb-2">3. 세모계가 제안하는 경영 팁</h4>
<p>마진율이 너무 낮으면 유지가 어렵고, 너무 높으면 경쟁력이 떨어집니다. 세모계를 통해 심리적 저항선을 넘지 않는 최적의 판매가를 시뮬레이션해 보세요.</p>
</section>

<section>
<h4 className="font-bold text-gray-800 mb-2">4. 디자인으로 완성한 경영의 직관</h4>
<p>8년 차 광고 디자이너가 설계한 세모계는 복잡한 숫자 나열이 아닙니다. 사장님이 가장 편안하게 수익 구조를 읽고 현명한 판단을 내릴 수 있도록 최적화된 인터페이스를 제공합니다.</p>
</section>

<p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
※ 본 계산기는 입력된 값을 바탕으로 한 시뮬레이션 결과이며, 실제 정산 금액은 플랫폼의 정산 주기와 부가세 신고 방식에 따라 달라질 수 있습니다.
</p>
</div>
</details>
</div>
