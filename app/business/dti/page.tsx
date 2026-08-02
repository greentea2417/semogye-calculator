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

export default function DtiPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const [mortgageRaw, setMortgageRaw] = useState("");
  const [otherInterestRaw, setOtherInterestRaw] = useState("");
  const [limitRaw, setLimitRaw] = useState("60");

  const result = useMemo(() => {
    const income = Math.max(0, parseNumber(incomeRaw));
    const mortgage = Math.max(0, parseNumber(mortgageRaw)); // 주담대 연 원리금상환액
    const otherInterest = Math.max(0, parseNumber(otherInterestRaw)); // 기타대출 연 이자상환액
    const limitRate = Math.max(0, parseNumber(limitRaw));
    const burden = mortgage + otherInterest; // 연간 상환부담액
    const dti = income > 0 ? round2((burden / income) * 100) : 0;
    const maxBurden = Math.round(income * (limitRate / 100)); // 한도 내 허용 상환액
    const room = Math.max(0, maxBurden - burden); // 추가 상환 여력
    const over = burden > maxBurden ? burden - maxBurden : 0; // 한도 초과 상환액
    const within = income > 0 && dti <= limitRate;
    return { income, mortgage, otherInterest, limitRate, burden, dti, maxBurden, room, over, within };
  }, [incomeRaw, mortgageRaw, otherInterestRaw, limitRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "DTI 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "DTI", hint: "(주담대 원리금 + 기타대출 이자) ÷ 연소득", value: `${result.dti}%` },
    { label: `${result.limitRate}% 한도 판정`, hint: "규제 한도 대비", value: result.within ? "한도 이내" : "한도 초과" },
    { label: "연간 상환부담액", hint: "주담대 원리금 + 기타대출 이자", value: `${result.burden.toLocaleString()}원` },
    result.over > 0
      ? { label: "한도 초과 상환액", hint: "줄여야 할 연 상환액", value: `${result.over.toLocaleString()}원` }
      : { label: "추가 상환 여력", hint: "한도 내 추가 가능 연 상환액", value: `${result.room.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "dti",
      title: "DTI 계산기",
      inputs: [
        { label: "연소득(입력)", value: `${result.income.toLocaleString()}원` },
        { label: "주담대 연 원리금상환액(입력)", value: `${result.mortgage.toLocaleString()}원` },
        { label: "기타대출 연 이자상환액(입력)", value: `${result.otherInterest.toLocaleString()}원` },
        { label: "규제 한도(입력)", value: `${result.limitRate}%` },
      ],
      lines,
      total: { label: "DTI", value: `${result.dti}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="DTI 계산기"
      subtitle="연소득과 대출 상환액으로 총부채상환비율(DTI)과 한도 여력을 계산합니다."
      intro="DTI = (주택담보대출 연간 원리금상환액 + 기타대출 연간 이자상환액) ÷ 연소득 × 100(%). 지역에 따라 40~60% 한도가 적용됩니다."
      faqTitle="DTI 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. DTI가 무엇인가요?", a: "A. DTI(총부채상환비율, Debt To Income)는 연소득 대비 대출 상환액의 비율입니다. 주택담보대출의 원리금과 그 밖의 대출 이자를 연소득으로 나눠 상환 부담을 봅니다." },
        { q: "Q. DTI는 DSR과 어떻게 다른가요?", a: "A. DTI는 주택담보대출은 원리금 전액, 기타대출은 이자만 반영합니다. DSR은 주담대를 포함한 모든 대출의 원리금을 반영해 더 엄격합니다. 모든 대출 원리금 부담을 보려면 DSR 계산기를 이용하세요." },
        { q: "Q. DTI는 어떻게 계산하나요?", a: "A. DTI = ((주택담보대출 연간 원리금상환액 + 기타대출 연간 이자상환액) ÷ 연소득) × 100 입니다. 이 계산기는 입력값으로 DTI와, 한도율을 곱한 허용 상환액 대비 여력을 함께 보여줍니다." },
        { q: "Q. 한도는 몇 %인가요?", a: "A. 규제지역은 40~50%, 그 밖의 지역은 60%가 일반적입니다. 실제 한도는 지역·금융기관에 따라 다르므로 한도 입력값을 바꿔 판정하세요." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0으로 처리하며, 연소득이 0이면 DTI를 계산할 수 없어 0%로 표시합니다. CSV에는 입력값과 DTI·연간 상환부담액·여력이 모두 담깁니다." },
      ]}
      result={
        <ResultPanel
          title="DTI 계산 결과"
          lines={lines}
          total={{ label: "DTI", value: `${result.dti}%` }}
          note="※ LTV·DSR 등 다른 규제와 금리·만기에 따른 원리금 산정을 반영하지 않은 간이 계산입니다. 실제 심사 기준은 금융기관·규제 변화에 따라 다를 수 있어요."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="연소득 (원)" type="text" inputMode="numeric" value={incomeRaw} onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 60,000,000" />
        <InputBlock label="주담대 연 원리금상환액 (원)" type="text" inputMode="numeric" value={mortgageRaw} onChange={(e) => setMortgageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 24,000,000" />
        <InputBlock label="기타대출 연 이자상환액 (원)" type="text" inputMode="numeric" value={otherInterestRaw} onChange={(e) => setOtherInterestRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 6,000,000" />
        <InputBlock label="규제 한도 (%)" type="text" inputMode="decimal" value={limitRaw} onChange={(e) => setLimitRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 60" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 주택담보대출은 원리금 전액, 기타대출은 연간 이자만 입력하세요.</p>
    </CalculatorLayout>
  );
}
