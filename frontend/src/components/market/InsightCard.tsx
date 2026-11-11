import React from 'react';
import type { InsightCard as InsightCardData } from '../../data/market';

interface InsightCardProps {
  readonly insight: InsightCardData;
}

const toneStyles: Record<InsightCardData['tone'], string> = {
  up: 'text-error',
  accent: 'text-primary',
  flat: 'text-muted',
};

/** Single "어제 시장 인사이트" stat card. */
export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => (
  <div className="bg-canvas border border-surface-container rounded-xl p-space-md shadow-sm hover:border-mint-200 transition-all flex flex-col justify-between">
    <div className="flex items-center gap-space-xs mb-space-xs text-on-surface">
      <span aria-hidden="true" className="text-lg">
        {insight.emoji}
      </span>
      <span className="font-ui-label text-ui-label font-bold text-on-surface">{insight.title}</span>
    </div>
    <div className="my-space-xs">
      <div className="flex items-baseline gap-space-xs">
        <span className="font-display-lg text-[32px] font-bold text-on-surface leading-none">{insight.value}</span>
        <span className={`font-stat-value text-body-md font-bold ${toneStyles[insight.tone]}`}>{insight.changeLabel}</span>
      </div>
      <p className="font-caption text-caption text-muted mt-1">{insight.caption}</p>
    </div>
  </div>
);

export default InsightCard;
