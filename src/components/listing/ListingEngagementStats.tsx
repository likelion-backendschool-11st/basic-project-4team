import React from 'react';
import { Icon } from '../common/Icon';

interface ListingEngagementStatsProps {
  readonly registered: string;
  readonly views: string;
  readonly viewsLabel?: string;
  readonly wishLabel: string;
  readonly wishCount: number;
  readonly variant?: 'buyer' | 'seller';
}

const Dot = () => <span className="text-faint">·</span>;

/** 등록시간 · 조회수 · 찜 meta strip. */
export const ListingEngagementStats: React.FC<ListingEngagementStatsProps> = ({
  registered,
  views,
  viewsLabel,
  wishLabel,
  wishCount,
  variant = 'buyer',
}) => {
  if (variant === 'seller') {
    return (
      <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 font-caption text-caption text-muted mb-space-md bg-canvas py-1">
        <span className="flex items-center gap-1">
          <Icon className="text-[16px] text-faint" name="schedule" />
          <span>{registered}</span>
        </span>
        <Dot />
        <span className="flex items-center gap-1">
          <Icon className="text-[16px] text-faint" name="visibility" />
          <span>
            {viewsLabel} <strong className="text-ink font-ui-sm text-ui-sm">{views}</strong>
          </span>
        </span>
        <Dot />
        <span className="flex items-center gap-1">
          <Icon className="text-[16px] text-tertiary" name="favorite" />
          <span>
            {wishLabel} <strong className="text-ink font-ui-sm text-ui-sm">{wishCount}</strong>
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 py-space-xs text-muted font-caption text-caption border-b border-hairline">
      <span className="flex items-center gap-1">
        <Icon className="text-[15px]" name="schedule" /> {registered}
      </span>
      <Dot />
      <span className="flex items-center gap-1">
        <Icon className="text-[15px]" name="visibility" /> {views}
      </span>
      <Dot />
      <span className="flex items-center gap-1">
        <Icon className="text-[15px]" name="favorite" /> {wishLabel} <span className="font-bold text-ink">{wishCount}</span>
      </span>
    </div>
  );
};

export default ListingEngagementStats;
