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
};
