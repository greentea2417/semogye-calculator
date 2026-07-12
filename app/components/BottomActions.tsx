"use client";

type Props = {
  shareLabel?: string;
  onShare?: () => void;
  shareHint?: string;
  /** PDF 저장(브라우저 인쇄 대화상자). 비즈니스 계산기는 기본으로 노출된다. */
  showPdf?: boolean;
  pdfLabel?: string;
  onPdfDownload?: () => void;
  excelLabel?: string;
  excelHint?: string;
  onExcelDownload?: () => void;
};

export default function BottomActions({
  shareLabel = "공유하기",
  onShare,
  shareHint,
  showPdf = true,
  pdfLabel = "PDF 다운로드",
  onPdfDownload,
  excelLabel = "엑셀 다운로드",
  excelHint,
  onExcelDownload,
}: Props) {
  const handlePdf = onPdfDownload ?? (() => window.print());

  if (!onShare && !showPdf && !onExcelDownload) return null;

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

        {showPdf && (
          <button
            type="button"
            onClick={handlePdf}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/15 transition hover:bg-slate-800"
          >
            {pdfLabel}
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

      {showPdf && (
        <div className="text-xs text-gray-500">PDF는 인쇄창에서 “PDF로 저장”을 선택하면 됩니다.</div>
      )}
      {onShare && shareHint && <div className="text-xs text-gray-500">{shareHint}</div>}
      {onExcelDownload && excelHint && <div className="text-xs text-gray-500">{excelHint}</div>}
    </div>
  );
}
