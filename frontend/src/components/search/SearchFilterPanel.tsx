import React from 'react';
import {
  conditionOptions,
  filterLabels,
  gradeOptions,
  pricePresets,
  sizeOptions,
  tradeOptions,
} from '../../data/search';
import type { SearchCategories } from '../../hooks/search/useSearchCategories';
import type { SearchFiltersState } from '../../hooks/search/useSearchFilters';
import { Icon } from '../common/Icon';
import { CategoryFilter } from './CategoryFilter';
import { FilterCheckbox } from './FilterCheckbox';
import { FilterRow } from './FilterRow';
import { PriceRangeFilter } from './PriceRangeFilter';

interface SearchFilterPanelProps {
  readonly filters: SearchFiltersState;
  /** DB 카테고리로 만든 칩과 등급 필터 사용 여부. */
  readonly categories: SearchCategories;
}

/** Structural filter panel (category / grade / size / price / options rows). */
export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ filters, categories }) => (
  // data-component="FilterSidebarOrSection"
  <section className="bg-surface-container-lowest rounded shadow-sm overflow-hidden mb-space-xl">
    <FilterRow hoverable icon={filterLabels.category.icon} label={filterLabels.category.label}>
      <CategoryFilter
        onSelect={(id) => {
          const { code, clearGrades, clearSizes } = categories.toSelection(id);
          filters.selectCategory(code, { clearGrades, clearSizes });
        }}
        options={categories.options}
        selectedId={categories.selectedId}
      />
    </FilterRow>

    <FilterRow
      badge={categories.gradeEnabled ? filterLabels.grade.badge : filterLabels.grade.disabledBadge}
      contentClassName="gap-space-md"
      icon={filterLabels.grade.icon}
      label={filterLabels.grade.label}
      variant={categories.gradeEnabled ? 'active' : 'disabled'}
    >
      {gradeOptions.map((option) => (
        <FilterCheckbox
          checked={categories.gradeEnabled && filters.grades.includes(option.id)}
          disabled={!categories.gradeEnabled}
          key={option.id}
          label={option.label}
          onToggle={categories.gradeEnabled ? () => filters.toggleGrade(option.id) : undefined}
        />
      ))}
      {categories.gradeEnabled ? (
        <span className="font-caption text-caption text-muted ml-auto hidden lg:inline-flex items-center gap-1">
          <Icon className="text-[14px]" name="info" />
          {filterLabels.grade.hint}
        </span>
      ) : (
        <span className="font-caption text-caption text-faint ml-auto">{filterLabels.grade.disabledHint}</span>
      )}
    </FilterRow>

    <FilterRow
      badge={categories.sizeEnabled ? filterLabels.size.badge : filterLabels.size.disabledBadge}
      contentClassName="gap-space-md"
      icon={filterLabels.size.icon}
      label={filterLabels.size.label}
      variant={categories.sizeEnabled ? 'active' : 'disabled'}
    >
      {sizeOptions.map((option) => (
        <FilterCheckbox
          checked={categories.sizeEnabled && filters.sizes.includes(option.id)}
          disabled={!categories.sizeEnabled}
          key={option.id}
          label={option.label}
          onToggle={categories.sizeEnabled ? () => filters.toggleSize(option.id) : undefined}
        />
      ))}
      {categories.sizeEnabled ? (
        <span className="font-caption text-caption text-muted ml-auto hidden lg:inline-flex items-center gap-1">
          <Icon className="text-[14px]" name="info" />
          {filterLabels.size.hint}
        </span>
      ) : (
        <span className="font-caption text-caption text-faint ml-auto">{filterLabels.size.disabledHint}</span>
      )}
    </FilterRow>

    <FilterRow
      contentClassName="gap-space-sm"
      hoverable
      icon={filterLabels.price.icon}
      label={filterLabels.price.label}
    >
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
      {filters.priceError ? (
        <span className="font-caption text-caption text-error flex items-center gap-1" role="alert">
          <Icon className="text-[14px]" name="error" />
          {filterLabels.price.rangeError}
        </span>
      ) : null}
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
