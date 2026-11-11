import React from 'react';
import { Link } from 'react-router-dom';
import type { PriceCard } from '../../data/market';
import { formatNumber, formatPercent, type Trend, trendOf } from '../../hooks/market/marketFormat';
import { Sparkline } from './Sparkline';

export interface PriceCardLabels {
  readonly median: string;
  readonly currency: string;
  readonly volumeSuffix: string;
  readonly d1: string;
  readonly d7: string;
  readonly d30: string;
  readonly volume: string;
}

interface PriceCardItemProps {
  readonly card: PriceCard;
  readonly to: string;
  readonly labels: PriceCardLabels;
  readonly layout?: 'grid' | 'list';
}

const headTone: Record<Trend, string> = {
  up: 'text-error',
  down: 'text-primary',
  flat: 'text-muted',
};

const metricTone: Record<Trend, string> = {
  up: 'text-error',
  down: 'text-primary',
  flat: 'text-on-surface',
};

const arrow: Record<Trend, string> = { up: ' ↗', down: ' ↘', flat: '' };

/** Single-card market price tile: thumb, tags, median price, sparkline, 4 metrics. */
export const PriceCardItem: React.FC<PriceCardItemProps> = ({ card, to, labels, layout = 'grid' }) => {
  const trend = trendOf(card.change1d);
  const metrics = [
    { label: labels.d1, value: formatPercent(card.change1d), tone: metricTone[trendOf(card.change1d)] },
    { label: labels.d7, value: formatPercent(card.change7d), tone: metricTone[trendOf(card.change7d)] },
    { label: labels.d30, value: formatPercent(card.change30d), tone: metricTone[trendOf(card.change30d)] },
    { label: labels.volume, value: `${card.volume30d}${labels.volumeSuffix}`, tone: 'text-on-surface' },
  ];

  return (
    // data-component="PriceCardItem" data-path="item-discussion"
    <Link
      className={`bg-canvas border border-surface-container rounded-xl p-space-md shadow-sm hover:shadow-md hover:border-mint-200 transition-all flex justify-between group cursor-pointer ${
        layout === 'list' ? 'flex-col md:flex-row md:items-center gap-space-md' : 'flex-col'
      }`}
      to={to}
    >
      <div className={layout === 'list' ? 'md:flex-1 md:flex md:items-center md:gap-space-md' : undefined}>
        <div className={`flex items-start gap-space-sm mb-space-sm ${layout === 'list' ? 'md:mb-0 md:flex-1' : ''}`}>
          <div className="w-16 aspect-[3/4] bg-surface-container rounded overflow-hidden shrink-0 border border-hairline">
            <img
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
              src={card.imageUrl}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 mb-1">
              {card.tags.map((tag) => (
                <span className="px-1.5 py-0.5 bg-surface-container rounded text-muted font-caption text-[11px] font-bold" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="font-ui-label text-ui-label font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
              {card.name}
            </h3>
            <div className="mt-2">
              <span className="font-caption text-caption text-muted block">{labels.median}</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="font-stat-value text-stat-value font-bold text-on-surface">
                  {formatNumber(card.price)}
                  {labels.currency}
                </span>
                <span className={`font-caption text-caption font-bold flex items-center ${headTone[trend]}`}>
                  {formatPercent(card.change1d)}
                  {arrow[trend]}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={layout === 'list' ? 'md:w-48 shrink-0' : undefined}>
          <Sparkline path={card.sparkline} trend={trend} />
        </div>
      </div>
      <div
        className={`pt-space-xs border-t border-hairline grid grid-cols-4 gap-1 text-center font-caption text-caption ${
          layout === 'list' ? 'md:border-t-0 md:pt-0 md:w-80 shrink-0' : ''
        }`}
      >
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span className="text-muted block text-[11px]">{metric.label}</span>
            <span className={`font-bold ${metric.tone}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </Link>
  );
};

export default PriceCardItem;
