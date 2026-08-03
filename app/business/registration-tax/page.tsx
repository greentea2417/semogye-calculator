"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) { const cleaned = String(raw ?? "").replace(/[^\d]/g, ""); return cleaned ? Number(cleaned) : 0; }
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function RegistrationTaxPage() {
  const [baseRaw, setBaseRaw] = useState("");
  const [rateRaw, setRateRaw] = useState("0.2");

  const result = useMemo(() => {
    const base = parseNumber(baseRaw);
    const rate = Number(rateRaw || 0);
    const tax = base > 0 ? Math.floor((base * rate) / 100) : 0;
    return { base, rate, tax };
  }, [baseRaw, rateRaw]);

  const lines: ResultLine[] = [{ label: "등록면허세", hint: "과세표준 × 세율", value: `${result.tax.toLocaleString()}원` }];
  const total: ResultLine = { label: "납부세액", value: `${result.tax.toLocaleString()}원` };

  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "등록면허세 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const onCsvDownload = () => downloadResultCsv({ slug: "registration-tax", title: "등록면허세 계산기", inputs: [{ label: "과세표준(입력)", value: `${result.base.toLocaleString()}원` }, { label: "세율(입력)", value: `${result.rate}%` }], lines, total });

  return (
    <CalculatorLayout title="등록면허세 계산기" subtitle="과세표준과 세율로 등록면허세를 계산합니다." intro="등록면허세는 일반적으로 과세표준 × 세율로 산출합니다. 이 계산기는 사용자가 입력한 세율을 기준으로 단순 계산합니다." faqTitle="등록면허세 계산기 자주 묻는 질문" faqItems={[
      { q: "Q. 등록면허세는 어떻게 계산하나요?", a: "A. 일반적으로 과세표준에 세율을 곱해 계산합니다. 이 계산기는 세율을 직접 입력하는 방식입니다." },
      { q: "Q. 세율은 고정인가요?", a: "A. 아닙니다. 등록 원인, 자산 종류, 지역, 감면 여부에 따라 달라질 수 있습니다." },
      { q: "Q. 빈칸이나 0원도 되나요?", a: "A. 네. 빈칸은 0으로 처리하고 결과도 0원으로 표시합니다. CSV에는 입력값과 결과값이 모두 들어갑니다. 엑셀에서 열 수 있어요 (.csv)" },
      { q: "Q. 소수 세율도 가능한가요?", a: "A. 네. 0.2처럼 소수 세율을 입력할 수 있습니다." },
      { q: "Q. 다른 세금도 같이 계산되나요?", a: "A. 아니요. 등록면허세만 계산합니다." },
    ]} result={<ResultPanel title="등록면허세 계산 결과" lines={lines} total={total} note="* 입력한 세율 기준의 간이 계산입니다. 실제 세액은 등록 원인과 대상에 따라 달라질 수 있습니다." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}>
      <InputBlock label="과세표준 (원)" type="text" inputMode="numeric" value={baseRaw} onChange={(e) => setBaseRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 100,000,000" />
      <div className="mt-4"><InputBlock label="세율 (%)" type="text" inputMode="decimal" value={rateRaw} onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 0.2" /></div>
    </CalculatorLayout>
  );
}
