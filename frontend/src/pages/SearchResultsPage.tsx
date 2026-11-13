import React from 'react';
import { EscrowGuideBanner } from '../components/search/EscrowGuideBanner';
import { ListingGrid } from '../components/search/ListingGrid';
import { Pagination } from '../components/search/Pagination';
import { SearchFilterPanel } from '../components/search/SearchFilterPanel';
import { SearchResultState } from '../components/search/SearchResultState';
import { SearchSummaryHeader } from '../components/search/SearchSummaryHeader';
import { SortBar } from '../components/search/SortBar';
import {
  escrowBanner,
  listingLabels,
  paginationData,
  searchApiCopy,
  searchHeaderData,
  sortBarData,
  sortOptions,
} from '../data/search';
import { useListingSearch } from '../hooks/search/useListingSearch';
import { useSearchFilters } from '../hooks/search/useSearchFilters';
import { useSearchQuery } from '../hooks/search/useSearchQuery';

interface SearchResultsPageProps {
  readonly className?: string;
}

/** P-009 listing search results (`/search?q=...`). 카드는 LISTING-01 응답, 클릭하면 /listings/:id. */
export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ className = '' }) => {
  const query = useSearchQuery();
  const filters = useSearchFilters();
  const search = useListingSearch(query, filters);
  const { sortKey, setSortKey, items, pagination } = search;
  const total = search.totalCount;

  let results: React.ReactNode;
  if (search.status === 'error') {
    results = <SearchResultState icon="error" message={searchApiCopy.error} />;
  } else if (search.status === 'loading' && items.length === 0) {
    results = <SearchResultState icon="hourglass_empty" message={searchApiCopy.loading} />;
  } else if (items.length === 0) {
    results = <SearchResultState hint={searchApiCopy.emptyHint} icon="search_off" message={searchApiCopy.empty} />;
  } else {
    results = (
      <ListingGrid
        currency={listingLabels.currency}
        isWished={search.isWished}
        listings={items}
        onToggleWish={search.toggleWish}
        statusLabels={listingLabels.status}
        wishAria={listingLabels.wishAria}
      />
    );
  }

  return (
    <div className={`w-full bg-canvas pb-space-section ${className}`}>
      <div className="max-w-7xl mx-auto px-gutter-desktop">
        <SearchSummaryHeader
          breadcrumbs={searchHeaderData.breadcrumbs}
          query={query}
          resultLabel={searchHeaderData.resultLabel}
          totalText={`${searchHeaderData.totalPrefix} ${total}${searchHeaderData.totalSuffix}`}
        />
        <SearchFilterPanel filters={filters} />
        <SortBar
          activeKey={sortKey}
          badge={sortBarData.badge}
          countLabel={`${total}${sortBarData.countSuffix}`}
          countText={sortBarData.countText}
          onSort={setSortKey}
          options={sortOptions}
        />
        {results}
        <Pagination
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          navAria={paginationData.navAria}
          nextAria={paginationData.nextAria}
          onNext={pagination.next}
          onPage={pagination.setPage}
          onPrev={pagination.prev}
          page={pagination.page}
          pages={pagination.pages}
          prevAria={paginationData.prevAria}
          summary={
            <>
              {paginationData.summaryPrefix} <span className="text-ink font-semibold">{total}</span>
              {paginationData.summaryMiddle} {pagination.rangeStart}-{pagination.rangeEnd}
              {paginationData.summarySuffix}
            </>
          }
        />
        <EscrowGuideBanner {...escrowBanner} />
      </div>
    </div>
  );
};

export default SearchResultsPage;
