import React from 'react';
import type { MyListingStatus } from '../../api/types';
import { myListCopy } from '../../data/mypage';

interface MyStatusBadgeProps {
  readonly status: MyListingStatus;
}

const statusClass: Readonly<Record<MyListingStatus, string>> = {
  selling: 'bg-mint-100 text-forest',
  reserved: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  sold: 'bg-surface-container-high text-muted',
};

/** 판매중 · 예약중 · 거래완료 뱃지. */
export const MyStatusBadge: React.FC<MyStatusBadgeProps> = ({ status }) => (
  <span className={`font-micro text-micro font-bold px-1.5 py-0.5 rounded shrink-0 ${statusClass[status]}`}>
    {myListCopy.statuses[status]}
  </span>
);

export default MyStatusBadge;
