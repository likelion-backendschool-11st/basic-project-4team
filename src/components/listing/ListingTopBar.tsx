import React from 'react';
import { Icon } from '../common/Icon';
import type { BreadcrumbItem } from '../../data/listing';
import { ListingBreadcrumbs } from './ListingBreadcrumbs';

interface ListingTopBarProps {
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly escrowBadge: string;
  readonly listingNoLabel: string;
  readonly listingNo: string;
}

/** Buyer view breadcrumb / utility sub-nav (escrow badge + 상품 등록번호). */
export const ListingTopBar: React.FC<ListingTopBarProps> = ({ breadcrumbs, escrowBadge, listingNoLabel, listingNo }) => (
  /* data-component="ProductBreadcrumb" */
  <div className="w-full bg-canvas border-b border-hairline py-space-xs">
    <div className="max-w-7xl mx-auto px-gutter md:px-gutter-desktop flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
      <ListingBreadcrumbs items={breadcrumbs} variant="slash" />
      <div className="flex flex-wrap items-center gap-space-sm text-muted font-caption text-caption">
        <span className="inline-flex items-center gap-1 text-primary-container font-ui-sm text-ui-sm bg-mint-50 px-2 py-0.5 rounded border border-mint-200">
          <Icon className="text-[14px]" name="verified" /> {escrowBadge}
        </span>
        <span className="text-faint">|</span>
        <span>
          {listingNoLabel} <strong className="text-ink font-micro text-micro">{listingNo}</strong>
        </span>
      </div>
    </div>
  </div>
);

export default ListingTopBar;
