import React from 'react';
import { useInfiniteSentinel } from '../../hooks/community/useInfiniteSentinel';
import { Icon } from '../common/Icon';

export interface LoadMoreSentinelProps {
  readonly hasMore: boolean;
  readonly onLoadMore: () => void;
  readonly loadingLabel: string;
  readonly endLabel: string;
  /** `feed` = soft panel with spinner (P-017), `discussion` = bouncing chevron (P-018). */
  readonly variant?: 'feed' | 'discussion';
}

/** Infinite-scroll trigger: loads the next page when scrolled into view (click also works). */
export const LoadMoreSentinel: React.FC<LoadMoreSentinelProps> = ({
  hasMore,
  onLoadMore,
  loadingLabel,
  endLabel,
  variant = 'feed',
}) => {
  const ref = useInfiniteSentinel<HTMLButtonElement>(onLoadMore, hasMore);

  if (variant === 'feed') {
    return (
      <button
        className="w-full py-space-lg text-center bg-canvas-soft rounded-lg flex items-center justify-center gap-space-xs text-muted font-ui-sm text-ui-sm disabled:cursor-default"
        disabled={!hasMore}
        onClick={onLoadMore}
        ref={ref}
        type="button"
      >
        {hasMore && <Icon className="animate-spin text-[18px] text-primary" name="autorenew" />}
        <span>{hasMore ? loadingLabel : endLabel}</span>
      </button>
    );
  }

  return (
    /* data-component="InfiniteScrollSentinel" */
    <button
      className="w-full flex flex-col items-center justify-center py-space-md text-muted gap-space-xxs disabled:cursor-default"
      disabled={!hasMore}
      onClick={onLoadMore}
      ref={ref}
      type="button"
    >
      {hasMore && <Icon className="text-[20px] animate-bounce" name="expand_more" />}
      <span className="font-caption text-caption">{hasMore ? loadingLabel : endLabel}</span>
    </button>
  );
};

export default LoadMoreSentinel;
