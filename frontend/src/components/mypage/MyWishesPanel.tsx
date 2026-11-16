import React from 'react';
import { Link } from 'react-router-dom';
import type { MyWish } from '../../api/layout';
import { ROUTES } from '../../data/layout';
import { myListCopy, myWishesCopy as copy } from '../../data/mypage';
import { formatPrice, formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { useMyWishes } from '../../hooks/mypage/useMyLists';
import { Icon } from '../common/Icon';
import { MyEmptyState } from './MyEmptyState';
import { MyListShell } from './MyListShell';
import { MyStatusBadge } from './MyStatusBadge';
import { MyThumbnail } from './MyThumbnail';

interface MyWishesPanelProps {
  /** 찜을 해제해 숫자가 바뀌었을 때. */
  readonly onChanged: () => void;
  readonly className?: string;
}

interface WishRowProps {
  readonly wish: MyWish;
  readonly removing: boolean;
  readonly onRemove: (listingId: number) => void;
}

const WishRow: React.FC<WishRowProps> = ({ wish, removing, onRemove }) => {
  const sold = wish.status === 'sold';
  return (
    <li className="border-b border-hairline flex items-center gap-space-xs">
      <Link
        className="flex items-center gap-space-sm py-space-sm px-1 flex-1 min-w-0 hover:bg-canvas-soft transition-colors group"
        to={ROUTES.listingDetail(String(wish.listingId))}
      >
        <MyThumbnail alt={wish.title} dimmed={sold} url={wish.thumbnailUrl} />
        <span className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <MyStatusBadge status={wish.status} />
            <span className="font-micro text-micro text-muted truncate">{copy.wishedAt(formatTimeAgo(wish.wishedAt))}</span>
          </span>
          <span className={`font-body-sm text-body-sm truncate group-hover:underline ${sold ? 'text-muted' : 'text-ink'}`}>
            {wish.title}
          </span>
          <span className={`font-ui-label text-ui-label ${sold ? 'text-muted line-through' : 'text-ink'}`}>
            {myListCopy.won(formatPrice(wish.price))}
          </span>
        </span>
      </Link>
      <button
        aria-label={copy.removeLabel(wish.title)}
        className="p-2 rounded-[9999px] text-error hover:bg-canvas-soft transition-colors disabled:opacity-40 shrink-0"
        disabled={removing}
        onClick={() => onRemove(wish.listingId)}
        type="button"
      >
        <Icon className="text-[22px]" filled name="favorite" />
      </button>
    </li>
  );
};

/** 찜한 상품 탭 — 하트를 누르면 찜 해제. */
export const MyWishesPanel: React.FC<MyWishesPanelProps> = ({ onChanged, className = '' }) => {
  const { list, removingId, remove } = useMyWishes(onChanged);
  return (
    <div className={className}>
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState actionLabel={copy.emptyAction} actionTo={ROUTES.search} body={copy.emptyBody} icon="favorite" title={copy.emptyTitle} />
        }
      >
        {list.items.map((wish) => (
          <WishRow key={wish.listingId} onRemove={remove} removing={removingId === wish.listingId} wish={wish} />
        ))}
      </MyListShell>
    </div>
  );
};

export default MyWishesPanel;
