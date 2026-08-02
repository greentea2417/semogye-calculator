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

export default function LtvPage() {
  const [valueRaw, setValueRaw] = useState("");
  const [loanRaw, setLoanRaw] = useState("");
  const [limitRaw, setLimitRaw] = useState("70");

  const result = useMemo(() => {
    const collateral = Math.max(0, parseNumber(valueRaw));
    const loan = Math.max(0, parseNumber(loanRaw));
    const limitRate = Math.max(0, parseNumber(limitRaw));
    const ltv = collateral > 0 ? round2((loan / collateral) * 100) : 0; // 담보인정비율
    const maxLoan = Math.round(collateral * (limitRate / 100)); // 한도 내 최대 대출가능액
    const room = Math.max(0, maxLoan - loan); // 추가 대출 여력
    const over = loan > maxLoan ? loan - maxLoan : 0; // 한도 초과 금액
    const within = collateral > 0 && ltv <= limitRate;
    return { collateral, loan, limitRate, ltv, maxLoan, room, over, within };
  }, [valueRaw, loanRaw, limitRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "LTV 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "LTV", hint: "대출금액 ÷ 담보가치", value: `${result.ltv}%` },
    { label: `${result.limitRate}% 한도 판정`, hint: "규제 한도 대비", value: result.within ? "한도 이내" : "한도 초과" },
    { label: "한도 내 최대 대출가능액", hint: "담보가치 × 한도율", value: `${result.maxLoan.toLocaleString()}원` },
    result.over > 0
      ? { label: "한도 초과 금액", hint: "줄여야 할 대출액", value: `${result.over.toLocaleString()}원` }
      : { label: "추가 대출 여력", hint: "한도 내 추가 가능액", value: `${result.room.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "ltv",
      title: "LTV 계산기",
      inputs: [
        { label: "주택 담보가치(입력)", value: `${result.collateral.toLocaleString()}원` },
        { label: "대출 금액(입력)", value: `${result.loan.toLocaleString()}원` },
        { label: "LTV 한도(입력)", value: `${result.limitRate}%` },
      ],
      lines,
      total: { label: "LTV", value: `${result.ltv}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="LTV 계산기"
      subtitle="주택 담보가치와 대출 금액으로 담보인정비율(LTV)과 한도 내 최대 대출가능액을 계산합니다."
      intro="LTV = 대출금액 ÷ 주택 담보가치 × 100(%). 규제지역·주택 유형에 따라 한도(예: 70%)가 달라지며, 한도율을 바꿔 상황에 맞게 판정할 수 있습니다."
      faqTitle="LTV 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. LTV가 무엇인가요?", a: "A. LTV(담보인정비율, Loan To Value)는 담보로 잡은 주택 가치 대비 대출금액의 비율입니다. 예를 들어 10억원 주택에 7억원을 대출받으면 LTV는 70%입니다." },
        { q: "Q. LTV는 어떻게 계산하나요?", a: "A. LTV = (대출금액 ÷ 주택 담보가치) × 100 입니다. 이 계산기는 입력한 담보가치와 대출금액으로 LTV와, 한도율을 곱한 최대 대출가능액(담보가치 × 한도율)을 함께 보여줍니다." },
        { q: "Q. 한도는 몇 %인가요?", a: "A. 지역·주택 유형·차주 조건에 따라 다릅니다. 생애최초·비규제지역은 70~80%, 규제지역은 그보다 낮게 적용되는 경우가 많습니다. 실제 한도는 금융기관과 확인하고, 한도 입력값을 바꿔 판정하세요." },
        { q: "Q. 추가 대출 여력은 무슨 뜻인가요?", a: "A. 한도(예: 70%) 안에서 추가로 받을 수 있는 대출금액입니다. 여력 = 담보가치 × 한도율 − 현재 대출금액으로 계산하며, 대출금액이 최대 한도를 넘으면 한도 초과 금액으로 표시합니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0으로 처리하며, 담보가치가 0이면 LTV를 계산할 수 없어 0%로 표시합니다. CSV에는 입력한 담보가치·대출금액·한도와 LTV·최대 대출가능액이 모두 담깁니다." },
      ]}
      result={
        <ResultPanel
          title="LTV 계산 결과"
          lines={lines}
          total={{ label: "LTV", value: `${result.ltv}%` }}
          note="※ DSR·DTI 등 다른 규제와 방공제(소액임차보증금) 등을 반영하지 않은 간이 계산입니다. 실제 대출 한도는 금융기관 심사에 따라 달라집니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock label="주택 담보가치 (원)" type="text" inputMode="numeric" value={valueRaw} onChange={(e) => setValueRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 2,000,000,000" />
        <InputBlock label="대출 금액 (원)" type="text" inputMode="numeric" value={loanRaw} onChange={(e) => setLoanRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 1,400,000,000" />
        <InputBlock label="LTV 한도 (%)" type="text" inputMode="decimal" value={limitRaw} onChange={(e) => setLimitRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 70" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 담보가치는 KB시세·감정가 등 은행이 인정하는 기준가로 입력하세요.</p>
    </CalculatorLayout>
  );
}
