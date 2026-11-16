const fs = require('fs/promises');
const uploadRepository = require('./upload.repository');
const HttpError = require('../utils/HttpError');

// 확장자·Content-Type은 클라이언트가 바꿀 수 있어서 파일 앞부분(시그니처)으로 한 번 더 확인한다.
const SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
};

async function readHead(filePath) {
  const handle = await fs.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(12);
    await handle.read(buffer, 0, 12, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

/** 저장된 업로드 파일을 검사하고 post_images에 등록한다. 이미지가 아니면 파일을 지우고 400. */
async function registerPostImage(uploaderId, file, publicUrl) {
  const head = await readHead(file.path);
  if (!SIGNATURES[file.mimetype]?.(head)) {
    await fs.unlink(file.path).catch(() => undefined);
    throw new HttpError(400, 'INVALID_FILE_TYPE', 'JPG, PNG, WebP 이미지만 올릴 수 있습니다.');
  }
  try {
    return await uploadRepository.createPostImage(uploaderId, publicUrl);
  } catch (err) {
    await fs.unlink(file.path).catch(() => undefined);
    throw err;
  }
}

module.exports = { registerPostImage };
