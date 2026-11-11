import React from 'react';
import type { SortKey, SortOption } from '../../data/search';
import { Icon } from '../common/Icon';

interface SortBarProps {
  readonly countLabel: string;
  readonly countText: string;
  readonly badge: string;
  readonly options: readonly SortOption[];
  readonly activeKey: SortKey;
  readonly onSort: (key: SortKey) => void;
}

/** Result counter + verification badge on the left, sort links on the right. */
export const SortBar: React.FC<SortBarProps> = ({ countLabel, countText, badge, options, activeKey, onSort }) => (
  // data-component="SortAndDisplayControls"
  <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-space-md gap-space-sm">
    <div className="flex flex-wrap items-center gap-space-xs font-ui-sm text-ui-sm">
      <span>
        <span className="text-ink font-bold">{countLabel}</span>
        {countText}
      </span>
      <span className="bg-lime-panel text-on-secondary-container px-2 py-0.5 rounded font-micro text-micro ml-1">{badge}</span>
    </div>
    <div className="flex flex-wrap items-center gap-space-sm font-ui-sm text-ui-sm">
      {options.map((option, index) => {
        const active = option.key === activeKey;
        return (
          <React.Fragment key={option.key}>
            {index > 0 ? <span className="text-faint">|</span> : null}
            <button
              aria-pressed={active}
              className={
                active
                  ? 'font-bold text-primary-container flex items-center gap-0.5'
                  : 'text-muted hover:text-ink transition-colors'
              }
              onClick={() => onSort(option.key)}
              type="button"
            >
              <span>{option.label}</span>
              {active ? <Icon className="text-[14px]" name="check" /> : null}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  </section>
);

export default SortBar;
