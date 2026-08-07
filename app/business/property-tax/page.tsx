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
  const cleaned = String(raw ?? "").replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatWon(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}
function won(n: number) {
  return `${Math.floor(n).toLocaleString("ko-KR")}원`;
}

/** 지방세법 제111조 주택분 재산세(표준세율). 단위: 원 */
function housingPropertyTax(base: number) {
  if (base <= 60_000_000) return base * 0.001;
  if (base <= 150_000_000) return 60_000 + (base - 60_000_000) * 0.0015;
  if (base <= 300_000_000) return 195_000 + (base - 150_000_000) * 0.0025;
  return 570_000 + (base - 300_000_000) * 0.004;
}

function calcPropertyTax(publicPrice: number, ratioPct: number) {
  const ratio = Math.max(0, ratioPct) / 100; // 공정시장가액비율
  const base = Math.max(0, Math.floor(publicPrice * ratio)); // 과세표준
  const propertyTax = Math.floor(housingPropertyTax(base)); // 재산세(주택분)
  const eduTax = Math.floor(propertyTax * 0.2); // 지방교육세 20%
  const total = propertyTax + eduTax;
  return { ratioPct, base, propertyTax, eduTax, total };
}

export default function PropertyTaxPage() {
  const [priceRaw, setPriceRaw] = useState("");
  const [ratioRaw, setRatioRaw] = useState("60");

  const r = useMemo(
    () => calcPropertyTax(parseNumber(priceRaw), parseNumber(ratioRaw)),
    [priceRaw, ratioRaw],
  );

  const lines: ResultLine[] = [
    { label: "공정시장가액비율", hint: "입력값", value: `${r.ratioPct}%` },
    { label: "과세표준", hint: "공시가격 × 비율", value: won(r.base) },
    { label: "재산세(주택분)", hint: "지방세법 §111 세율", value: won(r.propertyTax) },
    { label: "지방교육세", hint: "재산세 20%", value: won(r.eduTax) },
  ];
  const total = { label: "총 세액", value: won(r.total) };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "재산세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "property-tax",
      title: "재산세 계산기",
      inputs: [
        { label: "공시가격(입력)", value: won(parseNumber(priceRaw)) },
        { label: "공정시장가액비율(입력)", value: `${parseNumber(ratioRaw)}%` },
      ],
      lines,
      total,
    });

  return (
    <CalculatorLayout
      tone="business"
      title="재산세 계산기"
      subtitle="주택 공시가격과 공정시장가액비율을 넣으면 주택분 재산세와 지방교육세를 계산합니다."
      intro="지방세법 제111조 주택 표준세율(0.1~0.4%)과 지방교육세 20%를 적용한 예상액이에요."
      faqTitle="재산세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 재산세는 어떻게 계산하나요?",
          a: "A. 과세표준(주택 공시가격 × 공정시장가액비율)에 주택 표준세율을 적용합니다. 과세표준 6천만원 이하 0.1%, 1.5억원 이하는 6만원+6천만원 초과분의 0.15%, 3억원 이하는 19만5천원+1.5억원 초과분의 0.25%, 3억원 초과는 57만원+3억원 초과분의 0.4%입니다.",
        },
        {
          q: "Q. 공정시장가액비율은 얼마로 넣나요?",
          a: "A. 주택은 기본 60%입니다. 1세대 1주택은 공시가격에 따라 43~45%의 특례 비율이 적용될 수 있어, 해당하면 비율을 직접 바꿔 입력하세요. 기본값은 60%로 되어 있습니다.",
        },
        {
          q: "Q. 지방교육세는 무엇인가요?",
          a: "A. 재산세액의 20%가 지방교육세로 함께 부과됩니다. 이 계산기는 재산세(주택분)와 지방교육세를 더한 금액을 총 세액으로 보여줍니다.",
        },
        {
          q: "Q. 도시지역분이나 지역자원시설세도 포함되나요?",
          a: "A. 아니요. 재산세 도시지역분(과세표준의 0.14%), 지역자원시설세, 세부담상한 등은 반영하지 않습니다. 실제 고지서 금액과 다를 수 있으며 참고용 예상액입니다.",
        },
        {
          q: "Q. 공시가격은 어디서 확인하나요?",
          a: "A. 공동주택·단독주택 공시가격은 '부동산공시가격 알리미'에서 조회할 수 있습니다. 실거래가나 시세가 아니라 공시가격을 입력해야 정확합니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 공시가격·공정시장가액비율과 과세표준, 재산세(주택분), 지방교육세, 총 세액이 모두 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="재산세 계산 결과"
          lines={lines}
          total={total}
          note="* 주택분 재산세와 지방교육세만 계산한 예상액입니다. 도시지역분·지역자원시설세·세부담상한은 제외되어 실제 고지액과 다를 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock
          label="주택 공시가격 (원)"
          type="text"
          inputMode="numeric"
          value={priceRaw}
          onChange={(e) => setPriceRaw(formatWon(parseNumber(e.target.value)))}
          placeholder="예: 300,000,000"
        />
        <InputBlock
          label="공정시장가액비율 (%)"
          type="text"
          inputMode="numeric"
          value={ratioRaw}
          onChange={(e) => setRatioRaw(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="예: 60"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 시세가 아닌 공시가격을 넣으세요. 주택 공정시장가액비율은 기본 60%이며, 1세대 1주택 특례
        대상이면 43~45%로 바꿔 입력하세요.
      </p>
    </CalculatorLayout>
  );
}
