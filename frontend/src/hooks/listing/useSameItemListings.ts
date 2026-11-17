import { useMemo } from 'react';
import { toAssetUrl } from '../../api/client';
import type { ListingSummary } from '../../api/types';
import { listingDetailCopy as copy, type RelatedListing, sellerListing, type SellerOtherItem } from '../../data/listing';
import { formatPrice, formatTimeAgo } from './listingViewHelpers';
import { useOtherListings } from './useOtherListings';

/** 등급 슬랩이면 "PSA 10", 아니면 상태 이름. */
const gradeText = (listing: ListingSummary): string =>
  listing.gradingService && listing.grade ? `${listing.gradingService} ${listing.grade}` : copy.conditions[listing.condition];

const imageOf = (listing: ListingSummary): string | null => (listing.thumbnailUrl ? toAssetUrl(listing.thumbnailUrl) : null);

const toRelated = (listing: ListingSummary): RelatedListing => ({
  id: String(listing.id),
  title: listing.title,
  price: formatPrice(listing.price),
  imageSrc: imageOf(listing),
  imageAlt: listing.title,
  location: listing.directLocation ?? sellerListing.related.deliveryOnly,
  timeAgo: formatTimeAgo(listing.createdAt),
  category: gradeText(listing),
  condition: gradeText(listing),
  conditionTone: 'primary',
});

const toSellerOther = (listing: ListingSummary): SellerOtherItem => ({
  id: String(listing.id),
  title: listing.title,
  price: `${formatPrice(listing.price)}원`,
  condition: gradeText(listing),
  conditionTone: listing.condition === 'unopened' ? 'primary' : 'muted',
  imageSrc: imageOf(listing),
  imageAlt: listing.title,
});

/** 같은 품목의 다른 판매중·예약중 매물 (LISTING-01 itemId 필터). */
export const useSameItemListings = (itemId: number, excludeListingId: number, size = sellerListing.related.size) => {
  const { items } = useOtherListings({ itemId }, excludeListingId, size);
  return useMemo(() => items.map(toRelated), [items]);
};

/** 같은 판매자의 다른 판매중·예약중 상품 (LISTING-01 sellerId 필터). */
export const useSellerOtherListings = (sellerId: number, excludeListingId: number, size: number) => {
  const { items, totalCount } = useOtherListings({ sellerId }, excludeListingId, size);
  return useMemo(() => ({ items: items.map(toSellerOther), totalCount }), [items, totalCount]);
};
