"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "../components/lib/shareUtils";
import { toast } from "../components/toast";
import { useUrlQuerySync, codecs } from "@/utils/useUrlQuerySync";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function BurdenPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const [paymentRaw, setPaymentRaw] = useState("");

  useUrlQuerySync([
    { key: "i", value: incomeRaw, setValue: setIncomeRaw, codec: codecs.numberCommaString },
    { key: "p", value: paymentRaw, setValue: setPaymentRaw, codec: codecs.numberCommaString },
  ]);

  const income = parseNumber(incomeRaw);
  const payment = parseNumber(paymentRaw);

  const rate = useMemo(() => {
    if (!income || !payment) return null;
    return Number(((payment / income) * 100).toFixed(1));
  }, [income, payment]);

  const summary = useMemo(() => {
    if (rate === null) return null;
    if (rate < 20) {
      return {
        title: "상환부담률 20% 미만",
        desc: "월 소득 대비 상환 비중이 비교적 낮은 편입니다. 다만 소득 변동이나 금리 변화 가능성은 함께 고려하는 것이 좋아요.",
      };
    }
    if (rate < 30) {
      return {
        title: "상환부담률 20~30%",
        desc: "상환 비중이 점차 커지는 구간입니다. 고정 지출 구조와 상환 스케줄을 점검해 보기에 적절한 수준입니다.",
      };
    }
    return {
      title: "상환부담률 30% 이상",
      desc: "상환 비중이 높은 편으로 가계 현금흐름에 부담이 될 수 있습니다. 상환 구조·지출 구조를 점검해 보세요.",
    };
  }, [rate]);

  const remaining = income && payment ? Math.max(0, income - payment) : 0;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "상환부담률 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const resultLines: ResultLine[] = [
            { label: "월 소득 (실수령액)", value: `${income.toLocaleString()}원` },
            { label: "월 상환액", value: `${payment.toLocaleString()}원` },
            { label: "상환 후 잔여 소득", value: `${remaining.toLocaleString()}원` },
          ];
  const resultTotal: ResultLine = { label: "상환부담률", value: rate === null ? "-" : `${rate}%` };
  const onCsvDownload = () =>
    downloadResultCsv({ slug: "burden", title: "상환부담률 계산기", lines: resultLines, total: resultTotal });

  return (
    <CalculatorLayout
      tone="business"
      title="상환부담률 계산기"
      subtitle="월 소득 대비 대출 상환 부담 수준을 확인합니다."
      intro="대출·카드·할부처럼 매달 빠져나가는 고정 상환액이 소득에서 차지하는 비중을 바로 확인할 수 있어요."
      faqTitle="상환부담률 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 상환부담률은 어떻게 계산하나요?", a: "A. 상환부담률 = (월 상환액 ÷ 월 소득) × 100입니다. 월 소득은 실수령액 기준으로 넣는 것이 현실적입니다." },
        { q: "Q. 몇 %부터 위험한가요?", a: "A. 일반적으로 20% 미만은 여유, 20~30%는 관리 필요, 30% 이상은 부담이 커지는 구간으로 봅니다. 절대 기준은 아닙니다." },
        { q: "Q. DSR과 같은 개념인가요?", a: "A. 유사하지만 다릅니다. DSR은 금융기관이 모든 대출의 원리금을 연 소득으로 나눠 심사하는 공식 지표이고, 이 계산기는 개인이 체감 부담을 보는 참고 지표입니다." },
        { q: "Q. 어떤 지출을 월 상환액에 포함하나요?", a: "A. 주택담보대출·신용대출 원리금, 카드 할부, 리스료처럼 매달 고정적으로 나가는 상환액을 포함합니다." },
      ]}
      result={
        <ResultPanel
          title="계산 결과"
          lines={resultLines}
          total={resultTotal}
          note="※ 본 결과는 상환 부담 수준을 이해하기 위한 참고 지표입니다. 실제 대출 가능 여부나 금융기관 심사 기준을 대체하지 않습니다."
        >
          {summary ? (
            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">{summary.title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-700">{summary.desc}</p>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
              월 소득과 월 상환액을 입력하면 부담률이 표시됩니다.
            </p>
          )}

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">20% 미만</span>
              <span className="text-gray-500">부담이 상대적으로 낮은 편</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">20% ~ 30%</span>
              <span className="text-gray-500">관리 필요 구간</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">30% 이상</span>
              <span className="text-gray-500">부담이 커질 수 있는 구간</span>
            </div>
          </div>
        </ResultPanel>
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock
        label="월 소득 (실수령액)"
        type="text"
        inputMode="numeric"
        value={incomeRaw}
        onChange={(e) => setIncomeRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 3,000,000"
      />
      <div className="mt-4">
        <InputBlock
          label="월 상환액 (대출·카드·할부 등)"
          type="text"
          inputMode="numeric"
          value={paymentRaw}
          onChange={(e) => setPaymentRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 800,000"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
