import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

interface MyEmptyStateProps {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
  readonly actionLabel: string;
  readonly actionTo: string;
}

/** 목록이 비었을 때: 아이콘 + 안내 + 이동 버튼. */
export const MyEmptyState: React.FC<MyEmptyStateProps> = ({ icon, title, body, actionLabel, actionTo }) => (
  <div className="py-16 flex flex-col items-center text-center gap-space-xs">
    <span className="w-14 h-14 rounded-[9999px] bg-canvas-soft flex items-center justify-center mb-space-xs">
      <Icon className="text-[28px] text-faint" name={icon} />
    </span>
    <p className="font-ui-label text-ui-label text-ink">{title}</p>
    <p className="font-body-sm text-body-sm text-muted">{body}</p>
    <Link
      className="mt-space-sm border border-hairline-strong text-ink font-ui-sm text-ui-sm px-space-md py-2 rounded hover:bg-canvas-soft transition-colors"
      to={actionTo}
    >
      {actionLabel}
    </Link>
  </div>
);

export default MyEmptyState;
