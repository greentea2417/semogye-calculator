"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "@/components/ResultPanel";
import { downloadResultCsv } from "@/components/lib/resultCsv";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseInt0(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatNum(n: number) {
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("ko-KR") : "";
}

type Usage = "private" | "business";

/** 지방세법 제127조 승용자동차 cc당 세액(원) */
function ccRate(cc: number, usage: Usage) {
  if (usage === "private") {
    if (cc <= 1000) return 80;
    if (cc <= 1600) return 140;
    return 200;
  }
  // 영업용
  if (cc <= 1000) return 18;
  if (cc <= 1600) return 18;
  if (cc <= 2000) return 19;
  if (cc <= 2500) return 19;
  return 24;
}

/**
 * 지방세법 제127조: 차령 3년 이상 비영업용 승용차는 1년마다 5%씩, 최대 50%까지 경감.
 * 경감율(%) = min(차령-2, 10) × 5  (차령 3년부터, 12년에서 상한)
 */
function reductionRate(age: number, usage: Usage) {
  if (usage !== "private") return 0;
  if (age < 3) return 0;
  const steps = Math.min(age - 2, 10);
  return steps * 5;
}

function calcCarTax(cc: number, age: number, usage: Usage) {
  const rate = ccRate(cc, usage);
  const baseTax = cc * rate; // 경감 전 자동차세
  const reduction = reductionRate(age, usage);
  const carTax = Math.round(baseTax * (1 - reduction / 100)); // 경감 후 자동차세
  const eduTax = usage === "private" ? Math.round(carTax * 0.3) : 0; // 지방교육세 30% (비영업용만)
  const total = carTax + eduTax;
  return { rate, baseTax, reduction, carTax, eduTax, total };
}

const USAGE_LABEL: Record<Usage, string> = {
  private: "비영업용(자가용)",
  business: "영업용",
};

export default function CarTaxPage() {
  const [ccRaw, setCcRaw] = useState("");
  const [ageRaw, setAgeRaw] = useState("");
  const [usage, setUsage] = useState<Usage>("private");

  const cc = parseInt0(ccRaw);
  const age = parseInt0(ageRaw);
  const r = useMemo(() => calcCarTax(cc, age, usage), [cc, age, usage]);

  const lines: ResultLine[] = [
    { label: "자동차세(경감 전)", hint: `${cc.toLocaleString()}cc × ${r.rate}원`, value: `${r.baseTax.toLocaleString()}원` },
  ];
  if (usage === "private") {
    lines.push({ label: "차령 경감", hint: `차령 ${age}년`, value: r.reduction > 0 ? `-${r.reduction}%` : "0%" });
  }
  lines.push({ label: "자동차세", hint: "경감 적용", value: `${r.carTax.toLocaleString()}원` });
  if (usage === "private") {
    lines.push({ label: "지방교육세", hint: "자동차세 30%", value: `${r.eduTax.toLocaleString()}원` });
  }

  const total = { label: "연 자동차세 합계", value: `${r.total.toLocaleString()}원` };

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "자동차세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "car-tax",
      title: "자동차세 계산기",
      inputs: [
        { label: "용도(입력)", value: USAGE_LABEL[usage] },
        { label: "배기량(입력)", value: `${cc.toLocaleString()}cc` },
        { label: "차령(입력)", value: `${age}년` },
      ],
      lines,
      total,
      footerNote: "* 실제 고지서는 10원 미만 절사 등으로 차이가 날 수 있습니다.",
    });

  return (
    <CalculatorLayout
      tone="business"
      title="자동차세 계산기"
      subtitle="배기량과 차령을 넣으면 승용차 연간 자동차세와 지방교육세를 계산합니다."
      intro="지방세법 제127조 표준세율 기준입니다. 비영업용 승용차는 배기량 cc당 세액에 지방교육세 30%가 더해지고, 차령 3년부터 세액이 경감됩니다."
      faqTitle="자동차세 계산기 자주 묻는 질문"
      faqItems={[
        {
          q: "Q. 자동차세는 어떻게 계산하나요?",
          a: "A. 승용차 자동차세 = 배기량(cc) × cc당 세액입니다. 비영업용은 1,000cc 이하 80원, 1,600cc 이하 140원, 1,600cc 초과 200원이며 여기에 자동차세의 30%가 지방교육세로 더해집니다.",
        },
        {
          q: "Q. 차령에 따른 경감은 무엇인가요?",
          a: "A. 비영업용 승용차는 차령 3년째부터 매년 5%씩, 최대 50%(12년 이상)까지 자동차세가 경감됩니다. 경감율 = (차령 − 2) × 5%로, 3년이면 5%, 12년 이상이면 50% 경감됩니다.",
        },
        {
          q: "Q. 영업용 승용차는 세액이 다른가요?",
          a: "A. 네. 영업용 승용차는 1,000~1,600cc 이하 18원, 2,500cc 이하 19원, 2,500cc 초과 24원으로 세율이 훨씬 낮고, 차령 경감과 지방교육세는 적용되지 않습니다.",
        },
        {
          q: "Q. 실제 고지서 금액과 다를 수 있나요?",
          a: "A. 이 계산기는 연세액(표준세율) 기준입니다. 실제 고지서는 10원 미만 절사, 연납 할인, 소유 기간에 따른 일할계산 등이 반영되어 다소 차이가 날 수 있습니다.",
        },
        {
          q: "Q. CSV에는 무엇이 들어가나요?",
          a: "A. 입력한 용도·배기량·차령과 자동차세·지방교육세·연 합계가 포함됩니다.",
        },
      ]}
      result={
        <ResultPanel
          title="자동차세 계산 결과"
          lines={lines}
          total={total}
          note="* 지방세법 제127조 표준세율 기준의 연세액이며, 실제 고지서와 다를 수 있습니다."
        />
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="input-block">
          <label className="input-label">용도</label>
          <select
            className="input-field prefilled"
            value={usage}
            onChange={(e) => setUsage(e.target.value as Usage)}
          >
            <option value="private">비영업용(자가용)</option>
            <option value="business">영업용</option>
          </select>
        </div>
        <InputBlock
          label="배기량 (cc)"
          type="text"
          inputMode="numeric"
          value={ccRaw}
          onChange={(e) => setCcRaw(formatNum(parseInt0(e.target.value)))}
          placeholder="예: 1,998"
        />
        <InputBlock
          label="차령 (년)"
          type="text"
          inputMode="numeric"
          value={ageRaw}
          onChange={(e) => setAgeRaw(formatNum(parseInt0(e.target.value)))}
          placeholder="예: 3 (신차는 0)"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        * 차령은 최초 등록 이후 경과 연수입니다. 비영업용 승용차만 차령 경감이 적용됩니다.
      </p>
    </CalculatorLayout>
  );
}
