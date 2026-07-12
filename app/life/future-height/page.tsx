"use client";

import { useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle";
import AccordionFAQ from "../../components/AccordionFAQ";

function calcGirlHeight(mom: number, dad: number) { return (mom + dad - 13) / 2; }
function calcBoyHeight(mom: number, dad: number) { return (mom + dad + 13) / 2; }

export default function FutureHeightPage() {
  const [momHeight, setMomHeight] = useState("");
  const [dadHeight, setDadHeight] = useState("");

  const mom = Number(momHeight);
  const dad = Number(dadHeight);
  const valid = Number.isFinite(mom) && Number.isFinite(dad) && mom > 0 && dad > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const girl = Math.round(calcGirlHeight(mom, dad));
    const boy = Math.round(calcBoyHeight(mom, dad));
    const avg = Math.round((girl + boy) / 2);
    return { girl, boy, avg };
  }, [mom, dad, valid]);

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8">
        <PageTitle tone="life" title="우리 아이 예상 키 계산기" subtitle="부모 키를 바탕으로 아이의 예상 키를 간단히 확인해보세요." />
      </section>

      <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">엄마 키 (cm)</span>
            <input type="number" placeholder="160" value={momHeight} onChange={(e) => setMomHeight(e.target.value)} className="w-full rounded-2xl border-none bg-gray-50 p-4 text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">아빠 키 (cm)</span>
            <input type="number" placeholder="175" value={dadHeight} onChange={(e) => setDadHeight(e.target.value)} className="w-full rounded-2xl border-none bg-gray-50 p-4 text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
        </div>

        {result && (
          <div className="mt-8 space-y-4 border-t border-gray-100 pt-8 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">예상 키</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-green-50 p-4"><p className="text-xs font-semibold text-green-700">여아 예상</p><p className="mt-1 text-2xl font-extrabold text-green-700">{result.girl}cm</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-semibold text-emerald-700">중간값</p><p className="mt-1 text-2xl font-extrabold text-emerald-700">{result.avg}cm</p></div>
              <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-semibold text-blue-700">남아 예상</p><p className="mt-1 text-2xl font-extrabold text-blue-700">{result.boy}cm</p></div>
            </div>
            <p className="text-xs text-gray-400">참고용 간이 계산이며 성장 환경, 영양, 건강상태에 따라 달라질 수 있어요.</p>
          </div>
        )}
      </section>

      <AccordionFAQ
        title="예상 키 계산기 자주 묻는 질문"
        items={[
          { q: "Q. 부모 키만으로 정확한 키를 알 수 있나요?", a: "A. 아니요. 참고용 추정치이며 영양·성장환경·건강상태에 따라 달라집니다." },
          { q: "Q. 계산 결과는 남아/여아 모두 같은가요?", a: "A. 성별에 따라 추정 방식이 약간 다릅니다." },
          { q: "Q. 언제까지 참고할 수 있나요?", a: "A. 성장기 전반에 참고할 수 있지만, 최종 키를 보장하지는 않습니다." },
        ]}
      />
    </main>
  );
}
