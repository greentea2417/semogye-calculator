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

export default function VatPreNoticePage() {
  const [vatRaw, setVatRaw] = useState("");
  const result = useMemo(() => { const prevVat = Math.max(0, parseNumber(vatRaw)); const notice = prevVat < 100000 ? 0 : Math.floor(prevVat / 2); return { prevVat, notice }; }, [vatRaw]);
  const lines: ResultLine[] = [{ label: "예정고지세액", hint: "직전 납부세액 × 50%", value: `${result.notice.toLocaleString()}원` }];
  const onShare = async () => { const url = typeof window === "undefined" ? "" : window.location.href; if (!url) return; try { if (navigator.share) await navigator.share({ title: "부가세 예정고지 계산기", url }); else { await copyToClipboardSafe(url); toast("링크를 복사했어요!"); } } catch {} };
  const onCsvDownload = () => downloadResultCsv({ slug: "vat-pre-notice", title: "부가세 예정고지 계산기", inputs: [{ label: "직전 납부세액(입력)", value: `${result.prevVat.toLocaleString()}원` }], lines, total: { label: "예정고지세액", value: `${result.notice.toLocaleString()}원` }, footerNote: "엑셀에서 열 수 있어요 (.csv)" });

  return <CalculatorLayout title="부가세 예정고지 계산기" subtitle="직전 납부세액을 기준으로 부가세 예정고지세액을 계산합니다." intro="부가세 예정고지는 보통 직전 과세기간 납부세액의 1/2로 계산합니다. 10만원 미만은 0원으로 처리했습니다." faqTitle="부가세 예정고지 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 계산식은 무엇인가요?", a: "A. 예정고지세액 = 직전 납부세액 × 1/2 입니다." }, { q: "Q. 10만원 미만이면 어떻게 되나요?", a: "A. 예정고지세액이 10만원 미만인 경우 0원으로 처리했습니다." }, { q: "Q. 0원이나 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리합니다." }, { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 직전 납부세액과 계산된 예정고지세액이 들어갑니다." }]} result={<ResultPanel title="부가세 예정고지 계산 결과" lines={lines} total={{ label: "예정고지세액", value: `${result.notice.toLocaleString()}원` }} note="* 예정고지 대상 여부와 신고대체 가능 여부는 관할 세무서 안내를 확인하세요." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />}><InputBlock label="직전 납부세액 (원)" type="text" inputMode="numeric" value={vatRaw} onChange={(e) => setVatRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 800,000" /></CalculatorLayout>;
}