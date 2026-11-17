/**
 * npm run db:market — 일별 시세 집계(item_price_daily)를 listings의 거래완료 행으로 다시 만든다 (#48).
 * 데이터는 지우지 않는다. 집계가 어긋났거나 SQL로 직접 거래완료를 넣었을 때 실행한다. 여러 번 실행해도 안전하다.
 */
const { env, connect, exitWithHint } = require('./db-common');
const marketRepository = require('../src/market/market.repository');

/** 커넥션 하나에서 트랜잭션으로 다시 만든다 — 도중에 실패하면 이전 집계가 그대로 남는다. */
async function rebuildMarket(connection) {
  await connection.beginTransaction();
  try {
    const count = await marketRepository.rebuildAll(connection);
    await connection.commit();
    return count;
  } catch (err) {
    await connection.rollback();
    throw err;
  }
}

async function main() {
  const connection = await connect();
  try {
    const count = await rebuildMarket(connection);
    console.log(`✅ DB '${env.db.database}' 일별 시세 집계 ${count}행을 다시 만들었습니다.`);
  } finally {
    await connection.end();
  }
}

if (require.main === module) main().catch(exitWithHint);

module.exports = { rebuildMarket };
