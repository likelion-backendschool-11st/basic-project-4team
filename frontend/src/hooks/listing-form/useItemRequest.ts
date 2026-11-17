import { useCallback, useState } from 'react';
import { ApiError } from '../../api/client';
import { createItemRequest } from '../../api/itemRequest';
import {
  ITEM_REQUEST_BODY_MAX,
  ITEM_REQUEST_TITLE_MAX,
  ITEM_REQUEST_URL_MAX,
  itemRequestCopy,
  type SelectOption,
} from '../../data/listingForm';
import { useLoginGate } from '../itemcommunity/useLoginGate';
import type { CategoryTreeApi } from './useCategoryTree';

/** closed = 팝업 없음, editing = 글쓰기, done = 접수 완료 안내. */
export type ItemRequestPhase = 'closed' | 'editing' | 'done';

export interface ItemRequestDefaults {
  readonly main: string;
  readonly sub: string;
  /** 4번 검색창에 입력했던 검색어 — 제목 기본값. */
  readonly title: string;
}

export interface UseItemRequestOptions {
  readonly tree: CategoryTreeApi;
  /** 409 ITEM_ALREADY_EXISTS — 팝업을 닫고 그 품목으로 다시 검색하게 한다. */
  readonly onExistingItem: (name: string, main: string, sub: string) => void;
}

export interface ItemRequestApi {
  readonly phase: ItemRequestPhase;
  readonly main: string;
  readonly sub: string;
  readonly title: string;
  readonly body: string;
  readonly referenceUrl: string;
  readonly mainOptions: readonly SelectOption[];
  readonly subOptions: readonly SelectOption[];
  readonly submitting: boolean;
  readonly error: string | null;
  /** 이미 있는 품목으로 돌려보냈을 때 4번 아래에 띄우는 안내. */
  readonly existingNotice: string | null;
  readonly loginGate: ReturnType<typeof useLoginGate>;
  readonly open: (defaults: ItemRequestDefaults) => void;
  readonly close: () => void;
  readonly setMain: (main: string) => void;
  readonly setSub: (sub: string) => void;
  readonly setTitle: (value: string) => void;
  readonly setBody: (value: string) => void;
  readonly setReferenceUrl: (value: string) => void;
  readonly submit: () => Promise<void>;
}

/** ITEM_ALREADY_EXISTS의 details.item.name. 형식이 다르면 null. */
const existingItemName = (details: unknown): string | null => {
  if (typeof details !== 'object' || details === null || !('item' in details)) return null;
  const { item } = details as { readonly item: unknown };
  if (typeof item !== 'object' || item === null || !('name' in item)) return null;
  const { name } = item as { readonly name: unknown };
  return typeof name === 'string' ? name : null;
};

/** 클라이언트 검사 — 서버 규칙과 같다. 통과하면 null. */
const validate = (categoryId: number | null, title: string, body: string, url: string): string | null => {
  if (categoryId === null) return itemRequestCopy.errors.category;
  if (title.trim().length === 0) return itemRequestCopy.errors.title;
  if (body.trim().length === 0) return itemRequestCopy.errors.body;
  if (url.trim() && !/^https?:\/\/\S+$/i.test(url.trim())) return itemRequestCopy.errors.url;
  return null;
};

/**
 * 판매글 등록 4번 "품목 등록 요청" 팝업 (REQ-POST-005, ITEM-06).
 * 관리자에게 카테고리 + 제목 + 본문(+참고 링크) 글을 보낸다. 비로그인이면 로그인 안내 팝업을 연다.
 */
export const useItemRequest = ({ tree, onExistingItem }: UseItemRequestOptions): ItemRequestApi => {
  const loginGate = useLoginGate();
  const { ensureLogin, prompt: promptLogin } = loginGate;
  const [phase, setPhase] = useState<ItemRequestPhase>('closed');
  const [main, setMainState] = useState('');
  const [sub, setSub] = useState('');
  const [title, setTitleState] = useState('');
  const [body, setBodyState] = useState('');
  const [referenceUrl, setReferenceUrlState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingNotice, setExistingNotice] = useState<string | null>(null);

  const open = useCallback(
    (defaults: ItemRequestDefaults) => {
      if (!ensureLogin()) return;
      setMainState(defaults.main);
      setSub(defaults.sub || (tree.subOptionsOf(defaults.main)[0]?.value ?? ''));
      setTitleState(defaults.title.trim().slice(0, ITEM_REQUEST_TITLE_MAX));
      setBodyState('');
      setReferenceUrlState('');
      setError(null);
      setExistingNotice(null);
      setPhase('editing');
    },
    [ensureLogin, tree],
  );

  const close = useCallback(() => {
    if (!submitting) setPhase('closed');
  }, [submitting]);

  const setMain = useCallback(
    (value: string) => {
      setMainState(value);
      setSub(tree.subOptionsOf(value)[0]?.value ?? '');
    },
    [tree],
  );

  const setTitle = useCallback((value: string) => setTitleState(value.slice(0, ITEM_REQUEST_TITLE_MAX)), []);
  const setBody = useCallback((value: string) => setBodyState(value.slice(0, ITEM_REQUEST_BODY_MAX)), []);
  const setReferenceUrl = useCallback((value: string) => setReferenceUrlState(value.slice(0, ITEM_REQUEST_URL_MAX)), []);

  const submit = useCallback(async () => {
    const categoryId = tree.subIdOf(sub);
    const invalid = validate(categoryId, title, body, referenceUrl);
    if (invalid || categoryId === null) {
      setError(invalid);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createItemRequest({
        categoryId,
        title: title.trim(),
        body: body.trim(),
        referenceUrl: referenceUrl.trim() || null,
      });
      setPhase('done');
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setError(itemRequestCopy.errors.failed);
      } else if (err.status === 401) {
        setPhase('closed');
        promptLogin();
      } else if (err.code === 'ITEM_ALREADY_EXISTS') {
        const name = existingItemName(err.details) ?? title.trim();
        setPhase('closed');
        setExistingNotice(itemRequestCopy.existingNotice(name));
        onExistingItem(name, main, sub);
      } else if (err.code === 'ITEM_REQUEST_DUPLICATE') {
        setError(itemRequestCopy.errors.duplicate);
      } else if (err.status === 0) {
        setError(itemRequestCopy.errors.network);
      } else if (err.status === 400 || err.status === 404) {
        setError(err.message);
      } else {
        setError(itemRequestCopy.errors.failed);
      }
    } finally {
      setSubmitting(false);
    }
  }, [tree, sub, main, title, body, referenceUrl, promptLogin, onExistingItem]);

  return {
    phase,
    main,
    sub,
    title,
    body,
    referenceUrl,
    mainOptions: tree.mainOptions,
    subOptions: tree.subOptionsOf(main),
    submitting,
    error,
    existingNotice,
    loginGate,
    open,
    close,
    setMain,
    setSub,
    setTitle,
    setBody,
    setReferenceUrl,
    submit,
  };
};
