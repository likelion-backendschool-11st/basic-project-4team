import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListingStatus } from '../../data/listing';
import type { ShowToast } from './useToast';

export interface ListingStatusMessages {
  readonly statusChanged: (status: string) => string;
  readonly deleted: string;
  readonly dealCompleted: (price: string) => string;
}

/**
 * Seller management state: status dropdown, delete-confirm modal and
 * deal-complete (거래완료 & 시세 반영) modal.
 */
export const useListingStatus = (
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  const selectStatus = useCallback(
    (next: ListingStatus) => {
      setStatus(next);
      setMenuOpen(false);
      notify?.(messages.statusChanged(next));
    },
    [notify, messages],
  );

  const openDeal = useCallback(() => {
    setMenuOpen(false);
    setDealOpen(true);
  }, []);
  const closeDeal = useCallback(() => setDealOpen(false), []);
  const submitDeal = useCallback(() => {
    setDealOpen(false);
    setStatus('거래완료');
    notify?.(messages.dealCompleted(finalPrice));
  }, [finalPrice, notify, messages]);

  const openDelete = useCallback(() => setDeleteOpen(true), []);
  const closeDelete = useCallback(() => setDeleteOpen(false), []);
  const confirmDelete = useCallback(() => {
    setDeleteOpen(false);
    notify?.(messages.deleted, 'delete');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1200);
  }, [notify, messages]);

  return {
    status,
    menuOpen,
    menuRef,
    toggleMenu,
    selectStatus,
    deleteOpen,
    openDelete,
    closeDelete,
    confirmDelete,
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
