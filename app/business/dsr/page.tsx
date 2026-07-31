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

export default function DsrPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const [repayRaw, setRepayRaw] = useState("");
  const [limitRaw, setLimitRaw] = useState("40");

  const result = useMemo(() => {
    const income = Math.max(0, parseNumber(incomeRaw));
    const repay = Math.max(0, parseNumber(repayRaw));
    const limitRate = Math.max(0, parseNumber(limitRaw));
    const dsr = income > 0 ? round1((repay / income) * 100) : 0;
    // 한도 기준 연간 상환 여력 (음수면 초과)
    const allowance = Math.round(income * (limitRate / 100) - repay);
    const room = Math.max(0, allowance);
    const over = allowance < 0 ? -allowance : 0;
    const within = income > 0 && dsr <= limitRate;
    return { income, repay, limitRate, dsr, room, over, within };
  }, [incomeRaw, repayRaw, limitRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "DSR 계산기", url });
      else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "DSR", hint: "연간 원리금상환액 ÷ 연소득", value: `${result.dsr}%` },
    { label: `${result.limitRate}% 한도 판정`, hint: "규제 한도 대비", value: result.within ? "한도 이내" : "한도 초과" },
    result.over > 0
      ? { label: "한도 초과 상환액", hint: "줄여야 할 연 원리금", value: `${result.over.toLocaleString()}원` }
      : { label: "추가 대출 여력", hint: "한도 내 추가 가능 연 원리금", value: `${result.room.toLocaleString()}원` },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "dsr",
      title: "DSR 계산기",
      inputs: [
        { label: "연소득(입력)", value: `${result.income.toLocaleString()}원` },
        { label: "연간 총 원리금상환액(입력)", value: `${result.repay.toLocaleString()}원` },
        { label: "규제 한도(입력)", value: `${result.limitRate}%` },
      ],
      lines,
      total: { label: "DSR", value: `${result.dsr}%` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="DSR 계산기"
      subtitle="연소득과 연간 원리금상환액으로 총부채원리금상환비율(DSR)과 한도 여력을 계산합니다."
      intro="DSR = 모든 대출의 연간 원리금상환액 합계 ÷ 연소득 × 100(%). 은행권은 보통 40%, 제2금융권은 50% 한도가 적용됩니다."
      faqTitle="DSR 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. DSR이 무엇인가요?", a: "A. DSR(총부채원리금상환비율)은 연간 갚아야 할 모든 대출의 원리금 상환액을 연소득으로 나눈 비율입니다. 대출 상환 부담 정도를 나타냅니다." },
        { q: "Q. DSR은 어떻게 계산하나요?", a: "A. DSR = (모든 대출의 연간 원리금상환액 합계 ÷ 연소득) × 100 입니다. 신용대출·주택담보대출·기타대출의 연간 원리금을 모두 더해 연간 총상환액에 넣으세요." },
        { q: "Q. 한도는 몇 %인가요?", a: "A. 금융위원회 차주단위 DSR 규제상 은행권은 40%, 제2금융권은 50%가 일반적입니다. 한도 입력값을 바꿔 상황에 맞게 판정할 수 있습니다." },
        { q: "Q. 추가 대출 여력은 무슨 뜻인가요?", a: "A. 한도(예: 40%) 안에서 추가로 감당할 수 있는 연간 원리금상환액입니다. 여력 = 연소득 × 한도율 − 현재 연간 상환액으로 계산하며, 음수이면 한도 초과 금액으로 표시합니다." },
        { q: "Q. 빈칸은 어떻게 처리하나요?", a: "A. 빈칸은 0으로 처리하며, 연소득이 0이면 DSR을 계산할 수 없어 0%로 표시합니다." },
      ]}
      result={<ResultPanel title="DSR 계산 결과" lines={lines} total={{ label: "DSR", value: `${result.dsr}%` }} />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputBlock label="연소득 (원)" type="text" inputMode="numeric" value={incomeRaw} onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 50,000,000" />
        <InputBlock label="연간 총 원리금상환액 (원)" type="text" inputMode="numeric" value={repayRaw} onChange={(e) => setRepayRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 15,000,000" />
        <InputBlock label="규제 한도 (%)" type="text" inputMode="decimal" value={limitRaw} onChange={(e) => setLimitRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 40" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다. 실제 심사 기준은 금융기관·규제 변화에 따라 다를 수 있어요.</p>
    </CalculatorLayout>
  );
}
