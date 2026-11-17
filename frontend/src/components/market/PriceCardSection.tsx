import React from 'react';
import { marketLinks, priceGridSection } from '../../data/market';
import { useMarketPrices } from '../../hooks/market/useMarketPrices';
import { LoadMoreButton } from './LoadMoreButton';
import { PriceCardGrid } from './PriceCardGrid';
import type { PriceCardLabels } from './PriceCardItem';
import { PriceGridToolbar } from './PriceGridToolbar';

interface PriceCardSectionProps {
  /** 카테고리 코드. 비어 있으면(최근 거래 없음) 불러오지 않는다. */
  readonly category: string;
  /** 등급 키 또는 'all'. */
  readonly grade: string;
  readonly className?: string;
}

const labels: PriceCardLabels = {
  median: priceGridSection.medianLabel,
  currency: priceGridSection.currency,
  volumeSuffix: priceGridSection.volumeSuffix,
  ...priceGridSection.metricLabels,
};

/** "품목별 시세" section: heading, toolbar, card grid and 더 보기 (MARKET-05). */
export const PriceCardSection: React.FC<PriceCardSectionProps> = ({ category, grade, className = '' }) => {
  const list = useMarketPrices(category, grade);

  return (
    // data-component="PriceCardGrid"
    <section className={`flex flex-col gap-space-md pt-space-md border-t border-hairline ${className}`}>
      <div className="flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <h2 className="font-heading-2 text-heading-2 text-on-surface font-bold">{priceGridSection.title}</h2>
          <span className="text-caption text-muted">{priceGridSection.caption}</span>
        </div>
        <PriceGridToolbar
          onQueryChange={list.setQuery}
          onSortChange={list.setSortKey}
          onViewModeChange={list.setViewMode}
          query={list.query}
          searchPlaceholder={priceGridSection.searchPlaceholder}
          sortKey={list.sortKey}
          sortOptions={priceGridSection.sortOptions}
          viewMode={list.viewMode}
          viewModes={priceGridSection.viewModes}
        />
      </div>
      {list.error ? (
        <p className="py-space-md text-center font-body-sm text-body-sm text-error">{priceGridSection.error}</p>
      ) : null}
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
        summary={priceGridSection.summary(list.totalCount, list.shownCount)}
      />
    </section>
  );
};

export default PriceCardSection;
