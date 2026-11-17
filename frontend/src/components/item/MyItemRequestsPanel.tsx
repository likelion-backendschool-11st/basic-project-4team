import React from 'react';
import type { ItemRequest } from '../../api/types';
import { myItemRequestsCopy as copy } from '../../data/item';
import { ROUTES } from '../../data/layout';
import { useMyItemRequests } from '../../hooks/item/useMyItemRequests';
import { formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { MyEmptyState } from '../mypage/MyEmptyState';
import { MyListShell } from '../mypage/MyListShell';
import { ItemRequestSummary } from './ItemRequestSummary';

interface MyItemRequestsPanelProps {
  readonly className?: string;
}

interface RequestRowProps {
  readonly request: ItemRequest;
}

/** 처리 결과 안내 — 등록됨이면 연결된 품목, 반려면 사유. */
const ResultNote: React.FC<RequestRowProps> = ({ request }) => {
  if (request.status === 'approved' && request.item) {
    return <p className="mt-space-xs p-space-sm rounded bg-mint-50 font-caption text-caption text-forest">{copy.approvedHint(request.item.name)}</p>;
  }
  if (request.status === 'rejected') {
    return (
      <p className="mt-space-xs p-space-sm rounded bg-canvas-soft font-caption text-caption text-body whitespace-pre-line">
        <span className="font-bold text-ink">{`${copy.rejectedLabel} · `}</span>
        {request.rejectReason}
      </p>
    );
  }
  return <p className="mt-space-xs font-caption text-caption text-muted">{copy.pendingHint}</p>;
};

const RequestRow: React.FC<RequestRowProps> = ({ request }) => (
  <li className="border-b border-hairline py-space-sm px-1">
    <ItemRequestSummary
      meta={
        <>
          <span>{copy.requestedAt(formatTimeAgo(request.createdAt))}</span>
          {request.processedAt && <span>{copy.processedAt(formatTimeAgo(request.processedAt))}</span>}
        </>
      }
      request={request}
    />
    <ResultNote request={request} />
  </li>
);

/** 마이페이지 "품목 요청" 탭 — 내가 보낸 품목 등록 요청과 처리 결과 (ITEM-07). */
export const MyItemRequestsPanel: React.FC<MyItemRequestsPanelProps> = ({ className = '' }) => {
  const list = useMyItemRequests();
  return (
    <div className={className}>
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState
            actionLabel={copy.emptyAction}
            actionTo={ROUTES.sell}
            body={copy.emptyBody}
            icon="playlist_add"
            title={copy.emptyTitle}
          />
        }
      >
        {list.items.map((request) => (
          <RequestRow key={request.id} request={request} />
        ))}
      </MyListShell>
    </div>
  );
};

export default MyItemRequestsPanel;
