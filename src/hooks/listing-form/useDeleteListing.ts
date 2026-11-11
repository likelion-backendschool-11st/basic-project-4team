import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import { submitCopy } from '../../data/listingForm';

/** Confirm-then-delete for the edit page (mock: navigates home). */
export const useDeleteListing = (): (() => void) => {
  const navigate = useNavigate();
  return useCallback(() => {
    if (window.confirm(submitCopy.edit.deleteConfirm)) navigate(ROUTES.home);
  }, [navigate]);
};
