"use client";

import { useMemo, useState } from "react";
import InputBlock from "../../components/InputBlock";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import ResultPanel, { type ResultLine } from "../../components/ResultPanel";
import { downloadResultCsv } from "../../components/lib/resultCsv";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return Number.isFinite(n) && n !== 0 ? n.toLocaleString("ko-KR") : "";
}

export default function VatReversePage() {
  const [total, setTotal] = useState("");
  const totalNum = parseNumber(total);
  const result = useMemo(() => {
    if (totalNum <= 0) return null;
    const supply = Math.round(totalNum / 1.1);
    const vat = Math.round(totalNum - supply);
    return { supply, vat, total: supply + vat };
  }, [totalNum]);

  const lines: ResultLine[] = [
    { label: "공급가액", hint: "총액 ÷ 1.1", value: `${(result?.supply ?? 0).toLocaleString()}원` },
    { label: "부가세", hint: "총액 − 공급가액", value: `${(result?.vat ?? 0).toLocaleString()}원` },
  ];
  const totalLine: ResultLine = { label: "합계", value: `${(result?.total ?? 0).toLocaleString()}원` };
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "vat-reverse",
      title: "부가세 역산 계산기",
      inputs: [{ label: "총금액(입력)", value: `${totalNum.toLocaleString()}원` }],
      lines,
      total: totalLine,
      footerNote: "엑셀에서 열 수 있어요 (.csv)",
    });

  return (
    <CalculatorLayout
      tone="business"
      title="부가세 역산 계산기"
      subtitle="부가세 포함 금액을 넣으면 공급가액과 부가세를 분리해 드려요."
      intro="국내 일반과세자 부가가치세율 10%를 기준으로 역산합니다."
      faqTitle="부가세 역산 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 공식은 어떻게 되나요?", a: "A. 부가세 포함 총액을 1.1로 나누면 공급가액, 총액에서 공급가액을 빼면 부가세입니다. 총액 = 공급가액 × 1.1 입니다." },
        { q: "Q. 0원이나 빈값도 계산되나요?", a: "A. 네. 입력이 없거나 0원일 때는 결과를 0원으로 표시합니다." },
        { q: "Q. 왜 10%가 아니라 1.1로 나누나요?", a: "A. 부가세는 공급가액의 10%이므로 총액은 공급가액의 110%가 됩니다. 그래서 총액 ÷ 1.1로 공급가액을 구합니다." },
        { q: "Q. 계산 결과가 반올림되나요?", a: "A. 원 단위 계산이므로 공급가액과 부가세를 반올림해 표시합니다. 원 단위 합계는 총액과 일치하도록 맞춥니다." },
      ]}
      result={<ResultPanel title="계산 결과" lines={lines} total={totalLine} note="* 일반 과세 기준 부가세 10%를 적용한 추정치입니다." />}
      guide={<BottomActions onShare={async () => { if (navigator.share) await navigator.share({ title: "부가세 역산 계산기", url: shareUrl }); else { await copyToClipboardSafe(shareUrl); toast("링크를 복사했어요!"); } }} onExcelDownload={onCsvDownload} />}
    >
      <InputBlock label="부가세 포함 총금액 (원)" type="text" inputMode="numeric" value={total} onChange={(e) => setTotal(formatComma(parseNumber(e.target.value)))} placeholder="예: 110,000" />
    </CalculatorLayout>
  );
}
