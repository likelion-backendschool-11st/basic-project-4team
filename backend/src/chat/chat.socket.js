const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');
const env = require('../config/env');
const { TOKEN_COOKIE } = require('../middlewares/auth');

/**
 * 채팅 실시간 수신 (CHAT-05) — ws://<서버>/ws/chat
 * 서버 → 클라이언트 이벤트만 보낸다(message·read·unread). 메시지 보내기는 REST(CHAT-04).
 *
 * - 인증: 로그인 쿠키(accessToken). 없거나 만료면 4401로 닫는다.
 * - Origin: CORS_ORIGIN과 다른 사이트의 브라우저 연결은 4403으로 닫는다. 쿠키 인증이라
 *   다른 사이트가 사용자 몰래 연결해 메시지를 엿듣는 것(CSWSH)을 막는다. Origin이 없는 연결(브라우저 아님)은 허용.
 * - 토큰 만료 시각에 4401로 닫는다 — 로그아웃·만료 뒤에도 메시지를 계속 받지 않게.
 */

const PATH = '/ws/chat';
const HEARTBEAT_MS = 30_000;
const CLOSE = { unauthorized: 4401, forbiddenOrigin: 4403 };
// setTimeout의 최대 지연(약 24.8일)
const MAX_TIMEOUT = 2 ** 31 - 1;

/** userId → 열린 소켓들 (탭·기기 여러 개) */
const clients = new Map();

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** 쿠키의 JWT를 검증해 { userId, expiresAt }을 돌려준다. 잘못되면 null. */
function authenticate(req) {
  const token = readCookie(req.headers.cookie, TOKEN_COOKIE);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    return { userId: Number(payload.sub), expiresAt: payload.exp ? payload.exp * 1000 : null };
  } catch {
    return null;
  }
}

function register(userId, ws) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(ws);
}

function unregister(userId, ws) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clients.delete(userId);
}

function onConnection(ws, req) {
  const origin = req.headers.origin;
  if (origin && !env.corsOrigins.includes(origin)) {
    ws.close(CLOSE.forbiddenOrigin, 'forbidden origin');
    return;
  }
  const auth = authenticate(req);
  if (!auth) {
    ws.close(CLOSE.unauthorized, 'unauthorized');
    return;
  }

  const { userId, expiresAt } = auth;
  register(userId, ws);
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  // 클라이언트가 보내는 메시지는 쓰지 않는다 (maxPayload로 크기만 막아 둔다).
  ws.on('message', () => undefined);

  const expiryTimer = expiresAt === null
    ? null
    : setTimeout(() => ws.close(CLOSE.unauthorized, 'token expired'), Math.min(Math.max(expiresAt - Date.now(), 0), MAX_TIMEOUT));

  ws.on('close', () => {
    if (expiryTimer) clearTimeout(expiryTimer);
    unregister(userId, ws);
  });
  ws.on('error', () => undefined);
}

/** HTTP 서버에 /ws/chat WebSocket을 붙인다. server.js에서 한 번 부른다. */
function attach(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname !== PATH) {
      socket.destroy();
      return;
    }
    // 인증 실패도 연결을 받은 뒤 닫는 코드(4401·4403)로 알려준다 — 핸드셰이크를 거절하면 브라우저는 이유를 알 수 없다.
    wss.handleUpgrade(req, socket, head, (ws) => onConnection(ws, req));
  });

  // 응답 없는 연결(네트워크 끊김) 정리
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_MS);
  wss.on('close', () => clearInterval(heartbeat));
  server.on('close', () => wss.close());

  return wss;
}

/** 이 회원의 열린 소켓 모두에 이벤트를 보낸다. 접속 중이 아니면 아무것도 하지 않는다. */
function sendToUser(userId, event) {
  const set = clients.get(userId);
  if (!set) return;
  const data = JSON.stringify(event);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

module.exports = { attach, sendToUser, PATH, CLOSE };
