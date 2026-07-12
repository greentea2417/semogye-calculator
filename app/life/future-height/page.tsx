"use client";

import { useMemo, useState } from "react";
import BottomActions from "../../components/BottomActions";
import CalculatorLayout from "../../components/CalculatorLayout";
import LifeResult from "../../components/LifeResult";
import { copyToClipboardSafe } from "../../components/lib/shareUtils";
import { toast } from "../../components/toast";

export default function FutureHeightPage() {
  const [momHeight, setMomHeight] = useState("");
  const [dadHeight, setDadHeight] = useState("");
  const [gender, setGender] = useState<"girl" | "boy">("girl");

  const mom = Number(momHeight);
  const dad = Number(dadHeight);
  const valid = mom > 0 && dad > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const girl = Math.round((mom + dad - 13) / 2);
    const boy = Math.round((mom + dad + 13) / 2);
    return { girl, boy, picked: gender === "girl" ? girl : boy };
  }, [mom, dad, valid, gender]);

  const onShare = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: "우리 아이 예상 키 계산기", url });
      else {
        await copyToClipboardSafe(url);
        toast("링크를 복사했어요!");
      }
    } catch {}
  };

  return (
    <CalculatorLayout
      tone="life"
      title="우리 아이 예상 키 계산기"
      subtitle="부모 키를 바탕으로 아이의 예상 키를 확인해보세요."
      intro="중간부모키(Mid-parental height) 공식을 사용한 간단한 예측입니다."
      faqTitle="예상 키 계산기 자주 묻는 질문"
      faqItems={[
        { q: "Q. 예상 키는 어떻게 계산하나요?", a: "A. 아들은 (엄마 키 + 아빠 키 + 13) ÷ 2, 딸은 (엄마 키 + 아빠 키 − 13) ÷ 2로 계산하는 중간부모키 공식을 사용합니다." },
        { q: "Q. 이 예측은 얼마나 정확한가요?", a: "A. 유전만 반영한 참고값이라 실제 키와 ±5cm 이상 차이가 날 수 있습니다." },
        { q: "Q. 키에 영향을 주는 다른 요인은?", a: "A. 수면, 영양, 운동, 사춘기 시작 시기, 만성질환 여부 등이 함께 영향을 줍니다." },
        { q: "Q. 아이 성장이 걱정되면 어떻게 하나요?", a: "A. 또래 대비 성장 곡선에서 크게 벗어난다면 소아청소년과 성장 상담을 받아보는 것이 좋습니다." },
      ]}
      result={
        <LifeResult
          label={gender === "girl" ? "여아 예상 키" : "남아 예상 키"}
          value={result ? `${result.picked}cm` : "-"}
          desc={result ? `여아 ${result.girl}cm · 남아 ${result.boy}cm 기준` : undefined}
          note="성장 환경, 영양, 건강 상태에 따라 달라질 수 있는 참고용 계산입니다."
        />
      }
      guide={<BottomActions onShare={onShare} showPdf={false} />}
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">엄마 키 (cm)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="160"
            value={momHeight}
            onChange={(e) => setMomHeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">아빠 키 (cm)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="175"
            value={dadHeight}
            onChange={(e) => setDadHeight(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center text-lg font-bold text-gray-900 outline-none focus:border-emerald-400"
          />
        </label>
      </div>

      <div className="mt-5 space-y-2">
        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">아이 성별</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGender("girl")}
            className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
              gender === "girl"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            여아
          </button>
          <button
            type="button"
            onClick={() => setGender("boy")}
            className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
              gender === "boy"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            남아
          </button>
        </div>
      </div>
    </CalculatorLayout>
  );
}
