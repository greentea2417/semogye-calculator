"use client";

import { useState } from "react";

// 성적별 점수 매핑 (4.5 기준 vs 4.3 기준)
const GRADE_SCHEMES = {
  4.5: { "A+": 4.5, "A0": 4.0, "B+": 3.5, "B0": 3.0, "C+": 2.5, "C0": 2.0, "D+": 1.5, "D0": 1.0, "F": 0, "P": 0, "NP": 0 },
  4.3: { "A+": 4.3, "A0": 4.0, "A-": 3.7, "B+": 3.3, "B0": 3.0, "B-": 2.7, "C+": 2.3, "C0": 2.0, "C-": 1.7, "D+": 1.3, "D0": 1.0, "D-": 0.7, "F": 0, "P": 0, "NP": 0 }
};

export default function GradeCalculator() {
  const [maxGrade, setMaxGrade] = useState<4.5 | 4.3>(4.5);
  const [subjects, setSubjects] = useState([{ id: 1, name: "", credit: 3, grade: "A+" }]);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: "", credit: 3, grade: "A+" }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 1) setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: number, field: string, value: any) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    const currentScheme = GRADE_SCHEMES[maxGrade];

    subjects.forEach(s => {
      // 선택한 기준에 해당 성적이 없을 경우(예: 4.3 기준의 A-) 기본값 0 처리
      const point = (currentScheme as any)[s.grade] ?? 0;
      if (s.grade !== "P" && s.grade !== "NP") {
        totalCredits += Number(s.credit);
        totalPoints += Number(s.credit) * point;
      }
    });

    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
  };

  return (
    <main className="max-w-md mx-auto px-6 py-12 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-2xl font-black text-gray-900">학점 계산기</h1>
        
        {/* 만점 기준 선택 스위치 (디자인 포인트!) */}
        <div className="inline-flex bg-gray-100 p-1 rounded-2xl">
          {[4.5, 4.3].map((val) => (
            <button
              key={val}
              onClick={() => {
                setMaxGrade(val as 4.5 | 4.3);
                // 기준 바뀔 때 성적 초기화 (충돌 방지)
                setSubjects(subjects.map(s => ({ ...s, grade: "A+" })));
              }}
              className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${
                maxGrade === val ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
              }`}
            >
              {val} 만점
            </button>
          ))}
        </div>
      </section>

      {/* 결과 카드 */}
      <div className="bg-gray-900 rounded-[40px] p-10 text-center shadow-2xl shadow-blue-100 transition-all">
        <p className="text-white/50 text-xs font-bold mb-2 uppercase tracking-widest">
          {maxGrade} 기준 예상 평점
        </p>
        <div className="text-6xl font-black text-white italic tracking-tighter">
          {calculateGPA()}
        </div>
      </div>

      {/* 과목 리스트 */}
      <div className="space-y-3">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="flex items-center space-x-2 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm