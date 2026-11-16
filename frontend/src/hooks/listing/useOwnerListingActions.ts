import { useCallback, useEffect, useState } from 'react';
import { sellerDetailCopy, toastMessages } from '../../data/listing';
import { useDeleteListing } from '../listing-form/useDeleteListing';
import type { ShowToast } from './useToast';

// 삭제 완료 토스트를 보여준 뒤 홈으로 이동한다 (P-013과 같은 값).
const DELETE_REDIRECT_MS = 1200;

/**
 * P-010 작성자 관리 버튼 — 삭제 확인 모달 열기/닫기와 삭제(LISTING-05).
 * 성공하면 완료 토스트 후 홈으로, 실패하면 오류 토스트.
 */
export const useOwnerListingActions = (listingId: string, showToast: ShowToast) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const onDeleted = useCallback(() => showToast(toastMessages.deleted, 'delete'), [showToast]);
  const { remove, deleting, deleteError } = useDeleteListing(listingId, {
    onDeleted,
    redirectDelayMs: DELETE_REDIRECT_MS,
  });

  useEffect(() => {
    if (deleteError) showToast(deleteError, sellerDetailCopy.deleteFailedIcon);
  }, [deleteError, showToast]);

  const openDelete = useCallback(() => setDeleteOpen(true), []);
  const closeDelete = useCallback(() => setDeleteOpen(false), []);
  const confirmDelete = useCallback(() => {
    setDeleteOpen(false);
    void remove();
  }, [remove]);

  return { deleteOpen, deleting, openDelete, closeDelete, confirmDelete };
};
