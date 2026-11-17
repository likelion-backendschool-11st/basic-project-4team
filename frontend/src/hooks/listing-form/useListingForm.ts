import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ItemSummary } from '../../api/types';
import { ROUTES } from '../../data/layout';
import {
  MAX_DESCRIPTION,
  NEW_LISTING_ID,
  emptyAttributes,
  validationMessages,
  type FormVariant,
  type ListingAttributes,
  type ListingFormValues,
  type ListingPhoto,
} from '../../data/listingForm';

export type ListingErrorKey = keyof typeof validationMessages;
export type ListingErrors = Partial<Record<ListingErrorKey, string>>;

export interface UseListingFormOptions {
  readonly variant: FormVariant;
  /** Listing id (edit mode). 저장 후 기본 이동 위치(내 판매글 상세)에 쓴다. */
  readonly listingId?: string;
  readonly redirectDelayMs?: number;
  /**
   * 실제 저장. 실패하면 화면에 보여줄 문구를 담은 Error를 던진다.
   * 이동할 경로를 돌려주면 저장 후 그 경로로 간다 (등록: 새 판매글 상세 P-010).
   * 돌려주지 않으면 내 판매글 상세(listingId)로 간다 (수정).
   */
  readonly onSubmit?: (values: ListingFormValues) => Promise<string | void>;
}

export interface ListingFormApi {
  readonly values: ListingFormValues;
  readonly errors: ListingErrors;
  readonly submitting: boolean;
  /** 저장이 끝나 상세로 이동하기 직전 (완료 토스트 표시용). */
  readonly saved: boolean;
  /** 서버 저장 실패 문구. */
  readonly submitError: string | null;
  readonly setField: <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => void;
  readonly setAttribute: <K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => void;
  /** 카테고리 변경. 선택해 둔 품목과 카테고리가 달라지면 품목 선택을 풀어준다. */
  readonly setCategory: (main: string, sub: string) => void;
  /** 공식 품목(ITEM-02 검색 결과) 선택 — itemId·카테고리·카드 속성을 채운다. mainCategory는 품목 소분류의 대분류. */
  readonly selectCatalogItem: (item: ItemSummary, mainCategory: string) => void;
  readonly setPhotos: (photos: readonly ListingPhoto[]) => void;
  readonly setAuthPhoto: (photo: ListingPhoto | null) => void;
  readonly addPrice: (amount: number) => void;
  readonly handleSubmit: (e?: React.FormEvent) => void;
}

export const validateListing = (v: ListingFormValues, variant: FormVariant = 'create'): ListingErrors => {
  const e: ListingErrors = {};
  if (v.photos.length === 0) e.photos = validationMessages.photos;
  if (!v.authPhoto) e.authPhoto = validationMessages.authPhoto;
  // 등록은 공식 품목 연결이 필수(LISTING-03 itemId). 수정은 품목을 바꿀 수 없어 검사하지 않는다.
  if (variant === 'create' && v.itemId === null) e.catalog = validationMessages.catalog;
  if (!v.title.trim()) e.title = validationMessages.title;
  if (v.price <= 0) e.price = validationMessages.price;
  if (v.description.length > MAX_DESCRIPTION) e.description = validationMessages.description;
  if (!v.delivery && !v.direct) e.tradeMethod = validationMessages.tradeMethod;
  if (v.direct && !v.directLocation.trim()) e.directLocation = validationMessages.directLocation;
  if (!v.agreed) e.agreed = validationMessages.agreed;
  // 필수 속성 (REQ-POST-010). 상태는 모든 카테고리에서 필수(LISTING-03 condition), 그레이딩이면 업체·등급까지.
  const { condition, gradingService, grade } = v.attributes;
  if (!condition) e.condition = validationMessages.condition;
  else if (condition === 'graded' && (!gradingService || !grade)) e.grading = validationMessages.grading;
  return e;
};

/** 선택한 품목의 표시 이름 — "리자몽 ex SAR (포켓몬 151 #201/165)". */
const toCatalogLabel = (item: ItemSummary): string => {
  const detail = [item.setName, item.cardNo ? `#${item.cardNo}` : null].filter(Boolean).join(' ');
  return detail ? `${item.name} (${detail})` : item.name;
};

/**
 * Controlled state + validation + submit for the listing form.
 * Pass empty values for create, a prefilled listing for edit.
 */
export const useListingForm = (
  initialValues: ListingFormValues,
  { variant, listingId, redirectDelayMs = 1600, onSubmit }: UseListingFormOptions,
): ListingFormApi => {
  const navigate = useNavigate();
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [errors, setErrors] = useState<ListingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // After the first submit attempt, re-validate live so errors clear as the user fixes them.
  useEffect(() => {
    if (attempted) setErrors(validateListing(values, variant));
  }, [attempted, values, variant]);

  const setField = useCallback(<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setAttribute = useCallback(<K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => {
    setValues((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  }, []);

  const setCategory = useCallback((main: string, sub: string) => {
    setValues((prev) => {
      if (prev.mainCategory === main && prev.subCategory === sub) return prev;
      const keepItem = prev.subCategory === sub;
      // 대분류가 바뀌면 입력란 구성이 달라지므로 속성을 모두 비운다 (REQ-POST-003).
      // 소분류만 바뀌면 고른 상태는 두고, 품목에서 온 값만 비운다.
      const attributes =
        prev.mainCategory !== main
          ? emptyAttributes
          : keepItem
            ? prev.attributes
            : { ...prev.attributes, setName: '', cardNo: '', language: '', rarity: '' };
      return {
        ...prev,
        mainCategory: main,
        subCategory: sub,
        itemId: keepItem ? prev.itemId : null,
        catalogMatch: keepItem ? prev.catalogMatch : null,
        attributes,
      };
    });
  }, []);

  const selectCatalogItem = useCallback((item: ItemSummary, mainCategory: string) => {
    setValues((prev) => ({
      ...prev,
      itemId: item.id,
      catalogMatch: toCatalogLabel(item),
      mainCategory,
      subCategory: item.category.code,
      attributes: {
        // 다른 대분류의 품목을 고르면 그 대분류 기준으로 속성을 다시 고른다.
        ...(prev.mainCategory === mainCategory ? prev.attributes : emptyAttributes),
        // 품목 속성은 items 값을 그대로 보여준다 (읽기 전용, 판매글에 저장하지 않음).
        setName: item.setName ?? '',
        cardNo: item.cardNo ?? '',
        language: item.language ?? '',
        rarity: item.rarity ?? '',
      },
    }));
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

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (submitting || saved) return;
      setAttempted(true);
      const nextErrors = validateListing(values, variant);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      setSubmitting(true);
      setSubmitError(null);
      let redirectTo: string | void = undefined;
      if (onSubmit) {
        try {
          redirectTo = await onSubmit(values);
        } catch (err) {
          setSubmitError(err instanceof Error ? err.message : String(err));
          setSubmitting(false);
          return;
        }
      }
      setSaved(true);
      const path = redirectTo || ROUTES.myListingDetail(variant === 'edit' && listingId ? listingId : NEW_LISTING_ID);
      timer.current = window.setTimeout(() => navigate(path), redirectDelayMs);
    },
    [submitting, saved, values, variant, listingId, navigate, redirectDelayMs, onSubmit],
  );

  return {
    values,
    errors,
    submitting,
    saved,
    submitError,
    setField,
    setAttribute,
    setCategory,
    selectCatalogItem,
    setPhotos,
    setAuthPhoto,
    addPrice,
    handleSubmit,
  };
};
