import type { ChatLastMessage, ChatMessage } from '../../api/types';
import { chatCopy as copy } from '../../data/chat';

const TZ = 'Asia/Seoul';

/** "오후 3:12" */
export const formatChatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('ko-KR', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });

const dayKey = (iso: string): string => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });

/** 메시지 사이에 넣는 날짜 구분선 "2026년 11월 16일 월요일" */
export const formatChatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString('ko-KR', { timeZone: TZ, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

/** 앞 메시지와 날짜가 다르면 true (첫 메시지 포함). */
export const isNewDay = (messages: readonly ChatMessage[], index: number): boolean =>
  index === 0 || dayKey(messages[index - 1].createdAt) !== dayKey(messages[index].createdAt);

/** 목록 시간: 오늘이면 "오후 3:12", 어제면 "어제", 그 전이면 "11월 14일" */
export const formatListTime = (iso: string, now = new Date()): string => {
  const key = dayKey(iso);
  if (key === dayKey(now.toISOString())) return copy.time.today(formatChatTime(iso));
  if (key === dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())) return copy.time.yesterday;
  return new Date(iso).toLocaleDateString('ko-KR', { timeZone: TZ, month: 'long', day: 'numeric' });
};

/** 목록 미리보기: 사진이면 "사진". */
export const previewText = (message: ChatLastMessage | null): string => {
  if (!message) return copy.noMessages;
  return message.type === 'image' ? copy.imagePreview : (message.body ?? '');
};

/** id 순서를 지키며 메시지를 합친다 (REST 응답과 WebSocket 이벤트가 같은 메시지를 두 번 줄 수 있다). */
export const mergeMessages = (current: readonly ChatMessage[], incoming: readonly ChatMessage[]): ChatMessage[] => {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.id - b.id);
};

/** 내 메시지 중 상대가 읽은 마지막 것의 id ("읽음"은 그 메시지 아래에만 표시). */
export const lastReadMineId = (messages: readonly ChatMessage[], myId: number, partnerReadId: number | null): number | null => {
  if (partnerReadId === null) return null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.senderId === myId && m.id <= partnerReadId) return m.id;
  }
  return null;
};
