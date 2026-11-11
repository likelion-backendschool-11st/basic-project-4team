import React from 'react';
import { marketLinks, priceCards, priceGridSection } from '../../data/market';
import { usePriceCardList } from '../../hooks/market/usePriceCardList';
import { useSelection } from '../../hooks/market/useSelection';
import { LoadMoreButton } from './LoadMoreButton';
import { PriceCardGrid } from './PriceCardGrid';
import type { PriceCardLabels } from './PriceCardItem';
import { PriceGridToolbar } from './PriceGridToolbar';

interface PriceCardSectionProps {
  readonly className?: string;
}

const labels: PriceCardLabels = {
  median: priceGridSection.medianLabel,
  currency: priceGridSection.currency,
  volumeSuffix: priceGridSection.volumeSuffix,
  ...priceGridSection.metricLabels,
};

/** "카드 시세" section: heading, toolbar, card grid and 더 보기. */
export const PriceCardSection: React.FC<PriceCardSectionProps> = ({ className = '' }) => {
  const subOption = useSelection<string>('all');
  const list = usePriceCardList(priceCards, { pageSize: priceGridSection.pageSize, subOptionId: subOption.selected });

  return (
    // data-component="PriceCardGrid"
    <section className={`flex flex-col gap-space-md pt-space-md border-t border-hairline ${className}`}>
      <div className="flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <h2 className="font-heading-2 text-heading-2 text-on-surface font-bold">{priceGridSection.title}</h2>
          <span className="text-caption text-muted">{priceGridSection.caption}</span>
        </div>
        <PriceGridToolbar
          activeSubOptionId={subOption.selected}
          onQueryChange={list.setQuery}
          onSortChange={list.setSortKey}
          onSubOptionChange={subOption.select}
          onViewModeChange={list.setViewMode}
          query={list.query}
          searchPlaceholder={priceGridSection.searchPlaceholder}
          sortKey={list.sortKey}
          sortOptions={priceGridSection.sortOptions}
          subOptionLabel={priceGridSection.subOptionLabel}
          subOptions={priceGridSection.subOptions}
          viewMode={list.viewMode}
          viewModes={priceGridSection.viewModes}
        />
      </div>
      <PriceCardGrid
        cards={list.items}
        emptyLabel={priceGridSection.emptyLabel}
        labels={labels}
        linkFor={marketLinks.item}
        viewMode={list.viewMode}
      />
      <LoadMoreButton
        disabled={!list.hasMore}
        label={priceGridSection.loadMoreLabel}
        onClick={list.loadMore}
        summary={priceGridSection.summary(priceGridSection.totalItems, list.shownCount)}
      />
    </section>
  );
};

export default PriceCardSection;
