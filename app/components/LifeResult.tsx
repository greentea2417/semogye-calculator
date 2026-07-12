import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  status?: string;
  statusClass?: string;
  desc?: string;
  note?: string;
  children?: ReactNode;
};

/**
 * 라이프 계산기 공통 결과 카드.
 * 비즈니스 계산기(ResultPanel)보다 가볍게, 핵심 숫자 하나를 크게 보여준다.
 */
export default function LifeResult({
  label,
  value,
  status,
  statusClass = "text-emerald-600",
  desc,
  note,
  children,
}: Props) {
  return (
    <div className="print-report text-center">
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-5xl font-black tracking-tight text-gray-900 tabular-nums">{value}</p>

      {status ? <p className={`mt-3 text-lg font-black ${statusClass}`}>{status}</p> : null}
      {desc ? <p className="mt-1 text-sm font-medium text-gray-500">{desc}</p> : null}

      {children}

      {note ? <p className="mt-4 text-xs leading-5 text-gray-400">{note}</p> : null}
    </div>
  );
}

/** 라이프 계산기 공통 선택 버튼 (기본: 화이트, 선택: 다크) */
export function LifeChoice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
