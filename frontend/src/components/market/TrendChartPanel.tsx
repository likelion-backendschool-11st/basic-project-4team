import React from 'react';
import type { ChartMode, ChartPoint, HeadlineStat } from '../../data/market';
import { type ChartModeOption, ChartModeToggle } from './ChartModeToggle';
import { HeadlineStats } from './HeadlineStats';
import { PriceVolumeChart } from './PriceVolumeChart';

interface TrendChartPanelProps {
  readonly title: string;
  readonly modes: readonly ChartModeOption[];
  readonly mode: ChartMode;
  readonly onModeChange: (mode: ChartMode) => void;
  readonly stats: readonly HeadlineStat[];
  readonly points: readonly ChartPoint[];
  readonly priceDomain: readonly [number, number];
  readonly volumeMax: number;
  readonly priceTicks: readonly string[];
  readonly volumeTicks: readonly string[];
  readonly xLabels: readonly string[];
  readonly legend: { readonly price: string; readonly volume: string };
}

/** "30일 시세 · 거래량" card: header + mode toggle, headline stats, chart. */
export const TrendChartPanel: React.FC<TrendChartPanelProps> = ({
  title,
  modes,
  mode,
  onModeChange,
  stats,
  ...chartProps
}) => (
  <div className="lg:col-span-8 min-w-0 bg-canvas border border-surface-container rounded-xl p-space-md lg:p-space-lg shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-space-md">
        <h2 className="font-heading-4 text-heading-4 text-on-surface font-bold">{title}</h2>
        <ChartModeToggle mode={mode} onChange={onModeChange} options={modes} />
      </div>
      <HeadlineStats stats={stats} />
    </div>
    <PriceVolumeChart mode={mode} {...chartProps} />
  </div>
);

export default TrendChartPanel;
