import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toAssetUrl } from '../../api/client';
import type { MyWish } from '../../api/layout';
import { ROUTES, wishlistDrawerCopy as copy } from '../../data/layout';
import type { WishlistDrawerState } from '../../hooks/layout/useWishlistDrawer';
import { formatPrice, formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { Icon } from '../common/Icon';

interface WishlistDrawerProps {
  readonly state: WishlistDrawerState;
}

interface WishRowProps {
  readonly wish: MyWish;
  readonly removing: boolean;
  readonly onRemove: (listingId: number) => void;
}

const statusClass: Record<MyWish['status'], string> = {
  selling: 'bg-mint-100 text-forest',
  reserved: 'bg-surface-container-high text-on-surface-variant',
  sold: 'bg-surface-container-high text-muted',
};

const WishRow: React.FC<WishRowProps> = ({ wish, removing, onRemove }) => {
  const sold = wish.status === 'sold';
  return (
    <li className="flex items-center gap-space-sm py-space-sm border-b border-hairline last:border-b-0">
      <Link className="flex items-center gap-space-sm flex-1 min-w-0 group" to={ROUTES.listingDetail(String(wish.listingId))}>
        <span className="w-16 h-16 rounded bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center">
          {wish.thumbnailUrl ? (
            <img
              alt={wish.title}
              className={`w-full h-full object-cover ${sold ? 'opacity-50' : ''}`}
              loading="lazy"
              src={toAssetUrl(wish.thumbnailUrl)}
            />
          ) : (
            <Icon className="text-[24px] text-outline" name="image" />
          )}
        </span>
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="flex items-center gap-1">
            <span className={`font-micro text-micro px-1.5 py-0.5 rounded shrink-0 ${statusClass[wish.status]}`}>
              {copy.statuses[wish.status]}
            </span>
            <span className="font-micro text-micro text-muted truncate">{copy.wishedAt(formatTimeAgo(wish.wishedAt))}</span>
          </span>
          <span className={`font-body-sm text-body-sm truncate group-hover:underline ${sold ? 'text-muted' : 'text-ink'}`}>
            {wish.title}
          </span>
          <span className={`font-ui-label text-ui-label ${sold ? 'text-muted line-through' : 'text-ink'}`}>
            {copy.price(formatPrice(wish.price))}
          </span>
        </span>
      </Link>
      <button
        aria-label={copy.removeLabel(wish.title)}
        className="p-2 rounded-full text-error hover:bg-canvas-soft transition-colors disabled:opacity-40 shrink-0"
        disabled={removing}
        onClick={() => onRemove(wish.listingId)}
        type="button"
      >
        <Icon className="text-[22px]" filled name="favorite" />
      </button>
    </li>
  );
};

/** 찜한 상품 사이드바 (REQ-HEADER-010) — 오른쪽에서 열린다. 하트를 누르면 찜 해제. */
export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ state }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { open, close } = state;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!open) return null;
  const firstLoad = state.status === 'loading' && state.items.length === 0;

  return (
    <div className="fixed inset-0 z-[60]">
      <button aria-label={copy.closeLabel} className="absolute inset-0 bg-ink/40 cursor-default" onClick={close} tabIndex={-1} type="button" />
      <aside
        aria-label={copy.title}
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-canvas shadow-xl flex flex-col"
        role="dialog"
      >
        <header className="flex items-center justify-between px-space-md h-14 border-b border-hairline shrink-0">
          <h2 className="font-ui-label text-ui-label text-ink flex items-center gap-1">
            <Icon className="text-[20px] text-error" filled name="favorite" />
            {copy.title}
            {state.totalCount !== null && <span className="text-muted font-normal">{copy.countLabel(state.totalCount)}</span>}
          </h2>
          <button aria-label={copy.closeLabel} className="p-2 rounded hover:bg-canvas-soft" onClick={close} ref={closeRef} type="button">
            <Icon className="text-[22px]" name="close" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-space-md">
          {state.error && (
            <p className="mt-space-sm font-caption text-caption text-error" role="alert">
              {state.error}
            </p>
          )}
          {firstLoad && <p className="py-space-xl text-center font-body-sm text-body-sm text-muted">{copy.loading}</p>}
          {state.status === 'error' && state.items.length === 0 && (
            <div className="py-space-xl flex flex-col items-center gap-space-sm">
              <p className="font-body-sm text-body-sm text-muted">{copy.error}</p>
              <button className="font-ui-sm text-ui-sm text-link hover:underline" onClick={state.retry} type="button">
                {copy.retry}
              </button>
            </div>
          )}
          {state.status === 'success' && state.items.length === 0 && (
            <div className="py-space-section flex flex-col items-center gap-space-xs text-center">
              <Icon className="text-[40px] text-outline" name="heart_plus" />
              <p className="font-ui-label text-ui-label text-ink">{copy.emptyTitle}</p>
              <p className="font-body-sm text-body-sm text-muted">{copy.emptyBody}</p>
              <Link className="mt-space-xs font-ui-sm text-ui-sm text-link hover:underline" to={ROUTES.search}>
                {copy.emptyLink}
              </Link>
            </div>
          )}
          {state.items.length > 0 && (
            <ul>
              {state.items.map((wish) => (
                <WishRow key={wish.listingId} onRemove={state.remove} removing={state.isRemoving(wish.listingId)} wish={wish} />
              ))}
            </ul>
          )}
          {state.hasMore && state.items.length > 0 && (
            <button
              className="w-full my-space-sm py-space-xs rounded border border-hairline font-ui-sm text-ui-sm text-on-surface-variant hover:bg-canvas-soft disabled:opacity-50"
              disabled={state.status === 'loading'}
              onClick={state.loadMore}
              type="button"
            >
              {state.status === 'loading' ? copy.loading : copy.moreLabel}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

export default WishlistDrawer;
