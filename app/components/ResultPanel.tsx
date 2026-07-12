import type { ReactNode } from "react";

export type ResultLine = {
  label: string;
  value: string;
  hint?: string;
};

type Props = {
  title?: string;
  lines: ResultLine[];
  total?: ResultLine;
  subTotal?: ResultLine;
  note?: ReactNode;
  children?: ReactNode;
};

/**
 * 사장님용 시급 계산기의 "합계" 카드를 기준으로 한 공통 결과 패널.
 * 모든 계산기의 결과 영역은 이 컴포넌트를 사용한다.
 */
export default function ResultPanel({ title = "계산 결과", lines, total, subTotal, note, children }: Props) {
  return (
    <div className="print-report rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>

      <div className="mt-3 grid gap-2 text-sm text-gray-800">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center justify-between text-gray-600">
            <span>
              {line.label}
              {line.hint ? <span className="ml-1 text-xs text-gray-400">{line.hint}</span> : null}
            </span>
            <span className="font-semibold tabular-nums text-gray-900">{line.value}</span>
          </div>
        ))}

        {subTotal ? (
          <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-gray-700">
            <span className="font-semibold">{subTotal.label}</span>
            <span className="font-bold tabular-nums">{subTotal.value}</span>
          </div>
        ) : null}

        {total ? (
          <div
            className={`flex items-center justify-between ${
              subTotal ? "" : "border-t border-gray-200 pt-3"
            }`}
          >
            <span className="text-base font-bold text-gray-900">{total.label}</span>
            <span className="text-xl font-extrabold tabular-nums text-gray-900">{total.value}</span>
          </div>
        ) : null}
      </div>

      {children}

      {note ? <p className="mt-3 text-xs leading-5 text-gray-500">{note}</p> : null}
    </div>
  );
}
