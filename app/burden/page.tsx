"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import { toast } from "../components/toast";
import { useUrlQuerySync, codecs } from "@/utils/useUrlQuerySync";

// 숫자 파싱/콤마 포맷
function parseNumber(raw: string) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function BurdenPage() {
  const [incomeRaw, setIncomeRaw] = useState("");
  const [paymentRaw, setPaymentRaw] = useState("");
  const [openDesc, setOpenDesc] = useState(false);

  // ✅ URL ↔ state 동기화 (반드시 컴포넌트 안에서!)
  //    -> 링크복사하면 입력값이 함께 따라감
  useUrlQuerySync([
    { key: "i", value: incomeRaw, setValue: setIncomeRaw, codec: codecs.numberCommaString },
    { key: "p", value: paymentRaw, setValue: setPaymentRaw, codec: codecs.numberCommaString },
  ]);

  const rate = useMemo(() => {
    const incomeNum = parseNumber(incomeRaw);
    const paymentNum = parseNumber(paymentRaw);
    if (!incomeNum || !paymentNum) return null;
    const result = (paymentNum / incomeNum) * 100;
    return Number(result.toFixed(1));
  }, [incomeRaw, paymentRaw]);

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast("링크가 복사되었습니다.");
  };

  // ✅ SEO용: 결과 문구를 더 구체적으로 (키워드 포함)
  const summary = useMemo(() => {
    if (rate === null) return null;

    if (rate < 20) {
      return {
        title: "상환부담률 20% 미만: 비교적 여유 있는 수준",
        desc:
          "월 소득 대비 상환액 비중이 낮아, 생활비·비상금·저축 여력이 비교적 유지될 가능성이 높습니다. " +
          "다만 변동금리·추가 대출이 예정되어 있다면 여유폭을 보수적으로 잡는 것이 좋아요.",
      };
    }
    if (rate < 30) {
      return {
        title: "상환부담률 20~30%: 관리가 필요한 구간",
        desc:
          "상환액이 월 소득에서 차지하는 비중이 커지기 시작하는 구간입니다. " +
          "고정비(통신·보험·구독) 점검, 대환/금리 재조정, 상환 스케줄 재배치 같은 관리가 도움이 됩니다.",
      };
    }
    return {
      title: "상환부담률 30% 이상: 부담이 큰 편",
      desc:
        "월 소득 대비 상환 비중이 높아 가계 현금흐름이 빠르게 빡빡해질 수 있습니다. " +
        "상환 구조 재설계(대환/기간조정), 지출 다이어트, 비상자금 확보 계획이 특히 중요해요.",
    };
  }, [rate]);

  return (
    <main className="mx-auto max-w-md px-4 py-8 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">상환부담률 계산기</h1>

        <p className="text-sm text-gray-500">월 소득 대비 상환 부담률(%)을 계산합니다.</p>

        <p className="text-xs text-gray-500">(대출·카드·할부 등 월 상환액 기준)</p>
      </section>

      {/* 입력 */}
      <section className="space-y-4">
        <input
          inputMode="numeric"
          placeholder="월 소득 (실수령액)"
          value={incomeRaw}
          onChange={(e) => {
            const n = parseNumber(e.target.value);
            setIncomeRaw(n ? formatComma(n) : "");
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        />

        <input
          inputMode="numeric"
          placeholder="월 상환액 (대출·카드·할부 등)"
          value={paymentRaw}
          onChange={(e) => {
            const n = parseNumber(e.target.value);
            setPaymentRaw(n ? formatComma(n) : "");
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        />

        <p className="text-xs text-gray-500">* 입력 즉시 자동 계산됩니다.</p>

        {/* ✅ 링크복사 버튼 1개만 */}
        <BottomActions copyLabel="링크복사" onCopyLink={onCopyLink} />
      </section>

      {/* 결과: 입력 후에만 */}
      {rate !== null && summary && (
        <section className="rounded-xl border bg-white p-5 space-y-3">
          <p className="text-lg font-bold">상환부담률: {rate}%</p>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{summary.title}</p>
            <p className="mt-1 text-sm text-gray-700">{summary.desc}</p>
          </div>

          <p className="text-xs text-gray-500">
            ※ 본 계산기는 “월 소득 대비 상환액 비율(상환부담률)”을 빠르게 확인하기 위한 참고용 지표입니다. 개인의 생활비 구조·부양가족·금리
            변동 등에 따라 체감 부담은 달라질 수 있어요.
          </p>
        </section>
      )}

      {/* 설명 토글 */}
      <section className="pt-2">
        <button
          onClick={() => setOpenDesc(!openDesc)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          📊 왜 이 기준인가요? {openDesc ? "▲" : "▼"}
        </button>

        {openDesc && (
          <div className="mt-4 rounded-xl border bg-white p-5 space-y-4 text-sm text-gray-700">
            <p>
              <strong>상환부담률</strong>은 월 소득 대비 고정적으로 지출되는 상환액의 비율을 의미합니다. (예: 대출 원리금, 카드·할부 고정
              상환 등)
            </p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">20% 미만</span>
                <span className="text-gray-600">여유 있는 수준</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">20% ~ 30%</span>
                <span className="text-gray-600">관리 필요</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">30% 이상</span>
                <span className="text-gray-600">부담 큼</span>
              </div>
            </div>

            <p className="text-gray-500">
              생활비·저축·비상자금까지 고려하면 “상환부담률이 낮을수록” 가계 현금흐름이 안정적일 가능성이 높습니다. 다만 소득 변동(프리랜서/자영업)이나 금리 변동이 있다면 보수적으로 판단하는 것이 좋아요.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
