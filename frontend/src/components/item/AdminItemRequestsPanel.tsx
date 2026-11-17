import React from 'react';
import type { AdminItemRequest, ItemRequestStatus } from '../../api/types';
import { adminItemRequestsCopy as copy, myItemRequestsCopy } from '../../data/item';
import { ROUTES } from '../../data/layout';
import { CARD_CATEGORY_CODE } from '../../data/search';
import { useAdminItemRequests, type OpenForm, type ProcessMode } from '../../hooks/item/useAdminItemRequests';
import { formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { useCategoryTree } from '../../hooks/listing-form/useCategoryTree';
import { Icon } from '../common/Icon';
import { MyEmptyState } from '../mypage/MyEmptyState';
import { MyListShell } from '../mypage/MyListShell';
import { ItemRequestProcessForm } from './ItemRequestProcessForm';
import { ItemRequestSummary } from './ItemRequestSummary';

interface AdminItemRequestsPanelProps {
  readonly className?: string;
}

interface StatusFilterProps {
  readonly value: ItemRequestStatus | null;
  readonly onChange: (value: ItemRequestStatus | null) => void;
}

interface AdminRequestRowProps {
  readonly request: AdminItemRequest;
  readonly openForm: OpenForm | null;
  readonly isCard: boolean;
  readonly onOpen: (requestId: number, mode: ProcessMode) => void;
  readonly onClose: () => void;
  readonly onProcessed: (message: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => (
  <div aria-label={copy.filterAria} className="flex flex-wrap gap-1.5" role="group">
    {copy.filters.map((filter) => {
      const active = filter.value === value;
      return (
        <button
          aria-pressed={active}
          className={`px-space-sm py-1.5 rounded-[9999px] font-ui-sm text-ui-sm border transition-colors ${
            active ? 'bg-ink text-canvas border-ink' : 'bg-canvas text-body border-hairline-strong hover:bg-canvas-soft'
          }`}
          key={filter.label}
          onClick={() => onChange(filter.value)}
          type="button"
        >
          {filter.label}
        </button>
      );
    })}
  </div>
);

const AdminRequestRow: React.FC<AdminRequestRowProps> = ({ request, openForm, isCard, onOpen, onClose, onProcessed }) => {
  const formMode = openForm?.requestId === request.id ? openForm.mode : null;
  return (
    <li className="border-b border-hairline py-space-sm px-1">
      <div className="flex flex-col sm:flex-row sm:items-start gap-space-sm">
        <div className="flex-1 min-w-0">
          <ItemRequestSummary
            meta={
              <>
                <span>{copy.requester(request.requester.nickname)}</span>
                <span>{myItemRequestsCopy.requestedAt(formatTimeAgo(request.createdAt))}</span>
                {request.processedAt && <span>{myItemRequestsCopy.processedAt(formatTimeAgo(request.processedAt))}</span>}
              </>
            }
            request={request}
          />
          {request.item && (
            <span className="mt-1 flex items-center gap-0.5 font-caption text-caption text-forest">
              <Icon className="text-[14px]" name="link" />
              {copy.linkedItem(request.item.name, request.item.id)}
            </span>
          )}
          {request.status === 'rejected' && request.rejectReason && (
            <p className="mt-1 font-caption text-caption text-muted whitespace-pre-line">
              {`${myItemRequestsCopy.rejectedLabel} · ${request.rejectReason}`}
            </p>
          )}
        </div>
        {request.status === 'pending' && formMode === null && (
          <div className="flex gap-space-xs shrink-0">
            <button
              className="border border-hairline-strong text-body font-ui-sm text-ui-sm px-3 py-1.5 rounded hover:bg-canvas-soft transition-colors"
              onClick={() => onOpen(request.id, 'reject')}
              type="button"
            >
              {copy.reject}
            </button>
            <button
              className="bg-primary-container text-on-primary font-ui-sm text-ui-sm px-3 py-1.5 rounded hover:bg-forest transition-colors"
              onClick={() => onOpen(request.id, 'approve')}
              type="button"
            >
              {copy.approve}
            </button>
          </div>
        )}
      </div>
      {formMode && (
        <ItemRequestProcessForm
          isCard={isCard}
          mode={formMode}
          onCancel={onClose}
          onProcessed={onProcessed}
          request={request}
        />
      )}
    </li>
  );
};

/** 관리자 마이페이지 "품목 요청 관리" 탭 — 승인하면 공식 품목이 생겨 바로 품목 검색에 나온다 (ITEM-08·09). */
export const AdminItemRequestsPanel: React.FC<AdminItemRequestsPanelProps> = ({ className = '' }) => {
  const { status, setStatus, list, openForm, open, close, notice, onProcessed } = useAdminItemRequests();
  const tree = useCategoryTree();
  return (
    <div className={className}>
      {notice && (
        <p className="mb-space-sm p-space-sm rounded bg-mint-50 font-caption text-caption text-forest" role="status">
          {notice}
        </p>
      )}
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState actionLabel={copy.emptyAction} actionTo={ROUTES.sell} body={copy.emptyBody} icon="inbox" title={copy.emptyTitle} />
        }
        toolbar={<StatusFilter onChange={setStatus} value={status} />}
      >
        {list.items.map((request) => (
          <AdminRequestRow
            isCard={tree.parentOf(request.category.code) === CARD_CATEGORY_CODE}
            key={request.id}
            onClose={close}
            onOpen={open}
            onProcessed={onProcessed}
            openForm={openForm}
            request={request}
          />
        ))}
      </MyListShell>
    </div>
  );
};

export default AdminItemRequestsPanel;
