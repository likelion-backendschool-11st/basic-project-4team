const path = require('path');

// 어느 폴더에서 실행하든 backend/.env를 읽도록 경로를 고정한다.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

/** 필수 환경변수가 없으면 서버를 띄우지 않는다. */
function required(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다. .env.example을 참고하세요.`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

/** 'https://a.com, https://b.com/' → ['https://a.com', 'https://b.com']. 끝의 /는 브라우저 Origin 헤더와 맞추려고 지운다. */
function parseOrigins(value) {
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/**
 * DB_SSL=true면 TLS로 접속한다 (클라우드 MySQL은 대부분 필수).
 * DB_SSL_CA에 CA 인증서(PEM)를 넣으면 그것으로 검증한다. 한 줄 환경변수로 넣을 수 있게 \n 글자를 줄바꿈으로 바꾼다.
 */
function dbSsl() {
  if (process.env.DB_SSL !== 'true') return undefined;
  const ca = process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined;
  return { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false', ...(ca ? { ca } : {}) };
}

module.exports = {
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  // 프론트 주소(들). 쉼표로 여러 개 — 배포 주소 + Vercel 미리보기 주소 등. CORS와 채팅 WebSocket Origin 검사에 쓴다.
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN ?? 'http://127.0.0.1:4173'),
  // 프론트(Vercel)와 API가 다른 사이트면 로그인 쿠키가 SameSite=None이어야 전달된다. 배포(production) 기본값은 none.
  cookieSameSite: process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax'),
  // Render·Railway 같은 프록시 뒤에서 실행할 때 req.secure·req.ip를 프록시 헤더로 판단한다.
  trustProxy: process.env.TRUST_PROXY === 'true' || isProduction,
  // 업로드 이미지 URL 앞부분. 프론트(다른 포트)가 <img src>로 바로 쓸 수 있게 절대 주소로 저장한다.
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? 'http://127.0.0.1:4000').replace(/\/+$/, ''),
  // 업로드 파일 저장 폴더. 기본 backend/uploads (git 제외). 배포 시 서버 재배포에도 남는 폴더로 바꿀 수 있다.
  uploadDir: process.env.UPLOAD_DIR
    ? path.resolve(path.join(__dirname, '..', '..'), process.env.UPLOAD_DIR)
    : path.join(__dirname, '..', '..', 'uploads'),
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'repick',
    ssl: dbSsl(),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  // 아이디·비밀번호 찾기 메일. SMTP_HOST가 비어 있으면 실제로 보내지 않고 서버 콘솔에 내용을 출력한다(로컬 개발용).
  mail: {
    from: process.env.MAIL_FROM || 'RE:PICK <no-reply@repick.dev>',
    smtp: process.env.SMTP_HOST
      ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' } : undefined,
      }
      : null,
  },
};
