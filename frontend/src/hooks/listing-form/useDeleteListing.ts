import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteListing } from '../../api/listings';
import { ROUTES } from '../../data/layout';
import { editPageCopy, submitCopy } from '../../data/listingForm';
import { toErrorMessage } from './useEditListing';

export interface UseDeleteListingOptions {
  /** 삭제 성공 직후 (예: 완료 토스트). */
  readonly onDeleted?: () => void;
  /** 삭제 후 홈으로 이동하기까지 기다리는 시간. */
  readonly redirectDelayMs?: number;
}

/** 판매글 삭제 (LISTING-05). 성공하면 홈으로 이동하고, 실패하면 deleteError에 문구를 담는다. */
export const useDeleteListing = (listingId: string, { onDeleted, redirectDelayMs = 0 }: UseDeleteListingOptions = {}) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const remove = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListing(listingId);
    } catch (err) {
      setDeleteError(toErrorMessage(err, editPageCopy.deleteError));
      setDeleting(false);
      return;
    }
    onDeleted?.();
    // 삭제된 글이라 뒤로 가기로 돌아오지 않게 기록을 바꾼다.
    timer.current = window.setTimeout(() => navigate(ROUTES.home, { replace: true }), redirectDelayMs);
  }, [deleting, listingId, navigate, onDeleted, redirectDelayMs]);

  /** 수정 화면용: 브라우저 확인창을 띄운 뒤 삭제. */
  const confirmAndRemove = useCallback(() => {
    if (window.confirm(submitCopy.edit.deleteConfirm)) void remove();
  }, [remove]);

  return { deleting, deleteError, remove, confirmAndRemove };
};
