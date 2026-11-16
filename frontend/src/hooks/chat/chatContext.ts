import { createContext } from 'react';
import type { ChatRoom } from '../../api/types';

/** 채팅 창이 무엇을 보여주는지. room: fromList면 "목록으로" 버튼을 보여준다. */
export type ChatView =
  | { readonly kind: 'closed' }
  | { readonly kind: 'list' }
  | { readonly kind: 'room'; readonly roomId: number; readonly initialRoom: ChatRoom | null; readonly fromList: boolean };

/** 판매글에서 채팅을 시작한 결과. login: 로그인 팝업, message: 토스트로 보여줄 문구. */
export type StartChatOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'login' | 'message'; readonly message: string };

export interface ChatContextValue {
  readonly view: ChatView;
  /** 헤더 배지 — 모든 방의 안 읽은 메시지 수. */
  readonly unreadCount: number;
  readonly setUnreadCount: (count: number) => void;
  readonly openList: () => void;
  readonly openRoom: (room: ChatRoom, fromList: boolean) => void;
  /** 판매글 상세 "1:1 채팅하기" — 방을 만들거나 기존 방을 열어 채팅 창을 띄운다. */
  readonly startChat: (listingId: number) => Promise<StartChatOutcome>;
  readonly close: () => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);
