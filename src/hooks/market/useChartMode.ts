import { useState } from 'react';
import type { ChartMode } from '../../data/market';

/** 선 / 막대 toggle for the 30-day chart. */
export const useChartMode = (initial: ChartMode = 'line') => {
  const [mode, setMode] = useState<ChartMode>(initial);
  return { mode, setMode };
};
