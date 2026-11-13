import React, { useEffect } from 'react';
import { Icon } from '../common/Icon';

export interface LoginRequiredModalProps {
  readonly open: boolean;
  readonly icon: string;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

const TITLE_ID = 'login-required-title';

/** 비로그인 상태에서 댓글·이모지를 누르면 뜨는 팝업. Esc·바깥 클릭으로 닫힌다. */
export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  open,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-space-md"
      onClick={onClose}
    >
      <div
        aria-labelledby={TITLE_ID}
        aria-modal="true"
        className="w-full max-w-sm bg-canvas rounded-lg shadow-xl p-space-lg flex flex-col items-center text-center gap-space-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="w-12 h-12 rounded-full bg-mint-100 text-forest flex items-center justify-center">
          <Icon className="text-[24px]" name={icon} />
        </div>
        <h2 className="font-heading-3 text-heading-3 text-on-surface" id={TITLE_ID}>
          {title}
        </h2>
        <p className="font-body-sm text-body-sm text-muted">{message}</p>
        <div className="flex w-full gap-space-xs mt-space-sm">
          <button
            className="flex-1 py-space-xs rounded-lg bg-surface-container-low font-ui-sm text-ui-sm text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            autoFocus
            className="flex-1 py-space-xs rounded-lg bg-primary font-ui-sm text-ui-sm text-on-primary hover:opacity-90 transition-opacity"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
