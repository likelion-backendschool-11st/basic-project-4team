import React from 'react';
import type { ChartMode } from '../../data/market';
import { Icon } from '../common/Icon';

export interface ChartModeOption {
  readonly id: ChartMode;
  readonly label: string;
  readonly icon: string;
}

interface ChartModeToggleProps {
  readonly options: readonly ChartModeOption[];
  readonly mode: ChartMode;
  readonly onChange: (mode: ChartMode) => void;
}

/** 선 / 막대 segmented control. */
export const ChartModeToggle: React.FC<ChartModeToggleProps> = ({ options, mode, onChange }) => (
  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
    {options.map((option) => (
      <button
        aria-pressed={option.id === mode}
        className={
          option.id === mode
            ? 'px-space-xs py-0.5 rounded bg-primary text-on-primary font-caption text-caption font-bold shadow-sm flex items-center gap-1'
            : 'px-space-xs py-0.5 rounded text-muted hover:text-on-surface font-caption text-caption flex items-center gap-1'
        }
        key={option.id}
        onClick={() => onChange(option.id)}
        type="button"
      >
        <Icon className="text-[14px]" name={option.icon} />
        {option.label}
      </button>
    ))}
  </div>
);

export default ChartModeToggle;
