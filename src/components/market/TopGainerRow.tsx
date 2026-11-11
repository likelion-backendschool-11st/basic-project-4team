import React from 'react';
import { Link } from 'react-router-dom';
import type { TopGainer } from '../../data/market';
import { formatNumber, formatPercent, trendOf } from '../../hooks/market/marketFormat';
import { Sparkline } from './Sparkline';

interface TopGainerRowProps {
  readonly item: TopGainer;
  readonly to: string;
  readonly currency: string;
  readonly volumePrefix: string;
  readonly volumeSuffix: string;
}

/** Ranked row: rank, thumbnail, name, price + change, volume, sparkline. */
export const TopGainerRow: React.FC<TopGainerRowProps> = ({ item, to, currency, volumePrefix, volumeSuffix }) => (
  <Link
    className="py-space-xs flex items-center justify-between gap-space-xs hover:bg-surface-container-low px-space-xs rounded transition-colors"
    to={to}
  >
    <div className="flex items-center gap-space-sm min-w-0">
      <span className="font-heading-4 font-bold text-on-surface w-4 text-center shrink-0">{item.rank}</span>
      <div className="w-10 h-14 bg-surface-container rounded overflow-hidden shrink-0 border border-hairline">
        <img alt={item.imageAlt} className="w-full h-full object-cover" loading="lazy" src={item.imageUrl} />
      </div>
      <div className="min-w-0">
        <span className="font-ui-sm text-ui-sm text-on-surface font-bold truncate block">{item.name}</span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-ui-label text-ui-label font-bold text-on-surface">
            {formatNumber(item.price)}
            {currency}
          </span>
          <span className="font-caption text-caption text-error font-bold">{formatPercent(item.change)}</span>
        </div>
        <span className="font-micro text-micro text-muted">
          {volumePrefix} {item.volume}
          {volumeSuffix}
        </span>
      </div>
    </div>
    <Sparkline path={item.sparkline} size="mini" trend={trendOf(item.change)} />
  </Link>
);

export default TopGainerRow;
