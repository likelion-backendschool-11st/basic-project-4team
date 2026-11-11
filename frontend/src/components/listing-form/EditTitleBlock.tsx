import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { editHeaderCopy } from '../../data/listingForm';

interface EditTitleBlockProps {
  readonly cancelTo: string;
}

/** Edit-only page heading with the "수정 취소" link. */
export const EditTitleBlock: React.FC<EditTitleBlockProps> = ({ cancelTo }) => {
  const c = editHeaderCopy;
  return (
    <div className="mb-space-xl pb-space-sm border-b border-hairline flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div>
        <div className="flex items-center gap-space-xs mb-1">
          <span className="bg-forest text-on-primary font-eyebrow text-eyebrow px-2 py-0.5 rounded">{c.eyebrow}</span>
          <span className="text-muted font-ui-sm text-ui-sm">{c.modeLabel}</span>
        </div>
        <h1 className="font-heading-2 text-heading-2 text-ink">{c.title}</h1>
        <p className="font-body-sm text-body-sm text-muted mt-1">{c.subtitle}</p>
      </div>
      <div className="flex items-center gap-space-xs shrink-0">
        <Link
          className="px-space-md py-2 rounded border border-hairline-strong text-body font-ui-label text-ui-label hover:bg-canvas-soft transition-colors inline-flex items-center gap-1"
          to={cancelTo}
        >
          <Icon className="text-[16px]" name="arrow_back" />
          {c.cancelLabel}
        </Link>
      </div>
    </div>
  );
};

export default EditTitleBlock;
