import React, { useRef } from 'react';
import type { AppNotification } from '../../api/layout';
import { headerData, notificationCopy as copy } from '../../data/layout';
import { useDismiss } from '../../hooks/layout/useDismiss';
import type { NotificationsState } from '../../hooks/layout/useNotifications';
import { formatPrice, formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { Icon } from '../common/Icon';
import { HeaderCountBadge } from './HeaderCountBadge';

interface NotificationMenuProps {
  readonly state: NotificationsState;
}

interface NotificationRowProps {
  readonly notification: AppNotification;
  readonly onSelect: (n: AppNotification) => void;
}

/** 알림 한 건의 제목·부가 설명. */
const describe = (n: AppNotification): { readonly title: string; readonly detail: string | null } => {
  const actor = n.actor?.nickname ?? copy.unknownActor;
  if (n.type === 'comment') return { title: copy.comment(actor), detail: n.comment?.excerpt ?? null };
  if (n.type === 'reply') return { title: copy.reply(actor), detail: n.comment?.excerpt ?? null };
  const down = (n.newPrice ?? 0) < (n.oldPrice ?? 0);
  const price = n.oldPrice !== null && n.newPrice !== null ? copy.priceChange(formatPrice(n.oldPrice), formatPrice(n.newPrice)) : '';
  return { title: down ? copy.priceDown : copy.priceUp, detail: [n.listing?.title, price].filter(Boolean).join(' · ') };
};

const NotificationRow: React.FC<NotificationRowProps> = ({ notification: n, onSelect }) => {
  const { title, detail } = describe(n);
  return (
    <li>
      <button
        className={`w-full text-left flex gap-space-sm px-space-md py-space-sm hover:bg-canvas-soft transition-colors ${
          n.isRead ? '' : 'bg-mint-50'
        }`}
        onClick={() => onSelect(n)}
        type="button"
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            n.type === 'price_change' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-mint-100 text-forest'
          }`}
        >
          <Icon className="text-[18px]" name={copy.icons[n.type]} />
        </span>
        <span className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className={`font-body-sm text-body-sm ${n.isRead ? 'text-on-surface-variant' : 'text-ink font-bold'}`}>{title}</span>
          {detail && <span className="font-caption text-caption text-muted truncate">{detail}</span>}
          <span className="font-micro text-micro text-muted">{formatTimeAgo(n.createdAt)}</span>
        </span>
        {!n.isRead && <span aria-hidden className="w-2 h-2 rounded-full bg-primary-container mt-1.5 shrink-0" />}
      </button>
    </li>
  );
};

/** 헤더 알림 버튼 + 드롭다운 (REQ-HEADER-005). 댓글·답글·찜한 상품 가격 변동. */
export const NotificationMenu: React.FC<NotificationMenuProps> = ({ state }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss(state.open, rootRef, state.close);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={state.open}
        aria-haspopup="true"
        aria-label={copy.title}
        className="relative p-2 rounded hover:bg-canvas-soft text-body hover:text-ink transition-colors flex items-center gap-1 font-ui-sm text-ui-sm"
        onClick={state.toggle}
        type="button"
      >
        <Icon className="text-[20px]" name="notifications" />
        <span className="hidden md:inline">{headerData.alertLabel}</span>
        <HeaderCountBadge count={state.unreadCount} />
      </button>

      {state.open && (
        <div className="absolute right-0 top-full mt-1 w-[min(22rem,calc(100vw-2rem))] bg-canvas border border-hairline rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-space-md h-11 border-b border-hairline">
            <span className="font-ui-label text-ui-label text-ink">{copy.title}</span>
            <button
              className="font-caption text-caption text-link hover:underline disabled:text-muted disabled:no-underline"
              disabled={state.unreadCount === 0}
              onClick={() => void state.readAll()}
              type="button"
            >
              {copy.readAll}
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {state.status === 'loading' && state.items.length === 0 && (
              <p className="py-space-lg text-center font-body-sm text-body-sm text-muted">{copy.loading}</p>
            )}
            {state.status === 'error' && (
              <div className="py-space-lg flex flex-col items-center gap-space-xs">
                <p className="font-body-sm text-body-sm text-muted">{copy.error}</p>
                <button className="font-ui-sm text-ui-sm text-link hover:underline" onClick={() => void state.retry()} type="button">
                  {copy.retry}
                </button>
              </div>
            )}
            {state.status === 'success' && state.items.length === 0 && (
              <p className="py-space-lg text-center font-body-sm text-body-sm text-muted">{copy.empty}</p>
            )}
            {state.items.length > 0 && state.status !== 'error' && (
              <ul className="divide-y divide-hairline">
                {state.items.map((n) => (
                  <NotificationRow key={n.id} notification={n} onSelect={state.select} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
