"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InputBlock from "../components/InputBlock";
import BottomActions from "../components/BottomActions";
import PageTitle from "../components/PageTitle";
import AccordionFAQ from "../components/AccordionFAQ";
import { toast } from "../components/toast";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function FreelancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState("");
  const amountNum = useMemo(() => parseNumber(amount), [amount]);

  useEffect(() => {
    const q = searchParams.get("amount");
    if (!q) return;
    const n = parseNumber(q);
    const current = parseNumber(amount);
    if (n === current) return;
    setAmount(n ? formatComma(n) : "");
  }, [searchParams, amount]);

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseNumber(e.target.value);
    setAmount(n ? formatComma(n) : "");
    if (!pathname) return;
    router.replace(n > 0 ? `${pathname}?amount=${n}` : pathname, { scroll: false });
  };

  const result = useMemo(() => {
    const tax = Math.round(amountNum * 0.03);
    const localTax = Math.round(tax * 0.1);
    const totalTax = tax + localTax;
    const takeHome = Math.max(0, amountNum - totalTax);
    return { tax, localTax, totalTax, takeHome };
  }, [amountNum]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${pathname || "/freelance"}`;
    return amountNum > 0 ? `${base}?amount=${amountNum}` : base;
  }, [amountNum, pathname]);

  const onShare = async () => {
    try {
      if (!shareUrl) return;
      if (navigator.share) await navigator.share({ title: "프리랜서 실수령액 계산기", text: "3.3% 원천징수 기준으로 실수령액을 계산해 보세요.", url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); toast("링크를 복사했어요!"); }
    } catch {}
  };

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8">
        <PageTitle tone="business" title="프리랜서 실수령액 계산기" subtitle="3.3% 원천징수 기준으로 실제 받는 금액을 계산합니다." />
        <p className="text-sm leading-relaxed text-gray-500 text-center">원천징수 소득세와 지방소득세를 반영해 실수령액을 빠르게 확인해보세요.</p>
      </section>

      <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 space-y-4">
        <InputBlock label="프리랜서 월 수입 (세전)" type="text" inputMode="numeric" placeholder="예: 2,500,000" value={amount} onChange={onChangeAmount} />
        <p className="text-xs text-gray-500">* 입력 즉시 결과가 갱신됩니다.</p>
      </section>

      <section className="mt-6 rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30">
        <h2 className="mb-4 text-lg font-bold text-gray-900">계산 결과</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4"><p className="text-xs font-semibold text-gray-500">소득세(3%)</p><p className="mt-1 text-xl font-extrabold text-gray-900 tabular-nums">{result.tax.toLocaleString()}원</p></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4"><p className="text-xs font-semibold text-gray-500">지방소득세(0.3%)</p><p className="mt-1 text-xl font-extrabold text-gray-900 tabular-nums">{result.localTax.toLocaleString()}원</p></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4"><p className="text-xs font-semibold text-gray-500">총 공제액</p><p className="mt-1 text-xl font-extrabold text-gray-900 tabular-nums">{result.totalTax.toLocaleString()}원</p></div>
        </div>
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-center"><p className="text-xs font-semibold text-blue-700">실수령액</p><p className="mt-1 text-3xl font-extrabold text-blue-700 tabular-nums">{result.takeHome.toLocaleString()}원</p></div>
        <BottomActions onShare={onShare} />
      </section>

      <AccordionFAQ title="프리랜서 실수령액 계산기 자주 묻는 질문" items={[
        { q: "Q. 3.3%는 정확히 무엇인가요?", a: "A. 원천징수 세율로 소득세 3%와 지방소득세 0.3%를 합친 값입니다." },
        { q: "Q. 이 금액이 최종 세금인가요?", a: "A. 아니요. 5월 종합소득세 신고 시 최종 세액은 달라질 수 있습니다." },
        { q: "Q. 부가세가 포함된 계약도 계산되나요?", a: "A. 이 계산기는 원천징수 3.3% 기준이며, 부가세 포함 여부는 별도입니다." },
      ]} />
    </main>
  );
}
