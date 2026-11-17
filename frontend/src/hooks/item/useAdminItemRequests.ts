import { useCallback, useState } from 'react';
import { getAdminItemRequests } from '../../api/itemRequest';
import type { ItemRequestStatus } from '../../api/types';
import { myListCopy } from '../../data/mypage';
import { usePagedList } from '../mypage/usePagedList';

export type ProcessMode = 'approve' | 'reject';

/** 처리 폼을 연 요청 — 한 번에 하나만 연다. */
export interface OpenForm {
  readonly requestId: number;
  readonly mode: ProcessMode;
}

/**
 * 관리자 "품목 요청 관리" 탭 (ITEM-08). 기본은 검토 중인 요청(오래된 순).
 * 처리가 끝나면 목록을 다시 불러온다 — 같은 제목으로 함께 승인된 요청도 목록에서 빠지게.
 */
export const useAdminItemRequests = () => {
  const [status, setStatusState] = useState<ItemRequestStatus | null>('pending');
  const [openForm, setOpenForm] = useState<OpenForm | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchPage = useCallback(
    (query: { page: number; size: number }) => getAdminItemRequests({ ...query, status: status ?? undefined }),
    [status],
  );
  const list = usePagedList({
    fetchPage,
    resetKey: status ?? 'all',
    pageSize: myListCopy.pageSize,
    windowSize: myListCopy.windowSize,
  });
  const { reload } = list;

  const setStatus = useCallback((next: ItemRequestStatus | null) => {
    setStatusState(next);
    setOpenForm(null);
    setNotice(null);
  }, []);

  const open = useCallback((requestId: number, mode: ProcessMode) => {
    setOpenForm({ requestId, mode });
    setNotice(null);
  }, []);

  const close = useCallback(() => setOpenForm(null), []);

  /** 처리 폼이 성공했을 때: 안내를 띄우고 폼을 닫고 목록을 새로 고친다. */
  const onProcessed = useCallback(
    (message: string) => {
      setNotice(message);
      setOpenForm(null);
      reload();
    },
    [reload],
  );

  return { status, setStatus, list, openForm, open, close, notice, onProcessed };
};

export default useAdminItemRequests;
