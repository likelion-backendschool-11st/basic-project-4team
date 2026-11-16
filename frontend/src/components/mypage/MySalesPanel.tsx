import React from 'react';
import { Link } from 'react-router-dom';
import type { MyListing } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { myListCopy, mySalesCopy as copy } from '../../data/mypage';
import { formatDate, formatPrice } from '../../hooks/listing/listingViewHelpers';
import { useMySales } from '../../hooks/mypage/useMyLists';
import { MyEmptyState } from './MyEmptyState';
import { MyListShell } from './MyListShell';
import { MyStatusBadge } from './MyStatusBadge';
import { MyThumbnail } from './MyThumbnail';

interface MySalesPanelProps {
  readonly className?: string;
}

interface SaleRowProps {
  readonly listing: MyListing;
}

const SaleRow: React.FC<SaleRowProps> = ({ listing }) => {
  const sold = listing.status === 'sold';
  return (
    <li className="border-b border-hairline">
      <Link
        className="flex items-center gap-space-sm py-space-sm px-1 hover:bg-canvas-soft transition-colors group"
        to={ROUTES.myListingDetail(String(listing.listingId))}
      >
        <MyThumbnail alt={listing.title} dimmed={sold} url={listing.thumbnailUrl} />
        <span className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="flex items-center gap-1.5 min-w-0">
            <MyStatusBadge status={listing.status} />
            <span className="font-micro text-micro text-muted truncate">{listing.itemName}</span>
          </span>
          <span className="font-body-sm text-body-sm text-ink truncate group-hover:underline">{listing.title}</span>
          <span className="font-micro text-micro text-muted">
            {copy.createdAt(formatDate(listing.createdAt))} · {copy.views(listing.viewCount)} · {copy.wishes(listing.wishCount)}
          </span>
        </span>
        <span className="flex flex-col items-end shrink-0 gap-0.5">
          <span className={`font-ui-label text-ui-label ${sold ? 'text-muted line-through' : 'text-ink'}`}>
            {myListCopy.won(formatPrice(listing.price))}
          </span>
          {sold && listing.soldPrice !== null && (
            <span className="font-micro text-micro text-primary font-bold">{copy.soldPrice(formatPrice(listing.soldPrice))}</span>
          )}
        </span>
      </Link>
    </li>
  );
};

/** 판매 내역 탭 — 상태 필터 + 내 판매글. 누르면 판매자용 상세(P-013). */
export const MySalesPanel: React.FC<MySalesPanelProps> = ({ className = '' }) => {
  const { status, setStatus, list } = useMySales();
  const toolbar = (
    <div aria-label={copy.filterAria} className="flex flex-wrap gap-1.5" role="group">
      {copy.filters.map((filter) => {
        const active = filter.value === status;
        return (
          <button
            aria-pressed={active}
            className={`px-space-sm py-1.5 rounded-[9999px] font-ui-sm text-ui-sm border transition-colors ${
              active ? 'bg-ink text-canvas border-ink' : 'bg-canvas text-body border-hairline-strong hover:bg-canvas-soft'
            }`}
            key={filter.label}
            onClick={() => setStatus(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
  return (
    <div className={className}>
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState actionLabel={copy.emptyAction} actionTo={ROUTES.sell} body={copy.emptyBody} icon="sell" title={copy.emptyTitle} />
        }
        toolbar={toolbar}
      >
        {list.items.map((listing) => (
          <SaleRow key={listing.listingId} listing={listing} />
        ))}
      </MyListShell>
    </div>
  );
};

export default MySalesPanel;
