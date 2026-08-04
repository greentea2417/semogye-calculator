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

export default function RentConversionPage() {
  const [jeonseRaw, setJeonseRaw] = useState("");
  const [depositRaw, setDepositRaw] = useState(""); // 전환 후 유지할 보증금
  const [rateRaw, setRateRaw] = useState("5.5"); // 적용 전환율(%)
  const [baseRateRaw, setBaseRateRaw] = useState("2.5"); // 한국은행 기준금리(%)

  const result = useMemo(() => {
    const jeonse = Math.max(0, parseNumber(jeonseRaw));
    const deposit = Math.max(0, parseNumber(depositRaw));
    const rate = Math.max(0, parseNumber(rateRaw));
    const baseRate = Math.max(0, parseNumber(baseRateRaw));
    const converted = Math.max(0, jeonse - deposit); // 월세로 전환할 보증금
    const monthly = Math.round((converted * (rate / 100)) / 12); // 월세 = 전환보증금 × 전환율 ÷ 12
    const yearly = monthly * 12; // 연 환산 월세
    const legalCap = round2(Math.min(baseRate + 2, 10)); // 주택임대차보호법 상한
    const withinCap = rate <= legalCap;
    return { jeonse, deposit, rate, baseRate, converted, monthly, yearly, legalCap, withinCap };
  }, [jeonseRaw, depositRaw, rateRaw, baseRateRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "전월세 전환율 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const lines: ResultLine[] = [
    { label: "월세로 전환할 보증금", hint: "전세보증금 − 전환 후 보증금", value: `${result.converted.toLocaleString()}원` },
    { label: "연 환산 월세", hint: "월세 × 12", value: `${result.yearly.toLocaleString()}원` },
    { label: "법정 전환율 상한", hint: "min(기준금리+2%, 10%)", value: `${result.legalCap}%` },
    { label: "상한 적용 여부", hint: "입력 전환율 기준", value: result.withinCap ? "상한 이하(적정)" : "상한 초과" },
  ];

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "rent-conversion",
      title: "전월세 전환율 계산기",
      inputs: [
        { label: "전세보증금(입력)", value: `${result.jeonse.toLocaleString()}원` },
        { label: "전환 후 보증금(입력)", value: `${result.deposit.toLocaleString()}원` },
        { label: "적용 전환율(입력)", value: `${result.rate}%` },
        { label: "한국은행 기준금리(입력)", value: `${result.baseRate}%` },
      ],
      lines,
      total: { label: "환산 월세(월)", value: `${result.monthly.toLocaleString()}원` },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="전월세 전환율 계산기"
      subtitle="전세보증금을 월세로 바꿀 때 전환율을 적용한 월세와 법정 상한을 바로 계산합니다."
      intro="주택임대차보호법 제7조의2와 시행령 제9조에 따른 전월세 전환 공식(전환보증금 × 전환율 ÷ 12)과 법정 상한(기준금리+2% 또는 10% 중 낮은 값)을 반영한 간이 계산기입니다."
      faqTitle="전월세 전환율 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 전세를 월세로 바꿀 때 월세는 어떻게 계산하나요?",
          a: "A. 월세 = (전세보증금 − 전환 후 유지할 보증금) × 전환율 ÷ 12 로 계산합니다. 예를 들어 전세 3억원에서 보증금 1억원을 남기고 2억원을 전환율 5.5%로 월세 전환하면 2억원 × 5.5% ÷ 12 ≈ 91만6,667원이 됩니다.",
        },
        {
          q: "Q. 전월세 전환율 법정 상한은 얼마인가요?",
          a: "A. 주택임대차보호법 제7조의2와 시행령 제9조에 따라 '한국은행 기준금리 + 2%'와 '연 10%' 중 낮은 값이 상한입니다. 기준금리가 2.5%라면 상한은 4.5%입니다. 이 상한은 계약 갱신·조건 변경 시 강제되고, 신규 계약에는 강제되지 않습니다.",
        },
        {
          q: "Q. 한국은행 기준금리는 어디서 확인하나요?",
          a: "A. 한국은행 홈페이지의 기준금리 공시에서 현재 기준금리를 확인해 입력란에 넣으면 법정 상한이 자동으로 계산됩니다. 기준금리가 바뀌면 상한도 함께 달라집니다.",
        },
        {
          q: "Q. 반대로 월세를 전세로 바꿀 수도 있나요?",
          a: "A. 네. 이 계산기는 전세→월세 방향을 기준으로 하며, 월세를 전세로 환산할 때는 월세 × 12 ÷ 전환율 로 전환보증금을 구할 수 있습니다. 계약 조건에 맞춰 전환율을 조정해 비교해 보세요.",
        },
        {
          q: "Q. 입력값이 없거나 0이면 어떻게 되나요?",
          a: "A. 전환할 보증금이 0원 이하이면 월세도 0원으로 표시됩니다. CSV에는 전세보증금·전환 후 보증금·전환율·기준금리 등 입력값과 전환 보증금·월세·연 환산·법정 상한이 모두 담겨 엑셀에서 바로 열 수 있습니다.",
        },
      ]}
      result={
        <ResultPanel
          title="전월세 전환 계산 결과"
          lines={lines}
          total={{ label: "환산 월세(월)", value: `${result.monthly.toLocaleString()}원` }}
          note="※ 관리비·중개보수 등은 반영하지 않은 간이 계산입니다. 법정 상한은 계약 갱신·조건 변경에 적용되며 실제 계약은 당사자 합의에 따릅니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="전세보증금 (원)"
          type="text"
          inputMode="numeric"
          value={jeonseRaw}
          onChange={(e) => setJeonseRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 300,000,000"
        />
        <InputBlock
          label="전환 후 보증금 (원)"
          type="text"
          inputMode="numeric"
          value={depositRaw}
          onChange={(e) => setDepositRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 100,000,000"
        />
        <InputBlock
          label="적용 전환율 (%)"
          type="text"
          inputMode="decimal"
          value={rateRaw}
          onChange={(e) => setRateRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 5.5"
        />
        <InputBlock
          label="한국은행 기준금리 (%)"
          type="text"
          inputMode="decimal"
          value={baseRateRaw}
          onChange={(e) => setBaseRateRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 2.5"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 전환 후 보증금을 비우면 전세보증금 전액을 월세로 전환한 금액을 계산합니다. 법정 상한은 기준금리 입력값으로 자동 계산됩니다.
      </p>
    </CalculatorLayout>
  );
}
