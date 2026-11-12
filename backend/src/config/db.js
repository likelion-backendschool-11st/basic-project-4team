const mysql = require('mysql2/promise');
const env = require('./env');

/** 앱 전체에서 공유하는 MySQL 커넥션 풀. */
const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
});

// DB 서버 시간대(KST 등)와 상관없이 CURRENT_TIMESTAMP·DATETIME을 UTC로 통일한다.
// timezone: 'Z'(드라이버 해석)와 짝이 맞아야 createdAt이 9시간 밀리지 않는다.
pool.pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

module.exports = pool;
