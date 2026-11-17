import { useCallback, useState } from 'react';
import { searchCatalogItems } from '../../api/catalog';
import { ApiError } from '../../api/client';
import { processItemRequest } from '../../api/itemRequest';
import type { AdminItemRequest, ItemSummary, NewItemInput, ProcessItemRequestBody } from '../../api/types';
import { adminItemRequestsCopy as copy } from '../../data/item';
import type { ProcessMode } from './useAdminItemRequests';

export type ApproveMode = 'create' | 'link';

export interface NewItemFields {
  readonly name: string;
  readonly setName: string;
  readonly cardNo: string;
  readonly language: string;
  readonly rarity: string;
  readonly imageUrl: string;
}

type LinkStatus = 'idle' | 'loading' | 'ready' | 'error';

const LINK_SEARCH_SIZE = 5;

/** 409 ITEM_ALREADY_EXISTS의 details.item. */
const conflictItemOf = (err: unknown): { readonly id: number; readonly name: string } | null => {
  if (!(err instanceof ApiError) || err.code !== 'ITEM_ALREADY_EXISTS') return null;
  const item = (err.details as { readonly item?: { readonly id: number; readonly name: string } } | undefined)?.item;
  return item ?? null;
};

const toErrorMessage = (err: unknown): string => {
  if (!(err instanceof ApiError)) return copy.errors.failed;
  if (err.status === 403) return copy.errors.forbidden;
  // 400(입력 오류)·404·409는 서버 문구가 구체적이라 그대로 보여준다
  if (err.status === 400 || err.status === 404 || err.status === 409) return err.message;
  return copy.errors.failed;
};

const blankToNull = (value: string): string | null => value.trim() || null;

/**
 * 요청 한 건의 승인·반려 폼 (ITEM-09).
 * 승인은 ① 새 품목 정보를 입력해 등록하거나 ② 기존 품목을 검색해 연결한다. 카드가 아니면 카드 필드는 보내지 않는다.
 */
export const useItemRequestProcess = (
  request: AdminItemRequest,
  mode: ProcessMode,
  isCard: boolean,
  onProcessed: (message: string) => void,
) => {
  const [approveMode, setApproveMode] = useState<ApproveMode>('create');
  const [fields, setFields] = useState<NewItemFields>({
    name: request.title,
    setName: '',
    cardNo: '',
    language: '',
    rarity: '',
    imageUrl: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [linkQuery, setLinkQuery] = useState(request.title);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('idle');
  const [linkResults, setLinkResults] = useState<readonly ItemSummary[]>([]);
  const [linkItemId, setLinkItemId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ readonly id: number; readonly name: string } | null>(null);

  const setField = useCallback((field: keyof NewItemFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  }, []);

  const searchLink = useCallback(() => {
    setLinkStatus('loading');
    searchCatalogItems({ q: linkQuery.trim(), category: request.category.code, size: LINK_SEARCH_SIZE })
      .then((res) => {
        setLinkResults(res.items);
        setLinkStatus('ready');
      })
      .catch(() => setLinkStatus('error'));
  }, [linkQuery, request.category.code]);

  const send = useCallback(
    async (body: ProcessItemRequestBody) => {
      setSubmitting(true);
      setError(null);
      setConflict(null);
      try {
        const res = await processItemRequest(request.id, body);
        if (body.action === 'reject') {
          onProcessed(copy.rejected(request.title));
        } else {
          const base = res.itemCreated ? copy.approvedCreated(request.title) : copy.approvedLinked(request.title);
          const count = res.approvedCount ?? 1;
          onProcessed(count > 1 ? base + copy.approvedTogether(count) : base);
        }
      } catch (err) {
        setConflict(conflictItemOf(err));
        setError(toErrorMessage(err));
        setSubmitting(false);
      }
    },
    [request.id, request.title, onProcessed],
  );

  const submit = useCallback(() => {
    if (mode === 'reject') {
      if (!rejectReason.trim()) {
        setError(copy.errors.reasonRequired);
        return;
      }
      void send({ action: 'reject', rejectReason: rejectReason.trim() });
      return;
    }
    if (approveMode === 'link') {
      if (linkItemId === null) {
        setError(copy.linkSelectRequired);
        return;
      }
      void send({ action: 'approve', itemId: linkItemId });
      return;
    }
    if (!fields.name.trim()) {
      setError(copy.errors.nameRequired);
      return;
    }
    const item: NewItemInput = {
      name: fields.name.trim(),
      setName: isCard ? blankToNull(fields.setName) : null,
      cardNo: isCard ? blankToNull(fields.cardNo) : null,
      language: isCard ? blankToNull(fields.language) : null,
      rarity: isCard ? blankToNull(fields.rarity) : null,
      imageUrl: blankToNull(fields.imageUrl),
    };
    void send({ action: 'approve', item });
  }, [mode, rejectReason, approveMode, linkItemId, fields, isCard, send]);

  /** 새 품목이 기존 품목과 겹쳤을 때: 그 품목에 바로 연결해서 승인. */
  const approveWithConflict = useCallback(() => {
    if (conflict) void send({ action: 'approve', itemId: conflict.id });
  }, [conflict, send]);

  return {
    approveMode,
    setApproveMode,
    fields,
    setField,
    rejectReason,
    setRejectReason,
    linkQuery,
    setLinkQuery,
    linkStatus,
    linkResults,
    linkItemId,
    setLinkItemId,
    searchLink,
    submitting,
    error,
    conflict,
    submit,
    approveWithConflict,
  };
};

export type ItemRequestProcessState = ReturnType<typeof useItemRequestProcess>;

export default useItemRequestProcess;
