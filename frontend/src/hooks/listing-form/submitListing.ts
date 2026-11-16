import { ApiError } from '../../api/client';
import { createListing, uploadListingImage } from '../../api/listings';
import type { CreateListingRequest, Grade, GradingService } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { submitCopy, type ListingFormValues, type ListingPhoto } from '../../data/listingForm';

/** 화면 상태의 사진 → 업로드할 원본 파일. 검사(validateListing)를 통과했다면 항상 있다. */
const requireFile = (photo: ListingPhoto | null): File => {
  if (!photo?.file) throw new Error('업로드할 사진 파일이 없습니다.');
  return photo.file;
};

/** 폼 값 + 업로드한 이미지 id → LISTING-03 요청 본문. 조건부 필드는 스펙대로 필요할 때만 넣는다. */
const toCreateRequest = (
  v: ListingFormValues,
  itemId: number,
  imageIds: readonly number[],
  authImageId: number,
): CreateListingRequest => {
  const { condition, gradingService, grade } = v.attributes;
  return {
    itemId,
    imageIds,
    authImageId,
    condition,
    ...(condition === 'graded'
      ? { gradingService: gradingService as GradingService, grade: grade as Grade }
      : {}),
    title: v.title.trim(),
    price: v.price,
    description: v.description,
    delivery: v.delivery,
    direct: v.direct,
    ...(v.direct ? { directLocation: v.directLocation.trim() } : {}),
    agreed: true,
  };
};

/**
 * 판매글 등록 제출 — 상품 사진(순서대로)·실물 인증 사진을 업로드(UPLOAD-01)한 뒤 등록(LISTING-03).
 * 성공하면 새 판매글 id를 돌려준다.
 */
export const submitNewListing = async (v: ListingFormValues): Promise<number> => {
  if (v.itemId === null) throw new Error('공식 품목이 선택되지 않았습니다.');
  // Promise.all은 입력 순서대로 결과를 돌려주므로 사진 노출 순서가 유지된다.
  const [photos, auth] = await Promise.all([
    Promise.all(v.photos.map((photo) => uploadListingImage(requireFile(photo), 'photo'))),
    uploadListingImage(requireFile(v.authPhoto), 'auth'),
  ]);
  const created = await createListing(
    toCreateRequest(v, v.itemId, photos.map((p) => p.imageId), auth.imageId),
  );
  return created.id;
};

/** 제출 실패 → 화면에 보여줄 문구. 서버 검증 에러(400 등)는 서버 메시지를 그대로 쓴다. */
export const toSubmitErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.status === 401) return submitCopy.errors.loginRequired;
    if (err.status === 0) return submitCopy.errors.network;
    if (err.status >= 400 && err.status < 500) return err.message;
  }
  return submitCopy.errors.failed;
};

/**
 * 등록 화면의 useListingForm onSubmit — 저장 후 이동할 새 판매글 상세(P-010) 경로를 돌려준다.
 * 실패하면 화면에 보여줄 문구를 담은 Error를 던진다 (useListingForm이 submitError로 표시).
 */
export const submitCreateForm = async (v: ListingFormValues): Promise<string> => {
  try {
    const id = await submitNewListing(v);
    return ROUTES.listingDetail(String(id));
  } catch (err) {
    throw new Error(toSubmitErrorMessage(err));
  }
};
