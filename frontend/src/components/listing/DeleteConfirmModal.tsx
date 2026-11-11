import React from 'react';
import { Icon } from '../common/Icon';
import { ListingModal } from './ListingModal';

interface DeleteConfirmLabels {
  readonly title: string;
  readonly question: string;
  readonly warning: string;
  readonly cancelLabel: string;
  readonly confirmLabel: string;
}

interface DeleteConfirmModalProps {
  readonly open: boolean;
  readonly labels: DeleteConfirmLabels;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 판매글 삭제 확인 모달. */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ open, labels, onCancel, onConfirm }) => (
  /* data-component="DeleteConfirmModal" */
  <ListingModal labelledBy="delete-modal-title" onClose={onCancel} open={open}>
    <div className="flex items-center gap-space-sm mb-space-sm text-error">
      <Icon className="text-[28px]" name="warning" />
      <h3 className="font-heading-3 text-heading-3 text-ink" id="delete-modal-title">
        {labels.title}
      </h3>
    </div>
    <p className="font-body-md text-body-md text-body mb-space-xs">{labels.question}</p>
    <p className="font-caption text-caption text-muted mb-space-lg bg-canvas-soft p-space-sm rounded">{labels.warning}</p>
    <div className="flex items-center justify-end gap-space-sm">
      <button
        className="px-space-md py-space-sm rounded bg-canvas-soft hover:bg-surface-variant font-ui-label text-ui-label text-body transition-colors"
        onClick={onCancel}
        type="button"
      >
        {labels.cancelLabel}
      </button>
      <button
        className="px-space-md py-space-sm rounded bg-error text-on-error font-ui-label text-ui-label hover:opacity-90 transition-opacity"
        onClick={onConfirm}
        type="button"
      >
        {labels.confirmLabel}
      </button>
    </div>
  </ListingModal>
);

export default DeleteConfirmModal;
