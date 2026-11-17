/**
 * npm run files:cleanup — 업로드만 하고 판매글·토론글·채팅에 쓰지 않은 사진을 지금 바로 정리한다 (#16).
 * 서버도 하루 1번 같은 정리를 한다(src/file/file.cleanup.js). 미연결 이미지 행·파일만 지운다.
 *   npm run files:cleanup                 24시간 지난 미연결 이미지
 *   npm run files:cleanup -- --hours=0    시간 상관없이 모든 미연결 이미지 (로컬 확인용)
 */
const pool = require('../src/config/db');
const { ORPHAN_AFTER_HOURS, cleanupOrphanImages, summarize } = require('../src/file/file.cleanup');
const { exitWithHint } = require('./db-common');

function parseHours(argv) {
  const arg = argv.find((a) => a.startsWith('--hours='));
  if (!arg) return ORPHAN_AFTER_HOURS;
  const hours = Number(arg.slice('--hours='.length));
  if (!Number.isInteger(hours) || hours < 0) {
    console.error('❌ --hours는 0 이상의 정수여야 합니다. 예: --hours=24');
    process.exit(1);
  }
  return hours;
}

async function main() {
  const olderThanHours = parseHours(process.argv.slice(2));
  try {
    const result = await cleanupOrphanImages({ olderThanHours });
    console.log(`✅ 미연결 이미지 정리 (${olderThanHours}시간 지난 것) — ${summarize(result)}`);
  } finally {
    await pool.end();
  }
}

main().catch(exitWithHint);
