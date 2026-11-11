import React from 'react';
import type { RankingFilter, RankingFilterId } from '../../data/home';

interface FilterChipsProps {
  readonly filters: readonly RankingFilter[];
  readonly active: RankingFilterId;
  readonly onSelect: (id: RankingFilterId) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ filters, active, onSelect }) => (
  <div className="flex flex-wrap items-center gap-2" role="tablist">
    {filters.map((filter) => {
      const selected = filter.id === active;
      return (
        <button
          aria-selected={selected}
          className={
            selected
              ? 'px-3 py-1.5 text-xs font-bold bg-primary-container text-on-primary border border-primary-container rounded'
              : 'px-3 py-1.5 text-xs font-medium bg-canvas text-body border border-hairline rounded hover:border-primary-container'
          }
          key={filter.id}
          onClick={() => onSelect(filter.id)}
          role="tab"
          type="button"
        >
          {filter.label}
        </button>
      );
    })}
  </div>
);

export default FilterChips;
