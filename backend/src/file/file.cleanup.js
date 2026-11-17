const fs = require('fs/promises');
const path = require('path');
const fileStorage = require('./file.storage');
const fileRepository = require('./file.repository');

/** 업로드 후 이 시간 동안 판매글·글·메시지에 연결되지 않으면 버린 사진으로 보고 지운다 (db/spec-gap.md). */
const ORPHAN_AFTER_HOURS = 24;
/** 하루 1번 실행. */
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
/** 서버 시작 직후 DB·메일 확인과 겹치지 않게 조금 늦게 첫 실행. */
const FIRST_RUN_DELAY_MS = 60 * 1000;
const BATCH_SIZE = 200;

/** 한 테이블의 미연결 이미지 행과 파일을 함께 지운다. 지운 행 수를 돌려준다. */
async function cleanupTable(table, olderThanHours) {
  let removed = 0;
  let lastBatch;
  do {
    lastBatch = await fileRepository.findOrphanImages(table, olderThanHours, BATCH_SIZE);
    let removedInBatch = 0;
    for (const { id, url } of lastBatch) {
      if (!(await fileRepository.deleteOrphanImage(table, id))) continue; // 그 사이 연결됨
      removedInBatch += 1;
      // 행을 먼저 지우고 파일을 지운다 — 반대로 하면 실패 시 깨진 이미지 행이 남는다.
      await fileStorage.removeUploadedFile(url).catch((err) => {
        console.error(`[file-cleanup] ${table}#${id} 파일 삭제 실패: ${err.message}`);
      });
    }
    removed += removedInBatch;
    // 한 배치를 다 돌았는데 하나도 못 지웠으면(모두 그 사이 연결) 같은 후보를 반복하지 않게 멈춘다.
    if (removedInBatch === 0) break;
  } while (lastBatch.length === BATCH_SIZE);
  return removed;
}

/**
 * DB 행 없이 디스크에만 남은 업로드 파일을 지운다.
 * (db:seed가 이미지 테이블을 비운 뒤 남은 파일, 저장 직후 DB 등록 전에 서버가 죽은 경우 등)
 * 방금 올라와 아직 DB에 등록 중인 파일을 지우지 않도록 olderThanHours보다 오래된 파일만 본다.
 */
async function cleanupUnreferencedFiles(olderThanHours) {
  const referenced = new Set();
  for (const url of await fileRepository.findAllReferencedUrls()) {
    const parsed = fileStorage.parseUploadedUrl(url);
    if (parsed) referenced.add(`${parsed.dir}/${parsed.fileName}`);
  }

  const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000;
  let removed = 0;
  for (const dir of fileStorage.USER_UPLOAD_DIRS) {
    let names;
    try {
      names = await fs.readdir(fileStorage.dirPath(dir));
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      throw err;
    }
    for (const name of names) {
      if (!fileStorage.STORED_FILE_NAME.test(name) || referenced.has(`${dir}/${name}`)) continue;
      const filePath = path.join(fileStorage.dirPath(dir), name);
      const stat = await fs.stat(filePath).catch(() => null);
      if (!stat?.isFile() || stat.mtimeMs >= cutoff) continue;
      await fs.unlink(filePath).then(() => { removed += 1; }, () => undefined);
    }
  }
  return removed;
}

/** 미연결 이미지 정리 1회. { listing_images, post_images, chat_images, files } 지운 개수를 돌려준다. */
async function cleanupOrphanImages({ olderThanHours = ORPHAN_AFTER_HOURS } = {}) {
  const result = {};
  for (const table of Object.keys(fileRepository.ORPHAN_TABLES)) {
    result[table] = await cleanupTable(table, olderThanHours);
  }
  result.files = await cleanupUnreferencedFiles(olderThanHours);
  return result;
}

function summarize(result) {
  return Object.entries(result).map(([key, count]) => `${key} ${count}`).join(', ');
}

/** 서버가 떠 있는 동안 하루 1번 정리한다. 타이머는 unref라 서버 종료를 막지 않는다. */
function scheduleOrphanCleanup() {
  const run = async () => {
    try {
      const result = await cleanupOrphanImages();
      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      if (total > 0) console.log(`[file-cleanup] 미연결 이미지 정리 — ${summarize(result)}`);
    } catch (err) {
      console.error(`[file-cleanup] 정리 실패: ${err.message}`);
    }
  };
  setTimeout(run, FIRST_RUN_DELAY_MS).unref();
  setInterval(run, CLEANUP_INTERVAL_MS).unref();
}

module.exports = { ORPHAN_AFTER_HOURS, cleanupOrphanImages, scheduleOrphanCleanup, summarize };
