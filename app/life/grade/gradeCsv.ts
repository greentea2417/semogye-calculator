export type Subject = { id: number; name: string; credit: number; grade: string };

export const GRADE_SCHEMES: Record<string, Record<string, number>> = {
  "4.5": { "A+": 4.5, A0: 4.0, "B+": 3.5, B0: 3.0, "C+": 2.5, C0: 2.0, "D+": 1.5, D0: 1.0, F: 0, P: 0, NP: 0 },
  "4.3": {
    "A+": 4.3, A0: 4.0, "A-": 3.7, "B+": 3.3, B0: 3.0, "B-": 2.7,
    "C+": 2.3, C0: 2.0, "C-": 1.7, "D+": 1.3, D0: 1.0, "D-": 0.7, F: 0, P: 0, NP: 0,
  },
};

/** P/NP 과목은 평점 산출에서 제외한다. */
export function isExcluded(grade: string) {
  return grade === "P" || grade === "NP";
}

export function summarize(subjects: Subject[], scheme: Record<string, number>) {
  const graded = subjects.filter((s) => !isExcluded(s.grade));
  const totalCredits = graded.reduce((sum, s) => sum + Number(s.credit), 0);
  const totalPoints = graded.reduce((sum, s) => sum + Number(s.credit) * (scheme[s.grade] ?? 0), 0);
  const gpa = totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
  return { totalCredits, totalPoints, gpa };
}

export function todayStamp(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 과목별 상세 + 평균 평점까지 담은 CSV 행을 만든다. */
export function buildGradeCsvRows(subjects: Subject[], maxGrade: "4.5" | "4.3"): string[][] {
  const scheme = GRADE_SCHEMES[maxGrade];
  const { totalCredits, totalPoints, gpa } = summarize(subjects, scheme);

  const rows: string[][] = [
    ["계산기", "학점 계산기"],
    ["만점 기준", `${maxGrade} 만점`],
    ["기준일", todayStamp()],
    [],
    ["번호", "과목명", "이수학점", "성적", "평점", "평점 환산(학점×평점)", "평점 반영"],
  ];

  subjects.forEach((s, idx) => {
    const excluded = isExcluded(s.grade);
    const point = scheme[s.grade] ?? 0;
    rows.push([
      String(idx + 1),
      s.name || `과목 ${idx + 1}`,
      String(s.credit),
      s.grade,
      excluded ? "" : point.toFixed(1),
      excluded ? "" : (Number(s.credit) * point).toFixed(1),
      excluded ? "제외(P/NP)" : "반영",
    ]);
  });

  rows.push([]);
  rows.push(["총 이수학점(P/NP 제외)", String(totalCredits)]);
  rows.push(["총 평점 환산", totalPoints.toFixed(1)]);
  rows.push([`평균 평점(GPA, ${maxGrade} 만점)`, gpa]);

  return rows;
}

function csvEscape(value: string) {
  const v = String(value ?? "");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function toCsvText(rows: string[][]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}
