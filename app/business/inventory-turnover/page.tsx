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
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function InventoryTurnoverPage() {
  const [cogsRaw, setCogsRaw] = useState("");
  const [beginRaw, setBeginRaw] = useState("");
  const [endRaw, setEndRaw] = useState("");

  const result = useMemo(() => {
    const cogs = Math.max(0, parseNumber(cogsRaw));
    const begin = Math.max(0, parseNumber(beginRaw));
    const end = Math.max(0, parseNumber(endRaw));
    const avgInventory = (begin + end) / 2;
    const turnover = avgInventory > 0 ? cogs / avgInventory : 0;
    const days = turnover > 0 ? 365 / turnover : 0;
    return { cogs, begin, end, avgInventory, turnover, days };
  }, [cogsRaw, beginRaw, endRaw]);

  const lines: ResultLine[] = [
    { label: "평균 재고자산", hint: "(기초 + 기말) ÷ 2", value: `${Math.round(result.avgInventory).toLocaleString("ko-KR")}원` },
    { label: "재고회전율", hint: "매출원가 ÷ 평균재고", value: `${round2(result.turnover)}회` },
    { label: "재고회전일수", hint: "365 ÷ 재고회전율", value: `${round2(result.days)}일` },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "재고회전율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "inventory-turnover",
      title: "재고회전율 계산기",
      inputs: [
        { label: "매출원가(입력)", value: `${result.cogs.toLocaleString("ko-KR")}원` },
        { label: "기초재고(입력)", value: `${result.begin.toLocaleString("ko-KR")}원` },
        { label: "기말재고(입력)", value: `${result.end.toLocaleString("ko-KR")}원` },
      ],
      lines,
      total: { label: "재고회전율", value: `${round2(result.turnover)}회` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="재고회전율 계산기"
      subtitle="매출원가와 기초·기말 재고를 넣으면 재고회전율과 회전일수를 계산합니다."
      intro="재고가 1년에 몇 번 팔려나가는지(회전율), 한 바퀴 도는 데 며칠 걸리는지(회전일수)를 확인해 재고 효율을 점검할 수 있어요."
      faqTitle="재고회전율 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 재고회전율은 어떻게 계산하나요?", a: "A. 재고회전율 = 매출원가 ÷ 평균 재고자산 입니다. 평균 재고자산은 (기초재고 + 기말재고) ÷ 2 로 계산합니다." },
        { q: "Q. 재고회전일수는 무엇인가요?", a: "A. 재고회전일수 = 365 ÷ 재고회전율 입니다. 재고가 한 바퀴 도는 데 걸리는 평균 일수로, 짧을수록 재고가 빠르게 소진됩니다." },
        { q: "Q. 매출액이 아니라 매출원가를 쓰는 이유는?", a: "A. 재고는 원가로 기록되므로, 분자도 같은 원가 기준인 매출원가를 쓰는 것이 표준 회계 방식입니다. 매출액으로 계산하면 회전율이 과대평가됩니다." },
        { q: "Q. 회전율이 높으면 무조건 좋은가요?", a: "A. 대체로 재고 효율이 좋다는 뜻이지만, 지나치게 높으면 품절·기회손실 위험이 있고, 너무 낮으면 재고 과잉·보관비 부담이 큽니다. 업종 평균과 비교하세요." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 매출원가·기초재고·기말재고 입력값과 평균 재고자산, 재고회전율, 재고회전일수가 모두 들어갑니다." },
      ]}
      result={<ResultPanel title="재고회전율 계산 결과" lines={lines} total={{ label: "재고회전율", value: `${round2(result.turnover)}회` }} note="* 매출원가 기준이며, 평균재고가 0이면 회전율·회전일수는 0으로 표시합니다." />}
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="매출원가 (원)" type="text" inputMode="numeric" value={cogsRaw} onChange={(e) => setCogsRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 120,000,000" />
        <InputBlock label="기초 재고 (원)" type="text" inputMode="numeric" value={beginRaw} onChange={(e) => setBeginRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 20,000,000" />
        <InputBlock label="기말 재고 (원)" type="text" inputMode="numeric" value={endRaw} onChange={(e) => setEndRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000,000" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 기초·기말 재고를 모르면 한 시점의 재고금액을 양쪽에 같은 값으로 넣어도 됩니다(그 값이 평균재고가 됩니다).</p>
    </CalculatorLayout>
  );
}
