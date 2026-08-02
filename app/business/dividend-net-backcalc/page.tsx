"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string) { const cleaned = String(raw ?? "").replace(/[^\d.]/g, ""); return cleaned ? Number(cleaned) : 0; }
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }
function round0(n: number) { return Math.round(n); }

export default function DividendNetBackcalcPage() {
  const [netRaw, setNetRaw] = useState("");
  const result = useMemo(() => {
    const net = Math.max(0, parseNumber(netRaw));
    const gross = net > 0 ? round0(net / 0.846) : 0;
    const incomeTax = round0(gross * 0.14);
    const localTax = round0(incomeTax * 0.1);
    const totalTax = incomeTax + localTax;
    const checkNet = Math.max(0, gross - totalTax);
    return { net, gross, incomeTax, localTax, totalTax, checkNet };
  }, [netRaw]);

  const lines: ResultLine[] = [
    { label: "세전 배당금", hint: "세후 금액 ÷ 0.846", value: `${result.gross.toLocaleString()}원` },
    { label: "소득세", hint: "세전 배당금 × 14%", value: `${result.incomeTax.toLocaleString()}원` },
    { label: "지방소득세", hint: "소득세 × 10%", value: `${result.localTax.toLocaleString()}원` },
    { label: "총 세금", hint: "소득세 + 지방소득세", value: `${result.totalTax.toLocaleString()}원` },
    { label: "검산 후 세후금액", hint: "세전 배당금 − 총 세금", value: `${result.checkNet.toLocaleString()}원` },
  ];

  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "세후 배당금 역산 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const onCsvDownload = () => downloadResultCsv({ slug: "dividend-net-backcalc", title: "세후 배당금 역산 계산기", inputs: [{ label: "세후 배당금(입력)", value: `${result.net.toLocaleString()}원` }], lines, total: { label: "세전 배당금", value: `${result.gross.toLocaleString()}원` }, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return (
    <CalculatorLayout tone="business" title="세후 배당금 역산 계산기" subtitle="원하는 세후 배당금을 받으려면 세전 배당금이 얼마여야 하는지 계산합니다." intro="배당소득세 15.4%를 역산해 세전 배당금 = 세후 배당금 ÷ 0.846 으로 계산합니다." faqTitle="세후 배당금 역산 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 왜 0.846으로 나누나요?", a: "A. 배당금의 15.4%가 원천징수되므로, 수령 비율은 84.6%입니다. 따라서 세후 금액을 0.846으로 나누면 세전 배당금을 구할 수 있습니다." },
      { q: "Q. 반올림 오차가 있나요?", a: "A. 세금은 원 단위로 반올림하므로 1원 내외 차이가 날 수 있습니다. 이 계산기는 검산용 세후금액도 함께 보여줍니다." },
      { q: "Q. 빈칸이나 0원도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원입니다." },
      { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 세후 배당금, 세전 배당금, 소득세, 지방소득세, 총 세금, 검산 후 세후금액이 모두 들어가며 엑셀에서 열 수 있어요 (.csv)" },
    ]}
    result={<ResultPanel title="역산 결과" lines={lines} total={{ label: "세전 배당금", value: `${result.gross.toLocaleString()}원` }} />}
    guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="원하는 세후 배당금 (원)" type="text" inputMode="numeric" value={netRaw} onChange={(e) => setNetRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 850,000" />
      <p className="mt-3 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
