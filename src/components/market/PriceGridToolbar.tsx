import React from 'react';
import type { LabeledCount, PriceSortKey, ViewMode } from '../../data/market';
import { Icon } from '../common/Icon';
import { GradePill } from './GradePill';

export interface SortChipOption {
  readonly key: PriceSortKey;
  readonly label: string;
}

export interface ViewModeOption {
  readonly id: ViewMode;
  readonly icon: string;
  readonly label: string;
}

interface PriceGridToolbarProps {
  readonly searchPlaceholder: string;
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly subOptionLabel: string;
  readonly subOptions: readonly LabeledCount[];
  readonly activeSubOptionId: string;
  readonly onSubOptionChange: (id: string) => void;
  readonly sortOptions: readonly SortChipOption[];
  readonly sortKey: PriceSortKey;
  readonly onSortChange: (key: PriceSortKey) => void;
  readonly viewModes: readonly ViewModeOption[];
  readonly viewMode: ViewMode;
  readonly onViewModeChange: (mode: ViewMode) => void;
}

/** Full-width search, sub-option pills, sort chips and grid/list toggle. */
export const PriceGridToolbar: React.FC<PriceGridToolbarProps> = ({
  searchPlaceholder,
  query,
  onQueryChange,
  subOptionLabel,
  subOptions,
  activeSubOptionId,
  onSubOptionChange,
  sortOptions,
  sortKey,
  onSortChange,
  viewModes,
  viewMode,
  onViewModeChange,
}) => (
  <>
    <div className="w-full relative">
      <div className="flex items-center bg-canvas border border-hairline-strong/80 rounded-xl px-space-md py-3 shadow-sm focus-within:border-primary transition-all">
        <Icon className="text-outline text-[20px] mr-space-xs" name="search" />
        <input
          className="w-full bg-transparent border-0 outline-none p-0 font-body-sm text-body-sm text-on-surface placeholder:text-muted focus:ring-0"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          type="text"
          value={query}
        />
      </div>
    </div>

    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pt-space-xs">
      <div className="flex items-center gap-space-xs overflow-x-auto min-w-0">
        <span className="text-caption font-bold text-muted mr-space-xxs shrink-0">{subOptionLabel}</span>
        {subOptions.map((option) => (
          <GradePill
            active={option.id === activeSubOptionId}
            count={option.count}
            key={option.id}
            label={option.label}
            onClick={() => onSubOptionChange(option.id)}
            size="sm"
          />
        ))}
      </div>

      <div className="flex items-center gap-space-xs shrink-0 self-end md:self-auto max-w-full">
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {sortOptions.map((option) => (
            <button
              aria-pressed={option.key === sortKey}
              className={
                option.key === sortKey
                  ? 'px-space-sm py-1 rounded-full bg-on-surface text-canvas font-caption text-caption font-bold shrink-0'
                  : 'px-space-sm py-1 rounded-full bg-canvas border border-hairline-strong/70 text-on-surface hover:bg-surface-container font-caption text-caption shrink-0'
              }
              key={option.key}
              onClick={() => onSortChange(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-hairline-strong mx-1 hidden sm:block" />
        <div className="flex items-center bg-canvas border border-hairline-strong/70 rounded-lg p-0.5 shrink-0">
          {viewModes.map((mode) => (
            <button
              aria-label={mode.label}
              aria-pressed={mode.id === viewMode}
              className={
                mode.id === viewMode
                  ? 'p-1 rounded bg-surface-container text-on-surface flex items-center'
                  : 'p-1 rounded text-muted hover:text-on-surface flex items-center'
              }
              key={mode.id}
              onClick={() => onViewModeChange(mode.id)}
              type="button"
            >
              <Icon className="text-[18px]" name={mode.icon} />
            </button>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default PriceGridToolbar;
