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

    if (kbm <= -10) return "마름 (연예인급)";
    if (kbm <= -5) return "슬림 (이쁨존🔥)";
    if (kbm <= 0) return "보통 (건강라인)";
    if (kbm <= 5) return "통통 (귀여운 단계)";
    return "과체중 (관리 필요)";
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: "키빼몸 계산기란?",
      content:
        "키빼몸은 '몸무게 - (키 - 100)'으로 계산하는 간단한 체형 지표입니다. 한국에서 직관적으로 체형을 판단할 때 많이 사용하는 방식입니다.",
    },
    {
      title: "키빼몸 기준표",
      content:
        "키빼몸 -10 이하: 마름\n-5 ~ -10: 슬림\n0 ~ -5: 보통\n0 ~ 5: 통통\n5 이상: 과체중",
    },
    {
      title: "BMI와 차이점",
      content:
        "BMI는 체지방률을 추정하는 국제 기준이며, 키빼몸은 보다 직관적인 체형 비교용입니다. 정확한 건강 판단은 BMI나 체지방률을 함께 참고하는 것이 좋습니다.",
    },
    {
      title: "주의사항",
      content:
        "키빼몸은 단순 참고용 지표입니다. 근육량이 많은 경우 실제보다 과체중으로 나올 수 있습니다.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">키빼몸 계산기</h2>

      <input
        type="number"
        placeholder="키 (cm)"
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
        className="border p-2 rounded w-full text-center"
      />

      <input
        type="number"
        placeholder="몸무게 (kg)"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="border p-2 rounded w-full text-center"
      />

      {kbm !== null && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">키빼몸: {kbm}</p>
          <p className="text-gray-600">{getResult()}</p>
        </div>
      )}

      {/* 아코디언 */}
      <div className="w-full mt-6">
        {accordionData.map((item, index) => (
          <div key={index} className="border-b">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full text-left p-3 font-medium flex justify-between items-center"
            >
              {item.title}
              <span>{openIndex === index ? "-" : "+"}</span>
            </button>

            {openIndex === index && (
              <div className="p-3 text-sm text-gray-600 whitespace-pre-line">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}