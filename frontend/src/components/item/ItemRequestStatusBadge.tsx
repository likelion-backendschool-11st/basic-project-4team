import React from 'react';
import type { ItemRequestStatus } from '../../api/types';
import { itemRequestStatusCopy } from '../../data/item';

interface ItemRequestStatusBadgeProps {
  readonly status: ItemRequestStatus;
}

const statusClass: Readonly<Record<ItemRequestStatus, string>> = {
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  approved: 'bg-mint-100 text-forest',
  rejected: 'bg-surface-container-high text-muted',
};

/** 검토 중 · 등록됨 · 반려 뱃지. */
export const ItemRequestStatusBadge: React.FC<ItemRequestStatusBadgeProps> = ({ status }) => (
  <span className={`font-micro text-micro font-bold px-1.5 py-0.5 rounded shrink-0 ${statusClass[status]}`}>
    {itemRequestStatusCopy[status]}
  </span>
);

export default ItemRequestStatusBadge;
