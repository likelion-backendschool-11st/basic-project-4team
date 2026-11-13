import { apiRequest } from './client';
import type { ListingDetail } from './types';

/** 판매글 상세 (LISTING-02). 없거나 삭제된 글이면 ApiError(404, LISTING_NOT_FOUND). */
export const getListing = (listingId: string): Promise<ListingDetail> =>
  apiRequest<ListingDetail>(`/listings/${encodeURIComponent(listingId)}`);
