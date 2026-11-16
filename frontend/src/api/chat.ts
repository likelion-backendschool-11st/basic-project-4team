import { apiRequest } from './client';
import type { ChatMessagePage, ChatRoom, ChatRoomList, SendChatMessageResult } from './types';

// 채팅 REST — backend/docs/api-spec-all.md 10장. 실시간 수신은 chatSocket.ts.

/** CHAT-01 판매글로 채팅방 열기. 이미 있으면 기존 방. */
export const openChatRoom = (listingId: number): Promise<{ readonly room: ChatRoom }> =>
  apiRequest(`/chat/rooms`, { method: 'POST', body: JSON.stringify({ listingId }) });

/** CHAT-02 내 채팅방 목록 (메시지가 있는 방만, 최근 순) + 전체 안 읽은 수. */
export const getChatRooms = (): Promise<ChatRoomList> => apiRequest('/chat/rooms');

/** CHAT-06 채팅방 하나. */
export const getChatRoom = (roomId: number): Promise<{ readonly room: ChatRoom }> => apiRequest(`/chat/rooms/${roomId}`);

/** CHAT-03 메시지 목록. before를 주면 그보다 이전 메시지. */
export const getChatMessages = (roomId: number, before?: number, size = 30): Promise<ChatMessagePage> =>
  apiRequest(`/chat/rooms/${roomId}/messages?size=${size}${before === undefined ? '' : `&before=${before}`}`);

/** CHAT-04 텍스트 메시지 보내기. */
export const sendChatText = (roomId: number, body: string): Promise<SendChatMessageResult> =>
  apiRequest(`/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ type: 'text', body }) });

/** CHAT-04 사진 메시지 보내기 (uploadChatImage로 받은 id). */
export const sendChatImage = (roomId: number, imageId: number): Promise<SendChatMessageResult> =>
  apiRequest(`/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ type: 'image', imageId }) });

/** CHAT-07 이 방 모두 읽음. 전체 안 읽은 수를 돌려준다. */
export const markChatRoomRead = (roomId: number): Promise<{ readonly unreadCount: number }> =>
  apiRequest(`/chat/rooms/${roomId}/read`, { method: 'PUT' });

/** CHAT-08 전체 안 읽은 수 (헤더 배지). */
export const getChatUnreadCount = (): Promise<{ readonly unreadCount: number }> => apiRequest('/chat/unread-count');

/** UPLOAD-03 채팅 사진 업로드. */
export const uploadChatImage = (file: File): Promise<{ readonly image: { readonly id: number; readonly url: string } }> => {
  const form = new FormData();
  form.append('image', file);
  return apiRequest('/uploads/chat-images', { method: 'POST', body: form });
};
