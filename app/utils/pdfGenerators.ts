import jsPDF from "jspdf";
import "jspdf-autotable";
import "../utils/NotoSansKR";

export const generatePDF = (workers: any[]) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFont("NotoSansKR", "normal");

  const today = new Date().toLocaleDateString();

  workers.forEach((w, idx) => {
    if (idx > 0) doc.addPage();

    const wage = Number(w.wage);
    const hours = Number(w.totalHours);
    const weeklyHours = hours / 4;

    const holiday =
      w.includeHoliday && weeklyHours >= 15 ? wage * 8 * 4 : 0;

    const base = wage * hours;
    const beforeTax = base + holiday;
    const tax = w.tax33 ? Math.floor(beforeTax * 0.033) : 0;
    const final = beforeTax - tax;

    // 타이틀
    doc.setFontSize(22);
    doc.text("세모계 급여명세서", 40, 60);

    // 기본 정보
    doc.setFontSize(12);
    doc.text(`직원명: ${w.name || "-"}`, 40, 100);
    doc.text(`발급일: ${today}`, 40, 120);

    // 표
    const rows = [
      ["시급", `${w.wage} 원`],
      ["월 총 근무시간", `${w.totalHours} 시간`],
      ["기본급", `${base.toLocaleString()} 원`],
      ["주휴수당", `${holiday.toLocaleString()} 원`],
      ["3.3% 공제액", `${tax.toLocaleString()} 원`],
      ["실 지급액", `${final.toLocaleString()} 원`],
    ];

    (doc as any).autoTable({
      startY: 150,
      body: rows,
      theme: "grid",
      styles: {
        font: "NotoSansKR",
        fontSize: 12,
        halign: "left",
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [70, 130, 180], // 파란색 세모계 느낌
        textColor: 255,
      },
    });

    // 하단 문구
    doc.setFontSize(10);
    doc.text("※ 본 명세서는 세모계에서 자동 생성되었습니다.", 40, 780);
  });

  doc.save("직원급여명세서.pdf");
};
