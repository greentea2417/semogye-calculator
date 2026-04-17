"use client";

import { useState } from "react";

export default function KBMCalculator() {
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const calculateKBM = () => {
    if (!height || !weight) return null;
    return weight - (height - 100);
  };

  const kbm = calculateKBM();

  const getResult = () => {
    if (kbm === null) return "";

    if (kbm <= -10) return "🔥 마름 (연예인급)";
    if (kbm <= -5) return "✨ 슬림 (이쁨존)";
    if (kbm <= 0) return "👌 보통 (건강라인)";
    if (kbm <= 5) return "🙂 통통 (귀여운 단계)";
    return "⚠️ 과체중 (관리 필요)";
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: "키빼몸 계산기란?",
      content:
        "키빼몸은 몸무게 - (키 - 100)으로 계산하는 간단한 체형 지표입니다.",
    },
    {
      title: "기준표",
      content:
        "-10 이하: 마름\n-5 ~ -10: 슬림\n0 ~ -5: 보통\n0 ~ 5: 통통\n5 이상: 과체중",
    },
    {
      title: "BMI와 차이",
      content:
        "BMI는 국제 기준, 키빼몸은 직관적인 비교용입니다.",
    },
    {
      title: "주의사항",
      content:
        "근육량이 많은 경우 실제보다 높게 나올 수 있으며, 참고용으로 활용하세요.",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-6">

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-center">
          키빼몸 계산기
        </h2>

        {/* 입력 */}
        <div className="space-y-5">

          {/* 키 */}
          <div className="space-y-2">
            <input
              type="number"
              placeholder="예: 160"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full p-4 border border-gray-200 rounded-2xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <p className="text-xs text-gray-400 text-center">
              키를 cm 단위로 입력하세요 (예: 160)
            </p>
          </div>

          {/* 몸무게 */}
          <div className="space-y-2">
            <input
              type="number"
              placeholder="예: 50"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-4 border border-gray-200 rounded-2xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <p className="text-xs text-gray-400 text-center">
              몸무게를 kg 단위로 입력하세요 (예: 50)
            </p>
          </div>

        </div>

        {/* 결과 */}
        {kbm !== null && (
          <div className="bg-black text-white rounded-2xl p-6 text-center space-y-2 shadow-md">
            <p className="text-sm opacity-70">당신의 키빼몸</p>
            <p className="text-4xl font-bold tracking-tight">{kbm}</p>
            <p className="text-sm">{getResult()}</p>
          </div>
        )}

        {/* 아코디언 */}
        <div className="divide-y">
          {accordionData.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center py-4 text-left font-medium"
              >
                {item.title}
                <span className="text-lg">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-40 pb-3" : "max-h-0"
                }`}
              >
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}