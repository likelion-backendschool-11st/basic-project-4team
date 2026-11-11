import React from 'react';
import type { TopGainer } from '../../data/market';
import { TopGainerRow } from './TopGainerRow';

interface TopGainersWidgetProps {
  readonly title: string;
  readonly caption: string;
  readonly items: readonly TopGainer[];
  readonly linkFor: (id: string) => string;
  readonly currency: string;
  readonly volumePrefix: string;
  readonly volumeSuffix: string;
}

/** "전일 상승 Top 5" side widget. */
export const TopGainersWidget: React.FC<TopGainersWidgetProps> = ({
  title,
  caption,
  items,
  linkFor,
  currency,
  volumePrefix,
  volumeSuffix,
}) => (
  // data-component="TopGainersWidget"
  <div className="lg:col-span-4 min-w-0 bg-canvas border border-surface-container rounded-xl p-space-md shadow-sm flex flex-col">
    <div className="flex items-center justify-between pb-space-xs mb-space-xs border-b border-surface-container">
      <h2 className="font-heading-4 text-heading-4 text-on-surface font-bold">{title}</h2>
      <span className="text-caption text-muted">{caption}</span>
    </div>
    <div className="divide-y divide-surface-container flex-1 flex flex-col justify-between">
      {items.map((item) => (
        <TopGainerRow
          currency={currency}
          item={item}
          key={item.id}
          to={linkFor(item.id)}
          volumePrefix={volumePrefix}
          volumeSuffix={volumeSuffix}
        />
      ))}
    </div>
  </div>
);

export default TopGainersWidget;
