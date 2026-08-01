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
function won(n: number) {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export default function DepreciationPage() {
  const [acquisitionRaw, setAcquisitionRaw] = useState("");
  const [residualRaw, setResidualRaw] = useState("");
  const [lifeRaw, setLifeRaw] = useState("");

  const result = useMemo(() => {
    const acquisition = Math.max(0, parseNumber(acquisitionRaw));
    const residual = Math.max(0, parseNumber(residualRaw));
    const life = Math.max(0, Math.floor(parseNumber(lifeRaw)));
    const depreciableBase = Math.max(0, acquisition - residual);
    const annual = life > 0 ? depreciableBase / life : 0;
    const monthly = annual / 12;
    const rate = life > 0 ? 1 / life : 0;

    // 연차별 상각 스케줄: 마지막 해에 반올림 잔차를 몰아 장부가액이 잔존가치와 정확히 일치하게 한다.
    const rows: { year: number; expense: number; accumulated: number; bookValue: number }[] = [];
    if (life > 0 && depreciableBase > 0) {
      const perYear = Math.round(annual);
      const cap = Math.min(life, 50);
      let accumulated = 0;
      for (let y = 1; y <= cap; y++) {
        const expense = y === life ? depreciableBase - perYear * (life - 1) : perYear;
        accumulated += expense;
        rows.push({ year: y, expense, accumulated, bookValue: acquisition - accumulated });
      }
    }

    return { acquisition, residual, life, depreciableBase, annual, monthly, rate, rows };
  }, [acquisitionRaw, residualRaw, lifeRaw]);

  const lines: ResultLine[] = [
    { label: "감가상각 대상금액", hint: "취득가액 − 잔존가치", value: won(result.depreciableBase) },
    { label: "연 감가상각비", hint: "대상금액 ÷ 내용연수", value: won(result.annual) },
    { label: "월 감가상각비", hint: "연 상각비 ÷ 12", value: won(result.monthly) },
    { label: "상각률", hint: "1 ÷ 내용연수", value: `${(result.rate * 100).toFixed(2)}%` },
  ];

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "감가상각 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const onCsvDownload = () =>
    downloadResultCsv({
      slug: "depreciation",
      title: "감가상각 계산기 (정액법)",
      inputs: [
        { label: "취득가액(입력)", value: won(result.acquisition) },
        { label: "잔존가치(입력)", value: won(result.residual) },
        { label: "내용연수(입력)", value: `${result.life}년` },
      ],
      lines: [
        ...lines,
        ...result.rows.map((r) => ({
          label: `${r.year}년차`,
          hint: `누계 ${won(r.accumulated)} / 장부가 ${won(r.bookValue)}`,
          value: won(r.expense),
        })),
      ],
      total: { label: "연 감가상각비", value: won(result.annual) },
    });

  return (
    <CalculatorLayout
      tone="business"
      title="감가상각 계산기"
      subtitle="취득가액, 잔존가치, 내용연수를 넣으면 정액법 감가상각비를 계산합니다."
      intro="설비·차량·비품 등 유형자산을 매년 균등하게 상각하는 정액법 기준으로, 연·월 감가상각비와 연차별 장부가액을 확인할 수 있어요."
      faqTitle="감가상각 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 정액법 감가상각비는 어떻게 계산하나요?", a: "A. 연 감가상각비 = (취득가액 − 잔존가치) ÷ 내용연수 입니다. 매년 같은 금액을 상각하며, 월 상각비는 이를 12로 나눈 값입니다. (법인세법 시행령 제26조 정액법 기준)" },
        { q: "Q. 잔존가치는 얼마로 넣나요?", a: "A. 세법상 감가상각 대상 자산의 잔존가치는 일반적으로 0원으로 봅니다. 회계 목적으로 예상 처분가액이 있다면 그 금액을 넣으세요. 비워두면 0원으로 계산합니다." },
        { q: "Q. 내용연수는 어떻게 정하나요?", a: "A. 세법상 자산별 기준내용연수(예: 차량운반구·비품 5년, 건물 등은 더 김)를 사용합니다. 정확한 연수는 업종별 기준내용연수표를 확인하세요." },
        { q: "Q. 정률법과 무엇이 다른가요?", a: "A. 정액법은 매년 같은 금액을 상각하지만, 정률법은 장부가액에 일정 상각률을 곱해 초기에 더 많이 상각합니다. 이 계산기는 정액법 기준입니다." },
        { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 취득가액·잔존가치·내용연수 입력값과 대상금액, 연·월 감가상각비, 상각률, 연차별 감가상각비·누계·장부가액이 모두 들어갑니다." },
      ]}
      result={
        <ResultPanel title="감가상각 계산 결과 (정액법)" lines={lines} total={{ label: "연 감가상각비", value: won(result.annual) }} note="* 정액법 기준이며, 마지막 연차에서 반올림 잔차를 조정해 장부가액이 잔존가치와 일치합니다.">
          {result.rows.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-gray-600">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-1 text-left font-semibold">연차</th>
                    <th className="py-1 text-right font-semibold">감가상각비</th>
                    <th className="py-1 text-right font-semibold">감가상각누계액</th>
                    <th className="py-1 text-right font-semibold">기말 장부가액</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r) => (
                    <tr key={r.year} className="border-b border-gray-100 last:border-0">
                      <td className="py-1 text-left">{r.year}년차</td>
                      <td className="py-1 text-right tabular-nums">{r.expense.toLocaleString("ko-KR")}</td>
                      <td className="py-1 text-right tabular-nums">{r.accumulated.toLocaleString("ko-KR")}</td>
                      <td className="py-1 text-right tabular-nums">{r.bookValue.toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ResultPanel>
      }
      guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputBlock label="취득가액 (원)" type="text" inputMode="numeric" value={acquisitionRaw} onChange={(e) => setAcquisitionRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 10,000,000" />
        <InputBlock label="잔존가치 (원)" type="text" inputMode="numeric" value={residualRaw} onChange={(e) => setResidualRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 0" />
        <InputBlock label="내용연수 (년)" type="text" inputMode="numeric" value={lifeRaw} onChange={(e) => setLifeRaw(String(Math.floor(parseNumber(e.target.value)) || ""))} placeholder="예: 5" />
      </div>
      <p className="mt-3 text-xs text-gray-500">* 세법상 잔존가치는 보통 0원입니다. 내용연수는 자산별 기준내용연수표를 참고하세요.</p>
    </CalculatorLayout>
  );
}
