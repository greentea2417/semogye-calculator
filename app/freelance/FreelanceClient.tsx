"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InputBlock from "../components/InputBlock";
import BottomActions from "../components/BottomActions";
import { toast } from "../components/toast";

// 숫자 파싱/포맷
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function FreelancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState("");

  const amountNum = useMemo(() => parseNumber(amount), [amount]);

  // URL 쿼리(amount) → 입력값 반영
  useEffect(() => {
    const q = searchParams.get("amount");
    if (!q) return;

    const n = parseNumber(q);
    const current = parseNumber(amount);
    if (n === current) return;

    setAmount(n ? formatComma(n) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 입력 즉시 콤마 적용 + URL 쿼리 갱신
  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseNumber(e.target.value);
    setAmount(n ? formatComma(n) : "");

    if (!pathname) return;
    if (n > 0) router.replace(`${pathname}?amount=${n}`, { scroll: false });
    else router.replace(`${pathname}`, { scroll: false });
  };

  // 계산 (원천징수 3.3% = 소득세 3% + 지방소득세 0.3%)
  const result = useMemo(() => {
    const tax = Math.round(amountNum * 0.03);
    const localTax = Math.round(tax * 0.1);
    const totalTax = tax + localTax;
    const takeHome = Math.max(0, amountNum - totalTax);
    return { tax, localTax, totalTax, takeHome };
  }, [amountNum]);

  // 공유/복사 URL
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${pathname || "/freelance"}`;
    return amountNum > 0 ? `${base}?amount=${amountNum}` : base;
  }, [amountNum, pathname]);

  const onShare = async () => {
    try {
      if (!shareUrl) return;

      if (navigator.share) {
        await navigator.share({
          title: "프리랜서 실수령액 계산기",
          text: "3.3% 원천징수 기준으로 실수령액을 계산해 보세요.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast("링크를 복사했어요!");
      }
    } catch {
      // 공유 취소 등
    }
  };

  const onCopyLink = async () => {
    try {
      if (!shareUrl) return;
      await navigator.clipboard.writeText(shareUrl);
      toast("링크를 복사했어요!");
    } catch {
      toast("복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-8 space-y-8">
      {/* 제목 */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-bold">프리랜서 실수령액 계산기</h1>
        <p className="text-sm text-gray-500">
          <b className="font-medium text-gray-900">3.3% 원천징수</b> 기준 실수령액 계산
        </p>
      </section>

      {/* 입력 */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <InputBlock
          label="프리랜서 월 수입 (세전)"
          type="text"
          inputMode="numeric"
          placeholder="예: 2,500,000"
          value={amount}
          onChange={onChangeAmount}
        />
        <p className="text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
      </section>

      {/* 결과 */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-bold text-lg">계산 결과</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">소득세(3%)</span>
            <span className="font-semibold">{formatComma(result.tax)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">지방소득세(0.3%)</span>
            <span className="font-semibold">{formatComma(result.localTax)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">총 공제액</span>
            <span className="font-semibold">{formatComma(result.totalTax)}원</span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold">실수령액</span>
          <span className="text-xl font-extrabold">
            {formatComma(result.takeHome)}원
          </span>
        </div>

        <BottomActions
          onShare={onShare}
          onCopyLink={onCopyLink}
          copyLabel="링크 복사"
        />
      </section>

      {/* 설명 + FAQ */}
      <section className="space-y-4">
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span aria-hidden>🔎</span>
            <p className="font-semibold text-gray-900">왜 이 금액이 나왔나요?</p>
          </div>

          <p className="leading-6">
            이 계산기는 프리랜서 지급 시 일반적으로 적용되는{" "}
            <b className="font-medium text-gray-900">원천징수 3.3%</b>
            {" "}(소득세 3% + 지방소득세 0.3%)를 기준으로{" "}
            <b className="font-medium text-gray-900">실수령액</b>을 계산합니다.
            <br />
            다만{" "}
            <b className="font-medium text-gray-900">5월 종합소득세 신고</b>
            에서 경비·공제 적용에 따라 최종 세금은 달라질 수 있습니다.
          </p>

          <p className="text-xs leading-5 text-gray-500">
            부가세 포함 여부, 계약 형태, 기타 공제·가산 항목에 따라 실제 입금액과 차이가 있을 수 있습니다.
          </p>
        </div>

        <hr className="my-2 opacity-30" />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">자주 묻는 질문</p>

          <details className="rounded-lg border bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-900">
              Q. 3.3%는 정확히 무엇인가요?
            </summary>
            <div className="mt-2 text-sm leading-6 text-gray-700">
              A. 프리랜서에게 지급할 때 미리 떼는 원천징수 세율로,
              소득세 3%와 지방소득세 0.3%를 합친 값입니다.
            </div>
          </details>

          <details className="rounded-lg border bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-900">
              Q. 3.3%가 최종 세금인가요?
            </summary>
            <div className="mt-2 text-sm leading-6 text-gray-700">
              A. 아니요. 3.3%는 미리 납부한 세금이며,
              5월 종합소득세 신고 시 최종 세액이 정산됩니다.
            </div>
          </details>

          <details className="rounded-lg border bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-900">
              Q. 부가세(10%)도 여기 계산에 포함되나요?
            </summary>
            <div className="mt-2 text-sm leading-6 text-gray-700">
              A. 이 계산기는 원천징수(3.3%)만 기준으로 하며,
              부가세 포함 계약 여부에 따라 실제 정산 방식은 달라질 수 있습니다.
            </div>
          </details>
        </div>

        {/* 법적 안전 문구 */}
        <p className="text-xs text-gray-500">
          ※ 본 계산은 참고용이며, 법적 판단이나 세무 자문을 대체하지 않습니다.
        </p>
      </section>
    </main>
  );
}
