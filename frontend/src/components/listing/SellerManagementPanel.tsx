import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { ROUTES } from '../../data/layout';
import { DiscussionShortcut } from './DiscussionShortcut';

interface SellerManagementLabels {
  readonly title: string;
  readonly note: string;
  readonly discussionLabel: string;
  readonly editLabel: string;
  readonly deleteLabel: string;
}

interface SellerManagementPanelProps {
  readonly listingId: string;
  readonly itemId: string;
  readonly labels: SellerManagementLabels;
  /** The status dropdown slot (keeps this panel stateless). */
  readonly statusControl: React.ReactNode;
  readonly onDelete: () => void;
}

/** 판매자 전용 관리 도구: 1. 상품수정 · 2. 상태 변경 · 3. 상품삭제. */
export const SellerManagementPanel: React.FC<SellerManagementPanelProps> = ({
  listingId,
  itemId,
  labels,
  statusControl,
  onDelete,
}) => (
  /* data-component="StatusManagementActionGroup" */
  <div className="w-full bg-canvas-soft p-space-md rounded">
    <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        <span className="font-eyebrow text-eyebrow text-forest">{labels.title}</span>
      </div>
      <span className="font-micro text-micro text-muted">{labels.note}</span>
      <DiscussionShortcut itemId={itemId} label={labels.discussionLabel} variant="link" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm items-center">
      {/* data-component="EditListingButton" */}
      <Link
        className="flex items-center justify-center gap-space-xs py-space-sm px-space-md bg-canvas hover:bg-mint-50 text-ink hover:text-primary-container rounded font-ui-label text-ui-label transition-colors"
        to={ROUTES.myListingEdit(listingId)}
      >
        <Icon className="text-[18px]" name="edit_note" />
        <span>{labels.editLabel}</span>
      </Link>
      {statusControl}
      {/* data-component="DeleteListingButton" */}
      <button
        className="flex items-center justify-center gap-space-xs py-space-sm px-space-md bg-canvas hover:bg-error-container text-muted hover:text-on-error-container rounded font-ui-label text-ui-label transition-colors"
        onClick={onDelete}
        type="button"
      >
        <Icon className="text-[18px]" name="delete" />
        <span>{labels.deleteLabel}</span>
      </button>
    </div>
  </div>
);

export default SellerManagementPanel;
