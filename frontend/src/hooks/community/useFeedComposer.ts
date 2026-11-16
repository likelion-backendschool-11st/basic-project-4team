import { useCallback, useState } from 'react';
import type { ItemSearchResult } from '../../api/types';
import { feedComposer } from '../../data/community';
import { useItemTagSearch } from './useItemTagSearch';
import { usePhotoAttachments } from './usePhotoAttachments';

export type { ComposerImage } from './usePhotoAttachments';

/** 글 등록 요청에 실어 보낼 내용. */
export interface FeedComposerPayload {
  readonly body: string;
  readonly imageIds: readonly number[];
  readonly itemId: string | null;
  readonly poll: { readonly options: readonly string[]; readonly durationDays: number } | null;
}

const { poll: pollCopy } = feedComposer;

/**
 * 피드 글쓰기 상태 — 본문, 사진(바로 업로드), 투표, 시세 태그.
 * onSubmit이 true를 돌려주면(등록 성공) 입력을 비운다.
 * ensureLogin()이 false면 업로드·등록을 하지 않는다 (비로그인).
 */
export const useFeedComposer = (
  onSubmit: (payload: FeedComposerPayload) => Promise<boolean>,
  ensureLogin: () => boolean,
) => {
  const [text, setText] = useState('');
  const [pollOpen, setPollOpen] = useState(false);
  const [pollOptions, setPollOptions] = useState<readonly string[]>(['', '']);
  const [pollDays, setPollDays] = useState(pollCopy.defaultDuration);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [taggedItem, setTaggedItem] = useState<ItemSearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useItemTagSearch(tagQuery, tagOpen && taggedItem === null);
  const photos = usePhotoAttachments(ensureLogin, setError);

  /* ---------------- 투표 ---------------- */
  const togglePoll = useCallback(() => setPollOpen((open) => !open), []);
  const setPollOption = useCallback(
    (index: number, value: string) =>
      setPollOptions((prev) => prev.map((o, i) => (i === index ? value.slice(0, pollCopy.optionMax) : o))),
    [],
  );
  const addPollOption = useCallback(
    () => setPollOptions((prev) => (prev.length < pollCopy.maxOptions ? [...prev, ''] : prev)),
    [],
  );
  const removePollOption = useCallback(
    (index: number) => setPollOptions((prev) => (prev.length > pollCopy.minOptions ? prev.filter((_, i) => i !== index) : prev)),
    [],
  );
  const trimmedOptions = pollOptions.map((o) => o.trim());
  const pollValid =
    trimmedOptions.every((o) => o.length > 0) && new Set(trimmedOptions).size === trimmedOptions.length;

  /* ---------------- 시세 태그 ---------------- */
  const toggleTag = useCallback(() => setTagOpen((open) => !open), []);
  const selectItem = useCallback((item: ItemSearchResult) => {
    setTaggedItem(item);
    setTagQuery('');
  }, []);
  const clearItem = useCallback(() => setTaggedItem(null), []);

  /* ---------------- 등록 ---------------- */
  const { uploading } = photos;
  // 투표 선택지 검사는 submit에서 해서 오류 문구를 보여준다.
  const canSubmit = text.trim().length > 0 && !uploading && !submitting;

  const clearPhotos = photos.clear;
  const reset = useCallback(() => {
    clearPhotos();
    setText('');
    setPollOpen(false);
    setPollOptions(['', '']);
    setPollDays(pollCopy.defaultDuration);
    setTagOpen(false);
    setTagQuery('');
    setTaggedItem(null);
  }, [clearPhotos]);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    if (pollOpen && !pollValid) {
      setError(pollCopy.invalid);
      return;
    }
    if (!ensureLogin()) return;
    setSubmitting(true);
    setError(null);
    const ok = await onSubmit({
      body: text.trim(),
      imageIds: photos.imageIds,
      itemId: taggedItem?.slug ?? null,
      poll: pollOpen ? { options: trimmedOptions, durationDays: pollDays } : null,
    });
    setSubmitting(false);
    if (ok) reset();
  }, [canSubmit, pollOpen, pollValid, ensureLogin, onSubmit, text, photos.imageIds, taggedItem, trimmedOptions, pollDays, reset]);

  return {
    text,
    setText,
    images: photos.images,
    addFiles: photos.addFiles,
    removeImage: photos.removeImage,
    pollOpen,
    togglePoll,
    pollOptions,
    setPollOption,
    addPollOption,
    removePollOption,
    pollDays,
    setPollDays,
    tagOpen,
    toggleTag,
    tagQuery,
    setTagQuery,
    taggedItem,
    selectItem,
    clearItem,
    searchResults: search.results,
    searchStatus: search.status,
    uploading,
    submitting,
    canSubmit,
    submit,
    error,
  };
};
