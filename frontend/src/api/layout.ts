import { apiRequest } from './client';

// ── 내 찜 목록 (LIST-04) · 찜 해제 (LIST-03) ──────────────────────

export type WishListingStatus = 'selling' | 'reserved' | 'sold';

export interface MyWish {
  readonly listingId: number;
  readonly registrationNo: string | null;
  readonly title: string;
  readonly price: number;
  readonly status: WishListingStatus;
  readonly thumbnailUrl: string | null;
  readonly wishCount: number;
  readonly wishedAt: string;
}

export interface MyWishList {
  readonly items: readonly MyWish[];
  readonly page: number;
  readonly size: number;
  readonly totalCount: number;
}

export const getMyWishes = (page = 1, size = 20): Promise<MyWishList> =>
  apiRequest<MyWishList>(`/users/me/wishes?page=${page}&size=${size}`);

export interface WishState {
  readonly listingId: number;
  readonly isWished: boolean;
  readonly wishCount: number;
}

export const removeWish = (listingId: number): Promise<WishState> =>
  apiRequest<WishState>(`/listings/${listingId}/wishes`, { method: 'DELETE' });

// ── 알림 (NOTI-01~04) ───────────────────────────────────────────

export type NotificationType = 'comment' | 'reply' | 'price_change';

export interface AppNotification {
  readonly id: number;
  readonly type: NotificationType;
  readonly isRead: boolean;
  readonly createdAt: string;
  readonly actor: { readonly id: number; readonly nickname: string } | null;
  readonly post: { readonly id: number; readonly itemId: string | null; readonly board: string } | null;
  readonly comment: { readonly id: number; readonly excerpt: string } | null;
  readonly listing: {
    readonly id: number;
    readonly title: string;
    readonly status: WishListingStatus;
    readonly thumbnailUrl: string | null;
  } | null;
  readonly oldPrice: number | null;
  readonly newPrice: number | null;
}

export interface NotificationList {
  readonly items: readonly AppNotification[];
  readonly unreadCount: number;
}

export const getNotifications = (size = 20): Promise<NotificationList> =>
  apiRequest<NotificationList>(`/notifications?size=${size}`);

export const getUnreadNotificationCount = (): Promise<{ readonly unreadCount: number }> =>
  apiRequest<{ readonly unreadCount: number }>('/notifications/unread-count');

export const markNotificationRead = (id: number): Promise<void> =>
  apiRequest<void>(`/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = (): Promise<void> =>
  apiRequest<void>('/notifications/read-all', { method: 'POST' });
