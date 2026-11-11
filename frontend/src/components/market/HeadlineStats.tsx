import React from 'react';
import type { HeadlineStat } from '../../data/market';
import { Icon } from '../common/Icon';

interface HeadlineStatsProps {
  readonly stats: readonly HeadlineStat[];
}

const toneStyles: Record<HeadlineStat['tone'], string> = {
  neutral: 'text-on-surface',
  down: 'text-primary',
  up: 'text-error',
};

/** Headline numbers row above the 30-day chart. */
export const HeadlineStats: React.FC<HeadlineStatsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs pb-space-md border-b border-surface-container">
    {stats.map((stat) => (
      <div key={stat.id}>
        <span className="font-caption text-caption text-muted flex items-center gap-1">
          {stat.label}
          {stat.helpIcon ? <Icon className="text-[13px] text-faint" name="help_outline" /> : null}
        </span>
        <span
          className={`font-stat-value font-bold block mt-1 ${stat.emphasis ? 'text-[22px]' : 'text-[17px]'} ${toneStyles[stat.tone]}`}
        >
          {stat.value}
        </span>
      </div>
    ))}
  </div>
);

export default HeadlineStats;
