"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import ResultPanel from "@/components/ResultPanel";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
function formatComma(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export default function VatPage() {
  const [salesRaw, setSalesRaw] = useState("");
  const [purchaseRaw, setPurchaseRaw] = useState("");

  const result = useMemo(() => {
    const sales = parseNumber(salesRaw);
    const purchase = parseNumber(purchaseRaw);
    const salesTax = Math.round(sales * 0.1);
    const purchaseTax = Math.round(purchase * 0.1);
    const payable = salesTax - purchaseTax;
    return { salesTax, purchaseTax, payable };
  }, [salesRaw, purchaseRaw]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "부가세 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  const isRefund = result.payable < 0;

  return (
    <CalculatorLayout
      tone="business"
      title="부가세 계산기"
      subtitle="매출세액에서 매입세액을 빼 이번 분기 납부(환급) 세액을 계산합니다."
      intro="일반과세자 기준으로 매출·매입 공급가액만 입력하면 납부하거나 돌려받을 금액을 바로 확인할 수 있어요."
      faqTitle="부가세 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 부가세는 어떻게 계산되나요?", a: "A. 납부세액 = 매출세액(매출 공급가액 × 10%) − 매입세액(매입 공급가액 × 10%)입니다. 결과가 음수면 환급 대상입니다." },
        { q: "Q. 공급가액과 공급대가는 무엇이 다른가요?", a: "A. 공급가액은 부가세를 뺀 금액, 공급대가는 부가세를 포함한 총액입니다. 이 계산기는 부가세 별도 금액(공급가액)을 입력합니다." },
        { q: "Q. 간이과세자도 이 계산이 맞나요?", a: "A. 아니요. 간이과세자는 업종별 부가가치율이 적용되어 계산 방식이 다릅니다. 이 계산기는 일반과세자 기준입니다." },
        { q: "Q. 매입세액이 매출세액보다 크면 어떻게 되나요?", a: "A. 차액만큼 환급 대상이 됩니다. 다만 접대비 등 매입세액 불공제 항목은 공제되지 않습니다." },
      ]}
      result={
        <ResultPanel
          title="부가세 신고 리포트"
          lines={[
            { label: "매출세액", hint: "(매출 × 10%)", value: `${result.salesTax.toLocaleString()}원` },
            { label: "매입세액", hint: "(매입 × 10%)", value: `${result.purchaseTax.toLocaleString()}원` },
          ]}
          total={{
            label: isRefund ? "환급받을 세액" : "납부할 세액",
            value: `${Math.abs(result.payable).toLocaleString()}원`,
          }}
          note="* 간이과세자, 면세 항목, 매입세액 불공제, 가산세 등은 반영되지 않은 일반과세자 기준 단순 계산입니다."
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <InputBlock
        label="매출 공급가액 (부가세 별도)"
        type="text"
        inputMode="numeric"
        value={salesRaw}
        onChange={(e) => setSalesRaw(formatComma(parseNumber(e.target.value)))}
        placeholder="예: 30,000,000"
      />
      <div className="mt-4">
        <InputBlock
          label="매입 공급가액 (세액공제 가능분)"
          type="text"
          inputMode="numeric"
          value={purchaseRaw}
          onChange={(e) => setPurchaseRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 12,000,000"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
    </CalculatorLayout>
  );
}
