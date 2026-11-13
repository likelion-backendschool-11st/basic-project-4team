import React, { useEffect } from 'react';
import { REPORT_DETAIL_MAX, reportCopy } from '../../data/comment';
import type { useReport } from '../../hooks/comment/useReport';

export interface ReportModalProps {
  /** useReport()가 돌려준 상태·동작. */
  readonly state: ReturnType<typeof useReport>;
}

const TITLE_ID = 'report-modal-title';

/** 신고 사유 선택 팝업. 기타를 고르면 상세 내용이 필수. Esc·바깥 클릭으로 닫힌다. */
export const ReportModal: React.FC<ReportModalProps> = ({ state }) => {
  const { isOpen, close } = state;
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-space-md" onClick={close}>
      <div
        aria-labelledby={TITLE_ID}
        aria-modal="true"
        className="w-full max-w-sm bg-canvas rounded-lg shadow-xl p-space-lg flex flex-col gap-space-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <h2 className="font-heading-3 text-heading-3 text-on-surface" id={TITLE_ID}>
          {reportCopy.title}
        </h2>
        <p className="font-body-sm text-body-sm text-muted">{reportCopy.description}</p>
        <fieldset className="flex flex-col gap-1">
          <legend className="sr-only">{reportCopy.title}</legend>
          {reportCopy.reasons.map((r) => (
            <label
              className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface cursor-pointer hover:bg-surface-container-low"
              key={r.value}
            >
              <input
                checked={state.reason === r.value}
                className="text-primary focus:ring-primary"
                name="report-reason"
                onChange={() => state.setReason(r.value)}
                type="radio"
              />
              {r.label}
            </label>
          ))}
        </fieldset>
        <textarea
          aria-label={reportCopy.detailPlaceholder}
          className="w-full p-space-sm bg-surface-container-low border-0 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          onChange={(e) => state.setDetail(e.target.value)}
          placeholder={reportCopy.detailPlaceholder}
          rows={3}
          value={state.detail}
        />
        <span className="font-micro text-micro text-muted self-end">
          {state.detail.length}/{REPORT_DETAIL_MAX}
        </span>
        {state.error && <p className="font-body-sm text-body-sm text-error">{state.error}</p>}
        <div className="flex gap-space-xs">
          <button
            className="flex-1 py-space-xs rounded-lg bg-surface-container-low font-ui-sm text-ui-sm text-on-surface-variant hover:text-on-surface"
            onClick={close}
            type="button"
          >
            {reportCopy.cancelLabel}
          </button>
          <button
            className="flex-1 py-space-xs rounded-lg bg-error font-ui-sm text-ui-sm text-on-error hover:opacity-90 disabled:opacity-50"
            disabled={!state.canSubmit}
            onClick={state.submit}
            type="button"
          >
            {reportCopy.submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
