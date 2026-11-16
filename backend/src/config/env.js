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

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://127.0.0.1:4173',
  // 업로드 이미지 URL 앞부분. 프론트(다른 포트)가 <img src>로 바로 쓸 수 있게 절대 주소로 저장한다.
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? 'http://127.0.0.1:4000').replace(/\/+$/, ''),
  // 업로드 파일 저장 폴더 (backend/uploads, git 제외)
  uploadDir: path.join(__dirname, '..', '..', 'uploads'),
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'repick',
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
