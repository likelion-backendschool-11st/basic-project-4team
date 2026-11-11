import React from 'react';
import { EscrowGuideBanner } from '../components/search/EscrowGuideBanner';
import { ListingGrid } from '../components/search/ListingGrid';
import { Pagination } from '../components/search/Pagination';
import { SearchFilterPanel } from '../components/search/SearchFilterPanel';
import { SearchSummaryHeader } from '../components/search/SearchSummaryHeader';
import { SortBar } from '../components/search/SortBar';
import {
  escrowBanner,
  listingLabels,
  listings,
  paginationData,
  searchHeaderData,
  sortBarData,
  sortOptions,
} from '../data/search';
import { usePagination } from '../hooks/search/usePagination';
import { useSearchFilters } from '../hooks/search/useSearchFilters';
import { useSearchQuery } from '../hooks/search/useSearchQuery';
import { useSortedListings } from '../hooks/search/useSortedListings';
import { useWishlist } from '../hooks/search/useWishlist';

interface SearchResultsPageProps {
  readonly className?: string;
}

const initialWished = listings.filter((item) => item.wished).map((item) => item.id);

/** P-009 listing search results (`/search?q=...`). */
export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ className = '' }) => {
  const query = useSearchQuery();
  const filters = useSearchFilters();
  const { sortKey, setSortKey, items } = useSortedListings(listings, filters.appliedRange);
  const wishlist = useWishlist(initialWished);
  const pagination = usePagination(paginationData);
  const total = paginationData.totalItems;

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
        <ListingGrid
          currency={listingLabels.currency}
          isWished={wishlist.isWished}
          listings={items}
          onToggleWish={wishlist.toggle}
          statusLabels={listingLabels.status}
          wishAria={listingLabels.wishAria}
        />
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
