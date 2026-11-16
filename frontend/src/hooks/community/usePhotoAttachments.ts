import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import { uploadPostImage } from '../../api/community';
import { feedComposer } from '../../data/community';

export interface ComposerImage {
  /** 화면용 키 (업로드 전에는 id가 없다). */
  readonly key: string;
  readonly previewUrl: string;
  /** 업로드가 끝나면 post_images.id. */
  readonly id: number | null;
  readonly status: 'uploading' | 'done' | 'error';
}

const { photo } = feedComposer;
const ACCEPTED_TYPES = photo.accept.split(',');

/** 이미 글에 붙어 있는 사진 (수정 폼 초기값). */
export interface ExistingPhoto {
  readonly id: number;
  readonly url: string;
}

/** 직접 고른 파일의 미리보기(blob:)만 해제한다. 서버 사진 주소는 그대로 둔다. */
const revoke = (url: string) => {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
};

const errorMessage = (e: unknown, fallback: string): string =>
  e instanceof ApiError && e.status !== 0 && e.status < 500 ? e.message : fallback;

/**
 * 토론글 사진 첨부 — 고르는 즉시 POST /uploads/post-images로 올리고 post_images.id를 모은다 (최대 4장).
 * 피드 글쓰기·품목 토론방 글쓰기·글 수정이 함께 쓴다. ensureLogin()이 false면(비로그인) 올리지 않는다.
 * initial: 수정할 때 이미 붙어 있는 사진 — 업로드 완료 상태로 시작한다.
 */
export const usePhotoAttachments = (
  ensureLogin: () => boolean,
  onError: (message: string) => void,
  initial: readonly ExistingPhoto[] = [],
) => {
  const [images, setImages] = useState<readonly ComposerImage[]>(() =>
    initial.map((photo) => ({ key: `saved-${photo.id}`, previewUrl: photo.url, id: photo.id, status: 'done' })),
  );
  const keySeq = useRef(0);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // 미리보기용 blob URL은 화면을 떠날 때 정리한다.
  useEffect(() => () => imagesRef.current.forEach((img) => revoke(img.previewUrl)), []);

  const addFiles = useCallback(
    (files: readonly File[]) => {
      if (files.length === 0 || !ensureLogin()) return;
      const room = photo.max - imagesRef.current.length;
      if (files.length > room) onError(photo.tooMany(photo.max));
      const candidates = files.slice(0, Math.max(room, 0));
      const accepted = candidates.filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= photo.maxBytes);
      if (accepted.length < candidates.length) onError(photo.tooLarge);
      accepted.forEach((file) => {
        const key = `img-${++keySeq.current}`;
        setImages((prev) => [...prev, { key, previewUrl: URL.createObjectURL(file), id: null, status: 'uploading' }]);
        uploadPostImage(file)
          .then((uploaded) =>
            setImages((prev) => prev.map((img) => (img.key === key ? { ...img, id: uploaded.id, status: 'done' } : img))),
          )
          .catch((e: unknown) => {
            onError(errorMessage(e, photo.failed));
            setImages((prev) => prev.map((img) => (img.key === key ? { ...img, status: 'error' } : img)));
          });
      });
    },
    [ensureLogin, onError],
  );

  const removeImage = useCallback((key: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.key === key);
      if (target) revoke(target.previewUrl);
      return prev.filter((img) => img.key !== key);
    });
  }, []);

  const clear = useCallback(() => {
    imagesRef.current.forEach((img) => revoke(img.previewUrl));
    setImages([]);
  }, []);

  return {
    images,
    addFiles,
    removeImage,
    clear,
    uploading: images.some((img) => img.status === 'uploading'),
    full: images.length >= photo.max,
    /** 업로드가 끝난 사진 id (실패한 사진은 뺀다). */
    imageIds: images.flatMap((img) => (img.status === 'done' && img.id !== null ? [img.id] : [])),
  };
};
