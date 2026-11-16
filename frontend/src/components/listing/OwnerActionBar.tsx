import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

interface OwnerActionLabels {
  readonly notice: string;
  readonly editLabel: string;
  readonly deleteLabel: string;
  readonly deletingLabel: string;
  readonly manageLabel: string;
}

interface OwnerActionBarProps {
  readonly labels: OwnerActionLabels;
  /** 판매글 수정 화면(P-015) 경로. */
  readonly editTo: string;
  /** 내 판매글 관리 화면(P-013) 경로. */
  readonly manageTo: string;
  readonly deleting: boolean;
  readonly onDelete: () => void;
}

/** P-010에서 작성자 본인에게 구매자 버튼 대신 보여주는 관리 버튼 줄: 내 판매글 관리 · 수정 · 삭제. */
export const OwnerActionBar: React.FC<OwnerActionBarProps> = ({ labels, editTo, manageTo, deleting, onDelete }) => (
  /* data-component="OwnerActionBar" */
  <div className="mt-space-md pt-space-sm border-t border-hairline flex flex-col gap-space-sm">
    <p className="flex items-center gap-1 font-caption text-caption text-forest">
      <Icon className="text-[16px]" name="person" />
      {labels.notice}
    </p>
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm">
      <Link
        className="flex-1 sm:flex-none sm:min-w-[150px] h-12 border-2 border-hairline-strong hover:border-primary-container bg-canvas hover:bg-canvas-soft rounded text-ink font-ui-label text-ui-label flex items-center justify-center gap-1.5 transition-all"
        to={manageTo}
      >
        <Icon className="text-[20px] text-muted" name="dashboard" />
        <span>{labels.manageLabel}</span>
      </Link>
      <button
        className="flex-1 sm:flex-none sm:min-w-[130px] h-12 border-2 border-hairline-strong hover:border-error bg-canvas hover:bg-error-container rounded text-error font-ui-label text-ui-label flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
        disabled={deleting}
        onClick={onDelete}
        type="button"
      >
        <Icon className="text-[20px]" name="delete" />
        <span>{deleting ? labels.deletingLabel : labels.deleteLabel}</span>
      </button>
      <Link
        className="w-full sm:w-auto sm:flex-1 h-12 bg-primary-container hover:bg-forest text-on-primary font-ui-label text-ui-label rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
        to={editTo}
      >
        <Icon className="text-[20px]" name="edit" />
        <span>{labels.editLabel}</span>
      </Link>
    </div>
  </div>
);

export default OwnerActionBar;
