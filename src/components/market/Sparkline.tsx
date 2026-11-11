import React from 'react';
import type { Trend } from '../../hooks/market/marketFormat';

export type SparklineSize = 'mini' | 'wide';

interface SparklineProps {
  readonly path: string;
  readonly trend: Trend;
  readonly size?: SparklineSize;
}

const miniTone: Record<Trend, string> = {
  up: 'text-error',
  down: 'text-primary',
  flat: 'text-muted',
};

const wideTone: Record<Trend, string> = {
  up: 'text-error/80',
  down: 'text-primary',
  flat: 'text-muted/70',
};

/** Tiny inline-SVG trend line; colour follows the trend direction. */
export const Sparkline: React.FC<SparklineProps> = ({ path, trend, size = 'wide' }) =>
  size === 'mini' ? (
    <svg
      aria-hidden="true"
      className={`w-14 h-6 shrink-0 ${miniTone[trend]}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.8}
      viewBox="0 0 60 24"
    >
      <path d={path} />
    </svg>
  ) : (
    <div className="w-full h-10 my-space-xs">
      <svg
        aria-hidden="true"
        className={`w-full h-full ${wideTone[trend]}`}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.8}
        viewBox="0 0 200 40"
      >
        <path d={path} />
      </svg>
    </div>
  );

export default Sparkline;
