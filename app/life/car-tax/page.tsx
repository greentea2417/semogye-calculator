"use client";

import { useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";
import { calcCarTax } from "../../utils/carTaxCalc";

export default function CarTaxPage() {
  const [cc, setCc] = useState("");
  const [carAge, setCarAge] = useState("0");

  const result = calcCarTax(parseFloat(cc), parseFloat(carAge));
  const won = (n: number) => `${Math.round(n).toLocaleString()}원`;

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

  return (
    <CalculatorLayout
      tone="life"
      title="자동차세 계산기"
      subtitle="배기량과 차령으로 연간 자동차세(지방교육세 포함)를 계산해요."
      intro="비영업용 승용차 기준입니다. 배기량(cc)과 차령을 넣으면 경감된 자동차세와 지방교육세를 확인할 수 있어요."
      faqTitle="자동차세 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 자동차세는 어떻게 계산하나요?", a: "A. 비영업용 승용차는 배기량 × cc당 세액입니다. 1,000cc 이하 80원, 1,600cc 이하 140원, 초과 200원이며 여기에 지방교육세 30%가 더해집니다." },
        { q: "Q. 차령 경감이 무엇인가요?", a: "A. 차량 등록 후 3년째부터 매년 5%씩 자동차세가 줄어들며 최대 50%까지 경감됩니다. 예: 차령 5년이면 15% 경감됩니다." },
        { q: "Q. 지방교육세는 얼마인가요?", a: "A. 경감 후 자동차세 본세의 30%입니다. 예: 본세가 20만원이면 지방교육세는 6만원, 합계 26만원입니다." },
        { q: "Q. 왜 실제 고지서와 다를 수 있나요?", a: "A. 영업용·전기차·연납 할인 등 조건에 따라 달라집니다. 이 계산기는 비영업용 승용차 연간 기준 참고값입니다." },
      ]}
      result={
        <LifeResult
          label="연간 자동차세 합계"
          value={result ? won(result.total) : "-"}
          status={result ? `본세 ${won(result.reducedBase)} + 교육세 ${won(result.eduTax)}` : undefined}
          desc={result ? `cc당 ${result.ratePerCc}원 · 경감 ${(result.reduceRate * 100).toFixed(0)}%` : undefined}
          note="비영업용 승용차 연간 기준이며 연납 할인·전기차 등은 반영하지 않습니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">배기량 (cc)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="1998"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">차령 (년)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={carAge}
              onChange={(e) => setCarAge(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
      </div>
    </CalculatorLayout>
  );
}
