"use client";

type Props = {
  // Excel (선택)
  excelLabel?: string;
  excelHint?: string;
  onExcelDownload?: () => void;

  // Link copy (선택)
  copyLabel?: string;
  onCopyLink?: () => void;

  // Share (선택)
  shareLabel?: string;
  onShare?: () => void;
};

export default function BottomActions({
  excelLabel = "엑셀 다운로드",
  excelHint,
  onExcelDownload,

  copyLabel = "링크 복사",
  onCopyLink,

  shareLabel = "공유하기",
  onShare,
}: Props) {
  const hasAny = !!onExcelDownload || !!onCopyLink || !!onShare;
  if (!hasAny) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-3">
        {/* ✅ 공유 */}
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
          >
            {shareLabel}
          </button>
        )}

        {/* ✅ 링크 복사 */}
        {onCopyLink && (
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
          >
            {copyLabel}
          </button>
        )}

        {/* ✅ 엑셀 다운로드(있는 계산기만) */}
        {onExcelDownload && (
          <button
            type="button"
            onClick={onExcelDownload}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
          >
            {excelLabel}
          </button>
        )}
      </div>

      {onExcelDownload && excelHint && <div className="text-xs text-gray-500">{excelHint}</div>}
    </div>
  );
}
