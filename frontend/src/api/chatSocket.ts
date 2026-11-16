import { API_ORIGIN } from './client';
import type { ChatServerEvent } from './types';

/**
 * 채팅 실시간 수신 (CHAT-05) — 앱 전체에서 WebSocket 하나를 같이 쓴다.
 * 로그인하면 start, 로그아웃하면 stop. 끊기면 점점 길게 기다리며 다시 연결한다.
 * 서버가 4401(로그인 없음·만료)·4403(Origin 거절)으로 닫으면 다시 연결하지 않는다.
 *
 * 다시 연결되면 'connected' 이벤트를 보낸다 — 끊긴 동안 놓친 메시지를 화면이 REST로 다시 불러오게.
 */
export type ChatSocketEvent = ChatServerEvent | { readonly type: 'connected' };
type Listener = (event: ChatSocketEvent) => void;

const SOCKET_URL = `${API_ORIGIN.replace(/^http/, 'ws')}/ws/chat`;
const RETRY_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000];
const NO_RETRY_CODES = new Set([4401, 4403]);

const listeners = new Set<Listener>();
let socket: WebSocket | null = null;
let wanted = false;
let attempt = 0;
let retryTimer: number | undefined;

const emit = (event: ChatSocketEvent) => listeners.forEach((listener) => listener(event));

function isServerEvent(value: unknown): value is ChatServerEvent {
  return typeof value === 'object' && value !== null && 'type' in value;
}

function connect() {
  const ws = new WebSocket(SOCKET_URL);
  socket = ws;
  ws.onopen = () => {
    attempt = 0;
    emit({ type: 'connected' });
  };
  ws.onmessage = (e: MessageEvent<string>) => {
    try {
      const data: unknown = JSON.parse(e.data);
      if (isServerEvent(data)) emit(data);
    } catch {
      // 형식이 다른 메시지는 무시
    }
  };
  ws.onclose = (e) => {
    if (socket === ws) socket = null;
    if (!wanted || NO_RETRY_CODES.has(e.code)) return;
    const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
    attempt += 1;
    retryTimer = window.setTimeout(() => {
      if (wanted && !socket) connect();
    }, delay);
  };
}

/** 로그인 상태가 되면 부른다. 이미 연결돼 있으면 아무것도 하지 않는다. */
export function startChatSocket() {
  wanted = true;
  if (!socket) connect();
}

/** 로그아웃하면 부른다. */
export function stopChatSocket() {
  wanted = false;
  window.clearTimeout(retryTimer);
  attempt = 0;
  const ws = socket;
  socket = null;
  ws?.close(1000);
}

/** 이벤트를 받는다. 돌려받은 함수로 그만 받는다. */
export function subscribeChat(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
