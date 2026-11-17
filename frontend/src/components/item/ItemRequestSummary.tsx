import React from 'react';
import type { ItemRequest } from '../../api/types';
import { myItemRequestsCopy as copy } from '../../data/item';
import { Icon } from '../common/Icon';
import { ItemRequestStatusBadge } from './ItemRequestStatusBadge';

interface ItemRequestSummaryProps {
  readonly request: ItemRequest;
  /** 제목 아래 작은 글씨 줄 (요청 시각, 요청자 등). */
  readonly meta: React.ReactNode;
}

/** 요청 글 한 건 — 상태·카테고리, 제목, 본문, 참고 링크. 회원·관리자 탭 공통. */
export const ItemRequestSummary: React.FC<ItemRequestSummaryProps> = ({ request, meta }) => (
  <div className="min-w-0">
    <span className="flex items-center gap-1.5 mb-1">
      <ItemRequestStatusBadge status={request.status} />
      <span className="font-micro text-micro text-muted truncate">{request.category.name}</span>
    </span>
    <span className="block font-ui-label text-ui-label text-ink break-words">{request.title}</span>
    <span className="block font-body-sm text-body-sm text-body whitespace-pre-line break-words line-clamp-4">{request.body}</span>
    {request.referenceUrl && (
      <a
        className="mt-0.5 inline-flex items-center gap-0.5 font-caption text-caption text-link hover:underline break-all"
        href={request.referenceUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon className="text-[14px]" name="open_in_new" />
        {copy.referenceLink}
      </a>
    )}
    <span className="mt-1 flex flex-wrap items-center gap-x-space-sm font-micro text-micro text-muted">{meta}</span>
  </div>
);

export default ItemRequestSummary;
