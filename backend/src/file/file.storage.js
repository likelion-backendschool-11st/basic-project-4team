const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const express = require('express');
const env = require('../config/env');

/**
 * 파일(이미지) 서버 — 업로드 파일의 저장 위치·공개 URL·정적 서빙을 한곳에서 정한다 (#16).
 *
 * 저장 위치: env.uploadDir (기본 backend/uploads, git 제외)
 *   listings/  판매글 사진·실물 인증 사진 (UPLOAD-01, webp로 리사이즈)
 *   posts/     토론글 사진 (UPLOAD-02)
 *   chat/      채팅 사진 (UPLOAD-03)
 *   seed/      npm run db:seed가 복사하는 시드 사진 — 정리 작업이 지우지 않는다
 * 공개 경로: GET /uploads/<폴더>/<파일명>
 */

const PUBLIC_PATH = '/uploads';
const UPLOAD_DIRS = Object.freeze({ listings: 'listings', posts: 'posts', chat: 'chat' });
/** 사용자가 올린 파일만 있는 폴더. 정리 작업은 이 폴더 안의 파일만 지운다. */
const USER_UPLOAD_DIRS = Object.freeze(Object.values(UPLOAD_DIRS));
/** 서버가 만드는 파일명 규칙 (랜덤 UUID + 이미지 확장자). 이 모양이 아니면 지우지 않는다. */
const STORED_FILE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** 업로드 폴더를 만든다. 서버 시작 시 1번 호출한다. */
function ensureUploadDirs() {
  for (const dir of USER_UPLOAD_DIRS) fs.mkdirSync(dirPath(dir), { recursive: true });
}

/** 폴더(UPLOAD_DIRS 값)의 디스크 경로. */
function dirPath(dir) {
  return path.join(env.uploadDir, dir);
}

/** DB·응답에 저장하는 상대 URL (/uploads/posts/xxx.jpg). */
function relativeUrl(dir, fileName) {
  return `${PUBLIC_PATH}/${dir}/${fileName}`;
}

/** 프론트(다른 포트)가 <img src>로 바로 쓰는 절대 URL (http://127.0.0.1:4000/uploads/...). */
function absoluteUrl(dir, fileName) {
  return `${env.publicBaseUrl}${relativeUrl(dir, fileName)}`;
}

/**
 * 이미지 URL(절대·상대 모두) → { dir, fileName, filePath }.
 * 사용자 업로드 폴더 안의, 서버가 만든 이름의 파일이 아니면 null — 시드 사진·외부 URL·경로 조작을 걸러낸다.
 */
function parseUploadedUrl(url) {
  if (typeof url !== 'string') return null;
  let pathname;
  try {
    pathname = new URL(url, 'http://localhost').pathname;
  } catch {
    return null;
  }
  const parts = pathname.split('/');
  // ['', 'uploads', dir, fileName]
  if (parts.length !== 4 || parts[0] !== '' || `/${parts[1]}` !== PUBLIC_PATH) return null;
  const [, , dir, fileName] = parts;
  if (!USER_UPLOAD_DIRS.includes(dir) || !STORED_FILE_NAME.test(fileName)) return null;
  return { dir, fileName, filePath: path.join(dirPath(dir), fileName) };
}

/** 업로드 파일 1개를 지운다. 이미 없으면 false, 사용자 업로드 파일이 아니면 지우지 않고 false. */
async function removeUploadedFile(url) {
  const parsed = parseUploadedUrl(url);
  if (!parsed) return false;
  try {
    await fsp.unlink(parsed.filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

/**
 * GET /uploads/* 정적 서빙 미들웨어.
 * 파일명이 랜덤 UUID라 내용이 바뀌지 않으므로 오래 캐시해도 되고, 목록 노출 없이 경로로만 접근한다.
 */
function serveUploads() {
  return express.static(env.uploadDir, {
    maxAge: '7d',
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  });
}

module.exports = {
  PUBLIC_PATH,
  UPLOAD_DIRS,
  USER_UPLOAD_DIRS,
  STORED_FILE_NAME,
  ensureUploadDirs,
  dirPath,
  relativeUrl,
  absoluteUrl,
  parseUploadedUrl,
  removeUploadedFile,
  serveUploads,
};
