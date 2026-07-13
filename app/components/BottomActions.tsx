"use client";

type Props = {
  shareLabel?: string;
  onShare?: () => void;
  shareHint?: string;
  excelLabel?: string;
  excelHint?: string;
  onExcelDownload?: () => void;
};

export default function BottomActions({
  shareLabel = "공유하기",
  onShare,
  shareHint,
  excelLabel = "엑셀 다운로드",
  excelHint,
  onExcelDownload,
}: Props) {
  if (!onShare && !onExcelDownload) return null;

  return (
    <div className="no-print mt-6 flex flex-col items-center gap-2">
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
      {onExcelDownload && (
        <div className="text-xs text-gray-500">엑셀에서 열 수 있어요 (.csv)</div>
      )}
    </div>
  );
}
