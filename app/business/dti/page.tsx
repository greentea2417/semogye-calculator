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

export default function DtiPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const [mortgageRaw, setMortgageRaw] = useState("");
  const [otherInterestRaw, setOtherInterestRaw] = useState("");
  const [limitRaw, setLimitRaw] = useState("60");

  const result = useMemo(() => {
    const income = Math.max(0, parseNumber(incomeRaw));
    const mortgage = Math.max(0, parseNumber(mortgageRaw)); // 주택담보대출 연간 원리금상환액
    const otherInterest = Math.max(0, parseNumber(otherInterestRaw)); // 기타 대출 연간 이자상환액
    const limitRate = Math.max(0, parseNumber(limitRaw));
    const burden = mortgage + otherInterest; // DTI 분자
    const dti = income > 0 ? round1((burden / income) * 100) : 0;
    const within = income > 0 && dti <= limitRate;
    const allowance = Math.round(income * (limitRate / 100) - burden);
    const room = Math.max(0, allowance);
    const over = allowance < 0 ? -allowance : 0;
    return { income, mortgage, otherInterest, limitRate, burden, dti, within, room, over };
  }, [incomeRaw, mortgageRaw, otherInterestRaw, limitRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "DTI 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "연간 총 상환부담", hint: "주담대 원리금 + 기타대출 이자", value: `${result.burden.toLocaleString()}원` },
    { label: "DTI", hint: "총 상환부담 ÷ 연소득", value: `${result.dti}%` },
    { label: `${result.limitRate}% 한도 판정`, hint: "규제 한도 대비", value: result.within ? "한도 이내" : "한도 초과" },
    result.over > 0
      ? { label: "한도 초과 상환액", hint: "줄여야 할 연 상환부담", value: `${result.over.toLocaleString()}원` }
      : { label: "추가 상환 여력", hint: "한도 내 추가 가능 연 상환액", value: `${result.room.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "dti",
      title: "DTI 계산기",
      inputs: [
        { label: "연소득(입력)", value: `${result.income.toLocaleString()}원` },
        { label: "주택담보대출 연간 원리금(입력)", value: `${result.mortgage.toLocaleString()}원` },
        { label: "기타대출 연간 이자(입력)", value: `${result.otherInterest.toLocaleString()}원` },
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
      intro="DTI = (주택담보대출 연간 원리금상환액 + 기타 대출의 연간 이자상환액) ÷ 연소득 × 100(%). 주담대는 원리금 전체, 기타 대출은 이자만 반영하는 점이 DSR과 다릅니다."
      faqTitle="DTI 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. DTI가 무엇인가요?", a: "A. DTI(총부채상환비율, Debt To Income)는 연소득 대비 대출 상환 부담의 비율입니다. 주택담보대출 심사 시 상환 능력을 보는 지표로 쓰입니다." },
        { q: "Q. DTI는 어떻게 계산하나요?", a: "A. DTI = (주택담보대출 연간 원리금상환액 + 기타 대출의 연간 이자상환액) ÷ 연소득 × 100 입니다. 주담대는 원금+이자를 모두, 나머지 대출은 이자만 더합니다." },
        { q: "Q. DTI와 DSR은 어떻게 다른가요?", a: "A. DSR은 모든 대출의 원리금(원금+이자)을 전부 합산하지만, DTI는 주택담보대출만 원리금을 넣고 기타 대출은 이자만 반영합니다. 그래서 보통 DTI가 DSR보다 낮게 나옵니다." },
        { q: "Q. DTI 한도는 몇 %인가요?", a: "A. 규제지역·주택 종류에 따라 다르며 통상 40~60% 범위입니다. 기본값 60%를 상황에 맞게 바꿔 판정할 수 있습니다. 실제 한도는 규제 변화에 따라 달라집니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0으로 처리하며, 연소득이 0이면 DTI를 계산할 수 없어 0%로 표시합니다." },
      ]}
      result={
        <ResultPanel
          title="DTI 계산 결과"
          lines={lines}
          total={{ label: "DTI", value: `${result.dti}%` }}
          note="※ 소득 산정 방식·기타 대출 이자 인정 범위는 금융기관마다 다를 수 있는 간이 계산입니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="연소득 (원)" type="text" inputMode="numeric" value={incomeRaw} onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 60,000,000" />
        <InputBlock label="주택담보대출 연간 원리금 (원)" type="text" inputMode="numeric" value={mortgageRaw} onChange={(e) => setMortgageRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 12,000,000" />
        <InputBlock label="기타대출 연간 이자 (원)" type="text" inputMode="numeric" value={otherInterestRaw} onChange={(e) => setOtherInterestRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 3,000,000" />
        <InputBlock label="규제 한도 (%)" type="text" inputMode="decimal" value={limitRaw} onChange={(e) => setLimitRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 60" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 실제 심사 기준은 금융기관·규제 변화에 따라 다를 수 있어요.</p>
    </CalculatorLayout>
  );
}
