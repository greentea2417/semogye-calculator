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
            className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-3 text-white font-semibold shadow-sm shadow-blue-500/20 transition hover:from-blue-500 hover:to-sky-400"
          >
            {shareLabel}
          </button>
        )}

        {onExcelDownload && (
          <button
            type="button"
            onClick={onExcelDownload}
            className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold shadow-sm shadow-slate-900/15 transition hover:bg-slate-800"
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
