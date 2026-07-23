"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcDiscount } from "@/utils/discountCalc";

export default function DiscountPage() {
  const [price, setPrice] = useState("");
  const [rate, setRate] = useState("");
  const [extra, setExtra] = useState("");

  const priceNum = parseFloat(price);
  const rateNum = rate === "" ? 0 : parseFloat(rate);
  const extraNum = extra === "" ? 0 : parseFloat(extra);

  const result = useMemo(() => {
    if (!(priceNum > 0)) return null;
    if (rateNum < 0 || rateNum > 100 || extraNum < 0 || extraNum > 100) return null;
    return calcDiscount(priceNum, rateNum, extraNum);
  }, [priceNum, rateNum, extraNum]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "할인가 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="할인가 계산기"
      subtitle="정가와 할인율만 넣으면 결제 금액과 할인액을 바로 알려드려요."
      intro="쿠폰 추가 할인까지 순차 적용해 실제 결제 금액을 계산합니다. 추가 할인은 1차 할인된 금액에 다시 적용됩니다."
      faqTitle="할인가 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 어떻게 계산하나요?", a: "A. 결제금액 = 정가 × (1 − 할인율/100) × (1 − 추가할인율/100)이며 원 단위로 반올림합니다. 할인액은 정가에서 결제금액을 뺀 값입니다." },
        { q: "Q. 추가 할인은 어떻게 적용되나요?", a: "A. 쿠폰·카드 추가 할인은 보통 1차 할인된 금액을 기준으로 다시 적용됩니다. 예: 20% 할인 후 10% 추가 할인은 총 28% 할인 효과입니다." },
        { q: "Q. 실질 할인율은 무엇인가요?", a: "A. 최종적으로 정가 대비 몇 % 싸게 샀는지를 나타냅니다. 할인율을 단순히 더한 값과 다를 수 있습니다." },
        { q: "Q. 추가 할인이 없으면요?", a: "A. 추가 할인율을 비워두면 0%로 처리되어 1차 할인만 적용됩니다." },
      ]}
      result={
        <LifeResult
          label="결제 금액"
          value={result ? `${result.finalPrice.toLocaleString()}원` : "-"}
          status={result ? `-${result.effectiveRate}%` : undefined}
          statusClass="text-emerald-600"
          desc={result ? `${result.discountAmount.toLocaleString()}원 할인` : undefined}
          note={result ? "추가 할인은 1차 할인 금액에 다시 적용된 결과입니다." : "정가와 할인율을 입력하면 결제 금액이 표시됩니다."}
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">정가 (원)</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="50000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">할인율 (%)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="20"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">추가 할인율 (%)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
