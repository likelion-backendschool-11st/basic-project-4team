import { useCallback, useEffect, useRef, useState } from 'react';
import { changeListingStatus, completeListing } from '../../api/listings';
import { statusToApi, type ListingStatus } from '../../data/listing';
import { toErrorMessage } from '../listing-form/useEditListing';
import { formatPrice } from './listingViewHelpers';
import type { ShowToast } from './useToast';

export interface ListingStatusMessages {
  readonly statusChanged: (status: string) => string;
  readonly deleted: string;
  readonly dealCompleted: (price: string) => string;
  readonly statusFailed: string;
  readonly dealFailed: string;
  readonly soldLocked: string;
  readonly invalidFinalPrice: string;
}

const MAX_SOLD_PRICE = 1_000_000_000;

/** "295,000원" 같은 입력에서 숫자만 꺼낸다. 올바르지 않으면 null. */
const parsePrice = (value: string): number | null => {
  const digits = value.replace(/[^\d]/g, '');
  const price = Number(digits);
  return digits && Number.isSafeInteger(price) && price >= 1 && price <= MAX_SOLD_PRICE ? price : null;
};

/**
 * 판매자 관리 상태: 상태 드롭다운(LISTING-06), 삭제 확인 모달, 거래완료 모달(LISTING-07).
 * 서버에 저장된 뒤에만 화면 상태를 바꾼다.
 */
export const useListingStatus = (
  listingId: string,
  initialStatus: ListingStatus,
  initialFinalPrice: string,
  messages: ListingStatusMessages,
  notify?: ShowToast,
) => {
  const [status, setStatus] = useState<ListingStatus>(initialStatus);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dealOpen, setDealOpen] = useState(false);
  const [finalPrice, setFinalPrice] = useState(initialFinalPrice);
  const [requestReview, setRequestReview] = useState(true);
  const [pending, setPending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSold = status === '거래완료';

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    // 거래완료는 시세 데이터라 되돌릴 수 없다.
    if (isSold) {
      notify?.(messages.soldLocked, 'lock');
      return;
    }
    setMenuOpen((v) => !v);
  }, [isSold, notify, messages]);

  const selectStatus = useCallback(
    async (next: ListingStatus) => {
      setMenuOpen(false);
      const apiStatus = statusToApi[next];
      // 거래완료는 체결가가 필요해서 모달(submitDeal)로만 처리한다.
      if (next === status || pending || apiStatus === 'sold') return;
      setPending(true);
      try {
        await changeListingStatus(listingId, apiStatus);
        setStatus(next);
        notify?.(messages.statusChanged(next));
      } catch (err) {
        notify?.(toErrorMessage(err, messages.statusFailed), 'error');
      } finally {
        setPending(false);
      }
    },
    [status, pending, listingId, notify, messages],
  );

  const openDeal = useCallback(() => {
    setMenuOpen(false);
    setDealOpen(true);
  }, []);
  const closeDeal = useCallback(() => setDealOpen(false), []);
  const submitDeal = useCallback(async () => {
    if (pending) return;
    const soldPrice = parsePrice(finalPrice);
    if (soldPrice === null) {
      notify?.(messages.invalidFinalPrice, 'error');
      return;
    }
    setPending(true);
    try {
      // 채팅 API가 없어 구매 상대를 고를 수 없으므로 외부 거래(buyerId = null)로 기록한다.
      const result = await completeListing(listingId, { soldPrice, buyerId: null, requestReview });
      setDealOpen(false);
      setStatus('거래완료');
      notify?.(messages.dealCompleted(formatPrice(result.soldPrice)));
    } catch (err) {
      notify?.(toErrorMessage(err, messages.dealFailed), 'error');
    } finally {
      setPending(false);
    }
  }, [pending, finalPrice, listingId, requestReview, notify, messages]);

  const openDelete = useCallback(() => setDeleteOpen(true), []);
  const closeDelete = useCallback(() => setDeleteOpen(false), []);

  return {
    status,
    pending,
    menuOpen,
    menuRef,
    toggleMenu,
    selectStatus,
    deleteOpen,
    openDelete,
    closeDelete,
    dealOpen,
    openDeal,
    closeDeal,
    submitDeal,
    finalPrice,
    setFinalPrice,
    requestReview,
    setRequestReview,
  } as const;
};
