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

  // URL ↔ state 동기화 (링크 공유 시 입력값 유지)
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

  // 결과 해석(참고용 요약)
  const summary = useMemo(() => {
    if (rate === null) return null;

    if (rate < 20) {
      return {
        title: "상환부담률 20% 미만",
        desc:
          "월 소득 대비 상환 비중이 비교적 낮은 편으로, 현재 부담 수준을 점검하는 참고 지표로 활용할 수 있습니다. " +
          "다만 소득 변동이나 금리 변화 가능성은 함께 고려하는 것이 좋아요.",
      };
    }
    if (rate < 30) {
      return {
        title: "상환부담률 20~30%",
        desc:
          "상환 비중이 점차 커지는 구간입니다. 고정 지출 구조와 상환 스케줄을 점검해 보기에 적절한 수준입니다.",
      };
    }
    return {
      title: "상환부담률 30% 이상",
      desc:
        "상환 비중이 높은 편으로, 가계 현금흐름에 부담이 될 수 있습니다. " +
        "상환 구조·지출 구조를 점검하는 참고 지표로 활용해 보세요.",
    };
  }, [rate]);

  return (
    <main className="mx-auto max-w-md px-4 py-8 space-y-8">
      {/* 제목 */}
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">상환부담률 계산기</h1>
        <p className="text-sm text-gray-500">
          소득 대비 대출 상환 부담 수준을 확인하기 위한 계산기입니다.
        </p>
        <p className="text-sm leading-relaxed text-gray-500">
          월 소득과 월 상환액을 넣으면 현재 부담률을 바로 볼 수 있어요.
          대출, 카드, 할부처럼 매달 빠져나가는 고정 비용을 관리할 때 유용한 참고 지표입니다.
        </p>
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

        <BottomActions onShare={onCopyLink} />
      </section>

      {/* 결과 */}
      {rate !== null && summary && (
        <section className="rounded-xl border bg-white p-5 space-y-3">
          <p className="text-lg font-bold">상환부담률: {rate}%</p>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{summary.title}</p>
            <p className="mt-1 text-sm text-gray-700">{summary.desc}</p>
          </div>

          <p className="text-xs text-gray-500">
            ※ 본 결과는 현재 상환 부담 수준을 이해하기 위한 참고용 지표입니다.
            개인의 생활비 구조, 부양가족, 금리·소득 변동에 따라 체감 부담은 달라질 수 있습니다.
          </p>
        </section>
      )}

      {/* 설명 토글 */}
      <section className="pt-2">
        <button
          onClick={() => setOpenDesc(!openDesc)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          📊 상환부담률이란? {openDesc ? "▲" : "▼"}
        </button>

        {openDesc && (
          <div className="mt-4 rounded-xl border bg-white p-5 space-y-4 text-sm text-gray-700">
            <p>
              <b>상환부담률</b>은 월 소득 대비 고정적으로 지출되는
              <b> 상환액의 비율</b>을 의미합니다.
              (예: 대출 원리금, 카드·할부 고정 상환 등)
            </p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">20% 미만</span>
                <span className="text-gray-600">부담이 상대적으로 낮은 편</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">20% ~ 30%</span>
                <span className="text-gray-600">관리 필요 구간</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">30% 이상</span>
                <span className="text-gray-600">부담이 커질 수 있는 구간</span>
              </div>
            </div>

            <p className="text-gray-500">
              이 구간은 일반적인 참고 범위이며,
              금융기관의 실제 대출 심사 기준이나 개인 상황에 따라 다르게 적용될 수 있습니다.
            </p>

            <p className="text-xs text-gray-500">
              ※ 본 계산은 참고용이며, 실제 대출 가능 여부나 금융기관의 심사 기준을 대체하지 않습니다.
            </p>
          </div>
        )}
      </section>
      {/* 2. 여기서부터 SEO용 텍스트 추가 (로봇이 좋아하는 부분) */}
      <section className="space-y-4 px-1">
        <div>
          <h4 className="font-bold text-gray-800">내 소득으로 대출 이자 감담 가능할까? DSR 가이드</h4>
          <p>대출부담률은 금융권에서 말하는 DSR(총부채원리금상환비율)과 일맥상통하며, 이 수치가 높을수록 실질적인 가용 소득이 줄어듭니다. 2026년 금리 변동 시나리오를 고려하여 나의 안전 구간을 미리 체크하는 것이 현명한 금융 생활의 시작입니다.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800">현명한 대출 관리를 위한 팁</h4>
          <p>원리금 균등 상환인지, 원금 균등 상환인지에 따라 매달 고정 지출액이 달라집니다. 세모계의 대출부담률 계산기를 통해 복잡한 은행 용어 없이도 나의 재무 건강 상태를 직관적으로 확인해 보세요.</p>
        </div>
      </section>
    </main>
  );
}
