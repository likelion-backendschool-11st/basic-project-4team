import { apiRequest } from './client';
import type {
  CompleteListingRequest,
  CompleteListingResponse,
  ListingDetail,
  ListingImageType,
  ListingStatusResponse,
  UpdateListingRequest,
  UploadedImage,
} from './types';

/** 판매글 상세 (LISTING-02). 없거나 삭제된 글이면 ApiError(404, LISTING_NOT_FOUND). */
export const getListing = (listingId: string): Promise<ListingDetail> =>
  apiRequest<ListingDetail>(`/listings/${encodeURIComponent(listingId)}`);

/** 판매글 수정 (LISTING-04). 작성자 본인만 가능하며, 수정된 상세를 돌려준다. */
export const updateListing = (listingId: string, body: UpdateListingRequest): Promise<ListingDetail> =>
  apiRequest<ListingDetail>(`/listings/${encodeURIComponent(listingId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

/** 판매글 삭제 (LISTING-05). 작성자 본인만 가능. 거래완료 글은 ApiError(409, LISTING_ALREADY_SOLD). */
export const deleteListing = (listingId: string): Promise<void> =>
  apiRequest<void>(`/listings/${encodeURIComponent(listingId)}`, { method: 'DELETE' });

/** 판매 상태 변경 (LISTING-06). 판매중 ↔ 예약중만. 거래완료 글은 ApiError(409, LISTING_ALREADY_SOLD). */
export const changeListingStatus = (listingId: string, status: 'selling' | 'reserved'): Promise<ListingStatusResponse> =>
  apiRequest<ListingStatusResponse>(`/listings/${encodeURIComponent(listingId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

/** 거래완료 처리 (LISTING-07). 체결가가 품목 시세에 반영된다. */
export const completeListing = (listingId: string, body: CompleteListingRequest): Promise<CompleteListingResponse> =>
  apiRequest<CompleteListingResponse>(`/listings/${encodeURIComponent(listingId)}/complete`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** 이미지 한 장 업로드 (UPLOAD-01). 받은 imageId를 판매글 등록·수정에 넘긴다. */
export const uploadListingImage = (file: File, type: ListingImageType): Promise<UploadedImage> => {
  const form = new FormData();
  form.append('type', type);
  form.append('image', file);
  return apiRequest<UploadedImage>('/uploads/images', { method: 'POST', body: form });
};
