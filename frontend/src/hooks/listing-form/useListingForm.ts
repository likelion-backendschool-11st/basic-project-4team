import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import {
  MAX_DESCRIPTION,
  NEW_LISTING_ID,
  catalogLookup,
  validationMessages,
  type FormVariant,
  type ListingAttributes,
  type ListingFormValues,
  type ListingPhoto,
} from '../../data/listingForm';
import { firstSubCategory } from './useCategorySelection';

export type ListingErrorKey = keyof typeof validationMessages;
export type ListingErrors = Partial<Record<ListingErrorKey, string>>;

export interface UseListingFormOptions {
  readonly variant: FormVariant;
  /** Listing id (edit mode). Create mode navigates to a mock new id. */
  readonly listingId?: string;
  readonly redirectDelayMs?: number;
}

export interface ListingFormApi {
  readonly values: ListingFormValues;
  readonly errors: ListingErrors;
  readonly submitting: boolean;
  readonly setField: <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => void;
  readonly setAttribute: <K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => void;
  readonly setMainCategory: (main: string) => void;
  readonly setPhotos: (photos: readonly ListingPhoto[]) => void;
  readonly setAuthPhoto: (photo: ListingPhoto | null) => void;
  readonly addPrice: (amount: number) => void;
  readonly searchCatalog: () => void;
  readonly handleSubmit: (e?: React.FormEvent) => void;
}

export const validateListing = (v: ListingFormValues): ListingErrors => {
  const e: ListingErrors = {};
  if (v.photos.length === 0) e.photos = validationMessages.photos;
  if (!v.authPhoto) e.authPhoto = validationMessages.authPhoto;
  if (!v.title.trim()) e.title = validationMessages.title;
  if (v.price <= 0) e.price = validationMessages.price;
  if (v.description.length > MAX_DESCRIPTION) e.description = validationMessages.description;
  if (!v.delivery && !v.direct) e.tradeMethod = validationMessages.tradeMethod;
  if (v.direct && !v.directLocation.trim()) e.directLocation = validationMessages.directLocation;
  if (!v.agreed) e.agreed = validationMessages.agreed;
  return e;
};

/**
 * Controlled state + validation + submit for the listing form.
 * Pass empty values for create, a prefilled listing for edit.
 */
export const useListingForm = (
  initialValues: ListingFormValues,
  { variant, listingId, redirectDelayMs = 1600 }: UseListingFormOptions,
): ListingFormApi => {
  const navigate = useNavigate();
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [errors, setErrors] = useState<ListingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // After the first submit attempt, re-validate live so errors clear as the user fixes them.
  useEffect(() => {
    if (attempted) setErrors(validateListing(values));
  }, [attempted, values]);

  const setField = useCallback(<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setAttribute = useCallback(<K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => {
    setValues((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  }, []);

  const setMainCategory = useCallback((main: string) => {
    setValues((prev) => ({ ...prev, mainCategory: main, subCategory: firstSubCategory(main) }));
  }, []);

  const setPhotos = useCallback((photos: readonly ListingPhoto[]) => {
    setValues((prev) => (prev.photos === photos ? prev : { ...prev, photos }));
  }, []);

  const setAuthPhoto = useCallback((authPhoto: ListingPhoto | null) => {
    setValues((prev) => (prev.authPhoto === authPhoto ? prev : { ...prev, authPhoto }));
  }, []);

  const addPrice = useCallback((amount: number) => {
    setValues((prev) => ({ ...prev, price: prev.price + amount }));
  }, []);

  const searchCatalog = useCallback(() => {
    setValues((prev) => ({ ...prev, catalogMatch: catalogLookup(prev.catalogQuery) }));
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (submitting) return;
      setAttempted(true);
      const nextErrors = validateListing(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      setSubmitting(true);
      const id = variant === 'edit' && listingId ? listingId : NEW_LISTING_ID;
      timer.current = window.setTimeout(() => navigate(ROUTES.myListingDetail(id)), redirectDelayMs);
    },
    [submitting, values, variant, listingId, navigate, redirectDelayMs],
  );

  return {
    values,
    errors,
    submitting,
    setField,
    setAttribute,
    setMainCategory,
    setPhotos,
    setAuthPhoto,
    addPrice,
    searchCatalog,
    handleSubmit,
  };
};
