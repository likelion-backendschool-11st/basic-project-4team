import React from 'react';
import { Link } from 'react-router-dom';
import type { MyPurchase } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { myListCopy, myPurchasesCopy as copy } from '../../data/mypage';
import { formatDate, formatPrice } from '../../hooks/listing/listingViewHelpers';
import { useMyPurchases } from '../../hooks/mypage/useMyLists';
import { MyEmptyState } from './MyEmptyState';
import { MyListShell } from './MyListShell';
import { MyThumbnail } from './MyThumbnail';

interface MyPurchasesPanelProps {
  readonly className?: string;
}

interface PurchaseRowProps {
  readonly purchase: MyPurchase;
}

const PurchaseRow: React.FC<PurchaseRowProps> = ({ purchase }) => {
  const content = (
    <>
      <MyThumbnail alt={purchase.title} dimmed={purchase.isDeleted} url={purchase.thumbnailUrl} />
      <span className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-micro text-micro text-muted truncate">
          {purchase.isDeleted ? copy.deleted : purchase.itemName}
        </span>
        <span className={`font-body-sm text-body-sm truncate ${purchase.isDeleted ? 'text-muted' : 'text-ink group-hover:underline'}`}>
          {purchase.title}
        </span>
        <span className="font-micro text-micro text-muted">
          {copy.soldAt(formatDate(purchase.soldAt))} · {copy.seller(purchase.seller.nickname ?? copy.withdrawnSeller)}
        </span>
      </span>
      <span className="font-ui-label text-ui-label text-ink shrink-0">{myListCopy.won(formatPrice(purchase.soldPrice))}</span>
    </>
  );
  const rowClass = 'flex items-center gap-space-sm py-space-sm px-1';
  return (
    <li className="border-b border-hairline">
      {purchase.isDeleted ? (
        <div className={rowClass}>{content}</div>
      ) : (
        <Link className={`${rowClass} hover:bg-canvas-soft transition-colors group`} to={ROUTES.listingDetail(String(purchase.listingId))}>
          {content}
        </Link>
      )}
    </li>
  );
};

/** 구매 내역 탭 — 내가 구매자인 거래완료 판매글. */
export const MyPurchasesPanel: React.FC<MyPurchasesPanelProps> = ({ className = '' }) => {
  const list = useMyPurchases();
  return (
    <div className={className}>
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState
            actionLabel={copy.emptyAction}
            actionTo={ROUTES.search}
            body={copy.emptyBody}
            icon="shopping_bag"
            title={copy.emptyTitle}
          />
        }
      >
        {list.items.map((purchase) => (
          <PurchaseRow key={purchase.listingId} purchase={purchase} />
        ))}
      </MyListShell>
    </div>
  );
};

export default MyPurchasesPanel;
