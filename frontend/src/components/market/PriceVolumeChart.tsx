import React, { useId } from 'react';
import type { ChartMode, ChartPoint } from '../../data/market';
import { type ChartGeometryOptions, usePriceVolumeChart } from '../../hooks/market/usePriceVolumeChart';

interface PriceVolumeChartProps {
  readonly points: readonly ChartPoint[];
  readonly mode: ChartMode;
  readonly priceDomain: readonly [number, number];
  readonly volumeMax: number;
  readonly priceTicks: readonly string[];
  readonly volumeTicks: readonly string[];
  readonly xLabels: readonly string[];
  readonly legend: { readonly price: string; readonly volume: string };
}

const BASE_GEOMETRY = {
  width: 600,
  height: 240,
  top: 20,
  baseline: 210,
  startX: 20,
} as const;
const MAX_BAR_WIDTH = 10;

/** 포인트 수에 맞춰 x 간격·막대 폭을 정한다 (거래일 수가 날마다 다르다). */
const spacingFor = (count: number) => {
  const step = count > 1 ? (BASE_GEOMETRY.width - BASE_GEOMETRY.startX * 2) / (count - 1) : 0;
  return { step, barWidth: count > 1 ? Math.min(MAX_BAR_WIDTH, step * 0.6) : MAX_BAR_WIDTH };
};

/** Inline-SVG dual-axis chart: volume bars + smoothed price line (or price bars in 막대 mode). */
export const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({
  points,
  mode,
  priceDomain,
  volumeMax,
  priceTicks,
  volumeTicks,
  xLabels,
  legend,
}) => {
  const gradientId = `pv-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const options = React.useMemo<ChartGeometryOptions>(
    () => ({ ...BASE_GEOMETRY, ...spacingFor(points.length), priceDomain, volumeMax }),
    [points.length, priceDomain, volumeMax],
  );
  const chart = usePriceVolumeChart(points, options);

  return (
    <>
      <div className="relative w-full h-64 mt-space-md">
        <svg
          aria-hidden="true"
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${BASE_GEOMETRY.width} ${BASE_GEOMETRY.height}`}
        >
          <defs>
            <linearGradient className="text-primary" id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>

          {chart.gridLines.map((y) => (
            <line className="stroke-surface-container" key={y} strokeDasharray="3 3" x1={0} x2={BASE_GEOMETRY.width} y1={y} y2={y} />
          ))}

          {chart.volumeBars.map((bar) => (
            <rect
              className={bar.highlight ? 'fill-mint-200' : 'fill-surface-container-high'}
              height={bar.height}
              key={bar.key}
              rx={2}
              width={options.barWidth}
              x={bar.x}
              y={bar.y}
            />
          ))}

          {mode === 'line' ? (
            <>
              <path d={chart.areaPath} fill={`url(#${gradientId})`} />
              <path
                className="stroke-primary"
                d={chart.linePath}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
              {chart.peak ? (
                <circle className="fill-canvas stroke-primary" cx={chart.peak.x} cy={chart.peak.y} r={4} strokeWidth={2.5} />
              ) : null}
            </>
          ) : (
            chart.priceBars.map((bar) => (
              <rect
                className={bar.highlight ? 'fill-primary' : 'fill-primary/60'}
                height={bar.height}
                key={bar.key}
                rx={1}
                width={options.barWidth / 2}
                x={bar.x}
                y={bar.y}
              />
            ))
          )}
        </svg>

        <div className="absolute left-1 top-2 text-[10px] text-muted flex flex-col justify-between h-[85%] pointer-events-none">
          {priceTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="absolute right-1 top-2 text-[10px] text-muted flex flex-col justify-between h-[85%] pointer-events-none text-right">
          {volumeTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-space-xs text-caption text-muted border-t border-hairline mt-space-xs">
        {xLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="flex items-center justify-center gap-space-md pt-space-xs text-caption">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-primary inline-block" />
          <span className="text-on-surface">{legend.price}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2.5 bg-surface-container-high rounded-sm inline-block" />
          <span className="text-muted">{legend.volume}</span>
        </div>
      </div>
    </>
  );
};

export default PriceVolumeChart;
