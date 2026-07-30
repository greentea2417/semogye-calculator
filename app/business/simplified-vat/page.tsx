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
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

// 부가가치세법 시행령 별표(2021.7.1~) 업종별 부가가치율
const INDUSTRIES = [
  { key: "retail", label: "소매업·음식점업·재생용재료 (15%)", rate: 15 },
  { key: "manufacture", label: "제조업·농림어업·소화물운송 (20%)", rate: 20 },
  { key: "lodging", label: "숙박업 (25%)", rate: 25 },
  { key: "construction", label: "건설·운수창고·정보통신 (30%)", rate: 30 },
  { key: "finance", label: "금융보험·전문과학기술·부동산임대 (40%)", rate: 40 },
  { key: "other", label: "그 밖의 서비스업 (30%)", rate: 30 },
] as const;

const EXEMPT_THRESHOLD = 48_000_000; // 납부의무 면제 기준(연 매출 4,800만원 미만)

export default function SimplifiedVatPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [purchaseRaw, setPurchaseRaw] = useState("");
  const [industryKey, setIndustryKey] = useState<string>("retail");

  const result = useMemo(() => {
    const sales = Math.max(0, parseNumber(salesRaw));
    const purchase = Math.max(0, parseNumber(purchaseRaw));
    const industry = INDUSTRIES.find((i) => i.key === industryKey) ?? INDUSTRIES[0];
    const rate = industry.rate;
    const salesTax = Math.round(sales * (rate / 100) * 0.1); // 매출세액 = 공급대가 × 부가가치율 × 10%
    const purchaseCredit = Math.round(purchase * 0.005); // 세금계산서 수취 세액공제 0.5%
    const exempt = sales > 0 && sales < EXEMPT_THRESHOLD;
    const payable = exempt ? 0 : Math.max(0, salesTax - purchaseCredit);
    return { sales, purchase, rate, industryLabel: industry.label, salesTax, purchaseCredit, exempt, payable };
  }, [salesRaw, purchaseRaw, industryKey]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "간이과세자 부가세 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "매출세액", hint: "매출 × 부가가치율 × 10%", value: `${result.salesTax.toLocaleString()}원` },
    { label: "매입세액공제", hint: "매입액 × 0.5%", value: `${result.purchaseCredit.toLocaleString()}원` },
    ...(result.exempt ? [{ label: "납부의무 면제", hint: "연 매출 4,800만원 미만", value: "면제" } as ResultLine] : []),
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "simplified-vat",
      title: "간이과세자 부가세 계산기",
      inputs: [
        { label: "연 매출액(공급대가, 입력)", value: `${result.sales.toLocaleString()}원` },
        { label: "업종·부가가치율(입력)", value: `${result.industryLabel}` },
        { label: "매입액(공급대가, 입력)", value: `${result.purchase.toLocaleString()}원` },
      ],
      lines: [
        { label: "매출세액", value: `${result.salesTax.toLocaleString()}원` },
        { label: "매입세액공제", value: `${result.purchaseCredit.toLocaleString()}원` },
        { label: "납부의무 면제 여부", value: result.exempt ? "면제" : "해당없음" },
      ],
      total: { label: "납부세액", value: `${result.payable.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="간이과세자 부가세 계산기"
      subtitle="연 매출과 업종별 부가가치율로 간이과세자 부가가치세 납부세액을 계산합니다."
      intro="간이과세자는 '매출(공급대가) × 업종별 부가가치율 × 10% − 매입액 × 0.5%'로 납부세액을 계산합니다. 연 매출 4,800만원 미만이면 납부의무가 면제됩니다."
      faqTitle="간이과세자 부가세 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 간이과세자 부가세는 어떻게 계산하나요?", a: "A. 납부세액 = 매출(공급대가) × 업종별 부가가치율 × 10% − 매입액(공급대가) × 0.5% 입니다. 일반과세자보다 실효세율(1.5~4%)이 낮습니다." },
        { q: "Q. 업종별 부가가치율은 어떻게 되나요?", a: "A. 소매·음식점 15%, 제조·농림어업 20%, 숙박 25%, 건설·운수·정보통신 및 기타 서비스 30%, 금융보험·전문과학기술·부동산임대 40%입니다(2021.7.1 이후 기준)." },
        { q: "Q. 납부의무 면제 기준은 무엇인가요?", a: "A. 해당 과세기간(연) 공급대가 합계가 4,800만원 미만이면 부가가치세 납부의무가 면제됩니다. 다만 신고는 해야 합니다." },
        { q: "Q. 매입세액공제는 얼마인가요?", a: "A. 세금계산서 등을 받은 매입액(공급대가)의 0.5%를 세액공제합니다. 일반과세자처럼 매입세액 전액을 공제받지는 못합니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 매출·매입이 비어 있으면 0원으로 처리합니다." },
      ]}
      result={<ResultPanel title="간이과세자 부가세 계산 결과" lines={lines} total={{ label: "납부세액", value: `${result.payable.toLocaleString()}원` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock label="연 매출액 (원, 부가세 포함)" type="text" inputMode="numeric" value={salesRaw} onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 50,000,000" />
        <div className="input-block">
          <label className="input-label">업종 (부가가치율)</label>
          <select className="input-field prefilled" value={industryKey} onChange={(e) => setIndustryKey(e.target.value)}>
            {INDUSTRIES.map((i) => (
              <option key={i.key} value={i.key}>{i.label}</option>
            ))}
          </select>
        </div>
        <InputBlock label="매입액 (원, 부가세 포함)" type="text" inputMode="numeric" value={purchaseRaw} onChange={(e) => setPurchaseRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 20,000,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 신용카드 매출세액공제 등 개별 공제는 포함하지 않은 간이 계산입니다.</p>
    </CalculatorLayout>
  );
}
