"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InputBlock from "../components/InputBlock";
import BottomActions from "../components/BottomActions";
import { toast } from "../components/toast";
 // ✅ 기본 export가 함수라면 이게 맞음
// 만약 기존 코드가 `import { toast } from ...` 였다면, 아래 주석 참고!

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

  // 계산
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
      // 사용자가 공유 취소 등
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
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-bold">프리랜서 실수령액 계산기</h1>
        <p className="text-sm text-gray-500">3.3% 원천징수 기준</p>
      </section>

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

      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-bold text-lg">계산 결과</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">소득세(3%)</span>
            <span className="font-semibold">{formatComma(result.tax)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">지방소득세(10%)</span>
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
    </main>
  );
}
