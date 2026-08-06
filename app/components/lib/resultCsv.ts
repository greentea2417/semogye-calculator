import type { ResultLine } from "../ResultPanel";

function csvEscape(value: string) {
  const v = String(value ?? "");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** 값에서 원/%/일 같은 단위와 콤마를 지워 엑셀이 숫자로 읽게 한다. */
function toCell(value: string) {
  const trimmed = String(value ?? "").trim();
  const numeric = trimmed.replace(/[,\s]/g, "").replace(/(원|일|시간|%)$/, "");
  return /^-?\d+(\.\d+)?$/.test(numeric) ? numeric : trimmed;
}

function todayStamp() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 사용자가 직접 입력한 값 한 줄 */
export type CsvInput = { label: string; value: string | number };

type Options = {
  /** 파일명에 쓰는 계산기 슬러그 (예: freelance) */
  slug: string;
  /** CSV 첫 줄에 넣는 계산기 이름 */
  title: string;
  /** 사용자가 입력한 값. 모든 계산기가 기본으로 함께 내보낸다. */
  inputs?: CsvInput[];
  lines: ResultLine[];
  subTotal?: ResultLine;
  total?: ResultLine;
  footerNote?: string;
};

/**
 * 사용자 입력값 + 결과 패널에 표시되는 줄을 그대로 CSV로 내려받는다.
 * 한글 엑셀에서 깨지지 않도록 BOM을 붙인다.
 */
export function downloadResultCsv({ slug, title, inputs, lines, subTotal, total, footerNote }: Options) {
  const rows: string[][] = [["계산기", title], ["기준일", todayStamp()]];

  if (inputs?.length) {
    rows.push([], ["입력값", "값"]);
    for (const input of inputs) {
      rows.push([input.label, toCell(String(input.value ?? ""))]);
    }
  }

  rows.push([], ["계산 결과", "값"]);

  for (const line of lines) {
    rows.push([line.hint ? `${line.label} ${line.hint}` : line.label, toCell(line.value)]);
  }
  if (subTotal) rows.push([subTotal.label, toCell(subTotal.value)]);
  if (total) rows.push([total.label, toCell(total.value)]);
  if (footerNote) rows.push([footerNote, ""]);

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `semogye-${slug}-${todayStamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
