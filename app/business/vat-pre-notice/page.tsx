"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorArticle from "@/components/CalculatorArticle";
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

  return <CalculatorLayout title="부가세 예정고지 계산기" subtitle="직전 납부세액을 기준으로 부가세 예정고지세액을 계산합니다." intro="부가세 예정고지는 보통 직전 과세기간 납부세액의 1/2로 계산합니다. 10만원 미만은 0원으로 처리했습니다." faqTitle="부가세 예정고지 계산기 자주 묻는 질문" faqItems={[{ q: "Q. 계산식은 무엇인가요?", a: "A. 예정고지세액 = 직전 납부세액 × 1/2 입니다." }, { q: "Q. 10만원 미만이면 어떻게 되나요?", a: "A. 예정고지세액이 10만원 미만인 경우 0원으로 처리했습니다." }, { q: "Q. 0원이나 빈칸도 되나요?", a: "A. 네. 빈칸은 0으로 처리합니다." }, { q: "Q. CSV에는 무엇이 들어가나요?", a: "A. 입력한 직전 납부세액과 계산된 예정고지세액이 들어갑니다." }]} result={<ResultPanel title="부가세 예정고지 계산 결과" lines={lines} total={{ label: "예정고지세액", value: `${result.notice.toLocaleString()}원` }} note="* 예정고지 대상 여부와 신고대체 가능 여부는 관할 세무서 안내를 확인하세요." />} guide={<BottomActions onShare={onShare} onExcelDownload={onCsvDownload} />} article={
      <CalculatorArticle
        sections={[
          {
            heading: "부가세 예정고지란?",
            body: (
              <p>
                부가세 예정고지는 법인이 아닌 <strong>개인 일반과세자</strong> 등에게, 세무서가 직전 과세기간 납부세액의
                절반을 미리 고지해 납부하도록 하는 제도입니다. 매 과세기간마다 신고·납부하는 부담을 나누기 위한 것으로,
                예정고지로 낸 세액은 다음 확정신고 때 <strong>기납부세액으로 공제</strong>됩니다.
              </p>
            ),
          },
          {
            heading: "계산 방법",
            body: (
              <>
                <p className="rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-800">
                  예정고지세액 = 직전 과세기간 납부세액 × 1/2
                </p>
                <p>
                  다만 계산된 예정고지세액이 <strong>10만원(현행 기준 50만원 미만은 고지 제외)</strong> 수준으로 적으면
                  고지가 생략될 수 있습니다. 본 계산기는 10만원 미만이면 0원으로 처리합니다.
                </p>
              </>
            ),
          },
          {
            heading: "계산 예시",
            body: (
              <>
                <p>직전 과세기간 납부세액이 800,000원인 경우:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>예정고지세액 = 800,000 × 1/2 = <strong>400,000원</strong></li>
                </ul>
              </>
            ),
          },
          {
            heading: "주의사항",
            body: (
              <p>
                예정고지 대상 여부, 고지 제외 기준 금액, 예정신고로 대체할 수 있는지 여부는 사업 형태와 그해 세법에 따라
                달라집니다. 실제 고지서 금액과 납부 기한은 <strong>관할 세무서·홈택스 안내</strong>를 반드시 확인하세요.
                본 계산은 참고용 추정치입니다.
              </p>
            ),
          },
        ]}
      />
    }><InputBlock label="직전 납부세액 (원)" type="text" inputMode="numeric" value={vatRaw} onChange={(e) => setVatRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 800,000" /></CalculatorLayout>;
}