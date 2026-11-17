import { useCallback, useMemo } from 'react';
import { ApiError, toAssetUrl } from '../../api/client';
import { updateListing, uploadListingImage } from '../../api/listings';
import type { ListingDetail, ListingImageType, UpdateListingRequest } from '../../api/types';
import {
  editConditionRules,
  editPageCopy as copy,
  gradeOptions,
  gradingServiceOptions,
  type ListingFormValues,
  type ListingPhoto,
} from '../../data/listingForm';

// 서버가 준 문구를 그대로 보여주면 안 되는 코드 (상태 코드만 담긴 기본 문구).
const GENERIC_ERROR_CODES = ['UNKNOWN_ERROR', 'INTERNAL_ERROR'];

/** API 에러 → 화면 문구. 서버의 한글 에러 문구를 우선 쓰고, 알 수 없는 에러면 fallback. */
export const toErrorMessage = (err: unknown, fallback: string): string => {
  if (!(err instanceof ApiError)) return fallback;
  if (err.code === 'NETWORK_ERROR') return copy.networkError;
  return GENERIC_ERROR_CODES.includes(err.code) ? fallback : err.message;
};

/** LISTING-02 응답 → 수정 폼 초기값. 품목 속성(세트명 등)은 표시만 하고 저장하지 않는다. */
const toFormValues = (listing: ListingDetail): ListingFormValues => {
  const { item } = listing;
  const photos: ListingPhoto[] = listing.images.map((image, i) => ({
    id: `image-${image.id}`,
    src: toAssetUrl(image.url),
    alt: `${listing.title} ${copy.photoLabel(i + 1)}`,
    label: copy.photoLabel(i + 1),
    imageId: image.id,
  }));
  const authPhoto: ListingPhoto | null = listing.authImage
    ? {
        id: `image-${listing.authImage.id}`,
        src: toAssetUrl(listing.authImage.url),
        alt: `${listing.title} ${copy.authPhotoLabel}`,
        label: copy.authPhotoLabel,
        imageId: listing.authImage.id,
      }
    : null;
  const catalogName = [item.name, item.setName, item.cardNo].filter(Boolean).join(' · ');

  return {
    photos,
    authPhoto,
    // breadcrumbs는 대분류 → 소분류 순서. 대분류만 있으면 품목 카테고리를 그대로 쓴다.
    mainCategory: listing.breadcrumbs[0]?.code ?? item.category.code,
    subCategory: listing.breadcrumbs[1]?.code ?? item.category.code,
    itemId: item.id,
    catalogQuery: item.name,
    catalogMatch: catalogName,
    attributes: {
      setName: item.setName ?? '',
      cardNo: item.cardNo ?? '',
      language: item.language ?? '',
      rarity: item.rarity ?? '',
      condition: listing.condition,
      // 미개봉 → 그레이딩으로 바꿀 때 바로 고를 수 있게 첫 선택지를 기본값으로 둔다.
      gradingService: listing.gradingService ?? gradingServiceOptions[0].value,
      grade: listing.grade ?? gradeOptions[0].value,
    },
    title: listing.title,
    price: listing.price,
    description: listing.description,
    delivery: listing.delivery,
    direct: listing.direct,
    directLocation: listing.directLocation ?? '',
    // 등록할 때 이미 동의한 판매글이다.
    agreed: true,
  };
};

/** 서버에 있는 사진은 id를 그대로, 새로 고른 사진은 업로드해서 id를 받는다. */
const resolveImageId = async (photo: ListingPhoto, type: ListingImageType): Promise<number> => {
  if (photo.imageId !== undefined) return photo.imageId;
  if (!photo.file) throw new Error(copy.missingPhotoFile);
  return (await uploadListingImage(photo.file, type)).imageId;
};

const sameIds = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((id, i) => id === b[i]);

/** 원래 값과 비교해 바뀐 필드만 담은 LISTING-04 요청 본문. */
const buildUpdateRequest = async (listing: ListingDetail, values: ListingFormValues): Promise<UpdateListingRequest> => {
  const body: { -readonly [K in keyof UpdateListingRequest]: UpdateListingRequest[K] } = {};

  const imageIds = await Promise.all(values.photos.map((photo) => resolveImageId(photo, 'photo')));
  if (!sameIds(imageIds, listing.images.map((image) => image.id))) body.imageIds = imageIds;
  if (values.authPhoto) {
    const authImageId = await resolveImageId(values.authPhoto, 'auth');
    if (authImageId !== listing.authImage?.id) body.authImageId = authImageId;
  }

  const { condition, gradingService, grade } = values.attributes;
  // 수정 화면은 원래 상태로 시작하므로 비어 있지 않다 (빈 값은 validateListing이 막는다).
  if (condition && condition !== listing.condition) body.condition = condition;
  if (condition === 'graded' && (body.condition || gradingService !== listing.gradingService || grade !== listing.grade)) {
    body.gradingService = gradingService;
    body.grade = grade;
  }

  const title = values.title.trim();
  if (title !== listing.title) body.title = title;
  if (values.price !== listing.price) body.price = values.price;
  if (values.description !== listing.description) body.description = values.description;
  if (values.delivery !== listing.delivery) body.delivery = values.delivery;
  if (values.direct !== listing.direct) body.direct = values.direct;
  const directLocation = values.directLocation.trim();
  if (values.direct && directLocation !== (listing.directLocation ?? '')) body.directLocation = directLocation;

  return body;
};

/** P-015 판매글 수정: 불러온 판매글로 폼 초기값을 만들고, 저장(사진 업로드 + LISTING-04)을 담당한다. */
export const useEditListing = (listing: ListingDetail) => {
  const initialValues = useMemo(() => toFormValues(listing), [listing]);
  const conditionRule = editConditionRules[listing.condition];

  const onSubmit = useCallback(
    async (values: ListingFormValues) => {
      const missingFile = [...values.photos, values.authPhoto].some(
        (photo) => photo && photo.imageId === undefined && !photo.file,
      );
      if (missingFile) throw new Error(copy.missingPhotoFile);
      try {
        const body = await buildUpdateRequest(listing, values);
        // 바뀐 게 없으면 요청 없이 상세로 돌아간다.
        if (Object.keys(body).length > 0) await updateListing(String(listing.id), body);
      } catch (err) {
        throw new Error(toErrorMessage(err, copy.submitError));
      }
    },
    [listing],
  );

  return {
    initialValues,
    onSubmit,
    conditionVisible: conditionRule.visible,
    conditionDisabled: conditionRule.disabled,
    registrationNo: listing.registrationNo ?? String(listing.id),
    originalPrice: listing.price,
    wishCount: listing.wishCount,
  };
};
