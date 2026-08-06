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
function round1(n: number) { return Math.round(n * 10) / 10; }

export default function LtvPage() {
  const [valueRaw, setValueRaw] = useState("");
  const [loanRaw, setLoanRaw] = useState("");
  const [limitRaw, setLimitRaw] = useState("70");

  const result = useMemo(() => {
    const value = Math.max(0, parseNumber(valueRaw));
    const loan = Math.max(0, parseNumber(loanRaw));
    const limitRate = Math.max(0, parseNumber(limitRaw));
    // 담보 한도 내 최대 대출 가능액
    const maxLoan = Math.round(value * (limitRate / 100));
    // 대출 희망액 기준 LTV
    const ltv = value > 0 ? round1((loan / value) * 100) : 0;
    const within = value > 0 && ltv <= limitRate;
    const allowance = maxLoan - loan; // 양수면 여력, 음수면 초과
    const room = Math.max(0, allowance);
    const over = allowance < 0 ? -allowance : 0;
    return { value, loan, limitRate, maxLoan, ltv, within, room, over };
  }, [valueRaw, loanRaw, limitRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "LTV 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "최대 대출 가능액", hint: "담보가치 × 한도율", value: `${result.maxLoan.toLocaleString()}원` },
    { label: "LTV", hint: "대출 희망액 ÷ 담보가치", value: `${result.ltv}%` },
    { label: `${result.limitRate}% 한도 판정`, hint: "규제 한도 대비", value: result.within ? "한도 이내" : "한도 초과" },
    result.over > 0
      ? { label: "한도 초과액", hint: "줄여야 할 대출액", value: `${result.over.toLocaleString()}원` }
      : { label: "추가 대출 여력", hint: "한도 내 추가 가능액", value: `${result.room.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "ltv",
      title: "LTV 계산기",
      inputs: [
        { label: "담보가치(주택가격, 입력)", value: `${result.value.toLocaleString()}원` },
        { label: "대출 희망액(입력)", value: `${result.loan.toLocaleString()}원` },
        { label: "LTV 한도(입력)", value: `${result.limitRate}%` },
      ],
      lines,
      total: { label: "최대 대출 가능액", value: `${result.maxLoan.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="LTV 계산기"
      subtitle="담보가치와 LTV 한도로 최대 대출 가능액과 담보인정비율(LTV)을 계산합니다."
      intro="LTV = 대출금액 ÷ 담보가치(주택가격) × 100(%). 담보가치에 규제 한도율을 곱하면 최대 대출 가능액이 됩니다."
      faqTitle="LTV 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. LTV가 무엇인가요?", a: "A. LTV(담보인정비율, Loan To Value)는 담보가치 대비 대출금액의 비율입니다. 주택 등 담보가치에서 얼마까지 대출받을 수 있는지를 나타냅니다." },
        { q: "Q. LTV는 어떻게 계산하나요?", a: "A. LTV = (대출금액 ÷ 담보가치) × 100 입니다. 최대 대출 가능액은 담보가치 × 한도율(%)로 계산합니다. 예를 들어 담보가치 5억원에 한도 70%면 최대 3억5천만원입니다." },
        { q: "Q. LTV 한도는 몇 %인가요?", a: "A. 규제지역·주택 종류·차주에 따라 다르며 통상 40~70% 범위입니다. 기본값 70%를 상황에 맞게 바꿔 판정할 수 있습니다. 실제 한도는 금융기관·규제 변화에 따라 달라집니다." },
        { q: "Q. 선순위 대출·전세보증금이 있으면요?", a: "A. 선순위 채권·임차보증금이 있으면 그만큼 대출 가능액이 줄어듭니다. 이 계산기는 순수 담보가치 기준 한도만 보여주므로, 선순위액을 최대 대출 가능액에서 별도로 빼서 판단하세요." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0으로 처리하며, 담보가치가 0이면 LTV를 계산할 수 없어 0%로 표시합니다." },
      ]}
      result={
        <ResultPanel
          title="LTV 계산 결과"
          lines={lines}
          total={{ label: "최대 대출 가능액", value: `${result.maxLoan.toLocaleString()}원` }}
          note="※ 선순위 채권·방공제(소액임차보증금) 등을 반영하지 않은 간이 계산입니다. 실제 대출 한도는 금융기관 심사에 따라 달라집니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock label="담보가치 (원)" type="text" inputMode="numeric" value={valueRaw} onChange={(e) => setValueRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 500,000,000" />
        <InputBlock label="대출 희망액 (원)" type="text" inputMode="numeric" value={loanRaw} onChange={(e) => setLoanRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 300,000,000" />
        <InputBlock label="LTV 한도 (%)" type="text" inputMode="decimal" value={limitRaw} onChange={(e) => setLimitRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 70" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 실제 심사 기준은 금융기관·규제 변화에 따라 다를 수 있어요.</p>
    </CalculatorLayout>
  );
}
