import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { SectionCard } from './SectionCard';
import { catalogCopy } from '../../data/listingForm';

interface CatalogSearchSectionProps {
  readonly step: number;
  readonly query: string;
  readonly match: string | null;
  readonly onQueryChange: (value: string) => void;
  readonly onSearch: () => void;
}

/** Create section 4 — official catalog DB search & mapping result. */
export const CatalogSearchSection: React.FC<CatalogSearchSectionProps> = ({ step, query, match, onQueryChange, onSearch }) => (
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
          className="bg-primary-container text-on-primary font-ui-sm text-ui-sm px-3 py-1 rounded hover:bg-forest transition-colors shrink-0"
          onClick={onSearch}
          type="button"
        >
          {catalogCopy.searchLabel}
        </button>
      </div>
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
        <p className="mt-space-xs font-caption text-caption text-muted">{catalogCopy.emptyHint}</p>
      )}
    </div>
  </SectionCard>
);

export default CatalogSearchSection;
