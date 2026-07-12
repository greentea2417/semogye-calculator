"use client";

import { useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle";
import AccordionFAQ from "../../components/AccordionFAQ";

export default function BmiPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const bmiValue = weightNum && heightNum ? parseFloat((weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1)) : null;

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "저체중", desc: "조금 더 든든하게 드셔도 좋겠어요.", color: "text-amber-500" };
    if (bmi < 23) return { label: "정상", desc: "아주 건강하고 이상적인 상태입니다!", color: "text-blue-500" };
    if (bmi < 25) return { label: "과체중", desc: "관리가 필요한 시점이에요.", color: "text-orange-500" };
    return { label: "비만", desc: "건강을 위해 식단 조절과 운동을 권장합니다.", color: "text-red-500" };
  };

  const status = bmiValue ? getBmiStatus(bmiValue) : null;

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8">
        <PageTitle tone="life" title="BMI 지수" subtitle="나의 체질량 지수를 확인해보세요" />
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 text-sm leading-relaxed text-gray-600">
          키와 몸무게를 입력하면 BMI 수치를 계산하고, 저체중·정상·과체중·비만 구간을 함께 보여줘요.
        </div>
      </section>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm shadow-gray-200/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Height (cm)</label>
            <input type="number" placeholder="160" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all text-center" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Weight (kg)</label>
            <input type="number" placeholder="50" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all text-center" />
          </div>
        </div>

        {bmiValue && status && (
          <div className="mt-10 pt-10 border-t border-gray-50 text-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your BMI</span>
            <div className="text-6xl font-black text-gray-900 tracking-tighter my-2">{bmiValue}</div>
            <div className="mt-4 space-y-1">
              <p className={`text-xl font-black ${status.color}`}>{status.label}</p>
              <p className="text-sm text-gray-400 font-medium">{status.desc}</p>
            </div>
          </div>
        )}
      </div>

      <AccordionFAQ
        title="BMI 지수와 건강 체중 자주 묻는 질문"
        items={[
          { q: "Q. BMI가 높으면 무조건 건강에 문제가 있나요?", a: "A. BMI는 참고 지표일 뿐이라 근육량과 체지방도 함께 봐야 합니다." },
          { q: "Q. 정상 BMI 범위는 어떻게 보나요?", a: "A. 일반적으로 18.5~22.9 정도를 참고합니다." },
          { q: "Q. 이 결과는 의료 진단인가요?", a: "A. 아니요. 일반적인 참고용 계산입니다." },
        ]}
      />
    </main>
  );
}
