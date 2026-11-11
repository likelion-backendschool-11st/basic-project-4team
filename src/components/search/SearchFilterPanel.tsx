import React from 'react';
import {
  categoryOptions,
  conditionOptions,
  filterLabels,
  gradeOptions,
  pricePresets,
  sizeOptions,
  tradeOptions,
} from '../../data/search';
import type { SearchFiltersState } from '../../hooks/search/useSearchFilters';
import { Icon } from '../common/Icon';
import { CategoryFilter } from './CategoryFilter';
import { FilterCheckbox } from './FilterCheckbox';
import { FilterRow } from './FilterRow';
import { PriceRangeFilter } from './PriceRangeFilter';

interface SearchFilterPanelProps {
  readonly filters: SearchFiltersState;
}

/** Structural filter panel (category / grade / size / price / options rows). */
export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ filters }) => (
  // data-component="FilterSidebarOrSection"
  <section className="bg-surface-container-lowest rounded shadow-sm overflow-hidden mb-space-xl">
    <FilterRow hoverable icon={filterLabels.category.icon} label={filterLabels.category.label}>
      <CategoryFilter onSelect={filters.selectCategory} options={categoryOptions} selectedId={filters.categoryId} />
    </FilterRow>

    <FilterRow
      badge={filterLabels.grade.badge}
      contentClassName="gap-space-md"
      icon={filterLabels.grade.icon}
      label={filterLabels.grade.label}
      variant="active"
    >
      {gradeOptions.map((option) => (
        <FilterCheckbox
          checked={filters.grades.includes(option.id)}
          key={option.id}
          label={option.label}
          onToggle={() => filters.toggleGrade(option.id)}
        />
      ))}
      <span className="font-caption text-caption text-muted ml-auto hidden lg:inline-flex items-center gap-1">
        <Icon className="text-[14px]" name="info" />
        {filterLabels.grade.hint}
      </span>
    </FilterRow>

    <FilterRow
      badge={filterLabels.size.badge}
      contentClassName="gap-space-md"
      icon={filterLabels.size.icon}
      label={filterLabels.size.label}
      variant="disabled"
    >
      {sizeOptions.map((option) => (
        <FilterCheckbox checked={false} disabled key={option.id} label={option.label} />
      ))}
      <span className="font-caption text-caption text-faint ml-auto">{filterLabels.size.hint}</span>
    </FilterRow>

    <FilterRow contentClassName="gap-space-sm" hoverable icon={filterLabels.price.icon} label={filterLabels.price.label}>
      <PriceRangeFilter
        activePresetId={filters.activePresetId}
        applyLabel={filterLabels.price.apply}
        max={filters.priceMax}
        maxPlaceholder={filterLabels.price.maxPlaceholder}
        min={filters.priceMin}
        minPlaceholder={filterLabels.price.minPlaceholder}
        onApply={filters.applyPrice}
        onMaxChange={filters.setPriceMax}
        onMinChange={filters.setPriceMin}
        onPreset={filters.applyPreset}
        presets={pricePresets}
        unit={filterLabels.price.unit}
      />
    </FilterRow>

    <FilterRow contentClassName="gap-space-lg" icon={filterLabels.options.icon} label={filterLabels.options.label}>
      <FilterCheckbox
        checked={filters.excludeSold}
        highlighted
        label={filterLabels.options.excludeSold}
        onToggle={filters.toggleExcludeSold}
      />
      <div className="flex items-center gap-space-md">
        <span className="font-ui-sm text-ui-sm text-muted">{filterLabels.options.conditionLabel}</span>
        {conditionOptions.map((option) => (
          <FilterCheckbox
            checked={filters.conditions.includes(option.id)}
            key={option.id}
            label={option.label}
            onToggle={() => filters.toggleCondition(option.id)}
            size="sm"
          />
        ))}
      </div>
      <div className="h-3 w-[1px] bg-hairline-strong hidden sm:block" />
      <div className="flex items-center gap-space-md">
        <span className="font-ui-sm text-ui-sm text-muted">{filterLabels.options.tradeLabel}</span>
        {tradeOptions.map((option) => (
          <FilterCheckbox
            checked={filters.trades.includes(option.id)}
            key={option.id}
            label={option.label}
            onToggle={() => filters.toggleTrade(option.id)}
            size="sm"
          />
        ))}
      </div>
      <button
        className="ml-auto text-muted hover:text-ink font-caption text-caption flex items-center gap-1"
        onClick={filters.reset}
        type="button"
      >
        <Icon className="text-[14px]" name="refresh" />
        {filterLabels.options.reset}
      </button>
    </FilterRow>
  </section>
);

export default SearchFilterPanel;
