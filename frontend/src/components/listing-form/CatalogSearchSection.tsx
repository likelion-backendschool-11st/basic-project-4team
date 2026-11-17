import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { SectionCard } from './SectionCard';
import { catalogCopy } from '../../data/listingForm';
import type { ItemSummary } from '../../api/types';
import { toAssetUrl } from '../../api/client';
import type { CatalogSearchStatus } from '../../hooks/listing-form/useCatalogSearch';

interface CatalogSearchSectionProps {
  readonly step: number;
  readonly query: string;
  /** 선택한 품목의 표시 이름. 선택 전이면 null. */
  readonly match: string | null;
  readonly selectedItemId: number | null;
  readonly status: CatalogSearchStatus;
  readonly results: readonly ItemSummary[];
  readonly totalCount: number;
  readonly error?: string;
  readonly onQueryChange: (value: string) => void;
  readonly onSearch: () => void;
  readonly onSelect: (item: ItemSummary) => void;
}

interface CatalogResultRowProps {
  readonly item: ItemSummary;
  readonly selected: boolean;
  readonly onSelect: (item: ItemSummary) => void;
}

/** 검색 결과 한 줄 — 품목명, 세트명·카드번호, 소분류, 최근 체결가. */
const CatalogResultRow: React.FC<CatalogResultRowProps> = ({ item, selected, onSelect }) => (
  <li>
    <button
      aria-pressed={selected}
      className={`w-full flex items-center gap-space-sm px-space-sm py-2 text-left rounded transition-colors ${
        selected ? 'bg-mint-50' : 'hover:bg-canvas-soft'
      }`}
      onClick={() => onSelect(item)}
      type="button"
    >
      {item.imageUrl ? (
        <img alt="" className="w-10 h-10 rounded object-cover shrink-0 bg-canvas-soft" src={toAssetUrl(item.imageUrl)} />
      ) : (
        <span className="w-10 h-10 rounded bg-canvas-soft shrink-0 flex items-center justify-center">
          <Icon className="text-muted text-[20px]" name="image" />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-ui-label text-ui-label text-ink truncate">{item.name}</span>
        <span className="block font-caption text-caption text-muted truncate">
          {[item.category.name, item.setName, item.cardNo ? `#${item.cardNo}` : null].filter(Boolean).join(' · ')}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-caption text-caption text-muted">{catalogCopy.latestPriceLabel}</span>
        <span className="block font-ui-sm text-ui-sm text-ink">
          {item.latestPrice === null ? catalogCopy.noPriceLabel : `${item.latestPrice.toLocaleString('ko-KR')}원`}
        </span>
      </span>
      {selected && <Icon className="text-forest text-[20px] shrink-0" name="check_circle" />}
    </button>
  </li>
);

/** Create section 4 — official catalog DB search (ITEM-02) & mapping result. */
export const CatalogSearchSection: React.FC<CatalogSearchSectionProps> = ({
  step,
  query,
  match,
  selectedItemId,
  status,
  results,
  totalCount,
  error,
  onQueryChange,
  onSearch,
  onSelect,
}) => (
  // data-component="ProductSearchAndLink"
  <SectionCard
    right={
      <Link
        aria-label={catalogCopy.externalLinkLabel}
        className="font-caption text-caption text-link hover:underline flex items-center gap-0.5 self-end sm:self-auto"
        to={catalogCopy.externalLinkTo}
      >
        <Icon className="text-[14px]" name="open_in_new" />
      </Link>
    }
    step={step}
    title={catalogCopy.title}
    variant="create"
  >
    <div className="relative">
      <div className="flex items-center w-full bg-canvas-soft px-space-md py-2.5 rounded">
        <Icon className="text-primary-container text-[22px] mr-2" name="search" />
        <input
          className="w-full bg-transparent border-0 p-0 font-body-sm text-body-sm text-ink focus:outline-none focus:ring-0 font-bold placeholder:font-normal placeholder:text-muted"
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch();
            }
          }}
          placeholder={catalogCopy.placeholder}
          type="text"
          value={query}
        />
        <button
          className="bg-primary-container text-on-primary font-ui-sm text-ui-sm px-3 py-1 rounded hover:bg-forest transition-colors shrink-0 disabled:opacity-70"
          disabled={status === 'loading'}
          onClick={onSearch}
          type="button"
        >
          {catalogCopy.searchLabel}
        </button>
      </div>

      {status === 'loading' && (
        <p className="mt-space-xs font-caption text-caption text-muted" role="status">
          {catalogCopy.loading}
        </p>
      )}
      {status === 'error' && (
        <p className="mt-space-xs font-caption text-caption text-error" role="alert">
          {catalogCopy.error}
        </p>
      )}
      {status === 'ready' && results.length === 0 && (
        <p className="mt-space-xs font-caption text-caption text-muted">{catalogCopy.noResults}</p>
      )}
      {status === 'ready' && results.length > 0 && (
        <div className="mt-space-xs border border-hairline rounded">
          <p className="px-space-sm pt-2 font-caption text-caption text-muted">{catalogCopy.resultCount(totalCount)}</p>
          <ul className="max-h-80 overflow-y-auto p-1">
            {results.map((item) => (
              <CatalogResultRow item={item} key={item.id} onSelect={onSelect} selected={item.id === selectedItemId} />
            ))}
          </ul>
          {totalCount > results.length && (
            <p className="px-space-sm pb-2 font-caption text-caption text-muted">{catalogCopy.moreHint}</p>
          )}
        </div>
      )}

      {match ? (
        <div className="mt-space-xs bg-mint-50 p-space-sm rounded flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-sm min-w-0">
            <Icon className="text-primary-container text-[20px] shrink-0" name="link" />
            <div className="min-w-0">
              <p className="font-ui-label text-ui-label text-ink truncate">{`${catalogCopy.matchedPrefix}${match}`}</p>
              <p className="font-caption text-caption text-forest">{catalogCopy.matchedHint}</p>
            </div>
          </div>
          <Icon className="text-forest text-[20px] shrink-0" name="check_circle" />
        </div>
      ) : (
        status === 'idle' && <p className="mt-space-xs font-caption text-caption text-muted">{catalogCopy.emptyHint}</p>
      )}
      {error && !match && (
        <p className="mt-space-xs font-caption text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  </SectionCard>
);

export default CatalogSearchSection;
