import { useMemo } from 'react';
import type { ChartPoint } from '../../data/market';

export interface ChartGeometryOptions {
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly baseline: number;
  readonly startX: number;
  readonly step: number;
  readonly barWidth: number;
  readonly priceDomain: readonly [number, number];
  readonly volumeMax: number;
}

export interface ChartBar {
  readonly key: string;
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly highlight: boolean;
}

interface Pt {
  readonly x: number;
  readonly y: number;
}

/** Catmull-Rom spline through the points, emitted as cubic Bézier segments. */
const smoothPath = (pts: readonly Pt[]): string => {
  if (pts.length === 0) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y.toFixed(1)}`;
  }
  return d;
};

/** Maps price/volume series to SVG geometry for the dual-axis chart. */
export const usePriceVolumeChart = (points: readonly ChartPoint[], options: ChartGeometryOptions) =>
  useMemo(() => {
    const { top, baseline, startX, step, barWidth, priceDomain, volumeMax } = options;
    const [minPrice, maxPrice] = priceDomain;
    const plotHeight = baseline - top;
    const priceY = (price: number) => baseline - ((price - minPrice) / (maxPrice - minPrice)) * plotHeight;
    const volumeH = (volume: number) => (volume / volumeMax) * (plotHeight + 10);

    const linePoints: Pt[] = points.map((p, i) => ({ x: startX + step * i, y: priceY(p.price) }));

    const volumeBars: ChartBar[] = points.map((p, i) => {
      const h = volumeH(p.volume);
      return { key: p.date, x: startX + step * i - barWidth / 2, y: baseline - h, height: h, highlight: Boolean(p.highlight) };
    });

    const priceBars: ChartBar[] = linePoints.map((pt, i) => ({
      key: points[i].date,
      x: pt.x - barWidth / 4,
      y: pt.y,
      height: baseline - pt.y,
      highlight: Boolean(points[i].highlight),
    }));

    const linePath = smoothPath(linePoints);
    const first = linePoints[0];
    const last = linePoints[linePoints.length - 1];
    const areaPath = first && last ? `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z` : '';

    const peakIndex = points.reduce((best, p, i) => (p.price > points[best].price ? i : best), 0);

    return {
      linePath,
      areaPath,
      volumeBars,
      priceBars,
      peak: linePoints[peakIndex],
      gridLines: [40, 100, 160, baseline],
    };
  }, [points, options]);
