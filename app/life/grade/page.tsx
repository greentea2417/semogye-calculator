"use client";

import { useState } from "react";

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
        <div className="inline-flex bg-gray-100 p-1 rounded-2xl">
          {[4.5, 4.3].map((val) => (
            <button
              key={val}
              onClick={() => {
                setMaxGrade(val as 4.5 | 4.3);
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

      <div className="bg-gray-900 rounded-[40px] p-10 text-center shadow-2xl shadow-blue-100 transition-all">
        <p className="text-white/50 text-xs font-bold mb-2 uppercase tracking-widest">
          {maxGrade} 기준 예상 평점
        </p>
        <div className="text-6xl font-black text-white italic tracking-tighter">
          {calculateGPA()}
        </div>
      </div>

      <div className="space-y-3">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="flex items-center space-x-2 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm">
            <input
              type="text"
              placeholder="과목명"
              className="flex-1 text-sm font-bold bg-transparent outline-none border-none focus:ring-0 placeholder:text-gray-200"
              value={subject.name}
              onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
            />
            <select 
              className="text-xs font-bold bg-gray-50 p-2 rounded-xl outline-none border-none"
              value={subject.credit}
              onChange={(e) => updateSubject(subject.id, "credit", e.target.value)}
            >
              {[1, 2, 3, 4].map(c => <option key={c} value={c}>{c}학점</option>)}
            </select>
            <select 
              className="text-xs font-black text-blue-600 bg-blue-50 p-2 rounded-xl outline-none border-none min-w-[60px]"
              value={subject.grade}
              onChange={(e) => updateSubject(subject.id, "grade", e.target.value)}
            >
              {Object.keys(GRADE_SCHEMES[maxGrade]).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button onClick={() => removeSubject(subject.id)} className="text-gray-300 hover:text-red-400 px-1">×</button>
          </div>
        ))}
      </div>

      <button 
        onClick={addSubject}
        className="w-full py-5 border-2 border-dashed border-gray-100 rounded-[30px] text-gray-400 text-sm font-bold hover:bg-gray-50 transition-all"
      >
        + 과목 추가하기
      </button>

      <p className="text-[10px] text-gray-300 text-center leading-relaxed">
        {maxGrade === 4.3 ? "A-, B-, C-, D- 성적이 포함된 4.3 만점 기준입니다." : "일반적인 4.5 만점 기준입니다."}
        <br />
        P/NP 과목은 평점에서 제외됩니다.
      </p>
    </main>
  );
}