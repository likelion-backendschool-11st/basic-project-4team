import { useCallback, useState } from 'react';
import { discussionComposer as copy } from '../../data/community';
import { usePhotoAttachments } from './usePhotoAttachments';

/** 품목 토론방 글 등록 요청에 실어 보낼 내용. */
export interface DiscussionComposerPayload {
  readonly body: string;
  readonly imageIds: readonly number[];
  /** 희망 체결가(원). 입력하지 않았으면 null. */
  readonly priceTag: number | null;
}

/** "300,000" 같은 입력 → 숫자. 비었거나 숫자가 아니면 null. */
const parsePrice = (value: string): number | null => {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};

/**
 * 품목 토론방 글쓰기 — 본문, 사진(최대 4장, 바로 업로드), 희망 체결가.
 * onSubmit이 true를 돌려주면(등록 성공) 입력을 비운다. ensureLogin()이 false면 업로드·등록하지 않는다.
 */
export const useDiscussionComposer = (
  onSubmit: (payload: DiscussionComposerPayload) => Promise<boolean>,
  ensureLogin: () => boolean,
) => {
  const [text, setTextState] = useState('');
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceInput, setPriceInputState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photos = usePhotoAttachments(ensureLogin, setError);

  const setText = useCallback((value: string) => setTextState(value.slice(0, copy.maxLength)), []);

  /** 숫자만 남기고 천 단위 쉼표를 붙여 보여준다. */
  const setPriceInput = useCallback((value: string) => {
    const price = parsePrice(value);
    setPriceInputState(price === null ? '' : price.toLocaleString('ko-KR'));
  }, []);

  const togglePrice = useCallback(() => {
    setPriceOpen((open) => !open);
    setPriceInputState('');
  }, []);

  const price = priceOpen ? parsePrice(priceInput) : null;
  const priceValid = price === null || (price >= 1 && price <= copy.priceMax);
  const canSubmit = text.trim().length > 0 && !photos.uploading && !submitting;

  const clearPhotos = photos.clear;
  const { imageIds } = photos;
  const submit = useCallback(async () => {
    if (!canSubmit || !ensureLogin()) return false;
    if (!priceValid) {
      setError(copy.priceInvalid);
      return false;
    }
    setSubmitting(true);
    setError(null);
    const ok = await onSubmit({ body: text.trim(), imageIds, priceTag: price });
    setSubmitting(false);
    if (ok) {
      setTextState('');
      setPriceOpen(false);
      setPriceInputState('');
      clearPhotos();
    }
    return ok;
  }, [canSubmit, ensureLogin, priceValid, onSubmit, text, imageIds, price, clearPhotos]);

  return {
    text,
    setText,
    length: text.length,
    images: photos.images,
    addFiles: photos.addFiles,
    removeImage: photos.removeImage,
    photosFull: photos.full,
    uploading: photos.uploading,
    priceOpen,
    togglePrice,
    priceInput,
    setPriceInput,
    price,
    submitting,
    canSubmit,
    submit,
    error,
  };
};
