"use client";

type Props = {
  excelLabel?: string;
  excelHint?: string;
  onExcelDownload?: () => void;
  shareLabel?: string;
  onShare?: () => void;
  shareHint?: string;
};

export default function BottomActions({
  excelLabel = "엑셀 다운로드",
  excelHint,
  onExcelDownload,
  shareLabel = "공유하기",
  onShare,
  shareHint,
}: Props) {
  const hasAny = !!onExcelDownload || !!onShare;
  if (!hasAny) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-3">
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm shadow-gray-200/40 transition hover:border-gray-300 hover:bg-gray-50"
          >
            {shareLabel}
          </button>
        )}

        {onExcelDownload && (
          <button
            type="button"
            onClick={onExcelDownload}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/15 transition hover:bg-slate-800"
          >
            {excelLabel}
          </button>
        )}
      </div>

      {onShare && shareHint && <div className="text-xs text-gray-500">{shareHint}</div>}
      {onExcelDownload && excelHint && <div className="text-xs text-gray-500">{excelHint}</div>}
    </div>
  );
}
