"use client";

import { useMemo, useState } from "react";
import BottomActions from "@/components/BottomActions";
import CalculatorLayout from "@/components/CalculatorLayout";
import LifeResult from "@/components/LifeResult";
import { copyToClipboardSafe } from "@/components/lib/shareUtils";
import { toast } from "@/components/toast";
import { calcElectricityBill } from "@/utils/electricityBillCalc";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function ElectricityBillPage() {
  const [usage, setUsage] = useState("");

  const usageNum = parseFloat(usage);

  const result = useMemo(() => {
    if (Number.isNaN(usageNum)) return null;
    return calcElectricityBill(usageNum);
  }, [usageNum]);

  const invalid = !Number.isNaN(usageNum) && result === null;

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "전기요금 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="전기요금 계산기"
      subtitle="한 달 사용량(kWh)만 넣으면 누진 3단계로 요금을 계산해 드려요."
      intro="주택용 저압 요금제(KEPCO 기준)로 기본요금·전력량요금·부가세·전력기금을 모두 반영해 청구금액을 계산합니다. 누진 3단계(200kWh·400kWh 기준)를 자동으로 적용합니다."
      faqTitle="전기요금 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 누진 3단계가 뭔가요?", a: "A. 사용량이 많을수록 단가가 올라가는 구조입니다. 200kWh 이하는 120원/kWh, 201~400kWh는 214.6원/kWh, 400kWh 초과는 307.3원/kWh가 각 구간에 누진 적용됩니다." },
        { q: "Q. 기본요금은 어떻게 정해지나요?", a: "A. 총 사용량이 속한 단계에 따라 200kWh 이하 910원, 201~400kWh 1,600원, 400kWh 초과 7,300원이 한 번 붙습니다." },
        { q: "Q. 세금도 포함되나요?", a: "A. 네. 전기요금계에 부가가치세 10%와 전력산업기반기금 3.7%를 더한 뒤 10원 미만을 절사한 값이 청구금액입니다." },
        { q: "Q. 실제 고지서와 다를 수 있나요?", a: "A. 복지할인·필수사용량 보장공제·계절별 요금 등 개별 조건은 반영하지 않은 참고용 추정치입니다." },
      ]}
      result={
        <LifeResult
          label="예상 청구금액"
          value={result ? won(result.total) : invalid ? "입력 오류" : "-"}
          desc={result ? `기본요금 ${won(result.base)} · 전력량요금 ${won(result.energy)}` : undefined}
          note={
            result
              ? `전기요금계 ${won(result.subtotal)} + 부가세 ${won(result.vat)} + 전력기금 ${won(result.fund)}`
              : invalid
              ? "사용량은 0 이상의 숫자로 입력해 주세요."
              : "한 달 전력 사용량(kWh)을 입력하면 예상 요금이 표시됩니다."
          }
        />
      }
      guide={<BottomActions onShare={onShare} />}
    >
      <div className="space-y-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">한 달 사용량 (kWh)</span>
          <input type="number" inputMode="decimal" min={0} placeholder="예: 300" value={usage} onChange={(e) => setUsage(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400" />
        </label>
        <p className="text-xs leading-5 text-gray-400">고지서의 &lsquo;사용량(kWh)&rsquo; 항목을 그대로 입력하세요. 주택용 저압 요금제 기준으로 계산됩니다.</p>
      </div>
    </CalculatorLayout>
  );
}
