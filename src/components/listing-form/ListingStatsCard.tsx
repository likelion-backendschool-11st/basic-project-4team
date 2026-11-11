import React from 'react';
import { Icon } from '../common/Icon';

interface ListingStatsCardProps {
  readonly label: string;
  readonly stats: string;
}

/** Edit-only snapshot of views / wishes / chats. */
export const ListingStatsCard: React.FC<ListingStatsCardProps> = ({ label, stats }) => (
  <div className="bg-canvas-soft border border-hairline rounded p-space-md flex items-center justify-between">
    <div>
      <span className="font-micro text-micro text-muted block">{label}</span>
      <span className="font-ui-label text-ui-label text-ink">{stats}</span>
    </div>
    <span className="w-8 h-8 rounded-full bg-mint-100 text-forest flex items-center justify-center font-bold shrink-0">
      <Icon className="text-[18px]" name="trending_up" />
    </span>
  </div>
);

export default ListingStatsCard;
