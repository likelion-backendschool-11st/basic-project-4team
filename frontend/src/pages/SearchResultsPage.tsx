import React, { useEffect, useMemo } from 'react';
import { LoginRequiredModal } from '../components/itemcommunity/LoginRequiredModal';
import { ListingToast } from '../components/listing/ListingToast';
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
import { wishCopy } from '../data/listing';
import { useLoginGate } from '../hooks/itemcommunity/useLoginGate';
import { useToast } from '../hooks/listing/useToast';
import { useListingSearch } from '../hooks/search/useListingSearch';
import { useSearchCategories } from '../hooks/search/useSearchCategories';
import { useSearchFilters } from '../hooks/search/useSearchFilters';

interface SearchResultsPageProps {
  readonly className?: string;
}

/**
 * P-009 판매글 목록·검색 결과 (`/search?q=&category=...`). 카드는 LISTING-01 응답, 클릭하면 /listings/:id.
 * 검색어가 없으면 전체(또는 고른 카테고리) 판매글 목록이다. 조건은 모두 주소에 남는다.
 */
export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ className = '' }) => {
  const filters = useSearchFilters();
  const categories = useSearchCategories(filters.categoryCode);
  // 없는 카테고리 주소(/search?category=잘못된값)는 칩은 "전체"인데 결과가 0건이 되므로 주소에서 뺀다.
  const { unknownCode } = categories;
  const { selectCategory } = filters;
  useEffect(() => {
    if (unknownCode) selectCategory('');
  }, [unknownCode, selectCategory]);
  const { toast, showToast } = useToast();
  const loginGate = useLoginGate();
  const wishHandlers = useMemo(
    () => ({
      ensureLogin: loginGate.ensureLogin,
      onLoginRequired: loginGate.prompt,
      showToast,
    }),
    [loginGate.ensureLogin, loginGate.prompt, showToast],
  );
  const search = useListingSearch(filters, categories, wishHandlers);
  const { items, pagination } = search;
  const total = search.totalCount;

  let results: React.ReactNode;
  if (search.status === 'error') {
    results = (
      <SearchResultState
        actionLabel={searchApiCopy.retry}
        icon="error"
        message={searchApiCopy.error}
        onAction={search.retry}
      />
    );
  } else if (search.status === 'loading' && items.length === 0) {
    results = <SearchResultState icon="hourglass_empty" message={searchApiCopy.loading} />;
  } else if (items.length === 0) {
    results = (
      <SearchResultState
        actionLabel={searchApiCopy.resetFilters}
        hint={searchApiCopy.emptyHint}
        icon="search_off"
        message={searchApiCopy.empty}
        onAction={filters.reset}
      />
    );
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
          breadcrumbs={categories.breadcrumbs}
          query={filters.q}
          title={categories.selectedName ?? searchHeaderData.allTitle}
          resultLabel={searchHeaderData.resultLabel}
          totalText={`${searchHeaderData.totalPrefix} ${total}${searchHeaderData.totalSuffix}`}
        />
        <SearchFilterPanel categories={categories} filters={filters} />
        <SortBar
          activeKey={filters.sortKey}
          badge={sortBarData.badge}
          countLabel={`${total}${sortBarData.countSuffix}`}
          countText={sortBarData.countText}
          onSort={filters.setSortKey}
          options={sortOptions}
        />
        {results}
        {total > 0 ? (
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
        ) : null}
        <EscrowGuideBanner {...escrowBanner} />
      </div>
      <ListingToast position="center" toast={toast} />
      <LoginRequiredModal
        {...wishCopy.loginRequired}
        onClose={loginGate.close}
        onConfirm={loginGate.goLogin}
        open={loginGate.open}
      />
    </div>
  );
};

export default SearchResultsPage;
