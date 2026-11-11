import React from 'react';
import { discussionControls, type DiscussionSort } from '../../data/community';

export interface DiscussionFeedControlsProps {
  readonly sort: DiscussionSort;
  readonly onSortChange: (sort: DiscussionSort) => void;
  readonly verifiedOnly: boolean;
  readonly onVerifiedOnlyChange: (value: boolean) => void;
  readonly total: number;
}

const activeClass = 'font-ui-label text-ui-label text-primary font-bold flex items-center gap-1 px-space-xs py-1 rounded bg-mint-50';
const idleClass = 'font-ui-label text-ui-label text-muted hover:text-on-surface px-space-xs py-1 rounded transition-colors';

/** 인기순/최신순 sort tabs + 인증 보유자 filter. */
export const DiscussionFeedControls: React.FC<DiscussionFeedControlsProps> = ({
  sort,
  onSortChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  total,
}) => (
  /* data-component="DiscussionFeedControls" */
  <section className="flex flex-wrap items-center justify-between gap-space-xs py-space-xxs">
    <div className="flex items-center gap-space-sm">
      <div className="flex items-center gap-space-xs">
        {discussionControls.sorts.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <span className="text-hairline-strong">|</span>}
            <button
              aria-pressed={sort === s.key}
              className={sort === s.key ? activeClass : idleClass}
              onClick={() => onSortChange(s.key)}
              type="button"
            >
              {sort === s.key && <span className="w-1.5 h-1.5 rounded-full bg-primary-container inline-block" />}
              {s.label}
            </button>
          </React.Fragment>
        ))}
      </div>
      <span className="font-micro text-micro text-muted hidden sm:inline">{discussionControls.total(total)}</span>
    </div>
    {/* Verified Filter Check */}
    <label className="flex items-center gap-1.5 cursor-pointer font-ui-sm text-ui-sm text-on-surface-variant select-none">
      <input
        checked={verifiedOnly}
        className="w-3.5 h-3.5 rounded text-primary-container focus:ring-0"
        onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
        type="checkbox"
      />
      <span>{discussionControls.verifiedOnly}</span>
    </label>
  </section>
);

export default DiscussionFeedControls;
